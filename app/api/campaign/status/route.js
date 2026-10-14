import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');

export async function GET() {
  try {
    const memoryState = global.__campaignState || {
      isRunning: false,
      total: 0,
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      mode: 'IDLE'
    };

    // Query SQLite database aggregates
    const rows = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM dispatch_audit 
      GROUP BY status
    `).all();

    const dbStats = { TOTAL: 0, SENT: 0, FAILED: 0, SKIPPED_DUPLICATE: 0 };
    let total = 0;
    for (const r of rows) {
      dbStats[r.status] = r.count;
      total += r.count;
    }
    dbStats.TOTAL = total;

    // College count
    const collegeCount = db.prepare('SELECT COUNT(*) as cnt FROM active_colleges').get().cnt;

    return NextResponse.json({
      worker: memoryState,
      database: dbStats,
      activeCollegesCount: collegeCount
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
