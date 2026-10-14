"""
Template Engine Module
Handles dynamic template loading, subject/body updates,
Jinja2 variable substitution with intelligent fallbacks,
and cryptographic template hashing for idempotency.
"""

import os
import json
import hashlib
from typing import Dict, Any, Tuple
from jinja2 import Template


class TemplateEngine:
    def __init__(self, base_dir: str = None):
        if not base_dir:
            self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        else:
            self.base_dir = base_dir

        self.config_path = os.path.join(self.base_dir, "templates", "template_config.json")
        self.load_config()

    def load_config(self) -> None:
        with open(self.config_path, "r", encoding="utf-8") as f:
            self.config = json.load(f)

        self.html_path = os.path.join(self.base_dir, self.config["html_template_file"])
        self.text_path = os.path.join(self.base_dir, self.config["text_template_file"])

        with open(self.html_path, "r", encoding="utf-8") as f:
            self.html_template_str = f.read()

        with open(self.text_path, "r", encoding="utf-8") as f:
            self.text_template_str = f.read()

    def get_template_hash(self) -> str:
        """Returns SHA-256 hash of active subject and body content for version tracking."""
        combined = (
            self.config["subject_template"]
            + self.html_template_str
            + self.text_template_str
            + self.config.get("template_version", "1.0.0")
        )
        return hashlib.sha256(combined.encode("utf-8")).hexdigest()[:16]

    def update_content(self, subject: str = None, html_body: str = None, text_body: str = None) -> None:
        """Updates subject, HTML body, or text body and saves to disk."""
        if subject:
            self.config["subject_template"] = subject.strip()

        if html_body:
            self.html_template_str = html_body.strip()
            with open(self.html_path, "w", encoding="utf-8") as f:
                f.write(self.html_template_str)

        if text_body:
            self.text_template_str = text_body.strip()
            with open(self.text_path, "w", encoding="utf-8") as f:
                f.write(self.text_template_str)

        with open(self.config_path, "w", encoding="utf-8") as f:
            json.dump(self.config, f, indent=2)

    def prepare_context(self, recipient: Dict[str, Any]) -> Dict[str, Any]:
        """Applies intelligent fallback cascade to ensure no unfilled or awkward placeholders."""
        fallbacks = self.config.get("fallbacks", {})
        context = dict(recipient)

        # Standardize fallbacks
        for key, default_val in fallbacks.items():
            current_val = context.get(key)
            if not current_val or str(current_val).strip() == "" or str(current_val).lower() == "nan":
                context[key] = default_val
            else:
                context[key] = str(current_val).strip()

        # College Name is mandatory
        if not context.get("college_name"):
            context["college_name"] = "Your Institution"

        return context

    def render(self, recipient: Dict[str, Any]) -> Tuple[str, str, str]:
        """
        Renders (subject, html_content, text_content) for a specific recipient.
        """
        context = self.prepare_context(recipient)

        # Render subject line
        subject_tmpl = Template(self.config["subject_template"])
        rendered_subject = subject_tmpl.render(**context)

        # Render HTML body
        html_tmpl = Template(self.html_template_str)
        rendered_html = html_tmpl.render(**context)

        # Render Plain Text body
        text_tmpl = Template(self.text_template_str)
        rendered_text = text_tmpl.render(**context)

        return rendered_subject, rendered_html, rendered_text
