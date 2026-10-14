'use client';

import { useEffect } from 'react';

export default function AntiDebugShield() {
  useEffect(() => {
    // Block right-click context menu (Inspect Element)
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Block DevTools & Source Inspector shortcuts
    const handleKeyDown = (e) => {
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
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
