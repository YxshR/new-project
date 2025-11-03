import { Response } from 'express';
import { WalletService } from '../services/walletService';
import { AuthRequest } from '../middleware/auth';

export class WalletController {
  static async getWallet(req: AuthRequest, res: Response) {
    try {
      const wallet = await WalletService.getWallet(req.user!.userId);
      res.json({ wallet });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getBalance(req: AuthRequest, res: Response) {
    try {
      const balance = await WalletService.getBalance(req.user!.userId);
      res.json({ balance });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deposit(req: AuthRequest, res: Response) {
    try {
      const { amount, paymentId, paymentMethod } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      await WalletService.deposit(
        req.user!.userId,
        amount,
        paymentId,
        paymentMethod
      );

      res.json({ message: 'Deposit successful', amount });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
