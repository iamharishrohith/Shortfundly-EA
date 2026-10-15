import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Cache in-memory dataset to ensure instantaneous response times
let cachedRecords = null;
let lastLoadedTime = 0;

function loadVerifiedDataset() {
  const dataDir = path.join(process.cwd(), 'data');
  const csvPath = path.join(dataDir, 'maharashtra_colleges_verified_only.csv');
  const now = Date.now();

  if (cachedRecords && (now - lastLoadedTime < 30000)) {
    return cachedRecords;
  }

  if (!fs.existsSync(csvPath)) {
    return [];
  }

  const workbook = xlsx.readFile(csvPath);
  const sheetName = workbook.SheetNames[0];
  const raw = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  cachedRecords = raw.map((r, idx) => ({
    id: idx + 1,
    aishe_code: r.aishe_code || '',
    college_name: r.college_name || '',
    category: r.category || 'Higher Education',
    district: r.district || r.city || '',
    city: r.city || r.district || '',
    state: r.state || 'Maharashtra',
    contact_person: r.contact_person || 'Principal / Head of Institution',
    designation: r.designation || 'Principal / Director',
    department: r.department || 'Office of the Principal',
    official_email: (r.official_email || r.email || '').toLowerCase().trim(),
    phone_number: r.phone_number || '',
    website_url: r.website_url || '',
    source_page_url: r.source_page_url || '',
    verification_status: r.verification_status || 'VERIFIED_OFFICIAL'
  }));

  lastLoadedTime = now;
  return cachedRecords;
}

