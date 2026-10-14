import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const id = body.id || parseInt(searchParams.get('id'), 10);

    if (!id) {
      return NextResponse.json({ error: 'Missing account ID' }, { status: 400 });
    }

    const target = db.prepare('SELECT * FROM smtp_accounts WHERE id = ?').get(id);
    if (!target) {
      return NextResponse.json({ error: 'Account not found in vault' }, { status: 404 });
    }

    // Atomically deactivate all accounts and activate the target account
    db.prepare('UPDATE smtp_accounts SET is_active = 0').run();
    db.prepare('UPDATE smtp_accounts SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

    // Keep smtp_config in sync for backward compatibility
    try {
      db.prepare(`
        UPDATE smtp_config
        SET host = ?,
            port = ?,
            secure = ?,
            user = ?,
            pass = ?,
            from_email = ?,
            from_name = ?,
            is_live_enabled = ?,
            last_tested_at = ?,
            last_test_status = ?,
            last_test_message = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `).run(
        target.host,
        target.port,
        target.secure,
        target.user,
        target.pass,
        target.from_email,
        target.from_name,
        target.user && target.pass ? 1 : 0,
        target.last_tested_at,
        target.last_test_status,
        target.last_test_message
      );
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `Switched active SMTP account to: ${target.account_name} (${target.user || target.host})`,
      activeAccount: {
        id: target.id,
        account_name: target.account_name,
        host: target.host,
        port: target.port,
        user: target.user,
        from_email: target.from_email,
        from_name: target.from_name
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
