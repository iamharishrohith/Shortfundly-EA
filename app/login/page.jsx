'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  RefreshCw,
  Lock
} from 'lucide-react';

const CHAR_SET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRandomCaptcha(length = 6) {
  let result = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * CHAR_SET.length);
    result += CHAR_SET[idx];
  }
  return result;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);

  const drawCaptcha = (code) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background fill
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGrad.addColorStop(0, '#f8fafc');
    bgGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Random distortion noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = ['#cbd5e1', '#94a3b8', '#cbd5e1', '#e2e8f0'][i % 4];
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.bezierCurveTo(
        Math.random() * canvas.width, Math.random() * canvas.height,
        Math.random() * canvas.width, Math.random() * canvas.height,
        Math.random() * canvas.width, Math.random() * canvas.height
      );
      ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw characters with distinct rotations and contrast colors
    const colors = ['#0f172a', '#e11d48', '#1d4ed8', '#047857', '#6d28d9', '#b45309'];
    const charWidth = (canvas.width - 24) / code.length;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      ctx.save();
      const x = 16 + i * charWidth + (Math.random() * 4 - 2);
      const y = 28 + (Math.random() * 4 - 2);
      const angle = (Math.random() - 0.5) * 0.45; // -12 to +12 degrees

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = 'bold 22px monospace, system-ui';
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillText(char, -6, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    const newCode = generateRandomCaptcha(6);
    setCaptchaCode(newCode);
    setUserCaptcha('');
    setTimeout(() => drawCaptcha(newCode), 20);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your operator email address.');
      setIsLoading(false);
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      setError('Invalid email address format. Please enter a valid email (e.g. operator@shortfundly.com).');
      setIsLoading(false);
      return;
    }

    if (!userCaptcha.trim()) {
      setError('Please enter the security CAPTCHA verification code.');
      setIsLoading(false);
      return;
    }

    if (userCaptcha.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Incorrect CAPTCHA code. Security challenge reset. Please try again.');
      refreshCaptcha();
      setIsLoading(false);
      return;
    }

    // Successful authentication
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const emailName = cleanEmail.split('@')[0];
        const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        localStorage.setItem('sf_auth_session', JSON.stringify({
          isAuthenticated: true,
          email: cleanEmail,
          name: formattedName.toLowerCase() === 'admin' ? 'Harish' : formattedName,
          role: cleanEmail.includes('admin') ? 'Lead Outreach Administrator' : 'Outreach Operator',
          timestamp: Date.now()
        }));
      }
      router.push('/dashboard');
    }, 250);
  };

  return (
    <div className="auth-wrapper">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <img
              src="/images/shortfundly-logo.png"
              alt="Shortfundly OTT Marketplace"
              style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <h2>Operator Access Portal</h2>
          <p>Higher Education Outreach &amp; Automation Suite</p>
        </div>

        {error && (
          <div className="alert-box error" style={{ marginBottom: '16px', marginTop: 0 }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="form-stack">
          <div className="form-field">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={13} />
              <span>Operator Email</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="input-text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@shortfundly.com"
                style={{ paddingLeft: '34px' }}
                autoFocus
              />
              <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* CAPTCHA Security Section */}
          <div className="form-field" style={{ marginTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={13} />
              <span>Security CAPTCHA Challenge</span>
            </label>

            {/* Canvas Badge & Refresh Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                overflow: 'hidden',
                background: '#f8fafc',
                display: 'flex',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <canvas
                  ref={canvasRef}
                  width={180}
                  height={42}
                  style={{ display: 'block', cursor: 'pointer' }}
                  onClick={refreshCaptcha}
                  title="Click to refresh CAPTCHA code"
                />
              </div>

              <button
                type="button"
                onClick={refreshCaptcha}
                className="btn btn-secondary"
                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', whiteSpace: 'nowrap' }}
                title="Generate new CAPTCHA code"
              >
                <RefreshCw size={13} />
                <span>Refresh</span>
              </button>
            </div>

            {/* CAPTCHA Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-text"
                required
                maxLength={6}
                value={userCaptcha}
                onChange={(e) => setUserCaptcha(e.target.value.toUpperCase())}
                placeholder="Enter the 6 characters shown above"
                style={{
                  paddingLeft: '34px',
                  letterSpacing: '2px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontFamily: 'monospace, system-ui'
                }}
              />
              <ShieldCheck size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            style={{ padding: '10px 16px', marginTop: '12px' }}
          >
            <span>{isLoading ? 'Verifying Session...' : 'Authenticate & Open Dashboard'}</span>
            <ArrowRight size={14} />
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ChevronLeft size={14} />
            <span>Return to Landing Page</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
