import axios from 'axios';
import redis from '../config/redis';
import { PriceUpdate } from '../types';

export class PriceFeedService {
  private static readonly CACHE_EXPIRY = 10; // seconds

  // Get current price from cache or API
  static async getCurrentPrice(symbol: string): Promise<number> {
    try {
      // Try cache first
      const cached = await redis.get(`price:${symbol}:INR`);
      if (cached) {
        return parseFloat(cached);
      }

      // Fetch from CoinGecko (free API, no key needed)
      const price = await this.fetchFromCoinGecko(symbol);

      // Cache the price
      await redis.setex(`price:${symbol}:INR`, this.CACHE_EXPIRY, price.toString());

      return price;
    } catch (error) {
      console.error('Error fetching price:', error);
      throw new Error('Failed to fetch price');
    }
  }

  // Fetch price from CoinGecko
  private static async fetchFromCoinGecko(symbol: string): Promise<number> {
    const coinGeckoIds: { [key: string]: string } = {
      'SOL': 'solana',
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'MATIC': 'matic-network',
    };

    const coinId = coinGeckoIds[symbol.toUpperCase()];
    if (!coinId) {
      throw new Error('Unsupported cryptocurrency');
    }

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=inr`
    );

    return response.data[coinId].inr;
  }

  // Get historical data for charts
  static async getHistoricalData(
    symbol: string,
    days: number = 1
  ): Promise<any[]> {
    const coinGeckoIds: { [key: string]: string } = {
      'SOL': 'solana',
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'MATIC': 'matic-network',
    };

    const coinId = coinGeckoIds[symbol.toUpperCase()];
    if (!coinId) {
      throw new Error('Unsupported cryptocurrency');
    }

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=inr&days=${days}`
    );

    return response.data.prices.map((item: any) => ({
      timestamp: item[0],
      price: item[1],
    }));
  }

  // Update price in cache (called by WebSocket worker)
  static async updatePriceCache(symbol: string, price: number): Promise<void> {
    await redis.setex(`price:${symbol}:INR`, this.CACHE_EXPIRY, price.toString());
  }
}
