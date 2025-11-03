'use client';

import { useEffect, useState } from 'react';
import { tradeAPI } from '@/lib/api';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface Trade {
  id: string;
  cryptocurrency: string;
  amount: number;
  direction: 'UP' | 'DOWN';
  entry_price: number;
  duration: number;
  expires_at: string;
  status: string;
}

export default function ActiveTrades({ refreshTrigger }: { refreshTrigger?: number }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveTrades();
    const interval = setInterval(fetchActiveTrades, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const fetchActiveTrades = async () => {
    try {
      const response = await tradeAPI.getActiveTrades();
      setTrades(response.data.trades);
    } catch (error) {
      console.error('Error fetching active trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRemainingTime = (expiresAt: string) => {
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return 'Settling...';

    const seconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="text-gray-400">Loading active trades...</div>;
  }

  if (trades.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Active Trades</h2>
        <div className="text-gray-400 text-center py-8">No active trades</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">
        Active Trades ({trades.length})
      </h2>

      <div className="space-y-3">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  trade.direction === 'UP' ? 'bg-green-600' : 'bg-red-600'
                }`}
              >
                {trade.direction === 'UP' ? (
                  <TrendingUp size={20} className="text-white" />
                ) : (
                  <TrendingDown size={20} className="text-white" />
                )}
              </div>

              <div>
                <div className="font-bold text-white">
                  {trade.cryptocurrency} {trade.direction}
                </div>
                <div className="text-sm text-gray-400">
                  ₹{trade.amount} at ₹{trade.entry_price.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-yellow-400 font-bold">
              <Clock size={16} />
              {getRemainingTime(trade.expires_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
