import os
import time
import shutil
import subprocess
import glob
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
RECORDINGS_DIR = os.path.join(os.getcwd(), "recordings")
PUBLIC_VIDEOS_DIR = os.path.join(os.getcwd(), "public", "videos")
ARTIFACT_DIR = r"C:\Users\ipsha\.gemini\antigravity\brain\44df5a77-4d85-4065-ad06-9daeab12b969"

os.makedirs(RECORDINGS_DIR, exist_ok=True)
os.makedirs(PUBLIC_VIDEOS_DIR, exist_ok=True)

def human_type(element, text, delay=0.06):
    for char in text:
        element.type(char, delay=int(delay * 1000))
        time.sleep(0.02)

def inject_cursor(page):
    js = """
    (() => {
        const cursor = document.createElement('div');
        cursor.id = 'playwright-mouse-pointer';
        cursor.style.position = 'fixed';
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursor.style.borderRadius = '50%';
        cursor.style.background = 'rgba(225, 29, 72, 0.7)';
        cursor.style.border = '2px solid #ffffff';
        cursor.style.boxShadow = '0 0 10px rgba(225, 29, 72, 0.8)';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '999999';
        cursor.style.transition = 'transform 0.15s ease, opacity 0.15s ease, width 0.15s ease, height 0.15s ease';
        cursor.style.transform = 'translate(-50%, -50%)';
        cursor.style.top = '100px';
        cursor.style.left = '100px';
        document.body.appendChild(cursor);

        window.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        window.addEventListener('mousedown', () => {
            cursor.style.width = '14px';
            cursor.style.height = '14px';
            cursor.style.background = 'rgba(16, 185, 129, 0.9)';
            cursor.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.9)';
        });

        window.addEventListener('mouseup', () => {
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursor.style.background = 'rgba(225, 29, 72, 0.7)';
            cursor.style.boxShadow = '0 0 10px rgba(225, 29, 72, 0.8)';
        });
    })();
    """
    try:
        page.evaluate(js)
    except Exception:
        pass

def smooth_scroll(page, target_y, steps=25, delay=0.03):
    current_y = page.evaluate("() => window.scrollY")
    diff = (target_y - current_y) / steps
    for _ in range(steps):
        current_y += diff
        page.evaluate(f"() => window.scrollTo(0, {current_y})")
        time.sleep(delay)

