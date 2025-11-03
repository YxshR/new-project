import { create } from 'zustand';

interface WalletState {
  balance: number;
  lockedBalance: number;
  setBalance: (balance: number) => void;
  setLockedBalance: (lockedBalance: number) => void;
  updateBalance: (balance: number, lockedBalance: number) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  lockedBalance: 0,

  setBalance: (balance) => set({ balance }),
  setLockedBalance: (lockedBalance) => set({ lockedBalance }),
  updateBalance: (balance, lockedBalance) => set({ balance, lockedBalance }),
}));
