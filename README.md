# Crypto Trading Platform

A real-time cryptocurrency trading platform where users can predict price movements and earn returns based on their predictions.

## Features

- User authentication (register/login with JWT)
- Real-time cryptocurrency prices via WebSocket
- Place UP/DOWN trades with customizable duration (1-5 minutes)
- Wallet management (deposits, balance tracking)
- Live price charts
- Active trades monitoring with countdown timers
- Trade history
- Auto-settlement of trades after expiry

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js (REST API)
- Socket.io (WebSocket for real-time prices)
- PostgreSQL (database)
- Redis (caching & job queue)
- Bull (job scheduling for trade settlement)
- JWT authentication
- CoinGecko API (price data)

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Socket.io-client (WebSocket)
- Recharts (price charts)
- Axios (API calls)

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis config
│   │   ├── controllers/     # API controllers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, rate limiting
│   │   ├── routes/          # API routes
│   │   ├── workers/         # Background jobs
│   │   ├── websocket/       # WebSocket server
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/                 # Next.js pages
│   ├── components/          # React components
│   ├── lib/                 # API client
│   ├── store/               # Zustand stores
│   ├── hooks/               # Custom hooks
│   └── package.json
└── docker-compose.yml       # Docker setup
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   cd /path/to/project
   ```

2. **Create environment file**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Start services with Docker**
   ```bash
   docker-compose up --build
   ```

4. **Run database migrations** (in another terminal)
   ```bash
   docker-compose exec backend npm run db:migrate
   ```

5. **Access the application**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3000
   - WebSocket: http://localhost:3001

### Option 2: Manual Setup

#### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start PostgreSQL and Redis** (if not using Docker)
   ```bash
   # On macOS with Homebrew
   brew services start postgresql@15
   brew services start redis

   # Create database
   createdb cryptodb
   ```

4. **Run migrations**
   ```bash
   npm run db:migrate
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

   The backend will run on:
   - HTTP: http://localhost:3000
   - WebSocket: http://localhost:3001

#### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Create environment file**
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local
   echo "NEXT_PUBLIC_WS_URL=http://localhost:3001" >> .env.local
   ```

3. **Start the frontend**
   ```bash
   npm run dev
   ```

   The frontend will run on http://localhost:3002

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)

### Wallet
- `GET /api/wallet` - Get wallet details
- `GET /api/wallet/balance` - Get balance
- `POST /api/wallet/deposit` - Deposit funds

### Trades
- `POST /api/trades` - Create new trade
- `GET /api/trades/active` - Get active trades
- `GET /api/trades/history` - Get trade history
- `GET /api/trades/:id` - Get trade by ID

### Prices
- `GET /api/prices/:symbol` - Get current price
- `GET /api/prices/:symbol/history` - Get historical data

## How It Works

### Trading Flow

1. **User Registration**
   - User signs up with email and password
   - System creates user account and wallet

2. **Add Funds**
   - User deposits money to wallet
   - Balance is updated in real-time

3. **Place Trade**
   - User selects cryptocurrency (SOL, BTC, ETH, MATIC)
   - Enters trade amount (min 10 Rs, max 100,000 Rs)
   - Chooses direction (UP or DOWN)
   - Selects duration (1-5 minutes)
   - Clicks UP or DOWN button

4. **Trade Execution**
   - System captures current price (entry price)
   - Locks funds in wallet
   - Creates trade record with status "ACTIVE"
   - Schedules auto-settlement using Bull Queue

5. **Trade Settlement** (Automatic)
   - After duration expires, background worker fetches exit price
   - Compares exit price with entry price
   - **Win Scenario**: Direction matches price movement
     - User gets 1.75x payout (e.g., 100 Rs → 175 Rs)
   - **Loss Scenario**: Direction opposite to price movement
     - User gets 0.5x payout (e.g., 100 Rs → 50 Rs)
   - Funds are unlocked and credited to wallet

6. **View Results**
   - Trade history shows all past trades
   - Profit/loss is calculated and displayed

### Real-time Price Updates

1. Backend WebSocket server connects to CoinGecko API
2. Fetches prices every 5 seconds
3. Broadcasts updates to all connected clients
4. Frontend updates charts and displays in real-time

## Configuration

### Backend Environment Variables

```bash
# Server
PORT=3000
WS_PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/cryptodb

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d

# Trading Rules
MIN_TRADE_AMOUNT=10
MAX_TRADE_AMOUNT=100000
WIN_MULTIPLIER=1.75
LOSS_MULTIPLIER=0.5
MAX_TRADES_PER_MINUTE=10
```

### Frontend Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## Development

### Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Building for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## Supported Cryptocurrencies

- **SOL** - Solana
- **BTC** - Bitcoin
- **ETH** - Ethereum
- **MATIC** - Polygon

More cryptocurrencies can be added by updating the price feed service.

## Security Features

- JWT authentication with secure tokens
- Password hashing with bcrypt (12 rounds)
- Rate limiting on all endpoints
- Input validation using Zod
- SQL injection protection (parameterized queries)
- CORS protection
- Helmet security headers

## Known Limitations

1. **Price Data**: Uses CoinGecko free API (rate limited to ~50 calls/min)
2. **Real-time Prices**: Updates every 5 seconds (not tick-by-tick)
3. **Payment Integration**: Razorpay integration not included (manual deposits only)
4. **No KYC**: KYC verification not implemented
5. **Single Currency**: Only INR supported

## Future Enhancements

- [ ] Razorpay payment integration
- [ ] Multiple timeframes (30s, 10m, 1h)
- [ ] More cryptocurrencies
- [ ] Advanced charts with indicators
- [ ] Social trading features
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Automated KYC verification
- [ ] Email notifications
- [ ] Referral system

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is running: `psql -U postgres`
- Check if Redis is running: `redis-cli ping`
- Verify .env file exists and has correct values

### WebSocket connection fails
- Check if WS_PORT (3001) is not already in use
- Verify CORS settings in backend
- Check browser console for errors

### Trades not settling
- Check if Bull Queue worker is running
- Check Redis connection
- Review backend logs for errors

### Database errors
- Run migrations: `npm run db:migrate`
- Check PostgreSQL version (needs 15+)
- Verify DATABASE_URL is correct

## Legal Notice

⚠️ **IMPORTANT**: This type of platform may be classified as gambling/betting in some jurisdictions. Before deploying to production:

1. Consult with a legal expert
2. Obtain necessary licenses and permits
3. Comply with local financial regulations
4. Implement proper KYC/AML measures
5. Understand tax implications

This is a demonstration project for educational purposes.

## License

MIT License - Feel free to use for learning purposes.

## Support

For issues or questions:
- Open an issue on GitHub
- Check the documentation guide
- Review the API endpoints

## Contributors

Built by [Your Name]

---

**Happy Trading! 🚀**
