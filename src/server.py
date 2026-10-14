"""
Enterprise REST API & Real-Time Telemetry Server
Built with FastAPI and Uvicorn.
Provides REST endpoints, Server-Sent Events (SSE) streaming,
Dead-Letter Queue management, and an integrated Web Control Deck.
"""

import os
import sys
import yaml
import asyncio
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, Query, BackgroundTasks
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse, StreamingResponse
from pydantic import BaseModel

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "src"))

from collector_validator import ContactValidator, export_to_excel_and_csv
from template_engine import TemplateEngine
from tracker import AuditTracker
from engine import AsyncCampaignManager

app = FastAPI(title="College Email Automation Suite", version="2.0.0")

# Load configuration
cfg_path = os.path.join(BASE_DIR, "config", "settings.yaml")
with open(cfg_path, "r", encoding="utf-8") as f:
    config = yaml.safe_load(f)

campaign_manager = AsyncCampaignManager(BASE_DIR, config)
template_engine = TemplateEngine(BASE_DIR)
tracker = AuditTracker()


class TemplateUpdateRequest(BaseModel):
    subject: Optional[str] = None
    html_body: Optional[str] = None
    text_body: Optional[str] = None


class StartCampaignRequest(BaseModel):
    campaign_id: str = "tamil_nadu_higher_ed_2026"
    state: Optional[str] = None
    city: Optional[str] = None
    limit: Optional[int] = None
    live_mode: bool = False
    concurrency: int = 3


@app.get("/api/health")
def get_health():
    return {
        "status": "HEALTHY",
        "service": "College Email Automation Suite",
        "circuit_breaker": campaign_manager.circuit_breaker.state,
        "database": "ACTIVE_WAL"
    }


@app.get("/api/colleges")
def list_colleges(state: Optional[str] = None, city: Optional[str] = None, search: Optional[str] = None):
    csv_path = os.path.join(BASE_DIR, "data", "colleges_master.csv")
    if not os.path.exists(csv_path):
        return {"data": [], "total": 0}
    df = pd.read_csv(csv_path).fillna("")

    if state:
        df = df[df["state"].str.lower() == state.lower()]
    if city:
        df = df[df["city"].str.lower() == city.lower()]
    if search:
        search_lower = search.lower()
        df = df[
            df["college_name"].str.lower().str.contains(search_lower) |
            df["official_email"].str.lower().str.contains(search_lower)
        ]

    records = df.to_dict(orient="records")
    return {"data": records, "total": len(records)}


@app.post("/api/colleges/upload")
async def upload_colleges(file: UploadFile = File(...)):
    temp_path = os.path.join(BASE_DIR, "data", f"uploaded_{file.filename}")
    with open(temp_path, "wb") as f:
        content = await file.read()
        f.write(content)

    if temp_path.endswith(".xlsx"):
        df = pd.read_excel(temp_path)
    else:
        df = pd.read_csv(temp_path)

    records = df.to_dict(orient="records")
    validator = ContactValidator(check_mx=False)
    valid, rejected = validator.validate_and_deduplicate(records)

    excel_out = os.path.join(BASE_DIR, "data", "colleges_master.xlsx")
    csv_out = os.path.join(BASE_DIR, "data", "colleges_master.csv")
    export_to_excel_and_csv(valid, excel_out, csv_out)

    return {
        "status": "SUCCESS",
        "total_uploaded": len(records),
        "validated_unique": len(valid),
        "rejected_count": len(rejected),
        "rejected_sample": rejected[:3]
    }


@app.get("/api/template")
def get_template():
    return {
        "version": template_engine.config.get("template_version"),
        "hash": template_engine.get_template_hash(),
        "subject": template_engine.config.get("subject_template"),
        "html_body": template_engine.html_template_str,
        "text_body": template_engine.text_template_str,
        "fallbacks": template_engine.config.get("fallbacks")
    }


@app.put("/api/template")
def update_template(req: TemplateUpdateRequest):
    template_engine.update_content(
        subject=req.subject,
        html_body=req.html_body,
        text_body=req.text_body
    )
    return {
        "status": "UPDATED",
        "hash": template_engine.get_template_hash(),
        "subject": template_engine.config.get("subject_template")
    }


@app.get("/api/template/preview")
def preview_template(college_index: int = 0):
    csv_path = os.path.join(BASE_DIR, "data", "colleges_master.csv")
    df = pd.read_csv(csv_path).fillna("")
    if df.empty:
        return {"error": "No colleges available"}

    idx = max(0, min(college_index, len(df) - 1))
    rec = df.iloc[idx].to_dict()
    subj, html_content, text_content = template_engine.render(rec)

    return {
        "college": rec,
        "subject": subj,
        "html_body": html_content,
        "text_body": text_content
    }


