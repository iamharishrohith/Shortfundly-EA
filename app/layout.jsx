import './globals.css';
import fs from 'fs';
import path from 'path';

export const metadata = {
  title: 'College Email Automation - Shortfundly Campus Control Deck',
  description: 'Enterprise Email Automation Suite for Maharashtra Higher Education'
};

export default function RootLayout({ children }) {
  let inlineCss = '';
  try {
    const cssPath = path.join(process.cwd(), 'app', 'globals.css');
    if (fs.existsSync(cssPath)) {
      inlineCss = fs.readFileSync(cssPath, 'utf8');
    }
  } catch (e) {
    console.error('Error reading globals.css for inline injection:', e);
  }

  return (
    <html lang="en">
      <head>
        {inlineCss && (
          <style id="shortfundly-global-styles" dangerouslySetInnerHTML={{ __html: inlineCss }} />
        )}
        <script
          id="anti-debug-shield"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                // Block right-click context menu (Inspect Element)
                document.addEventListener('contextmenu', function(e) {
                  e.preventDefault();
                });

                // Block DevTools & Source Inspector shortcuts
                document.addEventListener('keydown', function(e) {
                  // F12
                  if (e.keyCode === 123) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                  // Ctrl+Shift+I (Inspector), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element Picker)
                  if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                  // Ctrl+U (View Source)
                  if (e.ctrlKey && e.keyCode === 85) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                });
              })();
            `
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
