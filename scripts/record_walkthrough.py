import os
import time
import shutil
from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("BASE_URL", "https://shortfundly-ea.vercel.app")
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
                "--font-render-hinting=none"
            ]
        )
        
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            record_video_dir=RECORDINGS_DIR,
            record_video_size={"width": 1440, "height": 900}
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
        tab_upload = page.locator("button:has-text('Upload CSV')")
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
        time.sleep(2.0)

        smooth_scroll(page, 450, steps=20, delay=0.03)
        time.sleep(1.5)
        smooth_scroll(page, 0, steps=20, delay=0.03)
        time.sleep(1.0)

        # -------------------------------------------------------------
        # SCENE 8: DASHBOARD TAB 4 - AUDIT HISTORY & TRANSACTION LOG
        # -------------------------------------------------------------
        print("Scene 8: Dashboard Tab 4 (Audit History & Transaction Ledger)...")
        tab_audit = page.locator("button:has-text('Audit History')")
        tab_audit.hover()
        time.sleep(0.4)
        tab_audit.click()
        time.sleep(2.0)

        smooth_scroll(page, 350, steps=20, delay=0.03)
        time.sleep(1.5)
        smooth_scroll(page, 0, steps=20, delay=0.03)
        time.sleep(1.0)

        # -------------------------------------------------------------
        # SCENE 9: DASHBOARD TAB 5 - SMTP CONFIG & RELAYS
        # -------------------------------------------------------------
        print("Scene 9: Dashboard Tab 5 (SMTP Accounts & Relays)...")
        tab_smtp = page.locator("button:has-text('SMTP Vault')").first
        tab_smtp.hover()
        time.sleep(0.4)
        tab_smtp.click()
        time.sleep(2.0)

        smooth_scroll(page, 400, steps=20, delay=0.03)
        time.sleep(1.5)
        smooth_scroll(page, 0, steps=20, delay=0.03)
        time.sleep(1.0)

        # -------------------------------------------------------------
        # SCENE 10: RETURN TO OVERVIEW DASHBOARD
        # -------------------------------------------------------------
        print("Scene 10: Returning to Overview Dashboard...")
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
            shutil.copyfile(video_path, final_dest_public)
            shutil.copyfile(video_path, final_dest_artifact)
            size_mb = os.path.getsize(final_dest_public) / (1024 * 1024)
            print(f"SUCCESS: Video saved to {final_dest_public} ({size_mb:.2f} MB)")
            print(f"SUCCESS: Video copied to {final_dest_artifact}")
        else:
            print("ERROR: Video file was not found at:", video_path)

if __name__ == "__main__":
    main()