@app.post("/api/campaign/start")
async def start_campaign(req: StartCampaignRequest, bg_tasks: BackgroundTasks):
    if campaign_manager.is_running:
        return JSONResponse(status_code=400, content={"error": "A campaign is already running"})

    csv_path = os.path.join(BASE_DIR, "data", "colleges_master.csv")
    df = pd.read_csv(csv_path).fillna("")

    if req.state:
        df = df[df["state"].str.lower() == req.state.lower()]
    if req.city:
        df = df[df["city"].str.lower() == req.city.lower()]

    recipients = df.to_dict(orient="records")
    if req.limit:
        recipients = recipients[:req.limit]

    bg_tasks.add_task(
        campaign_manager.execute_campaign,
        campaign_id=req.campaign_id,
        recipients=recipients,
        live_mode=req.live_mode,
        concurrency=req.concurrency
    )

    return {
        "status": "STARTED",
        "campaign_id": req.campaign_id,
        "targets": len(recipients),
        "live_mode": req.live_mode
    }


@app.post("/api/campaign/kill")
def kill_campaign():
    campaign_manager.trigger_kill_switch()
    return {"status": "KILL_SWITCH_ENGAGED", "campaign_manager_status": campaign_manager.stats}


@app.get("/api/campaign/status")
def campaign_status():
    summary_db = tracker.get_summary_stats()
    return {
        "active_worker_stats": campaign_manager.stats,
        "audit_database_ledger": summary_db,
        "circuit_breaker_state": campaign_manager.circuit_breaker.state,
        "dlq_count": len(campaign_manager.dlq)
    }


@app.get("/api/stream")
async def event_stream():
    """Server-Sent Events endpoint streaming real-time dispatch progress."""
    async def generator():
        q = campaign_manager.subscribe_events()
        try:
            while True:
                msg = await q.get()
                yield f"data: {msg}\n\n"
        except asyncio.CancelledError:
            campaign_manager.unsubscribe_events(q)

    return StreamingResponse(generator(), media_type="text/event-stream")


@app.get("/api/dlq")
def get_dlq():
    return {"dlq_items": campaign_manager.dlq, "total_quarantined": len(campaign_manager.dlq)}


@app.get("/api/reports/export")
def export_report(format: str = "xlsx"):
    out_file = os.path.join(BASE_DIR, "logs", f"audit_report.{format}")
    tracker.export_report(out_file)
    return FileResponse(out_file, filename=f"audit_report.{format}")


