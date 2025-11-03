import { query } from '../config/database';
import { Trade, CreateTradeInput } from '../types';
import { WalletService } from './walletService';
import { PriceFeedService } from './priceFeedService';
import { TradeQueue } from '../workers/tradeQueue';

export class TradeService {
  private static readonly WIN_MULTIPLIER = parseFloat(process.env.WIN_MULTIPLIER || '1.75');
  private static readonly LOSS_MULTIPLIER = parseFloat(process.env.LOSS_MULTIPLIER || '0.5');
  private static readonly MIN_AMOUNT = parseFloat(process.env.MIN_TRADE_AMOUNT || '10');
  private static readonly MAX_AMOUNT = parseFloat(process.env.MAX_TRADE_AMOUNT || '100000');

  static async createTrade(userId: string, input: CreateTradeInput): Promise<Trade> {
    // Validate amount
    if (input.amount < this.MIN_AMOUNT || input.amount > this.MAX_AMOUNT) {
      throw new Error(`Trade amount must be between ${this.MIN_AMOUNT} and ${this.MAX_AMOUNT}`);
    }

    // Validate duration (60-300 seconds)
    if (input.duration < 60 || input.duration > 300) {
      throw new Error('Duration must be between 60 and 300 seconds');
    }

    const client = await query('BEGIN');

    try {
      // Check and lock funds
      await WalletService.lockFunds(userId, input.amount);

      // Get current price
      const entryPrice = await PriceFeedService.getCurrentPrice(input.cryptocurrency);

      // Calculate expiry time
      const expiresAt = new Date(Date.now() + input.duration * 1000);

      // Create trade record
      const result = await query(
        `INSERT INTO trades
         (user_id, cryptocurrency, amount, direction, entry_price, duration, expires_at, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          userId,
          input.cryptocurrency.toUpperCase(),
          input.amount,
          input.direction,
          entryPrice,
          input.duration,
          expiresAt,
          'ACTIVE',
        ]
      );

      const trade = result.rows[0];

      // Schedule trade settlement
      await TradeQueue.scheduleSettlement(trade.id, input.duration);

      await query('COMMIT');

      return trade;
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  static async settleTrade(tradeId: string): Promise<void> {
    try {
      // Get trade details
      const tradeResult = await query(
        'SELECT * FROM trades WHERE id = $1 AND status = $2',
        [tradeId, 'ACTIVE']
      );

      if (tradeResult.rows.length === 0) {
        console.log(`Trade ${tradeId} not found or already settled`);
        return;
      }

      const trade = tradeResult.rows[0];

      // Get current price
      const exitPrice = await PriceFeedService.getCurrentPrice(trade.cryptocurrency);

      // Determine win/loss
      const isWin =
        (trade.direction === 'UP' && exitPrice > trade.entry_price) ||
        (trade.direction === 'DOWN' && exitPrice < trade.entry_price);

      // Calculate payout
      const payout = isWin
        ? trade.amount * this.WIN_MULTIPLIER
        : trade.amount * this.LOSS_MULTIPLIER;

      const profitLoss = payout - trade.amount;

      // Update trade status
      await query(
        `UPDATE trades
         SET status = $1,
             exit_price = $2,
             payout = $3,
             profit_loss = $4,
             settled_at = NOW()
         WHERE id = $5`,
        [isWin ? 'WON' : 'LOST', exitPrice, payout, profitLoss, tradeId]
      );

      // Unlock funds and credit payout
      await WalletService.unlockAndCreditFunds(trade.user_id, trade.amount, payout);

      // Create transaction record
      await query(
        `INSERT INTO transactions (user_id, type, amount, status, reference_id, completed_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          trade.user_id,
          isWin ? 'TRADE_WIN' : 'TRADE_LOSS',
          profitLoss,
          'COMPLETED',
          tradeId,
        ]
      );

      console.log(`✓ Trade ${tradeId} settled: ${isWin ? 'WON' : 'LOST'}, payout: ${payout}`);
    } catch (error) {
      console.error('Error settling trade:', error);
      throw error;
    }
  }

  static async getActiveTrades(userId: string): Promise<Trade[]> {
    const result = await query(
      'SELECT * FROM trades WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC',
      [userId, 'ACTIVE']
    );

    return result.rows;
  }

  static async getTradeHistory(userId: string, limit: number = 50): Promise<Trade[]> {
    const result = await query(
      `SELECT * FROM trades
       WHERE user_id = $1 AND status IN ($2, $3)
       ORDER BY settled_at DESC
       LIMIT $4`,
      [userId, 'WON', 'LOST', limit]
    );

    return result.rows;
  }

  static async getTradeById(tradeId: string): Promise<Trade | null> {
    const result = await query('SELECT * FROM trades WHERE id = $1', [tradeId]);

    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
