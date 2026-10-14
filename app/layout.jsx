import './globals.css';
import fs from 'fs';
import path from 'path';
import AntiDebugShield from './AntiDebugShield';

export const metadata = {
  title: 'College Email Automation - Shortfundly Campus Control Deck',
  description: 'Enterprise Email Automation Suite for Maharashtra Higher Education',
  icons: {
    icon: [
      { url: '/images/shortfundly-icon.png?v=3', sizes: 'any', type: 'image/png' },
      { url: '/favicon.ico?v=3', sizes: 'any' }
    ],
    shortcut: '/favicon.ico?v=3',
    apple: '/images/shortfundly-icon.png?v=3'
  }
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
        <link rel="icon" href="/images/shortfundly-icon.png?v=3" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/images/shortfundly-icon.png?v=3" />
        {inlineCss && (
          <style id="shortfundly-global-styles" dangerouslySetInnerHTML={{ __html: inlineCss }} />
        )}
      </head>
      <body>
        <AntiDebugShield />
        {children}
      </body>
    </html>
  );
}