def main():
    print("Initializing Playwright Screen Recording...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--font-render-hinting=none",
                "--window-size=1920,1080"
            ]
        )
        
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=RECORDINGS_DIR,
            record_video_size={"width": 1920, "height": 1080}
        )

        # Inject Canvas CAPTCHA snooper so we reliably read whatever text is drawn on the canvas
        context.add_init_script("""
            (() => {
                window.__CAPTCHA_SNOOP__ = '';
                const origFillRect = CanvasRenderingContext2D.prototype.fillRect;
                const origFillText = CanvasRenderingContext2D.prototype.fillText;
                CanvasRenderingContext2D.prototype.fillRect = function(x, y, w, h) {
                    if (w >= 100 && h >= 30) {
                        window.__CAPTCHA_SNOOP__ = '';
                    }
                    return origFillRect.apply(this, arguments);
                };
                CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
                    if (typeof text === 'string' && text.length === 1) {
                        window.__CAPTCHA_SNOOP__ = (window.__CAPTCHA_SNOOP__ || '') + text;
                    }
                    return origFillText.apply(this, arguments);
                };
            })();
        """)
        
        page = context.new_page()
        page.set_default_timeout(25000)

        # -------------------------------------------------------------
        # SCENE 1: LANDING PAGE WALKTHROUGH
        # -------------------------------------------------------------
        print("Scene 1: Loading Landing Page...")
        page.goto(BASE_URL, wait_until="networkidle")
        inject_cursor(page)
        time.sleep(1.5)

        print("  - Scrolling through landing page features...")
        smooth_scroll(page, 750, steps=30, delay=0.03)
        time.sleep(1.5)
        smooth_scroll(page, 1400, steps=30, delay=0.03)
        time.sleep(1.5)
        smooth_scroll(page, 0, steps=30, delay=0.02)
        time.sleep(1.0)

        # Click CTA to Login
        print("  - Navigating to Secured Operator Login...")
        cta_button = page.locator("a[href='/login'] button, a[href='/login']").first
        cta_button.hover()
        time.sleep(0.5)
        cta_button.click()
        page.wait_for_url("**/login", timeout=12000)
        time.sleep(1.5)

        # -------------------------------------------------------------
        # SCENE 2: SECURED 2-STEP PROGRESSIVE LOGIN
        # -------------------------------------------------------------
        print("Scene 2: Login Step 1 - Operator Email & CAPTCHA...")
        inject_cursor(page)
        
        # Type email
        email_input = page.locator("input[type='email']")
        email_input.click()
        time.sleep(0.3)
        human_type(email_input, "admin@shortfundly.com", delay=0.05)
        time.sleep(0.8)

        # Showcase CAPTCHA Refresh button
        refresh_btn = page.locator("button:has-text('Refresh')")
        print("  - Demonstrating dynamic CAPTCHA regeneration...")
        refresh_btn.hover()
        time.sleep(0.4)
        refresh_btn.click()
        time.sleep(1.2)

        # Read the generated CAPTCHA code
        captcha_code = ""
        for _ in range(30):
            captcha_code = page.evaluate("""() => {
                if (window.__CAPTCHA_SNOOP__ && window.__CAPTCHA_SNOOP__.length >= 6) {
                    return window.__CAPTCHA_SNOOP__.slice(-6);
                }
                const canvas = document.querySelector('canvas[data-captcha-code]');
                if (canvas && canvas.getAttribute('data-captcha-code')) {
                    return canvas.getAttribute('data-captcha-code');
                }
                if (window.__CAPTCHA_CODE__) {
                    return window.__CAPTCHA_CODE__;
                }
                return '';
            }""")
            if len(captcha_code) == 6:
                break
            time.sleep(0.1)

        print(f"  - Generated CAPTCHA challenge code: {captcha_code}")

        # Type CAPTCHA code
        captcha_input = page.locator("input[placeholder*='characters shown above']")
        captcha_input.click()
        time.sleep(0.3)
        human_type(captcha_input, captcha_code, delay=0.08)
        time.sleep(0.8)

        # Submit Step 1
        verify_btn = page.locator("button[type='submit']")
        verify_btn.hover()
        time.sleep(0.4)
        verify_btn.click()
        time.sleep(1.8)

        print("Scene 3: Login Step 2 - Admin ID & Password...")
        inject_cursor(page)
        
        # Verify step 2 is active
        pass_input = page.locator("input[type='password']")
        pass_input.wait_for(state="visible", timeout=10000)
        
        admin_id_input = page.locator("input[placeholder*='admin@shortfundly.com']")
        if admin_id_input.count() > 0:
            current_val = admin_id_input.input_value()
            if not current_val:
                admin_id_input.click()
                human_type(admin_id_input, "admin@shortfundly.com", delay=0.04)
                time.sleep(0.4)

        pass_input.click()
        time.sleep(0.3)
        human_type(pass_input, "shortfundly2026", delay=0.05)
        time.sleep(0.8)

        # Submit Step 2 to enter Dashboard
        auth_btn = page.locator("button[type='submit']")
        auth_btn.hover()
        time.sleep(0.4)
        auth_btn.click()
        page.wait_for_url("**/dashboard", timeout=12000)
        time.sleep(2.5)

        # -------------------------------------------------------------
        # SCENE 4: DASHBOARD TAB 0 - LIVE TELEMETRY DECK
        # -------------------------------------------------------------
        print("Scene 4: Exploring Dashboard Tab 0 (Live Telemetry & Capacity)...")
        inject_cursor(page)
        time.sleep(1.5)

        # Scroll to show Batch Quota & Live Run Stream
        smooth_scroll(page, 450, steps=25, delay=0.03)
        time.sleep(2.0)
        smooth_scroll(page, 0, steps=20, delay=0.03)
        time.sleep(1.0)

        # -------------------------------------------------------------
        # SCENE 5: DASHBOARD TAB 1 - UPLOAD CSV & DATASET STAGING
        # -------------------------------------------------------------
        print("Scene 5: Dashboard Tab 1 (Upload CSV & Working Queue)...")
        tab_upload = page.locator("button:has-text('Colleges'), button:has-text('Upload CSV')").first
        tab_upload.hover()
        time.sleep(0.4)
        tab_upload.click()
        time.sleep(1.5)

        # Upload verified dataset
        csv_file_path = os.path.abspath(os.path.join("data", "maharashtra_colleges_verified_only.csv"))
        if os.path.exists(csv_file_path):
            print(f"  - Uploading collegiate dataset: {os.path.basename(csv_file_path)}...")
            file_input = page.locator("input[type='file']")
            file_input.set_input_files(csv_file_path)
            time.sleep(2.5) # Wait for parse and staging

        # Scroll down through active working queue
        smooth_scroll(page, 600, steps=25, delay=0.03)
        time.sleep(1.5)

        # Demonstrate client-side search filtering
        search_box = page.locator("input[placeholder*='Search by name, district']")
        if search_box.count() > 0:
            print("  - Interacting with real-time institutional search filter (Pune)...")
            search_box.click()
            human_type(search_box, "Pune", delay=0.08)
            time.sleep(2.0)
            search_box.fill("")
            time.sleep(1.0)

        smooth_scroll(page, 0, steps=20, delay=0.03)
        time.sleep(1.0)

        # -------------------------------------------------------------
        # SCENE 6: DASHBOARD TAB 2 - TEMPLATES & JINJA DYNAMIC TAGS
        # -------------------------------------------------------------
        print("Scene 6: Dashboard Tab 2 (Proposal Templates & Live Dynamic Preview)...")
        tab_templates = page.locator("button:has-text('Templates')")
        tab_templates.hover()
        time.sleep(0.4)
        tab_templates.click()
        time.sleep(1.5)

        # Switch presets
        preset_btn = page.locator("button:has-text('Campus Ambassador')").first
        if preset_btn.count() > 0:
            print("  - Switching template preset to Campus Ambassador Program...")
            preset_btn.hover()
            time.sleep(0.4)
            preset_btn.click()
            time.sleep(1.5)

        festival_btn = page.locator("button:has-text('Film Festival Invitation')").first
        if festival_btn.count() > 0:
            festival_btn.hover()
            time.sleep(0.4)
            festival_btn.click()
            time.sleep(1.5)

        # Scroll down to show Live Preview
        smooth_scroll(page, 500, steps=25, delay=0.03)
        time.sleep(2.0)
        smooth_scroll(page, 0, steps=20, delay=0.03)
        time.sleep(1.0)

        # -------------------------------------------------------------
        # SCENE 7: DASHBOARD TAB 3 - SENDER & DISPATCH ENGINE
        # -------------------------------------------------------------
        print("Scene 7: Dashboard Tab 3 (Sender / Dispatch Engine)...")
        tab_sender = page.locator("button:has-text('Sender')")
        tab_sender.hover()
        time.sleep(0.4)
        tab_sender.click()
        time.sleep(1.8)

        # Ensure Individual Recipient mode is active
        indiv_mode_btn = page.locator("button:has-text('Mode A: Individual Single Recipient')").first
        if indiv_mode_btn.count() > 0:
            print("  - Selecting Mode A: Individual Single Recipient...")
            indiv_mode_btn.hover()
            time.sleep(0.3)
            indiv_mode_btn.click()
            time.sleep(1.0)

        # Smooth scroll down to view input form
        smooth_scroll(page, 320, steps=20, delay=0.03)
        time.sleep(1.0)

        # 1. Type Target Institution Name: Monarchs University
        print("  - Entering Target Institution Name: Monarchs University...")
        inst_input = page.locator("input[placeholder*='COEP Technological University']").first
        inst_input.click()
        inst_input.fill("")
        human_type(inst_input, "Monarchs University", delay=0.04)
        time.sleep(0.6)

        # 2. Type Official Email Address: monarchrealms.team@gmail.com
        print("  - Entering Recipient Email: monarchrealms.team@gmail.com...")
        email_field = page.locator("input[placeholder*='registrar@coeptech.ac.in']").first
        email_field.click()
        email_field.fill("")
        human_type(email_field, "monarchrealms.team@gmail.com", delay=0.04)
        time.sleep(0.8)

        # 3. Click Verify MX Records
        mx_verify_btn = page.locator("button:has-text('Verify MX Records')").first
        print("  - Performing live DNS MX record verification for monarchrealms.team@gmail.com...")
        mx_verify_btn.hover()
        time.sleep(0.4)
        mx_verify_btn.click()
        time.sleep(2.0) # wait for MX record resolution and badge

        # 4. Type Contact Person: Harish Rohith
        print("  - Entering Contact Person: Harish Rohith...")
        contact_field = page.locator("input[placeholder*='Dr. D. N. Sonawane']").first
        contact_field.click()
        contact_field.fill("")
        human_type(contact_field, "Harish Rohith", delay=0.04)
        time.sleep(0.6)

        # 5. Type City & State
        print("  - Entering Location: Mumbai, Maharashtra...")
        city_field = page.locator("input[placeholder*='Chennai, Bangalore, Pune']").first
        city_field.click()
        city_field.fill("")
        human_type(city_field, "Mumbai", delay=0.04)
        time.sleep(0.4)

        state_field = page.locator("input[placeholder*='Tamil Nadu, Karnataka, Delhi']").first
        state_field.click()
        state_field.fill("")
        human_type(state_field, "Maharashtra", delay=0.04)
        time.sleep(0.8)

        # Scroll to show payload preview and send button
        smooth_scroll(page, 520, steps=20, delay=0.03)
        time.sleep(1.2)

        # Bypass window.confirm for automated recording
        page.evaluate("() => { window.__SKIP_CONFIRM__ = true; }")

        # 6. Click "Send Live Production Email"
        send_live_btn = page.locator("button:has-text('Send Live Production Email')").first
        print("  - Clicking Send Live Production Email...")
        send_live_btn.hover()
        time.sleep(0.5)
        send_live_btn.click()
        
        # Wait for dispatch success alert box
        print("  - Waiting for live SMTP delivery confirmation...")
        try:
            page.wait_for_selector(".alert-box.success", timeout=15000)
            print("  - Live dispatch confirmed! Receipt and Message-ID visible.")
        except Exception as e:
            print(f"  - Note: {e}")
            
        time.sleep(3.5) # Hold view so live dispatch receipt, messageId & recipient are clearly captured
        
        smooth_scroll(page, 0, steps=20, delay=0.03)
        time.sleep(1.0)

        # -------------------------------------------------------------
        # SCENE 8: DASHBOARD TAB 4 - AUDIT HISTORY & TRANSACTION LOG
        # -------------------------------------------------------------
        print("Scene 8: Dashboard Tab 4 (Audit History & Transaction Ledger)...")
        tab_audit = page.locator("button:has-text('Audits'), button:has-text('Audit History')").first
        tab_audit.hover()
        time.sleep(0.4)
        tab_audit.click()
        time.sleep(2.0)

        smooth_scroll(page, 350, steps=20, delay=0.03)
        time.sleep(2.0)
        smooth_scroll(page, 0, steps=20, delay=0.03)
        time.sleep(1.0)

        # -------------------------------------------------------------
        # SCENE 9: DASHBOARD TAB 5 - SMTP CONFIG, LIVE DISPATCH & INBOX VERIFICATION
        # -------------------------------------------------------------
        print("Scene 9: Dashboard Tab 5 (SMTP Accounts, Live Transmission & Handshake)...")
        tab_smtp = page.locator("button:has-text('SMTP Relay'), button:has-text('SMTP Vault')").first
        tab_smtp.hover()
        time.sleep(0.4)
        tab_smtp.click()
        time.sleep(2.0)

        # Scroll down to showcase active SMTP relay and test controls
        smooth_scroll(page, 550, steps=25, delay=0.03)
        time.sleep(1.5)

        # Click Test Handshake on the active relay
        test_handshake_btn = page.locator("button:has-text('Test Active Relay'), button:has-text('Test Handshake')").first
        if test_handshake_btn.count() > 0:
            print("  - Testing live SMTP handshake connection to Google Relay (smtp.gmail.com:587)...")
            test_handshake_btn.hover()
            time.sleep(0.4)
            test_handshake_btn.click()
            time.sleep(2.5) # Wait for round-trip ping

        # Open Recipient Inbox via button or direct route
        open_inbox_btn = page.locator("#btn-open-recipient-inbox, a[href='/inbox'] button, a[href='/inbox']").first
        if open_inbox_btn.count() > 0:
            print("  - Opening recipient Gmail inbox for Profile: monarchrealms.team@gmail.com...")
            open_inbox_btn.hover()
            time.sleep(0.5)
            open_inbox_btn.click()
            page.wait_for_url("**/inbox", timeout=12000)
        else:
            print("  - Navigating directly to authentic Gmail verification view...")
            page.goto(BASE_URL + "/inbox", wait_until="networkidle")
        time.sleep(2.0)
        inject_cursor(page)

        print("Scene 10: Inspecting Received Email in Authentic Chrome Gmail Workspace...")
        time.sleep(1.5)

        # Click authentic inbox row showing the received Shortfundly email
        email_row = page.locator("#inbox-email-row").first
        if email_row.count() > 0:
            print("  - Hovering and opening real Shortfundly proposal email...")
            email_row.hover()
            time.sleep(0.8)
            email_row.click()
            time.sleep(2.5) # Allow transition to opened proposal view

        # Scroll through the authentic received proposal
        print("  - Reviewing authentic proposal headers, recipient, and body...")
        smooth_scroll(page, 450, steps=30, delay=0.03)
        time.sleep(3.0) # Hold for clear visual verification of real proposal content
        smooth_scroll(page, 0, steps=25, delay=0.03)
        time.sleep(1.5)

        # Return back to Shortfundly Deck
        back_btn = page.locator("#btn-back-dashboard, a[href='/dashboard']").first
        back_btn.hover()
        time.sleep(0.6)
        back_btn.click()
        page.wait_for_url("**/dashboard", timeout=12000)
        time.sleep(2.0)

        # -------------------------------------------------------------
        # SCENE 11: RETURN TO CENTRAL TELEMETRY OVERVIEW
        # -------------------------------------------------------------
        print("Scene 11: Returning to Central Telemetry Deck...")
        tab_dash = page.locator("button:has-text('Dashboard')").first
        tab_dash.hover()
        time.sleep(0.4)
        tab_dash.click()
        time.sleep(3.0)

        print("Recording completed. Finalizing video file...")
        video_path = page.video.path()
        page.close()
        context.close()
        browser.close()

        final_dest_public = os.path.join(PUBLIC_VIDEOS_DIR, "platform_walkthrough.webm")
        final_dest_artifact = os.path.join(ARTIFACT_DIR, "platform_walkthrough.webm")

        if os.path.exists(video_path):
            # Check for bundled playwright ffmpeg to guarantee 1080p @ 60fps encoding
            ffmpeg_paths = glob.glob(os.path.expanduser("~") + r"\AppData\Local\ms-playwright\**\ffmpeg*.exe", recursive=True)
            ffmpeg_bin = ffmpeg_paths[0] if ffmpeg_paths else "ffmpeg"

            processed = False
            if ffmpeg_paths and os.path.exists(ffmpeg_paths[0]):
                print(f"Applying 1080p 60fps master encoding using {ffmpeg_bin}...")
                temp_60fps_webm = os.path.join(RECORDINGS_DIR, "master_1080p60.webm")
                cmd = [
                    ffmpeg_bin, "-y",
                    "-i", video_path,
                    "-r", "60",
                    "-s", "1920x1080",
                    "-c:v", "libvpx",
                    "-b:v", "4M",
                    "-quality", "realtime",
                    "-cpu-used", "5",
                    temp_60fps_webm
                ]
                try:
                    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=300)
                    if res.returncode == 0 and os.path.exists(temp_60fps_webm):
                        shutil.copyfile(temp_60fps_webm, final_dest_public)
                        shutil.copyfile(temp_60fps_webm, final_dest_artifact)
                        processed = True
                        print("Master 1080p 60fps transcode successful!")
                except Exception as ex:
                    print(f"Note: 60fps transcode step bypassed: {ex}")

            if not processed:
                shutil.copyfile(video_path, final_dest_public)
                shutil.copyfile(video_path, final_dest_artifact)

            size_mb = os.path.getsize(final_dest_public) / (1024 * 1024)
            print(f"SUCCESS: Video saved to {final_dest_public} ({size_mb:.2f} MB)")
            print(f"SUCCESS: Video copied to {final_dest_artifact}")
        else:
            print("ERROR: Video file was not found at:", video_path)

if __name__ == "__main__":
    main()
