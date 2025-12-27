import { NextResponse } from 'next/server';
import {
  getAllCriteria,
  getAllCriteriaByType,
} from '@/lib/db/repositories/criteria';

export async function GET(request?: Request) {
  try {
    const { searchParams } = new URL(request?.url || '');
    const type = searchParams.get('type') || null;
    const criteria = !type
      ? await getAllCriteria()
      : await getAllCriteriaByType(type);
    return NextResponse.json({ criteria });
  } catch (error) {
    console.error('[v0] Error fetching criteria:', error);
    return NextResponse.json(
      { error: 'Failed to fetch criteria' },
      { status: 500 }
    );
  }
}
