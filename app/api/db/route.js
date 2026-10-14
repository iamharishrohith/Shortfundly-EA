import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');
const fs = require('fs');
const path = require('path');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table') || 'active_colleges';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50', 10)));
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Allowed tables query
    const tableRows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC").all();
    const tables = tableRows.map(t => t.name);

    if (!tables.includes(table)) {
      return NextResponse.json({ error: 'Table not found', tables }, { status: 400 });
    }

    // Columns info
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();

    // Row count
    let countQuery = `SELECT COUNT(*) as count FROM ${table}`;
    let dataQuery = `SELECT * FROM ${table}`;
    const params = [];

    if (search && search.trim()) {
      const textCols = columns.filter(c => c.type.toUpperCase().includes('TEXT') || c.type.toUpperCase().includes('CHAR')).map(c => c.name);
      if (textCols.length > 0) {
        const whereClause = textCols.map(c => `${c} LIKE ?`).join(' OR ');
        countQuery += ` WHERE ${whereClause}`;
        dataQuery += ` WHERE ${whereClause}`;
        textCols.forEach(() => params.push(`%${search.trim()}%`));
      }
    }

    dataQuery += ` LIMIT ? OFFSET ?`;
    const countResult = db.prepare(countQuery).get(...params);
    const totalCount = countResult ? countResult.count : 0;

    const queryParams = [...params, limit, offset];
    const rows = db.prepare(dataQuery).all(...queryParams);

    // Sanitize user passwords if table is users
    const sanitizedRows = rows.map(r => {
      if (table === 'users' && r.password) {
        return { ...r, password: '••••••••••••••••' };
      }
      return r;
    });

    // DB stats
    const journalMode = db.prepare('PRAGMA journal_mode;').get()?.journal_mode || 'WAL';
    const integrity = db.prepare('PRAGMA integrity_check;').get()?.integrity_check || 'ok';
    const dbPath = path.join(process.cwd(), 'logs', 'next_dispatch_audit.db');
    let fileSize = 0;
    try {
      if (fs.existsSync(dbPath)) {
        fileSize = fs.statSync(dbPath).size;
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      currentTable: table,
      tables,
      columns,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
      rows: sanitizedRows,
      dbMeta: {
        path: dbPath,
        journalMode,
        integrity,
        fileSizeBytes: fileSize,
        fileSizeFormatted: (fileSize / (1024 * 1024)).toFixed(2) + ' MB'
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
