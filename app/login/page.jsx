'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@shortfundly.com');
  const [password, setPassword] = useState('shortfundly2026');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both operator email and access token.');
        setIsLoading(false);
        return;
      }

      if (email.toLowerCase() === 'admin@shortfundly.com' && password === 'shortfundly2026') {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sf_auth_session', JSON.stringify({
            isAuthenticated: true,
            email: email.trim(),
            role: 'Lead Outreach Administrator',
            timestamp: Date.now()
          }));
        }
        router.push('/dashboard');
      } else {
        if (password.length >= 6) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('sf_auth_session', JSON.stringify({
              isAuthenticated: true,
              email: email.trim(),
              role: 'Outreach Operator',
              timestamp: Date.now()
            }));
          }
          router.push('/dashboard');
        } else {
          setError('Invalid credentials. Use admin@shortfundly.com / shortfundly2026 or enter a 6+ char password.');
          setIsLoading(false);
        }
      }
    }, 300);
  };

  const handleFillDemo = () => {
    setEmail('admin@shortfundly.com');
    setPassword('shortfundly2026');
    setError('');
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
          <div className="brand-section" style={{ justifyContent: 'center', marginBottom: '8px' }}>
            <div className="brand-badge">SHORTFUNDLY</div>
          </div>
          <h2>Operator Access Portal</h2>
          <p>Higher Education Outreach & Automation Suite</p>
        </div>

        <div className="demo-account-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-title)', marginBottom: '6px' }}>
            <ShieldCheck size={14} style={{ color: 'var(--sf-red)' }} />
            <span>Pre-configured Operator Credentials</span>
          </div>
          <div>User: <code>admin@shortfundly.com</code></div>
          <div style={{ marginTop: '2px' }}>Pass: <code>shortfundly2026</code></div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '10px', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Sparkles size={14} style={{ color: 'var(--sf-red)' }} />
            <span>Auto-Fill Credentials</span>
          </button>
        </div>

        {error && (
          <div className="alert-box error" style={{ marginBottom: '16px', marginTop: 0 }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="form-stack">
          <div className="form-field">
            <label>Operator Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="input-text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@shortfundly.com"
                style={{ paddingLeft: '34px' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-field">
            <label>Access Token / Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="input-text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{ paddingLeft: '34px' }}
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
            style={{ padding: '10px 16px', marginTop: '6px' }}
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
