import { query } from '../config/database';
import { Wallet } from '../types';

export class WalletService {
  static async getBalance(userId: string): Promise<number> {
    const result = await query(
      'SELECT balance FROM wallets WHERE user_id = $1 AND currency = $2',
      [userId, 'INR']
    );

    if (result.rows.length === 0) {
      throw new Error('Wallet not found');
    }

    return parseFloat(result.rows[0].balance);
  }

  static async getWallet(userId: string): Promise<Wallet> {
    const result = await query(
      'SELECT * FROM wallets WHERE user_id = $1 AND currency = $2',
      [userId, 'INR']
    );

    if (result.rows.length === 0) {
      throw new Error('Wallet not found');
    }

    return result.rows[0];
  }

  static async lockFunds(userId: string, amount: number): Promise<void> {
    const client = await query('BEGIN');

    try {
      // Check balance
      const balance = await this.getBalance(userId);

      if (balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Deduct from balance and add to locked_balance
      await query(
        `UPDATE wallets
         SET balance = balance - $1,
             locked_balance = locked_balance + $1,
             updated_at = NOW()
         WHERE user_id = $2 AND currency = $3`,
        [amount, userId, 'INR']
      );

      await query('COMMIT');
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  static async unlockAndCreditFunds(
    userId: string,
    lockedAmount: number,
    payout: number
  ): Promise<void> {
    await query(
      `UPDATE wallets
       SET locked_balance = locked_balance - $1,
           balance = balance + $2,
           updated_at = NOW()
       WHERE user_id = $3 AND currency = $4`,
      [lockedAmount, payout, userId, 'INR']
    );
  }

  static async deposit(
    userId: string,
    amount: number,
    paymentId: string,
    paymentMethod: string = 'RAZORPAY'
  ): Promise<void> {
    const client = await query('BEGIN');

    try {
      // Add to balance
      await query(
        `UPDATE wallets
         SET balance = balance + $1, updated_at = NOW()
         WHERE user_id = $2 AND currency = $3`,
        [amount, userId, 'INR']
      );

      // Create transaction record
      await query(
        `INSERT INTO transactions (user_id, type, amount, status, payment_method, payment_id, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [userId, 'DEPOSIT', amount, 'COMPLETED', paymentMethod, paymentId]
      );

      await query('COMMIT');
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  static async withdraw(
    userId: string,
    amount: number,
    bankDetails: any
  ): Promise<string> {
    const client = await query('BEGIN');

    try {
      const balance = await this.getBalance(userId);

      if (balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Deduct from balance
      await query(
        `UPDATE wallets
         SET balance = balance - $1, updated_at = NOW()
         WHERE user_id = $2 AND currency = $3`,
        [amount, userId, 'INR']
      );

      // Create transaction record
      const result = await query(
        `INSERT INTO transactions (user_id, type, amount, status, payment_method, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id`,
        [userId, 'WITHDRAWAL', amount, 'PENDING', 'BANK_TRANSFER', JSON.stringify(bankDetails)]
      );

      await query('COMMIT');

      return result.rows[0].id;
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }
}
