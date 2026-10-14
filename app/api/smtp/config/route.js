import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');
const { getSmtpConfig } = require('@/lib/mailer');

export async function GET() {
  try {
    const config = getSmtpConfig();
    return NextResponse.json({
      id: config.id,
      account_name: config.account_name || 'Primary Account',
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.user,
      hasPassword: Boolean(config.pass && config.pass.length > 0),
      from_email: config.from_email,
      from_name: config.from_name,
      is_live_enabled: config.is_live_enabled,
      last_tested_at: config.last_tested_at,
      last_test_status: config.last_test_status,
      last_test_message: config.last_test_message
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      host = 'smtp.gmail.com',
      port = 587,
      secure = false,
      user = '',
      pass = '',
      from_email = 'outreach@shortfundly.com',
      from_name = 'Shortfundly Education Outreach',
      is_live_enabled = false
    } = body;

    const current = db.prepare('SELECT pass FROM smtp_config WHERE id = 1').get();
    let finalPass = current ? current.pass : '';
    // Only update password if a new, non-masked password is provided
    if (pass && pass !== '••••••••' && pass.trim().length > 0) {
      finalPass = pass.trim();
    }

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
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      host.trim(),
      parseInt(port, 10),
      secure ? 1 : 0,
      user.trim(),
      finalPass,
      from_email.trim(),
      from_name.trim(),
      is_live_enabled ? 1 : 0
    );

    return NextResponse.json({
      success: true,
      message: 'SMTP Configuration successfully saved.',
      is_live_enabled: Boolean(is_live_enabled)
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
