import { NextResponse } from 'next/server';
import { getAdminByUsername, updateAdmin } from '@/lib/db/repositories/admins';
import { comparePassword } from '@/lib/password-utils';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    const admin = await getAdminByUsername(username);
    if (admin && admin.status === 'active') {
      const lastLogin = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await updateAdmin(admin.id, { lastLogin });
      const { password: _, ...adminWithoutPassword } = admin;
      return NextResponse.json({ success: true, admin: adminWithoutPassword });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[v0] Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
