import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { WalletController } from '../controllers/walletController';
import { TradeController } from '../controllers/tradeController';
import { PriceController } from '../controllers/priceController';
import { authenticate } from '../middleware/auth';
import { authLimiter, tradeLimiter } from '../middleware/rateLimit';

const router = Router();

// Auth routes
router.post('/auth/register', authLimiter, AuthController.register);
router.post('/auth/login', authLimiter, AuthController.login);
router.get('/auth/profile', authenticate, AuthController.getProfile);

// Wallet routes
router.get('/wallet', authenticate, WalletController.getWallet);
router.get('/wallet/balance', authenticate, WalletController.getBalance);
router.post('/wallet/deposit', authenticate, WalletController.deposit);

// Trade routes
router.post('/trades', authenticate, tradeLimiter, TradeController.createTrade);
router.get('/trades/active', authenticate, TradeController.getActiveTrades);
router.get('/trades/history', authenticate, TradeController.getTradeHistory);
router.get('/trades/:id', authenticate, TradeController.getTradeById);

// Price routes (public)
router.get('/prices/:symbol', PriceController.getCurrentPrice);
router.get('/prices/:symbol/history', PriceController.getHistoricalData);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
