import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');
const { getTemplateHash } = require('@/lib/templateEngine');

export async function GET() {
  try {
    const row = db.prepare('SELECT subject, body_text FROM active_template WHERE id = 1').get();
    if (!row) {
      return NextResponse.json({ error: 'Template not initialized' }, { status: 404 });
    }
    const hash = getTemplateHash(row.subject, row.body_text);
    return NextResponse.json({
      subject: row.subject,
      body_text: row.body_text,
      template_hash: hash
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { subject, body_text } = await req.json();
    if (!subject || !body_text) {
      return NextResponse.json({ error: 'Subject and body_text are required' }, { status: 400 });
    }

    db.prepare(`
      UPDATE active_template
      SET subject = ?, body_text = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(subject.trim(), body_text.trim());

    const hash = getTemplateHash(subject, body_text);
    return NextResponse.json({
      status: 'UPDATED',
      subject: subject.trim(),
      template_hash: hash
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
