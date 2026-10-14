# College Email Automation Workflow - Operator and Demonstration Guide (Maharashtra Focus)

This guide details the complete operation of the email automation pipeline for higher education institutions in Maharashtra. It walks through data management, template customization, internal staging tests, automated dispatches, and delivery audit tracking.

---

## 1. System Overview and Directory Structure

The system is organized into modular directories:

```
Email Automation/
├── config/
│   ├── settings.yaml            # Dispatch limits, throttling delays, SMTP parameters
│   └── .env.example             # Template for SMTP credentials
├── data/
│   ├── colleges_master.xlsx     # Master official college database for Maharashtra (Excel)
│   ├── colleges_master.csv      # Master official college database for Maharashtra (CSV)
│   └── test_recipients.csv      # Internal test contacts for pre-flight testing
├── templates/
│   ├── template_config.json     # Active template configuration and placeholder fallbacks
│   ├── default_invite.html      # Responsive HTML email layout
│   └── default_invite.txt       # Plain-text deliverability fallback
├── src/
│   ├── collector_validator.py   # Data validation, RFC checks, and deduplication
│   ├── template_engine.py       # Jinja2 template personalization and fallback engine
│   ├── mailer.py                # Throttled SMTP dispatcher with rate limiting and simulation
│   ├── tracker.py               # SQLite WAL audit ledger and idempotency guard
│   ├── engine.py                # Asynchronous worker pipeline with circuit breaker
│   ├── harvester.py             # Official contact crawler and extractor
│   ├── server.py                # FastAPI REST API, SSE streaming, and Control Deck UI
│   └── cli.py                   # Unified operator interface
├── logs/
│   ├── dispatch_audit.db        # SQLite transactional database
│   └── audit_report.xlsx        # Exported delivery report
├── outbox_preview/              # Rendered HTML previews for inspection
└── tests/                       # Automated test suite
```

---

## 2. Step 1: Manage and Validate College Contact Details (Maharashtra)

All contacts originate from official institutional web pages (.ac.in, .edu, or accredited college portals).

### Institutions Included in the Maharashtra Master Dataset
- COEP Technological University, Pune (`registrar@coeptech.ac.in`)
- Veermata Jijabai Technological Institute (VJTI), Mumbai (`director@vjti.ac.in`)
- Savitribai Phule Pune University (SPPU), Pune (`regis@unipune.ac.in`)
- Fergusson College (Autonomous), Pune (`principal@fergusson.edu`)
- Sardar Patel Institute of Technology (SPIT), Mumbai (`principal@spit.ac.in`)
- Walchand College of Engineering, Sangli (`director@walchandsangli.ac.in`)
- Visvesvaraya National Institute of Technology (VNIT), Nagpur (`registrar@vnit.ac.in`)
- University of Mumbai, Mumbai (`registrar@fort.mu.ac.in`)
- St. Xavier's College (Autonomous), Mumbai (`principal@xaviers.edu`)
- K. J. Somaiya College of Engineering, Mumbai (`principal.kjsce@somaiya.edu`)
- Vishwakarma Institute of Technology (VIT), Pune (`director@vit.edu`)
- Government College of Engineering, Chhatrapati Sambhajinagar (`principal@geca.ac.in`)
- Government College of Engineering, Karad (`principal@gcekarad.ac.in`)
- Shri Ramdeobaba College of Engineering and Management, Nagpur (`principal@rknec.edu`)
- D. Y. Patil College of Engineering, Akurdi, Pune (`principal@dypcoeakurdi.ac.in`)
- Symbiosis International University, Pune (`registrar@siu.edu.in`)
- Bharati Vidyapeeth Deemed University, Pune (`bvuniversity@bharatividyapeeth.edu`)
- H.R. College of Commerce & Economics, Mumbai (`principal@hrcollege.edu`)
- K. K. Wagh Institute of Engineering Education and Research, Nashik (`kkwieer@kkwagh.edu.in`)
- MIT World Peace University (MIT-WPU), Pune (`registrar@mitwpu.edu.in`)

### Spreadsheet Columns
The master contact sheet `data/colleges_master.xlsx` contains the following fields:
1. `state`: Assigned state (Maharashtra).
2. `city`: City location (e.g., Pune, Mumbai, Nagpur, Sangli, Nashik).
3. `college_name`: Full official name of the institution.
4. `website_url`: Official root website URL.
5. `department`: Contact department or office.
6. `contact_person`: Contact person name and title.
7. `official_email`: Official email address on the institutional domain.
8. `source_page_url`: Direct URL link where the contact information was verified.

### Command to Validate and Deduplicate
```bash
python src/cli.py validate --file data/colleges_master.xlsx --save
```

---

## 3. Step 2: Upload or Update Email Content

The team can update the email subject line and email body at any time without modifying program code.

### Updating via CLI
```bash
python src/cli.py set-template --subject "Proposal for Industry Collaboration and Creative Media Training with {{ college_name }}"
```

### Available Personalization Tags
- `{{ college_name }}`: Name of the institution.
- `{{ contact_person }}`: Contact person name (with title). If missing, automatically falls back to: `"Respected Principal / Department Head"`.
- `{{ department }}`: Department name. If missing, automatically falls back to: `"Office of Academic Affairs and Training"`.
- `{{ city }}`: City name. If missing, automatically falls back to: `"your campus"`.
- `{{ state }}`: State name (defaults to `"Maharashtra"`).

---

## 4. Step 3: Preview Personalized Outputs

Before transmitting any message, inspect rendered samples to confirm proper placeholder substitution and fallbacks:

```bash
python src/cli.py preview --sample 3
```

Generated sample HTML files are saved in the `outbox_preview/` directory.

---

## 5. Step 4: Execute Safe Internal Testing

Always test the complete process using internal test addresses before dispatching to college recipients:

```bash
python src/cli.py test --recipient internal_qa@shortfundly.com --count 2
```

In test mode:
- All emails are routed to your internal test address.
- The personalized body for the designated college is preserved intact.
- The subject line is prefixed with `[TEST MODE - Target: College Name <email>]` for verification.

---

## 6. Step 5: Automated Sending with Rate Limiting and Idempotency

### Dry-Run Simulation (Recommended First Step)
```bash
python src/cli.py dispatch --state "Maharashtra" --limit 10
```

### Live SMTP Send
```bash
python src/cli.py dispatch --state "Maharashtra" --live
```

### Built-in Safety Controls:
1. **Idempotency Protection**: Calculates `SHA-256(official_email + template_hash + campaign_id)`. If an email was already delivered in status `SENT`, it is automatically skipped.
2. **Domain-Aware Rate Limiting**: Throttles dispatches per root domain to prevent institutional firewalls from flagging the sender.
3. **Circuit Breaker**: Halts dispatches automatically if consecutive failures or bounce thresholds are breached.

---

## 7. Step 6: Track Status and Export Audit Reports

To view delivery telemetry and export the status ledger:

```bash
python src/cli.py report --format xlsx
```

The full ledger is saved to `logs/audit_report.xlsx` and can be opened in Microsoft Excel for management review.

---

## 8. Web Control Deck (FastAPI Server)

To start the enterprise web control dashboard:
```bash
python -m uvicorn server:app --app-dir src --reload --port 8000
```
Open `http://localhost:8000` in any web browser.
