import { NextResponse } from 'next/server';
const fs = require('fs');
const path = require('path');
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format');
  const type = searchParams.get('type');
  const baseName = type === 'verified' ? 'maharashtra_colleges_verified_only' : 'maharashtra_colleges_master';
  const filename = format === 'xlsx' ? `${baseName}.xlsx` : `${baseName}.csv`;
  const filePath = path.join(process.cwd(), 'data', filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: `File ${filename} not found` }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const contentType = format === 'xlsx' 
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : 'text/csv; charset=utf-8';

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
