import { NextResponse } from 'next/server';
const { db } = require('@/lib/db');
const { renderContent } = require('@/lib/templateEngine');

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get('id');

    let college = null;
    if (collegeId) {
      college = db.prepare('SELECT * FROM active_colleges WHERE id = ?').get(collegeId);
    } else {
      college = db.prepare('SELECT * FROM active_colleges ORDER BY id ASC LIMIT 1').get();
    }

    if (!college) {
      college = {
        college_name: 'COEP Technological University',
        city: 'Pune',
        state: 'Maharashtra',
        contact_person: 'Dr. D. N. Sonawane, Registrar',
        department: 'Office of the Registrar / Academic Leadership',
        official_email: 'registrar@coeptech.ac.in'
      };
    }

    const tpl = db.prepare('SELECT subject, body_text FROM active_template WHERE id = 1').get();
    const renderedSubject = renderContent(tpl.subject, college);
    const renderedBody = renderContent(tpl.body_text, college);

    return NextResponse.json({
      college,
      subject: renderedSubject,
      body: renderedBody
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
