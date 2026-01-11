/**
 * POST /api/aristotle/process
 *
 * Cron endpoint to process the Aristotle analysis queue.
 * Should be called periodically (e.g., every 5 minutes) by a cron job.
 *
 * Can also be called manually for testing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { processAnalysisQueue, getQueueStats } from '@/lib/aristotle/queue-processor';

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    // Allow if cron secret matches OR if in development
    const isDev = process.env.NODE_ENV === 'development';
    const hasValidSecret = authHeader === `Bearer ${CRON_SECRET}`;

    if (!isDev && !hasValidSecret) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' } },
        { status: 401 }
      );
    }

    // Get optional batch size from query
    const batchSize = parseInt(request.nextUrl.searchParams.get('batch') || '10', 10);

    // Process queue
    const result = await processAnalysisQueue(batchSize);

    return NextResponse.json({
      success: true,
      data: {
        processed: result.processed,
        failed: result.failed,
        remaining: result.remaining,
        message: `Processed ${result.processed} sessions, ${result.failed} failed, ${result.remaining} remaining`,
      },
    });
  } catch (error) {
    console.error('Error processing Aristotle queue:', error);
    return NextResponse.json(
      {
        error: {
          code: 'PROCESSING_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/aristotle/process
 *
 * Get queue statistics without processing.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization for non-dev environments
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    const isDev = process.env.NODE_ENV === 'development';
    const hasValidSecret = authHeader === `Bearer ${CRON_SECRET}`;

    if (!isDev && !hasValidSecret) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' } },
        { status: 401 }
      );
    }

    const stats = await getQueueStats();

    return NextResponse.json({
      success: true,
      data: {
        queued: stats.queued,
        processing: stats.processing,
        completed: stats.completed,
        failed: stats.failed,
        total: stats.queued + stats.processing + stats.completed + stats.failed,
      },
    });
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return NextResponse.json(
      {
        error: {
          code: 'STATS_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
