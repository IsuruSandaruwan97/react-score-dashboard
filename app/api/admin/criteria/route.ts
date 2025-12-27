import { type NextRequest, NextResponse } from 'next/server';
import {
  createCriterion,
  updateCriterion,
  deleteCriterion,
  getAllCriteria,
} from '@/lib/db/repositories/criteria';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, maxPoints, type } = body;

    const allCriteria = await getAllCriteria();

    const newCriterion = {
      id: `criterion_${Date.now()}`,
      name,
      description: description || '',
      maxPoints: maxPoints || 20,
      displayOrder: allCriteria.length,
      active: true,
      type,
    };

    await createCriterion(newCriterion);

    return NextResponse.json({ success: true, criterion: newCriterion });
  } catch (error) {
    console.error('[v0] Error creating criterion:', error);
    return NextResponse.json(
      { error: 'Failed to create criterion' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, maxPoints, type } = body;

    await updateCriterion(id, { name, description, maxPoints, type });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error updating criterion:', error);
    return NextResponse.json(
      { error: 'Failed to update criterion' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, active } = body;

    await updateCriterion(id, { active });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error toggling criterion:', error);
    return NextResponse.json(
      { error: 'Failed to toggle criterion' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Criterion ID required' },
        { status: 400 }
      );
    }

    await deleteCriterion(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting criterion:', error);
    return NextResponse.json(
      { error: 'Failed to delete criterion' },
      { status: 500 }
    );
  }
}
