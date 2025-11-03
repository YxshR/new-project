import Bull from 'bull';
import { TradeService } from '../services/tradeService';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

// Create queue
export const tradeQueue = new Bull('trade-settlement', {
  redis: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

// Process settlement jobs
tradeQueue.process('settle', async (job) => {
  const { tradeId } = job.data;
  console.log(`Processing settlement for trade: ${tradeId}`);

  try {
    await TradeService.settleTrade(tradeId);
    console.log(`✓ Trade ${tradeId} settled successfully`);
  } catch (error) {
    console.error(`Error settling trade ${tradeId}:`, error);
    throw error; // Will trigger retry
  }
});

// Queue event handlers
tradeQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

tradeQueue.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

export class TradeQueue {
  static async scheduleSettlement(tradeId: string, delaySeconds: number): Promise<void> {
    await tradeQueue.add(
      'settle',
      { tradeId },
      {
        delay: delaySeconds * 1000, // Convert to milliseconds
        attempts: 3, // Retry up to 3 times
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );

    console.log(`✓ Scheduled settlement for trade ${tradeId} in ${delaySeconds}s`);
  }
}
