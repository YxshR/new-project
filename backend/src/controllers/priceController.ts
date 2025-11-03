import { Request, Response } from 'express';
import { PriceFeedService } from '../services/priceFeedService';

export class PriceController {
  static async getCurrentPrice(req: Request, res: Response) {
    try {
      const { symbol } = req.params;
      const price = await PriceFeedService.getCurrentPrice(symbol.toUpperCase());

      res.json({
        symbol: symbol.toUpperCase(),
        price,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getHistoricalData(req: Request, res: Response) {
    try {
      const { symbol } = req.params;
      const days = parseInt(req.query.days as string) || 1;

      const data = await PriceFeedService.getHistoricalData(
        symbol.toUpperCase(),
        days
      );

      res.json({
        symbol: symbol.toUpperCase(),
        data,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
