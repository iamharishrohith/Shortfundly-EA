"""
Unified Command Line Interface for College Email Automation
Supports:
- Data validation and deduplication
- Dynamic template management (subject and body updates)
- Personalized preview rendering
- Safe internal testing before production
- Idempotent automated batch dispatch (dry-run and live)
- Audit status reporting and analytics export
"""

import os
import sys
import yaml
import argparse
import pandas as pd
import logging
from typing import Dict, Any, List

from collector_validator import ContactValidator, export_to_excel_and_csv
from template_engine import TemplateEngine
from tracker import AuditTracker
from mailer import EmailDispatcher

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_config() -> Dict[str, Any]:
    cfg_path = os.path.join(BASE_DIR, "config", "settings.yaml")
    if os.path.exists(cfg_path):
        with open(cfg_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    return {}


def cmd_validate(args):
    file_path = args.file or os.path.join(BASE_DIR, "data", "colleges_master.xlsx")
    print(f"Loading contact data from: {file_path}")

    if file_path.endswith(".xlsx"):
        df = pd.read_excel(file_path)
    else:
        df = pd.read_csv(file_path)

    records = df.to_dict(orient="records")
    validator = ContactValidator(check_mx=args.check_mx)
    valid, rejected = validator.validate_and_deduplicate(records)

    print("-" * 60)
    print(f"TOTAL INPUT RECORDS : {len(records)}")
    print(f"VALIDATED UNIQUE    : {len(valid)}")
    print(f"REJECTED / DUPLICATE: {len(rejected)}")
    print("-" * 60)

    if rejected:
        print("\nRejection Breakdown (First 5):")
        for item in rejected[:5]:
            print(f"- {item.get('college_name')}: {item.get('rejection_reason')}")

    if args.save:
        excel_out = os.path.join(BASE_DIR, "data", "colleges_master.xlsx")
        csv_out = os.path.join(BASE_DIR, "data", "colleges_master.csv")
        export_to_excel_and_csv(valid, excel_out, csv_out)
        print(f"\nSaved cleaned dataset to:\n- {excel_out}\n- {csv_out}")


def cmd_set_template(args):
    engine = TemplateEngine(BASE_DIR)
    subject = args.subject
    html_body = None
    text_body = None

    if args.html_file and os.path.exists(args.html_file):
        with open(args.html_file, "r", encoding="utf-8") as f:
            html_body = f.read()

    if args.text_file and os.path.exists(args.text_file):
        with open(args.text_file, "r", encoding="utf-8") as f:
            text_body = f.read()

    engine.update_content(subject=subject, html_body=html_body, text_body=text_body)
    print("Template updated successfully.")
    print(f"Active Template Hash: {engine.get_template_hash()}")
    print(f"Active Subject Line : {engine.config['subject_template']}")


def cmd_preview(args):
    engine = TemplateEngine(BASE_DIR)
    csv_path = os.path.join(BASE_DIR, "data", "colleges_master.csv")
    df = pd.read_csv(csv_path)
    sample_records = df.head(args.sample).to_dict(orient="records")

    outbox_dir = os.path.join(BASE_DIR, "outbox_preview")
    os.makedirs(outbox_dir, exist_ok=True)

    print("=" * 70)
    print(f"GENERATING PERSONALIZED PREVIEWS (Sample size: {len(sample_records)})")
    print("=" * 70)

    for idx, rec in enumerate(sample_records, 1):
        subj, html_content, text_content = engine.render(rec)
        filename = f"preview_{idx}_{rec['college_name'][:20].replace(' ', '_')}.html"
        preview_file = os.path.join(outbox_dir, filename)

        with open(preview_file, "w", encoding="utf-8") as f:
            f.write(html_content)

        print(f"\n[SAMPLE {idx}]")
        print(f"Target College : {rec['college_name']} ({rec['city']}, {rec['state']})")
        print(f"Contact Person : {rec.get('contact_person') or '[Fallback Applied]'}")
        print(f"Department     : {rec.get('department') or '[Fallback Applied]'}")
        print(f"Official Email : {rec['official_email']}")
        print(f"Rendered Subj  : {subj}")
        print(f"Saved HTML     : {preview_file}")
        print("-" * 50)
        print("Text Body Snippet:")
        print("\n".join(text_content.strip().split("\n")[:7]))
        print("...")


def cmd_test(args):
    test_recipient = args.recipient
    if not test_recipient:
        print("Error: --recipient is required for test mode.")
        return

    print("=" * 70)
    print(f"EXECUTING INTERNAL SAFE TEST SEND TO: {test_recipient}")
    print("=" * 70)

    cfg = load_config()
    engine = TemplateEngine(BASE_DIR)
    tracker = AuditTracker()
    dispatcher = EmailDispatcher(
        config=cfg,
        dry_run=not args.live,
        test_mode=True,
        test_recipient=test_recipient
    )

    csv_path = os.path.join(BASE_DIR, "data", "colleges_master.csv")
    df = pd.read_csv(csv_path)
    recipients = df.head(args.count).to_dict(orient="records")

    campaign_id = "test_internal_validation"
    template_hash = engine.get_template_hash()

    for idx, rec in enumerate(recipients, 1):
        subj, html_content, text_content = engine.render(rec)
        print(f"\nDispatching Test {idx}/{len(recipients)} for {rec['college_name']}...")
        result = dispatcher.send_single_email(
            recipient_email=rec["official_email"],
            subject=subj,
            html_body=html_content,
            text_body=text_content,
            college_name=rec["college_name"],
            campaign_id=campaign_id
        )

        idempotency_key = tracker.compute_idempotency_key(test_recipient + f"_{idx}", template_hash, campaign_id)
        tracker.mark_status(idempotency_key, result["status"], result.get("error"))
        print(f"Result: {result['status']} (Mode: {result['mode']})")

    print("\nTest completed safely. Review outbox or test inbox.")


def cmd_dispatch(args):
    cfg = load_config()
    engine = TemplateEngine(BASE_DIR)
    tracker = AuditTracker()

    is_dry_run = not args.live
    campaign_id = args.campaign or "campaign_tamil_nadu_higher_ed"
    template_hash = engine.get_template_hash()

    print("=" * 70)
    print(f"CAMPAIGN DISPATCH CONTROLLER")
    print(f"Campaign ID    : {campaign_id}")
    print(f"Template Hash  : {template_hash}")
    print(f"Execution Mode : {'LIVE SMTP' if not is_dry_run else 'SIMULATED DRY-RUN (Zero network risk)'}")
    print("=" * 70)

    csv_path = os.path.join(BASE_DIR, "data", "colleges_master.csv")
    df = pd.read_csv(csv_path)

    # Filtering
    if args.state:
        df = df[df["state"].str.lower() == args.state.lower()]
    if args.city:
        df = df[df["city"].str.lower() == args.city.lower()]

    recipients = df.to_dict(orient="records")
    if args.limit:
        recipients = recipients[:args.limit]

    print(f"Target count after filtering: {len(recipients)}")

    dispatcher = EmailDispatcher(
        config=cfg,
        dry_run=is_dry_run,
        test_mode=False
    )

    stats = {"PROCESSED": 0, "SENT": 0, "FAILED": 0, "SKIPPED_DUPLICATE": 0}

    for idx, rec in enumerate(recipients, 1):
        email = rec["official_email"]
        college = rec["college_name"]

        # IDEMPOTENCY CHECK
        if tracker.is_already_sent(email, template_hash, campaign_id):
            print(f"[{idx}/{len(recipients)}] SKIPPED (Duplicate Prevention): {college} <{email}>")
            stats["SKIPPED_DUPLICATE"] += 1
            continue

        idemp_key = tracker.compute_idempotency_key(email, template_hash, campaign_id)
        tracker.register_or_get_status(rec, template_hash, campaign_id)

        subj, html_content, text_content = engine.render(rec)
        print(f"[{idx}/{len(recipients)}] Sending to: {college} <{email}>...")

        res = dispatcher.send_single_email(
            recipient_email=email,
            subject=subj,
            html_body=html_content,
            text_body=text_content,
            college_name=college,
            campaign_id=campaign_id
        )

        tracker.mark_status(idemp_key, res["status"], res.get("error"))

        if res["status"] == "SENT":
            stats["SENT"] += 1
        else:
            stats["FAILED"] += 1

        stats["PROCESSED"] += 1

    print("\n" + "=" * 70)
    print("DISPATCH RUN SUMMARY")
    print(f"Total Targets Evaluated: {len(recipients)}")
    print(f"Successfully Sent      : {stats['SENT']}")
    print(f"Failed Attempts        : {stats['FAILED']}")
    print(f"Skipped Duplicates     : {stats['SKIPPED_DUPLICATE']}")
    print("=" * 70)


def cmd_report(args):
    tracker = AuditTracker()
    campaign_id = args.campaign

    stats = tracker.get_summary_stats(campaign_id)
    print("=" * 70)
    print("DISPATCH TELEMETRY & AUDIT STATUS")
    print("=" * 70)
    for status_name, cnt in stats.items():
        print(f"{status_name:<20}: {cnt}")
    print("=" * 70)

    export_format = args.format or "xlsx"
    out_file = os.path.join(BASE_DIR, "logs", f"audit_report.{export_format}")
    tracker.export_report(out_file, campaign_id)
    print(f"Audit report exported to: {out_file}")


def main():
    parser = argparse.ArgumentParser(description="College Email Automation Suite")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # validate
    p_val = subparsers.add_parser("validate", help="Validate and deduplicate contact list")
    p_val.add_argument("--file", help="Path to input Excel or CSV file")
    p_val.add_argument("--check-mx", action="store_true", help="Perform DNS MX verification")
    p_val.add_argument("--save", action="store_true", help="Save validated dataset to master files")

    # set-template
    p_tmpl = subparsers.add_parser("set-template", help="Update email subject or body templates")
    p_tmpl.add_argument("--subject", help="New subject line template")
    p_tmpl.add_argument("--html-file", help="Path to HTML template file")
    p_tmpl.add_argument("--text-file", help="Path to text template file")

    # preview
    p_prev = subparsers.add_parser("preview", help="Preview personalized email outputs")
    p_prev.add_argument("--sample", type=int, default=3, help="Number of sample outputs")

    # test
    p_test = subparsers.add_parser("test", help="Send test emails to internal addresses")
    p_test.add_argument("--recipient", required=True, help="Internal test email address")
    p_test.add_argument("--count", type=int, default=2, help="Number of sample records to test")
    p_test.add_argument("--live", action="store_true", help="Dispatch via live SMTP (default is dry-run)")

    # dispatch
    p_disp = subparsers.add_parser("dispatch", help="Execute automated email campaign")
    p_disp.add_argument("--state", help="Filter target colleges by state")
    p_disp.add_argument("--city", help="Filter target colleges by city")
    p_disp.add_argument("--limit", type=int, help="Limit number of dispatches")
    p_disp.add_argument("--campaign", default="tamil_nadu_higher_ed_2026", help="Campaign identifier")
    p_disp.add_argument("--live", action="store_true", help="Execute live SMTP dispatch (default is dry-run)")

    # report
    p_rep = subparsers.add_parser("report", help="Generate status audit report")
    p_rep.add_argument("--campaign", help="Filter by campaign identifier")
    p_rep.add_argument("--format", choices=["xlsx", "csv"], default="xlsx", help="Export format")

    args = parser.parse_args()

    commands = {
        "validate": cmd_validate,
        "set-template": cmd_set_template,
        "preview": cmd_preview,
        "test": cmd_test,
        "dispatch": cmd_dispatch,
        "report": cmd_report,
    }

    commands[args.command](args)


if __name__ == "__main__":
    main()
