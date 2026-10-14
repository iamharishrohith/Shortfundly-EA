import { NextResponse } from 'next/server';
const { getAllUsers } = require('@/lib/db');

export async function GET() {
  try {
    const users = getAllUsers();
    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve user accounts.' },
      { status: 500 }
    );
  }
}
