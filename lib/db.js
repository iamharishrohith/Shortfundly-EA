/**
 * Database Module using Node.js native SQLite (node:sqlite)
 * Supports Write-Ahead Logging (WAL) for concurrent, high-throughput, ACID transactions.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const LOGS_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const DB_PATH = path.join(LOGS_DIR, 'next_dispatch_audit.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS active_colleges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    college_name TEXT NOT NULL,
    website_url TEXT NOT NULL,
    department TEXT,
    contact_person TEXT,
    official_email TEXT NOT NULL,
    source_page_url TEXT NOT NULL,
    verification_status TEXT DEFAULT 'VERIFIED_OFFICIAL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS dispatch_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idempotency_key TEXT UNIQUE NOT NULL,
    campaign_id TEXT NOT NULL,
    template_hash TEXT NOT NULL,
    college_name TEXT NOT NULL,
    official_email TEXT NOT NULL,
    state TEXT,
    city TEXT,
    status TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS active_template (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    subject TEXT NOT NULL,
    body_text TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS smtp_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    host TEXT NOT NULL DEFAULT 'smtp.gmail.com',
    port INTEGER NOT NULL DEFAULT 587,
    secure INTEGER NOT NULL DEFAULT 0,
    user TEXT DEFAULT '',
    pass TEXT DEFAULT '',
    from_email TEXT NOT NULL DEFAULT 'outreach@shortfundly.com',
    from_name TEXT NOT NULL DEFAULT 'Shortfundly Education Outreach',
    is_live_enabled INTEGER NOT NULL DEFAULT 0,
    last_tested_at DATETIME,
    last_test_status TEXT,
    last_test_message TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS smtp_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_name TEXT NOT NULL,
    host TEXT NOT NULL DEFAULT 'smtp.gmail.com',
    port INTEGER NOT NULL DEFAULT 587,
    secure INTEGER NOT NULL DEFAULT 0,
    user TEXT DEFAULT '',
    pass TEXT DEFAULT '',
    from_email TEXT NOT NULL DEFAULT 'outreach@shortfundly.com',
    from_name TEXT NOT NULL DEFAULT 'Shortfundly Education Outreach',
    is_active INTEGER NOT NULL DEFAULT 0,
    last_tested_at DATETIME,
    last_test_status TEXT,
    last_test_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default SMTP config if empty
const existingSmtp = db.prepare('SELECT id FROM smtp_config WHERE id = 1').get();
if (!existingSmtp) {
  db.prepare(`
    INSERT INTO smtp_config (id, host, port, secure, user, pass, from_email, from_name, is_live_enabled)
    VALUES (1, 'smtp.gmail.com', 587, 0, '', '', 'outreach@shortfundly.com', 'Shortfundly Education Outreach', 0)
  `).run();
}

// Seed/Migrate smtp_accounts if empty
const accountCount = db.prepare('SELECT COUNT(*) as count FROM smtp_accounts').get();
if (!accountCount || accountCount.count === 0) {
  const currentConfig = db.prepare('SELECT * FROM smtp_config WHERE id = 1').get();
  if (currentConfig) {
    db.prepare(`
      INSERT INTO smtp_accounts (account_name, host, port, secure, user, pass, from_email, from_name, is_active, last_tested_at, last_test_status, last_test_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `).run(
      'Primary Outreach (Default)',
      currentConfig.host || 'smtp.gmail.com',
      currentConfig.port || 587,
      currentConfig.secure || 0,
      currentConfig.user || '',
      currentConfig.pass || '',
      currentConfig.from_email || 'outreach@shortfundly.com',
      currentConfig.from_name || 'Shortfundly Education Outreach',
      currentConfig.last_tested_at || null,
      currentConfig.last_test_status || null,
      currentConfig.last_test_message || null
    );
  } else {
    db.prepare(`
      INSERT INTO smtp_accounts (account_name, host, port, secure, user, pass, from_email, from_name, is_active)
      VALUES ('Primary Gmail Account', 'smtp.gmail.com', 587, 0, '', '', 'outreach@shortfundly.com', 'Shortfundly Education Outreach', 1)
    `).run();
  }
}

// Seed default template if empty (Shortfundly Campus Collaboration Proposal)
const existingTpl = db.prepare('SELECT id FROM active_template WHERE id = 1').get();
if (!existingTpl) {
  const defaultSubj = 'PROPOSAL FOR SHORTFUNDLY CAMPUS COLLABORATION - Empowering Student Creators at {{ college_name }}';
  const defaultBody = `PROPOSAL FOR SHORTFUNDLY CAMPUS COLLABORATION
Empowering Student Creators at {{ college_name }}

Dear {{ contact_person }},

Greetings from Shortfundly!

We propose a collaboration with {{ college_name }} through Shortfundly Campus to help students develop creative skills, showcase their work, and explore opportunities in filmmaking and digital content.

About Shortfundly Campus

Shortfundly Campus connects student creators with collaboration, film submission, promotion, and event opportunities. Its Campus Pass brings together six products: Connect, Festival, Hub, Marketing, Ticket, and Tools. Students can build creator profiles, find collaborators, and prepare their projects for wider exposure.

Proposed Areas of Collaboration

* Student onboarding: Introduce interested students to the platform and help them activate their access.
* Learning sessions: Plan workshops on filmmaking, OTT distribution, film marketing, and AI.
* Campus activities: Organize screenings and competitions to showcase student talent.
* Creator development: Encourage portfolio building, collaboration, and festival participation.
* Student leadership: Explore a Campus Ambassador initiative to support participation and community building.

The activities, frequency, support, and deliverables will be finalized jointly with the institution.

Objectives for the Institution

Through this partnership, we aim to:

* Create a structured pathway for students to develop and present creative projects.
* Strengthen participation in film clubs and interdisciplinary activities.
* Help students build practical experience and demonstrable portfolios.
* Showcase the institution's emerging creative talent.

Proposed Implementation

1. Conduct a product demonstration for faculty and student coordinators.
2. Confirm participating departments, student numbers, and priorities.
3. Finalize the scope, commercial terms, and activity schedule.
4. Conduct an orientation and begin student onboarding.
5. Review participation and project progress with the designated faculty coordinator.

Commercial Terms

The Campus Pass is currently listed at INR 1,500 + GST per year. Institutional pricing and any additional activity charges will be confirmed through a separate quotation based on the agreed scope.

Next Steps

We would welcome a meeting with your team to understand your requirements and present Shortfundly Campus. Kindly share a convenient time and nominate a faculty coordinator to take the discussion forward.

Contact: +91 93612 23155
Explore Campus: https://campus.shortfundly.com/
Schedule a Meeting: https://calendly.com/shortfundly-meeting/30min

Warm regards,
{{ sender_name }}
Product Manager | Shortfundly`;

  db.prepare('INSERT INTO active_template (id, subject, body_text) VALUES (1, ?, ?)').run(defaultSubj, defaultBody);
}

module.exports = { db };
