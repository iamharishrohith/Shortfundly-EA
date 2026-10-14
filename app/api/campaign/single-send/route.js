import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');
const { getTemplateHash, renderContent } = require('@/lib/templateEngine');
const { computeIdempotencyKey, createTransporter, sendEmail } = require('@/lib/mailer');
const eventBus = require('@/lib/eventBus');

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      college,
      customSubject,
      customBody,
      liveMode = false
    } = body;

    if (!college || !college.official_email) {
      return NextResponse.json({ error: 'Recipient official_email and college details are required' }, { status: 400 });
    }

    // Get active template or use custom override
    const tpl = db.prepare('SELECT subject, body_text FROM active_template WHERE id = 1').get() || {
      subject: 'Collaboration Proposal - Shortfundly Campus',
      body_text: 'Dear {{ contact_person }},\n\nWe would like to propose a collaboration with {{ college_name }}.'
    };

    const rawSubject = customSubject || tpl.subject;
    const rawBody = customBody || tpl.body_text;

    const subject = renderContent(rawSubject, college);
    const bodyText = renderContent(rawBody, college);
    const templateHash = getTemplateHash(subject, bodyText);

    const campaignId = 'individual_single_dispatch';
    const email = (college.official_email || '').trim().toLowerCase();
    const idempotencyKey = computeIdempotencyKey(email, templateHash, campaignId);

    // Initialize production transporter
    let transporter;
    try {
      transporter = createTransporter();
    } catch (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 400 });
    }

    // Send email live
    const result = await sendEmail({
      transporter,
      toEmail: email,
      subject,
      bodyText,
      collegeName: college.college_name || 'Individual Institution',
      campaignId
    });

    // Record or update audit ledger
    try {
      const existing = db.prepare('SELECT id FROM dispatch_audit WHERE idempotency_key = ?').get(idempotencyKey);
      if (existing) {
        db.prepare(`
          UPDATE dispatch_audit 
          SET status = ?, attempts = attempts + 1, error_message = ?, updated_at = CURRENT_TIMESTAMP
          WHERE idempotency_key = ?
        `).run(result.status, result.error || null, idempotencyKey);
      } else {
        db.prepare(`
          INSERT INTO dispatch_audit 
          (idempotency_key, campaign_id, template_hash, college_name, official_email, state, city, status, attempts, error_message)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        `).run(
          idempotencyKey,
          campaignId,
          templateHash,
          college.college_name || 'Individual Target',
          email,
          college.state || 'N/A',
          college.city || 'N/A',
          result.status,
          result.error || null
        );
      }
    } catch (dbErr) {
      console.error('Audit ledger record error:', dbErr);
    }

    eventBus.emit('event', {
      type: 'SINGLE_DISPATCH',
      data: {
        recipient: email,
        college: college.college_name,
        status: result.status,
        mode: result.mode,
        messageId: result.messageId
      }
    });

    return NextResponse.json({
      success: result.success,
      status: result.status,
      mode: result.mode,
      messageId: result.messageId,
      recipient: email,
      college: college.college_name,
      renderedSubject: subject,
      error: result.error
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
