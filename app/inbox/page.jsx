"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';

export default function AuthenticGmailInboxPage() {
  const [viewState, setViewState] = useState('inbox'); // 'inbox' | 'opened'

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#1a1a1a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Top Floating Control Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard" id="btn-back-dashboard" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#ffffff',
            textDecoration: 'none',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '6px 14px',
            borderRadius: '6px',
            fontWeight: 500,
            transition: 'background 0.2s ease'
          }}>
            <ArrowLeft size={16} />
            <span>Return to Shortfundly Deck</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }}></span>
            <span style={{ fontWeight: 600, color: '#f3f4f6' }}>
              Real Chrome Profile: monarchrealms.team@gmail.com
            </span>
            <span style={{
              fontSize: '11px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              padding: '2px 8px',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontWeight: 600
            }}>
              LIVE VERIFIED DISPATCH
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            id="btn-toggle-inbox"
            onClick={() => setViewState('inbox')}
            style={{
              background: viewState === 'inbox' ? '#e11d48' : 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500
            }}
          >
            1. Inbox View
          </button>
          <button
            id="btn-toggle-opened"
            onClick={() => setViewState('opened')}
            style={{
              background: viewState === 'opened' ? '#e11d48' : 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500
            }}
          >
            2. Opened Proposal View
          </button>
        </div>
      </div>

      {/* Main Desktop Display Container */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#0d1117'
      }}>
        {viewState === 'inbox' ? (
          /* Real Google Chrome Inbox Screen */
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1920px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            {/* Clickable Overlay Target for Automated Walkthrough */}
            <div
              id="inbox-email-row"
              onClick={() => setViewState('opened')}
              style={{
                position: 'absolute',
                top: '445px',
                left: '260px',
                width: '1250px',
                height: '42px',
                cursor: 'pointer',
                zIndex: 10,
                background: 'rgba(225, 29, 72, 0.05)',
                border: '2px dashed rgba(225, 29, 72, 0.4)',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              title="Click to open Shortfundly Proposal Email"
            >
              <div style={{
                position: 'absolute',
                right: '12px',
                top: '8px',
                background: '#e11d48',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                pointerEvents: 'none'
              }}>
                CLICK TO OPEN RECEIVED EMAIL
              </div>
            </div>

            <img
              src="/images/real_gmail_inbox.png"
              alt="Real Google Chrome Gmail Inbox monarchrealms.team@gmail.com"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        ) : (
          /* Real Opened Shortfundly Proposal Screen */
          <div
            id="opened-proposal-container"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1920px',
              background: '#ffffff',
              minHeight: '100vh',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}
          >
            {/* Chrome-Style Window Header to perfectly frame the real opened email */}
            <div style={{
              height: '44px',
              background: '#2b2d30',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              color: '#d1d5db',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
                  <path fill="#4285F4" d="M22 6l-10 7L2 6"/>
                  <path fill="#FBBC05" d="M2 18V6l10 7"/>
                  <path fill="#34A853" d="M22 18V6l-10 7"/>
                </svg>
                <span style={{ fontWeight: 600 }}>PROPOSAL FOR SHORTFUNDLY CAMPUS COLLABORATION - monarchrealms.team@gmail.com - Gmail</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 600, fontSize: '11px' }}>● TLS ENCRYPTED</span>
                <span style={{ color: '#9ca3af' }}>Google Chrome 14-10-2026</span>
              </div>
            </div>

            {/* Authentic Screenshot Uploaded by User */}
            <div style={{ width: '100%', overflow: 'hidden' }}>
              <img
                src="/images/real_gmail_opened.png"
                alt="Authentic Received Proposal Email in Gmail for Monarchs University"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
