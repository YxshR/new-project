import { Response } from 'express';
import { TradeService } from '../services/tradeService';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const createTradeSchema = z.object({
  cryptocurrency: z.enum(['SOL', 'BTC', 'ETH', 'MATIC']),
  amount: z.number().min(10).max(100000),
  direction: z.enum(['UP', 'DOWN']),
  duration: z.number().int().min(60).max(300),
});

export class TradeController {
  static async createTrade(req: AuthRequest, res: Response) {
    try {
      const input = createTradeSchema.parse(req.body);

      const trade = await TradeService.createTrade(req.user!.userId, input);

      res.status(201).json({
        message: 'Trade created successfully',
        trade,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getActiveTrades(req: AuthRequest, res: Response) {
    try {
      const trades = await TradeService.getActiveTrades(req.user!.userId);
      res.json({ trades });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getTradeHistory(req: AuthRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const trades = await TradeService.getTradeHistory(req.user!.userId, limit);
      res.json({ trades });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getTradeById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const trade = await TradeService.getTradeById(id);

      if (!trade) {
        return res.status(404).json({ error: 'Trade not found' });
      }

      // Verify ownership
      if (trade.user_id !== req.user!.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      res.json({ trade });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
