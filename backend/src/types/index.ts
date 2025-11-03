export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  phone?: string;
  kyc_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  created_at: Date;
  updated_at: Date;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  locked_balance: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export interface Trade {
  id: string;
  user_id: string;
  cryptocurrency: string;
  amount: number;
  direction: 'UP' | 'DOWN';
  entry_price: number;
  exit_price?: number;
  duration: number;
  expires_at: Date;
  status: 'ACTIVE' | 'WON' | 'LOST' | 'CANCELLED';
  payout?: number;
  profit_loss?: number;
  created_at: Date;
  settled_at?: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE_WIN' | 'TRADE_LOSS';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  payment_method?: string;
  payment_id?: string;
  reference_id?: string;
  metadata?: any;
  created_at: Date;
  completed_at?: Date;
}

export interface PriceUpdate {
  symbol: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CreateTradeInput {
  cryptocurrency: string;
  amount: number;
  direction: 'UP' | 'DOWN';
  duration: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}
