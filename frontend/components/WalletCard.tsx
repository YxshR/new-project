'use client';

import { useEffect } from 'react';
import { walletAPI } from '@/lib/api';
import { useWalletStore } from '@/store/useWalletStore';
import { Wallet, Plus } from 'lucide-react';

export default function WalletCard() {
  const { balance, lockedBalance, updateBalance } = useWalletStore();

  useEffect(() => {
    fetchWallet();
    const interval = setInterval(fetchWallet, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await walletAPI.getWallet();
      const wallet = response.data.wallet;
      updateBalance(parseFloat(wallet.balance), parseFloat(wallet.locked_balance));
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={24} />
          <h2 className="text-xl font-bold">Wallet</h2>
        </div>
        <button className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition">
          <Plus size={16} />
          Add Funds
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <div className="text-sm opacity-80">Available Balance</div>
          <div className="text-3xl font-bold">₹{balance.toLocaleString('en-IN')}</div>
        </div>

        {lockedBalance > 0 && (
          <div>
            <div className="text-sm opacity-80">Locked in Trades</div>
            <div className="text-xl font-semibold">
              ₹{lockedBalance.toLocaleString('en-IN')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
