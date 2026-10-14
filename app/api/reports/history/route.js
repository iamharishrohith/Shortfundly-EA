import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    let query = 'SELECT * FROM dispatch_audit WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (college_name LIKE ? OR official_email LIKE ?)';
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const rows = db.prepare(query).all(...params);

    return NextResponse.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    return NextResponse.json({ error: err.message, success: false }, { status: 500 });
  }
}
