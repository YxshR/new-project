'use client';

import { useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { priceAPI } from '@/lib/api';
import { useState } from 'react';

interface PriceChartProps {
  symbol: string;
  currentPrice: number | null;
}

export default function PriceChart({ symbol, currentPrice }: PriceChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalData();
  }, [symbol]);

  // Update chart with current price
  useEffect(() => {
    if (currentPrice && data.length > 0) {
      setData((prev) => [
        ...prev.slice(-50), // Keep last 50 points
        {
          timestamp: Date.now(),
          price: currentPrice,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }
  }, [currentPrice]);

  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      const response = await priceAPI.getHistoricalData(symbol, 1);
      const formattedData = response.data.data.map((item: any) => ({
        timestamp: item.timestamp,
        price: item.price,
        time: new Date(item.timestamp).toLocaleTimeString(),
      }));
      setData(formattedData.slice(-50)); // Last 50 points
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 h-96 flex items-center justify-center">
        <div className="text-gray-400">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white">{symbol}/INR</h2>
        {currentPrice && (
          <div className="text-3xl font-bold text-green-400">
            ₹{currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `₹${value.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: any) => [`₹${value.toFixed(2)}`, 'Price']}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
