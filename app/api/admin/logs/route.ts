import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { Logger } from '@/lib/logging';
import { withLogging } from '@/lib/middleware/logging';
import { withCache } from '@/lib/cache/cache-middleware';

export async function GET(request: NextRequest) {
  return withCache(request, async () => {
    return withLogging(request, async (req) => {
    try {
      console.log('Admin logs API called');
      
      // Check if user is admin
      const user = await getUser();
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get('limit') || '100');
      const offset = parseInt(searchParams.get('offset') || '0');

      console.log('Fetching logs with limit:', limit, 'offset:', offset);
      
      const startTime = Date.now();
      const logs = await Logger.getLogsWithStripe(limit, offset);
      const endTime = Date.now();
      console.log('Found logs:', logs.length, 'in', endTime - startTime, 'ms');

        return NextResponse.json(logs);
      } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json(
          { error: 'Failed to fetch logs' },
          { status: 500 }
        );
      }
    });
  });
}
