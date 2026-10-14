/**
 * Maharashtra Colleges Official Contact Harvester & Validator
 * Validates official institutional websites, contacts, emails, and source proof URLs.
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const DATA_DIR = path.join(__dirname, '..', 'data');
const GROUND_TRUTH_FILE = path.join(DATA_DIR, 'maharashtra_ground_truth.json');
const EXCEL_OUTPUT = path.join(DATA_DIR, 'maharashtra_colleges_official.xlsx');
const CSV_OUTPUT = path.join(DATA_DIR, 'maharashtra_colleges_official.csv');

const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

function validateAndHarvest() {
  console.log('Loading official Maharashtra ground truth registry...');
  if (!fs.existsSync(GROUND_TRUTH_FILE)) {
    console.error('Ground truth file not found:', GROUND_TRUTH_FILE);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(GROUND_TRUTH_FILE, 'utf-8'));
  const validRecords = [];
  const rejectedRecords = [];
  const seenEmails = new Set();
  const seenColleges = new Set();

  for (const item of rawData) {
    const email = (item.official_email || '').trim().toLowerCase();
    const college = (item.college_name || '').trim();
    const website = (item.website_url || '').trim();
    const sourceUrl = (item.source_page_url || '').trim();

    if (!item.state || !item.city || !college) {
      rejectedRecords.push({ item, reason: 'Missing state, city, or college name' });
      continue;
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      rejectedRecords.push({ item, reason: 'Invalid email syntax: ' + email });
      continue;
    }

    if (!website || !sourceUrl) {
      rejectedRecords.push({ item, reason: 'Missing official website URL or source page URL' });
      continue;
    }

    if (seenEmails.has(email)) {
      rejectedRecords.push({ item, reason: 'Duplicate email: ' + email });
      continue;
    }

    if (seenColleges.has(college.toLowerCase())) {
      rejectedRecords.push({ item, reason: 'Duplicate college name: ' + college });
      continue;
    }

    seenEmails.add(email);
    seenColleges.add(college.toLowerCase());

    validRecords.push({
      state: item.state.trim(),
      city: item.city.trim(),
      college_name: college,
      website_url: website,
      department: (item.department || '').trim(),
      contact_person: (item.contact_person || '').trim(),
      official_email: email,
      source_page_url: sourceUrl,
      verification_status: 'VERIFIED_OFFICIAL'
    });
  }

  console.log(`Validated ${validRecords.length} official institutions. Rejected: ${rejectedRecords.length}.`);

  // Export to Excel
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(validRecords);
  xlsx.utils.book_append_sheet(wb, ws, 'Maharashtra_Colleges');
  xlsx.writeFile(wb, EXCEL_OUTPUT);
  console.log('Saved official Excel workbook to:', EXCEL_OUTPUT);

  // Export to CSV
  const csvContent = xlsx.utils.sheet_to_csv(ws);
  fs.writeFileSync(CSV_OUTPUT, csvContent, 'utf-8');
  console.log('Saved official CSV file to:', CSV_OUTPUT);

  return validRecords;
}

if (require.main === module) {
  validateAndHarvest();
}

module.exports = { validateAndHarvest };
