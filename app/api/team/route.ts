import { NextRequest } from 'next/server';
import { getTeamForUser } from '@/lib/db/queries';
import { withCache } from '@/lib/cache/cache-middleware';

export async function GET(request: NextRequest) {
  return withCache(request, async () => {
    const team = await getTeamForUser();
    return Response.json(team);
  });
}