@app.get("/", response_class=HTMLResponse)
def get_dashboard():
    """Serves the integrated Web Control Deck with clean semantic HTML, zero CSS frameworks, zero emojis."""
    return """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>College Email Automation - Control Deck</title>
</head>
<body style="font-family: monospace; margin: 20px; line-height: 1.4;">

<h1>COLLEGE EMAIL AUTOMATION - ENTERPRISE CONTROL DECK</h1>
<hr>

<div>
  <h3>SYSTEM TELEMETRY</h3>
  <table border="1" cellpadding="6" cellspacing="0" width="100%">
    <tr>
      <td><strong>STATUS</strong>: <span id="telemetry-status">IDLE</span></td>
      <td><strong>CIRCUIT BREAKER</strong>: <span id="telemetry-circuit">CLOSED</span></td>
      <td><strong>TOTAL TARGETS</strong>: <span id="telemetry-total">0</span></td>
    </tr>
    <tr>
      <td><strong>SENT</strong>: <span id="telemetry-sent">0</span></td>
      <td><strong>FAILED</strong>: <span id="telemetry-failed">0</span></td>
      <td><strong>SKIPPED (DUPLICATE)</strong>: <span id="telemetry-skipped">0</span></td>
    </tr>
  </table>
</div>

<br>

<div>
  <h3>ACTIONS & CONTROLS</h3>
  <button onclick="startCampaign(false)">START CAMPAIGN (DRY-RUN SIMULATION)</button>
  <button onclick="startCampaign(true)" style="background-color: #ffcccc;">START CAMPAIGN (LIVE SMTP)</button>
  <button onclick="killCampaign()" style="background-color: #cc0000; color: #ffffff;">EMERGENCY KILL SWITCH</button>
  <button onclick="refreshData()">REFRESH STATUS</button>
  <a href="/api/reports/export?format=xlsx"><button>EXPORT AUDIT EXCEL</button></a>
</div>

<br>
<hr>

<div>
  <h3>ACTIVE TEMPLATE MANAGEMENT</h3>
  <label><strong>Subject Line Template:</strong></label><br>
  <input type="text" id="tpl-subject" style="width: 100%; font-family: monospace; padding: 4px;"><br><br>

  <label><strong>Plain Text Body:</strong></label><br>
  <textarea id="tpl-text" rows="8" style="width: 100%; font-family: monospace;"></textarea><br><br>

  <button onclick="saveTemplate()">SAVE TEMPLATE CHANGES</button>
  <button onclick="previewTemplate()">PREVIEW PERSONALIZATION</button>
</div>

<br>

<div id="preview-box" style="border: 1px dashed #666; padding: 10px; display: none;">
  <h4>LIVE PERSONALIZED PREVIEW:</h4>
  <p><strong>Target:</strong> <span id="prev-target"></span></p>
  <p><strong>Subject:</strong> <span id="prev-subject"></span></p>
  <pre id="prev-body" style="background: #f4f4f4; padding: 8px;"></pre>
</div>

<br>
<hr>

<div>
  <h3>LIVE DISPATCH EVENT STREAM (SSE)</h3>
  <textarea id="event-log" rows="10" readonly style="width: 100%; font-family: monospace; background: #fafafa;"></textarea>
</div>

<br>
<hr>

<div>
  <h3>VERIFIED COLLEGE MASTER DATABASE</h3>
  <table border="1" cellpadding="5" cellspacing="0" width="100%" id="colleges-table">
    <thead>
      <tr bgcolor="#eeeeee">
        <th>ID</th>
        <th>College Name</th>
        <th>City</th>
        <th>Contact Person</th>
        <th>Official Email</th>
        <th>Source Page URL</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</div>

<script>
function updateTelemetry(stats) {
  if (!stats) return;
  document.getElementById('telemetry-status').innerText = stats.status || 'IDLE';
  document.getElementById('telemetry-circuit').innerText = stats.circuit_state || 'CLOSED';
  document.getElementById('telemetry-total').innerText = stats.total || 0;
  document.getElementById('telemetry-sent').innerText = stats.sent || 0;
  document.getElementById('telemetry-failed').innerText = stats.failed || 0;
  document.getElementById('telemetry-skipped').innerText = stats.skipped || 0;
}

function logEvent(text) {
  var area = document.getElementById('event-log');
  area.value = '[' + new Date().toLocaleTimeString() + '] ' + text + '\\n' + area.value;
}

function refreshData() {
  fetch('/api/campaign/status')
    .then(r => r.json())
    .then(data => {
      updateTelemetry(data.active_worker_stats);
    });

  fetch('/api/colleges')
    .then(r => r.json())
    .then(res => {
      var tbody = document.querySelector('#colleges-table tbody');
      tbody.innerHTML = '';
      res.data.forEach((c, i) => {
        var row = '<tr>' +
          '<td>' + (i + 1) + '</td>' +
          '<td><strong>' + c.college_name + '</strong></td>' +
          '<td>' + c.city + '</td>' +
          '<td>' + (c.contact_person || 'N/A') + '</td>' +
          '<td><code>' + c.official_email + '</code></td>' +
          '<td><a href="' + c.source_page_url + '" target="_blank">View Proof</a></td>' +
          '</tr>';
        tbody.innerHTML += row;
      });
    });

  fetch('/api/template')
    .then(r => r.json())
    .then(t => {
      document.getElementById('tpl-subject').value = t.subject;
      document.getElementById('tpl-text').value = t.text_body;
    });
}

function saveTemplate() {
  var subj = document.getElementById('tpl-subject').value;
  var text = document.getElementById('tpl-text').value;
  fetch('/api/template', {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({subject: subj, text_body: text})
  }).then(r => r.json()).then(res => {
    alert('Template updated. Hash: ' + res.hash);
  });
}

function previewTemplate() {
  fetch('/api/template/preview?college_index=0')
    .then(r => r.json())
    .then(res => {
      document.getElementById('preview-box').style.display = 'block';
      document.getElementById('prev-target').innerText = res.college.college_name + ' (' + res.college.official_email + ')';
      document.getElementById('prev-subject').innerText = res.subject;
      document.getElementById('prev-body').innerText = res.text_body;
    });
}

function startCampaign(isLive) {
  if (isLive && !confirm('Confirm: You are about to launch LIVE SMTP sending!')) return;
  fetch('/api/campaign/start', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      campaign_id: 'tamil_nadu_higher_ed_2026',
      live_mode: isLive,
      concurrency: 2
    })
  }).then(r => r.json()).then(res => {
    logEvent('CAMPAIGN INITIATED: ' + JSON.stringify(res));
  });
}

function killCampaign() {
  fetch('/api/campaign/kill', {method: 'POST'})
    .then(r => r.json())
    .then(res => {
      logEvent('EMERGENCY KILL SWITCH ENGAGED: ' + JSON.stringify(res));
      refreshData();
    });
}

// SSE Connection for Real-Time Streaming
try {
  var evtSource = new EventSource('/api/stream');
  evtSource.onmessage = function(e) {
    var payload = JSON.parse(e.data);
    logEvent(payload.event + ' -> ' + JSON.stringify(payload.data));
    if (payload.event === 'progress_update' || payload.event === 'campaign_complete') {
      updateTelemetry(payload.data);
    }
  };
} catch(err) {
  console.log('SSE not supported or server offline');
}

refreshData();
</script>
</body>
</html>
    """
