import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');
const fs = require('fs');
const path = require('path');

export async function POST() {
  try {
    const seedPath = path.join(process.cwd(), 'data', 'maharashtra_ground_truth.json');
    if (!fs.existsSync(seedPath)) {
      return NextResponse.json({ error: 'Seed file not found' }, { status: 404 });
    }

    const colleges = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

    // Clear and insert
    db.exec('DELETE FROM active_colleges;');

    const insertStmt = db.prepare(`
      INSERT INTO active_colleges 
      (state, city, college_name, website_url, department, contact_person, official_email, source_page_url, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let count = 0;
    for (const c of colleges) {
      insertStmt.run(
        c.state,
        c.city,
        c.college_name,
        c.website_url,
        c.department || '',
        c.contact_person || '',
        c.official_email.toLowerCase(),
        c.source_page_url,
        'VERIFIED_OFFICIAL'
      );
      count++;
    }

    return NextResponse.json({
      status: 'SUCCESS',
      message: `Imported ${count} verified official Maharashtra institutions with source links`,
      count
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
