import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');
const { verifySmtpConnection } = require('@/lib/mailer');

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      accountId,
      host,
      port,
      secure,
      user,
      pass
    } = body;

    // Run connection handshake test (using accountId if supplied)
    const result = await verifySmtpConnection({
      accountId,
      host,
      port,
      secure,
      user,
      pass
    });

    const status = result.success ? 'SUCCESS' : 'FAILED';
    const message = result.message || (result.success ? 'Verified' : 'Verification failed');

    // Update database audit record in smtp_config for backward compatibility
    try {
      db.prepare(`
        UPDATE smtp_config
        SET last_tested_at = CURRENT_TIMESTAMP,
            last_test_status = ?,
            last_test_message = ?
        WHERE id = 1
      `).run(status, message);
    } catch (dbErr) {
      console.error('Failed to log test status to database:', dbErr);
    }

    return NextResponse.json({
      success: result.success,
      durationMs: result.durationMs,
      message: result.message,
      error: result.error,
      status
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err.message,
      error: 'SERVER_ERROR',
      status: 'FAILED'
    }, { status: 500 });
  }
}
