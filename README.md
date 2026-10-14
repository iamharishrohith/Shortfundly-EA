# Shortfundly-EA

Enterprise College Email Automation & Outreach Control Deck for Shortfundly Campus Partnerships.

## Overview
Shortfundly-EA is a Next.js production web application and email automation suite designed to manage collegiate datasets, customize personalized outreach templates, verify deliverability via DNS MX lookups, and execute live or simulated SMTP email dispatch with SHA-256 deduplication and audit tracking.

## Core Features
- **Dynamic Dataset Staging**: Direct CSV / Excel upload with automatic header detection (`College Name`, `Official Email`, `Website`, `District`, `State`).
- **Template Engine**: Dynamic placeholder variable substitution (`{{ college_name }}`, `{{ contact_person }}`, `{{ department }}`, `{{ city }}`) with automatic SHA-256 template hashing.
- **Audited SMTP Dispatcher**: Nodemailer integration with connection pooling, rate limiting, and emergency kill switch.
- **ACID Audit Ledger**: Powered by Node.js native SQLite (`node:sqlite`) in WAL mode for concurrent, idempotent delivery logs.
- **MX Record Verification**: Multi-resolver DNS verification checking target institutional mail server health.

## Quick Start (Production)

### 1. Installation
```bash
npm install
```

### 2. Build for Production
```bash
npm run build
```

### 3. Start Production Server
```bash
npm start
```
The application will launch on `http://localhost:3000`.

## Directory Structure
- `app/`: Next.js 14 App Router UI pages and `/api` routes
- `lib/`: Core backend modules (`db.js`, `mailer.js`, `templateEngine.js`, `eventBus.js`)
- `data/`: Master collegiate datasets and verified URL lists
- `config/`: Configuration presets and environment templates
- `public/`: Static brand assets and icons

## License
Proprietary - Shortfundly Campus Network
