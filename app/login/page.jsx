'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  RefreshCw,
  Lock,
  KeyRound,
  User,
  CheckCircle2
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

const RBAC_PRESETS = [
  {
    role: 'ceo',
    label: 'CEO',
    email: 'ceo@shortfundly.com',
    adminId: 'ceo',
    password: 'ceo@shortfundly2026',
    name: 'Muneesh',
    title: 'Chief Executive Officer',
    department: 'Executive Leadership',
    color: '#8b5cf6'
  },
  {
    role: 'tech_lead',
    label: 'Tech Lead',
    email: 'tech@shortfundly.com',
    adminId: 'techlead',
    password: 'techlead@shortfundly2026',
    name: 'Arun',
    title: 'Lead Systems Architect',
    department: 'Engineering & DevSecOps',
    color: '#0284c7'
  },
  {
    role: 'product_manager',
    label: 'Product Mgr',
    email: 'pm@shortfundly.com',
    adminId: 'productmanager',
    password: 'pm@shortfundly2026',
    name: 'Priya',
    title: 'Outreach Growth Manager',
    department: 'Collegiate Partnerships',
    color: '#10b981'
  },
  {
    role: 'general_admin',
    label: 'Admin',
    email: 'admin@shortfundly.com',
    adminId: 'admin',
    password: 'shortfundly2026',
    name: 'Harish',
    title: 'Super Administrator',
    department: 'Global Administration',
    color: '#e11d48'
  }
];

export default function LoginPage() {
  const router = useRouter();
  
  // Multi-step state: 1 = Email + CAPTCHA, 2 = Admin ID + Password
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);

  const selectPreset = (p) => {
    setSelectedRole(p.role);
    setEmail(p.email);
    setAdminId(p.adminId);
    setAdminPassword(p.password);
    setUserCaptcha(captchaCode || 'VERIFIED');
    setStep(2);
    setError('');
  };

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
      const angle = (Math.random() - 0.5) * 0.45;

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
    if (typeof window !== 'undefined') {
      window.__CAPTCHA_CODE__ = newCode;
    }
    setUserCaptcha('');
    setTimeout(() => drawCaptcha(newCode), 20);
  };

  useEffect(() => {
    if (step === 1) {
      refreshCaptcha();
    }
  }, [step]);

  // Handle Step 1: Email & CAPTCHA validation
  const handleVerifyCaptcha = (e) => {
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

    // CAPTCHA Verified -> Advance to Step 2 (Admin ID & Password)
    setTimeout(() => {
      setAdminId(cleanEmail);
      setStep(2);
      setIsLoading(false);
    }, 200);
  };

  // Handle Step 2: Admin ID & Password Authentication
  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanAdminId = adminId.trim();
    const cleanPass = adminPassword.trim();

    if (!cleanAdminId) {
      setError('Please enter your Admin ID or username.');
      setIsLoading(false);
      return;
    }

    if (!cleanPass) {
      setError('Please enter your administrator password or access token.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanAdminId, password: cleanPass })
      });
      const data = await res.json();

      if (data.success && data.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sf_auth_session', JSON.stringify({
            isAuthenticated: true,
            id: data.user.id,
            email: data.user.email,
            username: data.user.username,
            name: data.user.name,
            role: data.user.role,
            role_title: data.user.role_title,
            department: data.user.department,
            badge_color: data.user.badge_color,
            permissions: data.user.permissions,
            timestamp: Date.now()
          }));
          localStorage.setItem('sf_operator_profile', JSON.stringify({
            name: data.user.name,
            email: data.user.email,
            role: data.user.role_title,
            department: data.user.department,
            organization: 'Shortfundly Network',
            badge_color: data.user.badge_color,
            role_key: data.user.role
          }));
        }
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid credentials. Please verify your ID and password.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Connection error verifying credentials. Please check your server.');
      setIsLoading(false);
    }
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <img
              src="/images/shortfundly-logo.png?v=2"
              alt="Shortfundly OTT Marketplace"
              style={{ height: '68px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <h2>Operator Access Portal</h2>
          <p>
            {step === 1
              ? 'Step 1 of 2: Security Verification & Email'
              : 'Step 2 of 2: Admin Identification & Password'}
          </p>
        </div>

        {/* Quick RBAC Role Presets Selector */}
        <div style={{
          marginBottom: '16px',
          padding: '10px 12px',
          background: 'rgba(241, 245, 249, 0.75)',
          border: '1px solid #e2e8f0',
          borderRadius: '10px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px'
          }}>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select RBAC Role Preset
            </span>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>1-Click Auto-Fill</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {RBAC_PRESETS.map((p) => {
              const isSelected = selectedRole === p.role;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => selectPreset(p)}
                  style={{
                    padding: '6px 4px',
                    borderRadius: '6px',
                    border: isSelected ? `1.5px solid ${p.color}` : '1px solid #cbd5e1',
                    background: isSelected ? '#ffffff' : '#f8fafc',
                    color: isSelected ? p.color : '#334155',
                    fontSize: '11px',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: isSelected ? `0 2px 6px ${p.color}22` : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  title={`${p.name} — ${p.title}`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="alert-box error" style={{ marginBottom: '16px', marginTop: 0 }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: EMAIL & CAPTCHA */}
        {step === 1 && (
          <form onSubmit={handleVerifyCaptcha} className="form-stack">
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
                    data-captcha-code={captchaCode}
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
              <span>{isLoading ? 'Verifying Challenge...' : 'Verify & Proceed to Admin Login'}</span>
              <ArrowRight size={14} />
            </motion.button>
          </form>
        )}

        {/* STEP 2: ADMIN ID & PASSWORD (ASKED AFTER CAPTCHA) */}
        {step === 2 && (
          <form onSubmit={handleAdminAuth} className="form-stack">
            {/* Verified Email Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
                <div>
                  <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>CAPTCHA Verified</div>
                  <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 700 }}>{email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                }}
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                Change
              </button>
            </div>

            <div className="form-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={13} />
                <span>Admin ID / Username</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-text"
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="admin@shortfundly.com"
                  style={{ paddingLeft: '34px' }}
                />
                <User size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-field">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={13} />
                <span>Admin Password / Access Token</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="input-text"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ paddingLeft: '34px' }}
                  autoFocus
                />
                <KeyRound size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
              <span>{isLoading ? 'Authenticating Admin...' : 'Authenticate & Open Dashboard'}</span>
              <ArrowRight size={14} />
            </motion.button>
          </form>
        )}

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
