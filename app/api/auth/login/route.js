import { NextResponse } from 'next/server';
const { authenticateUser } = require('@/lib/db');

export async function POST(req) {
  try {
    const body = await req.json();
    const { identifier, password } = body || {};

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Admin ID / Email and password are required.' },
        { status: 400 }
      );
    }

    const user = authenticateUser(identifier, password);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Please verify your ID and password.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        role_title: user.role_title,
        department: user.department,
        badge_color: user.badge_color,
        permissions: user.permissions,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
