import { NextRequest, NextResponse } from 'next/server';
import { runSync } from '@/lib/sync';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.SYNC_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runSync();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json(
      { error: 'Sync failed', detail: (error as Error).message },
      { status: 500 },
    );
  }
}
