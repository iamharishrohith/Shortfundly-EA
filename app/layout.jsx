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
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