function filterRecords(records, { role, district, category, search }) {
  return records.filter(r => {
    // Role filter
    if (role && role !== 'ALL') {
      const desig = (r.designation || '').toLowerCase();
      if (role === 'PRINCIPALS' && !desig.includes('principal') && !desig.includes('director')) return false;
      if (role === 'FACULTIES' && !desig.includes('professor') && !desig.includes('faculty') && !desig.includes('lecturer')) return false;
      if (role === 'HODS' && !desig.includes('hod') && !desig.includes('head of')) return false;
      if (role === 'DEANS' && !desig.includes('dean')) return false;
      if (role === 'TPOS' && !desig.includes('tpo') && !desig.includes('placement')) return false;
      if (role === 'REGISTRARS' && !desig.includes('registrar') && !desig.includes('admin') && !desig.includes('superintendent')) return false;
    }

    // District filter
    if (district && district !== 'ALL') {
      const d = (r.district || '').toLowerCase();
      const c = (r.city || '').toLowerCase();
      const target = district.toLowerCase();
      if (!d.includes(target) && !c.includes(target)) return false;
    }

    // Category filter
    if (category && category !== 'ALL') {
      const cat = (r.category || '').toLowerCase();
      if (!cat.includes(category.toLowerCase())) return false;
    }

    // Search query
    if (search && search.trim()) {
      const q = search.toLowerCase();
      const cname = (r.college_name || '').toLowerCase();
      const email = (r.official_email || '').toLowerCase();
      const person = (r.contact_person || '').toLowerCase();
      if (!cname.includes(q) && !email.includes(q) && !person.includes(q)) return false;
    }

    return true;
  });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || 'ALL';
    const district = searchParams.get('district') || 'ALL';
    const category = searchParams.get('category') || 'ALL';
    const search = searchParams.get('search') || '';
    const batchSize = Math.max(10, parseInt(searchParams.get('batchSize') || '100', 10));
    const batchNumber = Math.max(1, parseInt(searchParams.get('batchNumber') || '1', 10));

    const allRecords = loadVerifiedDataset();
    const filtered = filterRecords(allRecords, { role, district, category, search });
    
    const totalCount = filtered.length;
    const totalBatches = Math.max(1, Math.ceil(totalCount / batchSize));
    const safeBatchNum = Math.min(batchNumber, totalBatches);

    const startIndex = (safeBatchNum - 1) * batchSize;
    const endIndex = Math.min(startIndex + batchSize, totalCount);
    const batchRecords = filtered.slice(startIndex, endIndex);

    // Compute meta summary
    const roleCounts = {
      ALL: allRecords.length,
      PRINCIPALS: allRecords.filter(r => (r.designation || '').toLowerCase().includes('principal') || (r.designation || '').toLowerCase().includes('director')).length,
      FACULTIES: allRecords.filter(r => (r.designation || '').toLowerCase().includes('professor') || (r.designation || '').toLowerCase().includes('faculty') || (r.designation || '').toLowerCase().includes('lecturer')).length,
      HODS: allRecords.filter(r => (r.designation || '').toLowerCase().includes('hod') || (r.designation || '').toLowerCase().includes('head of')).length,
      DEANS: allRecords.filter(r => (r.designation || '').toLowerCase().includes('dean')).length,
      TPOS: allRecords.filter(r => (r.designation || '').toLowerCase().includes('tpo') || (r.designation || '').toLowerCase().includes('placement')).length,
      REGISTRARS: allRecords.filter(r => (r.designation || '').toLowerCase().includes('registrar') || (r.designation || '').toLowerCase().includes('admin') || (r.designation || '').toLowerCase().includes('superintendent')).length,
    };

    // Top districts
    const districtMap = {};
    for (const r of allRecords) {
      const d = r.district || 'Other';
      districtMap[d] = (districtMap[d] || 0) + 1;
    }
    const topDistricts = Object.entries(districtMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      status: 'SUCCESS',
      totalDatasetCount: allRecords.length,
      filteredCount: totalCount,
      totalBatches,
      currentBatch: safeBatchNum,
      batchSize,
      startIndex: totalCount > 0 ? startIndex + 1 : 0,
      endIndex,
      batchRecords,
      roleCounts,
      topDistricts
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'stage_batch'; // 'stage_batch' or 'stage_all'
    const role = body.role || 'ALL';
    const district = body.district || 'ALL';
    const category = body.category || 'ALL';
    const search = body.search || '';
    const batchSize = Math.max(10, parseInt(body.batchSize || '100', 10));
    const batchNumber = Math.max(1, parseInt(body.batchNumber || '1', 10));
    const clearExisting = body.clearExisting !== false;

    const allRecords = loadVerifiedDataset();
    const filtered = filterRecords(allRecords, { role, district, category, search });

    let recordsToStage = [];
    if (action === 'stage_all') {
      recordsToStage = filtered;
    } else {
      const totalBatches = Math.max(1, Math.ceil(filtered.length / batchSize));
      const safeBatchNum = Math.min(batchNumber, totalBatches);
      const start = (safeBatchNum - 1) * batchSize;
      recordsToStage = filtered.slice(start, start + batchSize);
    }

    if (clearExisting) {
      db.exec('DELETE FROM active_colleges;');
    }

    const insertStmt = db.prepare(`
      INSERT INTO active_colleges 
      (state, city, college_name, website_url, department, contact_person, official_email, source_page_url, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let stagedCount = 0;
    for (const r of recordsToStage) {
      if (r.official_email && r.college_name) {
        insertStmt.run(
          r.state || 'Maharashtra',
          r.city || r.district || 'Maharashtra',
          r.college_name,
          r.website_url || '',
          r.department || 'Office of the Principal',
          r.contact_person || 'Principal / Head of Institution',
          r.official_email,
          r.source_page_url || '',
          r.verification_status || 'VERIFIED_OFFICIAL'
        );
        stagedCount++;
      }
    }

    const currentTotalInDb = db.prepare('SELECT count(*) as c FROM active_colleges').get().c;

    return NextResponse.json({
      status: 'SUCCESS',
      message: `Successfully staged ${stagedCount} institutions into active queue.`,
      stagedCount,
      action,
      batchNumber,
      batchSize,
      totalInQueue: currentTotalInDb
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
