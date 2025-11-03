'use client';

import { useState } from 'react';
import { tradeAPI } from '@/lib/api';
import { useWalletStore } from '@/store/useWalletStore';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

interface TradePanelProps {
  symbol: string;
  currentPrice: number | null;
  onTradeCreated?: () => void;
}

export default function TradePanel({ symbol, currentPrice, onTradeCreated }: TradePanelProps) {
  const [amount, setAmount] = useState<string>('100');
  const [duration, setDuration] = useState<number>(60);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const balance = useWalletStore((state) => state.balance);

  const handleTrade = async (direction: 'UP' | 'DOWN') => {
    try {
      setLoading(true);
      setMessage(null);

      const amountNum = parseFloat(amount);

      if (isNaN(amountNum) || amountNum < 10) {
        throw new Error('Minimum trade amount is 10 Rs');
      }

      if (amountNum > balance) {
        throw new Error('Insufficient balance');
      }

      await tradeAPI.createTrade({
        cryptocurrency: symbol,
        amount: amountNum,
        direction,
        duration,
      });

      setMessage({ type: 'success', text: `Trade created! ${direction} for ${amountNum} Rs` });

      if (onTradeCreated) {
        onTradeCreated();
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || error.message || 'Failed to create trade',
      });
    } finally {
      setLoading(false);
    }
  };

  const winAmount = parseFloat(amount) * 1.75 || 0;
  const lossAmount = parseFloat(amount) * 0.5 || 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-white">Place Trade</h2>

      {/* Current Price */}
      {currentPrice && (
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Current Price</div>
          <div className="text-2xl font-bold text-white">
            ₹{currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        </div>
      )}

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Amount (Rs)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="10"
          max={balance}
          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter amount"
        />
        <div className="text-xs text-gray-400 mt-1">
          Balance: ₹{balance.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Duration Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
        <div className="grid grid-cols-3 gap-2">
          {[60, 120, 180, 240, 300].map((dur) => (
            <button
              key={dur}
              onClick={() => setDuration(dur)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                duration === dur
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {dur / 60}m
            </button>
          ))}
        </div>
      </div>

      {/* Payout Info */}
      <div className="bg-gray-700 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Win Payout:</span>
          <span className="text-green-400 font-bold">₹{winAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Loss Payout:</span>
          <span className="text-red-400 font-bold">₹{lossAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Trade Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleTrade('UP')}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition"
        >
          <TrendingUp size={20} />
          UP
        </button>
        <button
          onClick={() => handleTrade('DOWN')}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition"
        >
          <TrendingDown size={20} />
          DOWN
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
