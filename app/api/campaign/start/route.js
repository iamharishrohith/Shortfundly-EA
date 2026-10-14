import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');
const { getTemplateHash, renderContent } = require('@/lib/templateEngine');
const { computeIdempotencyKey, createTransporter, sendEmail } = require('@/lib/mailer');
const eventBus = require('@/lib/eventBus');

// Shared in-memory active campaign state
if (!global.__campaignState) {
  global.__campaignState = {
    isRunning: false,
    killSwitch: false,
    total: 0,
    processed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    mode: 'IDLE'
  };
}

async function runCampaignTask({ campaignId, limit }) {
  const state = global.__campaignState;
  state.isRunning = true;
  state.killSwitch = false;
  state.mode = 'LIVE_SMTP';

  let query = 'SELECT * FROM active_colleges ORDER BY id ASC';
  if (limit && limit > 0) {
    query += ` LIMIT ${parseInt(limit, 10)}`;
  }

  const colleges = db.prepare(query).all();
  state.total = colleges.length;
  state.processed = 0;
  state.sent = 0;
  state.failed = 0;
  state.skipped = 0;

  const tpl = db.prepare('SELECT subject, body_text FROM active_template WHERE id = 1').get();
  const templateHash = getTemplateHash(tpl.subject, tpl.body_text);

  let transporter;
  try {
    transporter = createTransporter();
  } catch (err) {
    state.isRunning = false;
    eventBus.emit('event', { type: 'CAMPAIGN_FAILED', message: err.message });
    return;
  }

  eventBus.emit('event', {
    type: 'CAMPAIGN_START',
    campaignId,
    total: colleges.length,
    mode: state.mode
  });

  const checkStmt = db.prepare('SELECT status FROM dispatch_audit WHERE idempotency_key = ?');
  const insertAuditStmt = db.prepare(`
    INSERT INTO dispatch_audit 
    (idempotency_key, campaign_id, template_hash, college_name, official_email, state, city, status, attempts, error_message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);
  const updateAuditStmt = db.prepare(`
    UPDATE dispatch_audit 
    SET status = ?, attempts = attempts + 1, error_message = ?, updated_at = CURRENT_TIMESTAMP
    WHERE idempotency_key = ?
  `);

  for (let i = 0; i < colleges.length; i++) {
    if (state.killSwitch) {
      eventBus.emit('event', { type: 'CAMPAIGN_KILLED', message: 'Campaign halted by Emergency Kill Switch' });
      break;
    }

    const c = colleges[i];
    const email = (c.official_email || '').trim().toLowerCase();
    const idempKey = computeIdempotencyKey(email, templateHash, campaignId);

    // Idempotency Check
    const existing = checkStmt.get(idempKey);
    if (existing && existing.status === 'SENT') {
      state.skipped++;
      state.processed++;
      eventBus.emit('event', {
        type: 'RECORD_SKIPPED',
        college: c.college_name,
        email,
        reason: 'DUPLICATE_PREVENTION'
      });
      continue;
    }

    const renderedSubject = renderContent(tpl.subject, c);
    const renderedBody = renderContent(tpl.body_text, c);

    // Send Live
    const res = await sendEmail({
      transporter,
      toEmail: email,
      subject: renderedSubject,
      bodyText: renderedBody,
      collegeName: c.college_name,
      campaignId
    });

    if (existing) {
      updateAuditStmt.run(res.status, res.error, idempKey);
    } else {
      insertAuditStmt.run(
        idempKey,
        campaignId,
        templateHash,
        c.college_name,
        email,
        c.state,
        c.city,
        res.status,
        res.error
      );
    }

    if (res.status === 'SENT') {
      state.sent++;
      eventBus.emit('event', {
        type: 'RECORD_SENT',
        college: c.college_name,
        email,
        messageId: res.messageId
      });
    } else {
      state.failed++;
      eventBus.emit('event', {
        type: 'RECORD_FAILED',
        college: c.college_name,
        email,
        error: res.error
      });
    }

    state.processed++;

    // Safe humanized throttle interval
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  state.isRunning = false;
  eventBus.emit('event', { type: 'CAMPAIGN_COMPLETE', stats: { ...state } });
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const campaignId = body.campaignId || 'maharashtra_higher_ed_2026';
    const limit = body.limit || null;

    if (global.__campaignState.isRunning) {
      return NextResponse.json({ error: 'A campaign is already running' }, { status: 400 });
    }

    // Pre-flight check for live SMTP credentials
    try {
      createTransporter();
    } catch (authErr) {
      return NextResponse.json({ error: authErr.message }, { status: 400 });
    }

    // Run async in background
    runCampaignTask({ campaignId, limit }).catch((err) => {
      console.error('Background campaign error:', err);
    });

    return NextResponse.json({
      status: 'INITIATED',
      campaignId,
      mode: 'LIVE_SMTP',
      limit
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
