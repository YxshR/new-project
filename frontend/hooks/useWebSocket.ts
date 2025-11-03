import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

export function useWebSocket(symbol: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create socket connection
    const socket = io(WS_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);

      // Subscribe to price updates
      socket.emit('subscribe', symbol);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('price-update', (data: PriceUpdate) => {
      if (data.symbol === symbol) {
        setPrice(data.price);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('unsubscribe', symbol);
        socketRef.current.disconnect();
      }
    };
  }, [symbol]);

  return { price, isConnected };
}
