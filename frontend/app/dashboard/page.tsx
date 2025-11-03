'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import WalletCard from '@/components/WalletCard';
import PriceChart from '@/components/PriceChart';
import TradePanel from '@/components/TradePanel';
import ActiveTrades from '@/components/ActiveTrades';
import { LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [selectedSymbol, setSelectedSymbol] = useState('SOL');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { price, isConnected } = useWebSocket(selectedSymbol);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleTradeCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const cryptos = [
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'MATIC', name: 'Polygon' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Crypto Trading</h1>
            <p className="text-sm text-gray-400">
              Welcome, {user?.full_name || user?.email}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Crypto Selector */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {cryptos.map((crypto) => (
            <button
              key={crypto.symbol}
              onClick={() => setSelectedSymbol(crypto.symbol)}
              className={`px-6 py-3 rounded-lg font-medium transition whitespace-nowrap ${
                selectedSymbol === crypto.symbol
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {crypto.name} ({crypto.symbol})
            </button>
          ))}
        </div>

        {/* Wallet Card */}
        <div className="mb-6">
          <WalletCard />
        </div>

        {/* Main Trading Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <PriceChart symbol={selectedSymbol} currentPrice={price} />
          </div>

          {/* Trade Panel */}
          <div>
            <TradePanel
              symbol={selectedSymbol}
              currentPrice={price}
              onTradeCreated={handleTradeCreated}
            />
          </div>
        </div>

        {/* Active Trades */}
        <div>
          <ActiveTrades refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  );
}
