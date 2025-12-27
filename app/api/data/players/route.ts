import { NextResponse } from 'next/server';
import {
  getActivePlayerCount,
  getAllPlayers,
  getAllQualifiedPlayers,
} from '@/lib/db/repositories/players';

export async function GET(request?: Request) {
  try {
    const { searchParams } = new URL(request?.url || '');
    const totalPlayers = searchParams.get('total') || null;
    const search = searchParams.get('search');
    const round = searchParams.get('round') || 'qualification';
    if (totalPlayers) {
      const total =
        round !== 'qualification' ? 10 : await getActivePlayerCount(search);
      return NextResponse.json({ total });
    }

    const soryBy = searchParams.get('sort') || 'Date';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const players =
      round === 'qualification'
        ? await getAllPlayers(soryBy, page, pageSize, search)
        : await getAllQualifiedPlayers();
    return NextResponse.json({ players });
  } catch (error) {
    console.error('[v0] Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}
