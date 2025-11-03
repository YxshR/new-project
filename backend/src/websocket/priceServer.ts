import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { PriceFeedService } from '../services/priceFeedService';

const WS_PORT = parseInt(process.env.WS_PORT || '3001');

const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
  },
});

// Track active subscriptions
const subscriptions = new Map<string, Set<string>>();

// Price update intervals
const priceUpdateIntervals = new Map<string, NodeJS.Timeout>();

// Start fetching prices for a symbol
function startPriceFeed(symbol: string) {
  if (priceUpdateIntervals.has(symbol)) {
    return; // Already running
  }

  const interval = setInterval(async () => {
    try {
      const price = await PriceFeedService.getCurrentPrice(symbol);

      // Broadcast to all subscribed clients
      io.to(symbol).emit('price-update', {
        symbol,
        price,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
    }
  }, 5000); // Update every 5 seconds

  priceUpdateIntervals.set(symbol, interval);
  console.log(`✓ Started price feed for ${symbol}`);
}

// Stop fetching prices for a symbol
function stopPriceFeed(symbol: string) {
  const interval = priceUpdateIntervals.get(symbol);
  if (interval) {
    clearInterval(interval);
    priceUpdateIntervals.delete(symbol);
    console.log(`✓ Stopped price feed for ${symbol}`);
  }
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Subscribe to price updates
  socket.on('subscribe', (symbol: string) => {
    const normalizedSymbol = symbol.toUpperCase();

    // Add to subscriptions
    if (!subscriptions.has(normalizedSymbol)) {
      subscriptions.set(normalizedSymbol, new Set());
    }
    subscriptions.get(normalizedSymbol)!.add(socket.id);

    // Join room
    socket.join(normalizedSymbol);

    // Start price feed if not already running
    startPriceFeed(normalizedSymbol);

    console.log(`Client ${socket.id} subscribed to ${normalizedSymbol}`);

    // Send current price immediately
    PriceFeedService.getCurrentPrice(normalizedSymbol)
      .then((price) => {
        socket.emit('price-update', {
          symbol: normalizedSymbol,
          price,
          timestamp: Date.now(),
        });
      })
      .catch((error) => {
        console.error('Error sending initial price:', error);
      });
  });

  // Unsubscribe from price updates
  socket.on('unsubscribe', (symbol: string) => {
    const normalizedSymbol = symbol.toUpperCase();
    const subs = subscriptions.get(normalizedSymbol);

    if (subs) {
      subs.delete(socket.id);

      if (subs.size === 0) {
        stopPriceFeed(normalizedSymbol);
        subscriptions.delete(normalizedSymbol);
      }
    }

    socket.leave(normalizedSymbol);
    console.log(`Client ${socket.id} unsubscribed from ${normalizedSymbol}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Clean up subscriptions
    subscriptions.forEach((subs, symbol) => {
      if (subs.has(socket.id)) {
        subs.delete(socket.id);

        if (subs.size === 0) {
          stopPriceFeed(symbol);
          subscriptions.delete(symbol);
        }
      }
    });
  });
});

export function startWebSocketServer() {
  httpServer.listen(WS_PORT, () => {
    console.log(`✓ WebSocket server listening on port ${WS_PORT}`);
  });
}

export default io;
