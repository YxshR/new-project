# Quick Start Guide

Follow these steps to get your crypto trading platform running in minutes!

## Option 1: Docker (Easiest - Recommended)

### Step 1: Start Services
```bash
docker-compose up --build
```

### Step 2: Run Database Migration (in another terminal)
```bash
docker-compose exec backend npm run db:migrate
```

### Step 3: Open Your Browser
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/health

That's it! 🎉

---

## Option 2: Manual Setup (More Control)

### Prerequisites
Make sure you have installed:
- Node.js 18+ (`node --version`)
- PostgreSQL 15+ (`psql --version`)
- Redis 7+ (`redis-cli --version`)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Start PostgreSQL & Redis

**On macOS (using Homebrew):**
```bash
brew services start postgresql@15
brew services start redis
```

**On Ubuntu/Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl start redis
```

**On Windows:**
- Start PostgreSQL from Services
- Start Redis from Services (or use WSL)

### Step 3: Create Database
```bash
createdb cryptodb
# Or using psql:
psql -U postgres -c "CREATE DATABASE cryptodb;"
```

### Step 4: Run Database Migrations
```bash
cd backend
npm run db:migrate
```

You should see:
```
✓ Users table created
✓ Wallets table created
✓ Trades table created
✓ Transactions table created
✓ All tables created successfully!
```

### Step 5: Start Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║  🚀 Crypto Trading Platform API                      ║
║                                                       ║
║  HTTP Server: http://localhost:3000                  ║
║  WebSocket Server: http://localhost:3001             ║
║                                                       ║
║  Environment: development                             ║
╚═══════════════════════════════════════════════════════╝
✓ Redis connected
✓ WebSocket server listening on port 3001
```

### Step 6: Install Frontend Dependencies (New Terminal)
```bash
cd frontend
npm install
```

### Step 7: Start Frontend Server
```bash
cd frontend
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3002
```

### Step 8: Open Your Browser
Go to: http://localhost:3002

---

## First Time Setup

### 1. Create an Account
- Click "Sign up"
- Enter your email and password
- Click "Create Account"

### 2. Add Test Funds
For now, you can add funds directly to the database:

```bash
# Connect to PostgreSQL
psql -U postgres cryptodb

# Find your user ID
SELECT id, email FROM users;

# Add 10,000 Rs to your wallet (replace USER_ID with your actual ID)
UPDATE wallets SET balance = 10000 WHERE user_id = 'USER_ID';

# Exit
\q
```

### 3. Start Trading!
- Select a cryptocurrency (SOL, BTC, ETH, or MATIC)
- Enter trade amount (minimum 10 Rs)
- Choose duration (1-5 minutes)
- Click UP or DOWN
- Watch your trade in the "Active Trades" section

### 4. View Results
- After the duration expires, your trade will auto-settle
- Win: Get 1.75x your amount (e.g., 100 Rs → 175 Rs)
- Loss: Get 0.5x your amount (e.g., 100 Rs → 50 Rs)
- Check your updated balance in the wallet

---

## Troubleshooting

### Backend won't start

**Problem**: `Error: connect ECONNREFUSED ::1:5432`
**Solution**: PostgreSQL is not running. Start it:
```bash
brew services start postgresql@15  # macOS
sudo systemctl start postgresql    # Linux
```

**Problem**: `Error: Redis connection refused`
**Solution**: Redis is not running. Start it:
```bash
brew services start redis          # macOS
sudo systemctl start redis         # Linux
```

**Problem**: `Error: Database "cryptodb" does not exist`
**Solution**: Create the database:
```bash
createdb cryptodb
```

### Frontend won't connect

**Problem**: Network error / CORS error
**Solution**: Make sure backend is running on port 3000

**Problem**: WebSocket connection failed
**Solution**:
1. Check if backend WebSocket server is running (port 3001)
2. Look for "✓ WebSocket server listening on port 3001" in backend logs

### Trades not settling

**Problem**: Trade stays "ACTIVE" forever
**Solution**:
1. Check if Redis is running (needed for Bull Queue)
2. Restart backend server
3. Check backend logs for errors

### Database errors

**Problem**: Table doesn't exist
**Solution**: Run migrations again:
```bash
cd backend
npm run db:migrate
```

---

## Testing the Platform

### Test User Credentials
After creating an account, you can use these for testing:
- Email: test@example.com
- Password: test123456

### Test Trades
1. Start with small amounts (10-50 Rs)
2. Try both UP and DOWN predictions
3. Test different durations
4. Watch the countdown timer
5. Verify balance updates after settlement

### API Testing with curl

**Get current price:**
```bash
curl http://localhost:3000/api/prices/SOL
```

**Health check:**
```bash
curl http://localhost:3000/api/health
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

---

## Next Steps

1. **Add Payment Integration**
   - Sign up for Razorpay account
   - Add API keys to `.env`
   - Implement deposit/withdrawal flows

2. **Customize Settings**
   - Edit `backend/.env` to change trade limits
   - Adjust win/loss multipliers
   - Change durations

3. **Deploy to Production**
   - See [README.md](README.md) for deployment guide
   - Use proper database and Redis instances
   - Set up SSL certificates
   - Configure proper environment variables

4. **Add More Features**
   - More cryptocurrencies
   - Trade history filtering
   - User profile page
   - Email notifications

---

## Need Help?

### Check Logs

**Backend logs:**
```bash
cd backend
npm run dev
# Watch the terminal for errors
```

**Frontend logs:**
```bash
cd frontend
npm run dev
# Watch the terminal for errors
# Also check browser console (F12)
```

**Database logs:**
```bash
# PostgreSQL logs location (macOS):
tail -f /usr/local/var/log/postgresql@15.log

# Linux:
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Common Issues

**Port already in use:**
```bash
# Find what's using the port
lsof -ti:3000  # Backend port
lsof -ti:3001  # WebSocket port
lsof -ti:3002  # Frontend port

# Kill the process
kill -9 <PID>
```

**Node modules issues:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## Resources

- [Full Documentation](README.md)
- [Technical Guide](CRYPTO_TRADING_PLATFORM_GUIDE.md)
- [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)
- [Socket.io Docs](https://socket.io/docs/)

---

**Happy Trading! 🚀**

If you encounter any issues, please check the README.md or open an issue on GitHub.
