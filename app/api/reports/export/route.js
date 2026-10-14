import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');
const xlsx = require('xlsx');

export async function GET() {
  try {
    const rows = db.prepare('SELECT * FROM dispatch_audit ORDER BY id ASC').all();

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(rows);
    xlsx.utils.book_append_sheet(wb, ws, 'Audit_Ledger');

    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="maharashtra_email_audit_report.xlsx"'
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
