import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const state = body.state || null;
    const city = body.city || null;
    const limit = body.limit ? parseInt(body.limit, 10) : null;
    const clearExisting = body.clearExisting !== false; // Default true

    const dataDir = path.join(process.cwd(), 'data');
    let csvPath = path.join(dataDir, 'maharashtra_colleges_master.csv');

    if (body.type === 'verified') {
      csvPath = path.join(dataDir, 'maharashtra_colleges_verified_only.csv');
    } else if (state && state !== 'All') {
      const stateClean = state.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const candidate = path.join(dataDir, `${stateClean}_colleges_master.csv`);
      if (fs.existsSync(candidate)) {
        csvPath = candidate;
      }
    }

    if (!fs.existsSync(csvPath)) {
      // Fallback to first available csv in dataDir
      const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv') || f.endsWith('.xlsx'));
      if (files.length > 0) {
        csvPath = path.join(dataDir, files[0]);
      } else {
        return NextResponse.json({ error: 'No collegiate dataset found in data directory.' }, { status: 404 });
      }
    }

    // Read CSV file using xlsx
    const workbook = xlsx.readFile(csvPath);
    const sheetName = workbook.SheetNames[0];
    let records = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    // Apply state filter if requested
    if (state && state !== 'All') {
      records = records.filter(r => (r.state || '').toLowerCase().includes(state.toLowerCase()));
    }

    // Apply city/district filter if requested
    if (city && city !== 'All') {
      records = records.filter(r => 
        (r.district || '').toLowerCase() === city.toLowerCase() ||
        (r.city || '').toLowerCase() === city.toLowerCase()
      );
    }

    const totalAvailable = records.length;

    // Apply limit if requested
    if (limit && limit > 0) {
      records = records.slice(0, limit);
    }

    if (clearExisting) {
      db.exec('DELETE FROM active_colleges;');
    }

    const insertStmt = db.prepare(`
      INSERT INTO active_colleges 
      (state, city, college_name, website_url, department, contact_person, official_email, source_page_url, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let importedCount = 0;
    for (const r of records) {
      insertStmt.run(
        r.state || state || 'Regional',
        r.district || r.city || city || 'Campus',
        r.college_name || 'Higher Education Institution',
        r.website_url || '',
        r.department || 'Office of the Principal',
        r.contact_person || 'Office of the Principal',
        (r.official_email || r.email || '').toLowerCase(),
        r.source_page_url || '',
        r.verification_status || 'VERIFIED_OFFICIAL'
      );
      importedCount++;
    }

    return NextResponse.json({
      status: 'SUCCESS',
      message: `Successfully imported ${importedCount} institutions from master CSV into active working queue.`,
      importedCount,
      cityFilter: city || 'All',
      totalAvailableInMasterCsv: totalAvailable
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
