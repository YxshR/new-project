import pool from './database';

const createTables = async () => {
  try {
    console.log('Creating database tables...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        phone VARCHAR(20),
        kyc_status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Users table created');

    // Wallets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        balance DECIMAL(15, 2) DEFAULT 0.00,
        locked_balance DECIMAL(15, 2) DEFAULT 0.00,
        currency VARCHAR(10) DEFAULT 'INR',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, currency)
      );
    `);
    console.log('✓ Wallets table created');

    // Trades table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        cryptocurrency VARCHAR(20) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        direction VARCHAR(10) NOT NULL,
        entry_price DECIMAL(20, 8) NOT NULL,
        exit_price DECIMAL(20, 8),
        duration INTEGER NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        status VARCHAR(20) NOT NULL,
        payout DECIMAL(15, 2),
        profit_loss DECIMAL(15, 2),
        created_at TIMESTAMP DEFAULT NOW(),
        settled_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
      CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
      CREATE INDEX IF NOT EXISTS idx_trades_expires_at ON trades(expires_at);
    `);
    console.log('✓ Trades table created');

    // Transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        status VARCHAR(20) NOT NULL,
        payment_method VARCHAR(50),
        payment_id VARCHAR(255),
        reference_id UUID,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    `);
    console.log('✓ Transactions table created');

    console.log('\n✓ All tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
};

createTables();
