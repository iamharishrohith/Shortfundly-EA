'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  Building2,
  Database,
  Send,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  FileSpreadsheet,
  Network,
  Zap,
  Tag,
  Check,
  BarChart3,
  Server,
  Terminal,
  Activity,
  MapPin,
  Compass,
  FileText
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-wrapper">
      {/* 1. TOP BRAND NAVIGATION BAR */}
      <motion.nav
        className="landing-nav"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="brand-section">
          <div className="brand-badge">SHORTFUNDLY</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-title)', letterSpacing: '-0.01em' }}>
                Campus Outreach
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="header-status-box" style={{ display: 'none', md: 'flex' }}>
            <span className="status-dot"></span>
            <span style={{ fontSize: '12px' }}>Active Dataset: <strong>Maharashtra State</strong></span>
          </div>

          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={13} style={{ color: 'var(--sf-red)' }} />
              <span>Operator Login</span>
            </button>
          </Link>

          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Enter Bento Deck</span>
              <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </motion.nav>

      {/* 2. HERO SECTION */}
      <section className="landing-hero" style={{ marginBottom: '32px' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <h1 className="hero-title">
            Targeted Higher Education Outreach,<br />
            <span>Built for Institutional Impact</span>
          </h1>

          <p className="hero-subtitle">
            Scale your university partnerships, collegiate short film festivals, and academic initiatives.
            Engineered with a future-ready pan-India architecture &mdash; currently powering outreach across Maharashtra's premier universities and colleges with verified official contacts.
          </p>

          <div className="hero-cta-group">
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <motion.button
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-sm)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Launch Automation Deck</span>
                <ArrowRight size={15} />
              </motion.button>
            </Link>

            <Link href="/login" style={{ textDecoration: 'none' }}>
              <motion.button
                className="btn btn-dark"
                style={{ padding: '12px 22px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-sm)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Lock size={14} />
                <span>Operator Sign In</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 5. 6-TILE BENTO FEATURE MATRIX */}
      <section style={{ marginTop: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="section-tag">Enterprise Capabilities</span>
          <h2 className="section-title">Engineered for Flawless Academic Delivery</h2>
          <p className="section-subtitle">
            Reaching high-ranking university authorities across Maharashtra with an architecture built to expand nationwide.
          </p>
        </div>

        <div className="hero-bento-grid">
          {/* Tile 1 */}
          <div className="hero-bento-tile">
            <div className="hero-bento-icon">
              <Database size={20} />
            </div>
            <h3 className="hero-bento-heading">Verified Institutional Directory</h3>
            <p className="hero-bento-desc">
              Curated higher-education records covering state universities, engineering colleges, and autonomous institutes with official .ac.in / .edu addresses.
            </p>
          </div>

          {/* Tile 2 */}
          <div className="hero-bento-tile">
            <div className="hero-bento-icon">
              <Network size={20} />
            </div>
            <h3 className="hero-bento-heading">Pre-flight MX DNS Validation</h3>
            <p className="hero-bento-desc">
              Inspects recipient mail servers via native Node.js DNS resolvers before transmission. Eliminates dead-letter bounces and protects IP trust.
            </p>
          </div>

          {/* Tile 3 */}
          <div className="hero-bento-tile">
            <div className="hero-bento-icon">
              <Tag size={20} />
            </div>
            <h3 className="hero-bento-heading">Jinja Tag Personalization</h3>
            <p className="hero-bento-desc">
              Effortlessly inject <code>&#123;&#123; college_name &#125;&#125;</code>, <code>&#123;&#123; contact_person &#125;&#125;</code>, and <code>&#123;&#123; city &#125;&#125;</code> for custom tailored letters of collaboration.
            </p>
          </div>

          {/* Tile 4 */}
          <div className="hero-bento-tile">
            <div className="hero-bento-icon">
              <Zap size={20} />
            </div>
            <h3 className="hero-bento-heading">Adaptive Rate Throttling</h3>
            <p className="hero-bento-desc">
              Built-in pooled connection throttler dispatches at exactly 2 messages per second with emergency pause and kill switch safety.
            </p>
          </div>

          {/* Tile 5 */}
          <div className="hero-bento-tile">
            <div className="hero-bento-icon">
              <ShieldCheck size={20} />
            </div>
            <h3 className="hero-bento-heading">SHA-256 Deduplication Shield</h3>
            <p className="hero-bento-desc">
              Every dispatched email is cryptographically hashed against the recipient. Prevents embarrassing repeated emails to the same dean or registrar.
            </p>
          </div>

          {/* Tile 6 */}
          <div className="hero-bento-tile">
            <div className="hero-bento-icon">
              <FileSpreadsheet size={20} />
            </div>
            <h3 className="hero-bento-heading">Audit Ledger &amp; Excel Export</h3>
            <p className="hero-bento-desc">
              Complete dispatch tracking with Message-IDs, delivery timestamps, and 1-click <code>.xlsx</code> export for management reviews.
            </p>
          </div>
        </div>
      </section>

      {/* 6. OUTREACH WORKFLOW */}
      <section className="workflow-section">
        <span className="section-tag">Step-by-Step Flow</span>
        <h2 className="section-title">How Campus Automation Works</h2>
        <p className="section-subtitle">A straightforward 4-step execution model designed for fast, error-free outreach campaigns.</p>

        <div className="workflow-grid">
          <div className="workflow-card">
            <span className="workflow-step-num">Step 01</span>
            <div className="workflow-card-title">Load State Dataset</div>
            <p className="workflow-card-desc">Select state jurisdiction and district filter. Load target slice into active working queue.</p>
          </div>

          <div className="workflow-card">
            <span className="workflow-step-num">Step 02</span>
            <div className="workflow-card-title">Compose Proposal</div>
            <p className="workflow-card-desc">Choose from 4 pre-configured templates or craft custom copy with Jinja tags.</p>
          </div>

          <div className="workflow-card">
            <span className="workflow-step-num">Step 03</span>
            <div className="workflow-card-title">Pre-Flight Test Send</div>
            <p className="workflow-card-desc">Execute single-recipient test send with MX DNS checks in safe simulation mode.</p>
          </div>

          <div className="workflow-card">
            <span className="workflow-step-num">Step 04</span>
            <div className="workflow-card-title">Launch &amp; Export</div>
            <p className="workflow-card-desc">Engage throttled bulk dispatcher. Download comprehensive Excel audit report upon completion.</p>
          </div>
        </div>
      </section>

      {/* 7. TRUST & SECURITY BAR */}
      <div className="trust-bar">
        <div className="trust-item">
          <div className="icon-box success" style={{ width: '32px', height: '32px' }}>
            <ShieldCheck size={16} />
          </div>
          <div>
            <h4>Enterprise Privacy</h4>
            <p>Runs locally on your server. Contact datasets and credentials are never shared with third parties.</p>
          </div>
        </div>

        <div className="trust-item">
          <div className="icon-box primary" style={{ width: '32px', height: '32px' }}>
            <Server size={16} />
          </div>
          <div>
            <h4>Authenticated SMTP</h4>
            <p>Compatible with Google Workspace, Microsoft 365, Amazon SES, and private university mail relays.</p>
          </div>
        </div>

        <div className="trust-item">
          <div className="icon-box dark" style={{ width: '32px', height: '32px' }}>
            <BarChart3 size={16} />
          </div>
          <div>
            <h4>Audit Compliance</h4>
            <p>Permanent SQLite transaction log records every dispatch status and message ID.</p>
          </div>
        </div>
      </div>

      {/* 8. FOOTER */}
      <footer className="landing-footer">
        <div>
          &copy; {new Date().getFullYear()} <strong>Shortfundly</strong> &bull; Campus Outreach &amp; Academic Partnership Network
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link href="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Operator Portal</Link>
          <Link href="/dashboard" style={{ color: 'var(--sf-red)', fontWeight: 600, textDecoration: 'none' }}>Launch Deck &rarr;</Link>
        </div>
      </footer>
    </div>
  );
}
