import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import { startWebSocketServer } from './websocket/priceServer';
import { apiLimiter } from './middleware/rateLimit';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all routes
app.use('/api', apiLimiter);

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Crypto Trading Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      wallet: '/api/wallet',
      trades: '/api/trades',
      prices: '/api/prices',
      health: '/api/health',
    },
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  🚀 Crypto Trading Platform API                      ║
║                                                       ║
║  HTTP Server: http://localhost:${PORT}                 ║
║  WebSocket Server: http://localhost:${process.env.WS_PORT || 3001}         ║
║                                                       ║
║  Environment: ${process.env.NODE_ENV || 'development'}                      ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Start WebSocket server
startWebSocketServer();

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;
