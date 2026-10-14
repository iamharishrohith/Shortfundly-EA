import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

function findField(row, keys) {
  const rowKeys = Object.keys(row);
  for (const key of keys) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const prop of rowKeys) {
      const cleanProp = prop.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanProp === cleanKey) {
        const val = row[prop];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }
  for (const key of keys) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const prop of rowKeys) {
      const cleanProp = prop.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanProp.includes(cleanKey)) {
        const val = row[prop];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }
  return '';
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const customState = formData.get('state') || '';
    const clearExisting = formData.get('clearExisting') !== 'false';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No CSV or Excel file uploaded.' }, { status: 400 });
    }

    const filename = file.name || 'uploaded_dataset.csv';
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Uploaded file is empty.' }, { status: 400 });
    }

    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const savedPath = path.join(dataDir, safeName);
    fs.writeFileSync(savedPath, buffer);

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json({ error: 'No readable sheet found in the file.' }, { status: 400 });
    }

    const records = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'The uploaded file contains no data rows.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const seenEmails = new Set();
    const validRows = [];
    const detectedStates = new Set();
    const detectedDistricts = new Set();

    for (const row of records) {
      const email = findField(row, ['official_email', 'email', 'email_id', 'contact_email', 'mail', 'e_mail']).toLowerCase();
      if (!email || !emailRegex.test(email)) continue;
      if (seenEmails.has(email)) continue;
      seenEmails.add(email);

      const collegeName = findField(row, ['college_name', 'college', 'institution_name', 'institution', 'name']) || 'Higher Education Institution';
      const state = findField(row, ['state', 'state_name', 'province']) || customState || 'State Region';
      const city = findField(row, ['city', 'district', 'town', 'location']) || 'Main Campus';
      const website = findField(row, ['website_url', 'website', 'url', 'web', 'link']);
      const contactPerson = findField(row, ['contact_person', 'contact', 'principal', 'dean', 'incharge', 'director']) || 'Office of the Principal';
      const department = findField(row, ['department', 'dept', 'stream', 'faculty']) || 'Academic & Student Affairs';
      const sourcePage = findField(row, ['source_page_url', 'source', 'reference']) || '';

      detectedStates.add(state);
      detectedDistricts.add(city);

      validRows.push({
        state,
        city,
        college_name: collegeName,
        website_url: website,
        department,
        contact_person: contactPerson,
        official_email: email,
        source_page_url: sourcePage,
        verification_status: 'VERIFIED_OFFICIAL'
      });
    }

    if (validRows.length === 0) {
      return NextResponse.json({
        error: 'No valid rows with email addresses found. Please ensure your CSV has an "email" or "official_email" column.'
      }, { status: 400 });
    }

    if (clearExisting) {
      db.exec('DELETE FROM active_colleges;');
    }

    const insertStmt = db.prepare(`
      INSERT INTO active_colleges 
      (state, city, college_name, website_url, department, contact_person, official_email, source_page_url, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.exec('BEGIN TRANSACTION;');
    try {
      for (const item of validRows) {
        insertStmt.run(
          item.state,
          item.city,
          item.college_name,
          item.website_url,
          item.department,
          item.contact_person,
          item.official_email,
          item.source_page_url,
          item.verification_status
        );
      }
      db.exec('COMMIT;');
    } catch (dbErr) {
      db.exec('ROLLBACK;');
      throw dbErr;
    }

    const stateList = Array.from(detectedStates);
    const primaryState = stateList.length === 1 ? stateList[0] : (stateList.length > 1 ? `${stateList[0]} (+${stateList.length - 1} more)` : 'National');

    return NextResponse.json({
      status: 'SUCCESS',
      count: validRows.length,
      filename,
      detectedStates: stateList,
      primaryState,
      uniqueDistrictsCount: detectedDistricts.size,
      message: `Successfully loaded ${validRows.length} institutions across ${detectedDistricts.size} districts (${primaryState}) into active working queue.`
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
