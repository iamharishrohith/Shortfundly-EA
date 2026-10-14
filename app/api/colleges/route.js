import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const search = searchParams.get('search');

    let query = 'SELECT * FROM active_colleges';
    const params = [];
    const conditions = [];

    if (city) {
      conditions.push('LOWER(city) = LOWER(?)');
      params.push(city);
    }

    if (search) {
      conditions.push('(LOWER(college_name) LIKE ? OR LOWER(official_email) LIKE ?)');
      params.push(`%${search.toLowerCase()}%`);
      params.push(`%${search.toLowerCase()}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id ASC';

    const rows = db.prepare(query).all(...params);
    return NextResponse.json({ data: rows, total: rows.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];

    const insertStmt = db.prepare(`
      INSERT INTO active_colleges 
      (state, city, college_name, website_url, department, contact_person, official_email, source_page_url, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let added = 0;
    for (const item of items) {
      if (item.college_name && item.official_email) {
        insertStmt.run(
          item.state || 'Maharashtra',
          item.city || 'Pune',
          item.college_name.trim(),
          item.website_url || '',
          item.department || '',
          item.contact_person || '',
          item.official_email.trim().toLowerCase(),
          item.source_page_url || '',
          'VERIFIED_OFFICIAL'
        );
        added++;
      }
    }

    return NextResponse.json({ status: 'SUCCESS', added });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    db.exec('DELETE FROM active_colleges;');
    return NextResponse.json({ status: 'SUCCESS', message: 'Reset active colleges to 0 data' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
