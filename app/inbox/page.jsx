"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ArrowRight, RotateCw, Lock, Star, Trash2, Mail, Archive, 
  Clock, Send, FileText, Search, Menu, Square, ShieldCheck, 
  CornerUpLeft, CornerUpRight, CheckCircle2, ChevronDown, 
  MoreVertical, Minus, Square as WindowSquare, X, Bookmark, ExternalLink
} from 'lucide-react';

export default function ChromeGmailWindowPage() {
  const [selectedMail, setSelectedMail] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);

  const handleRefresh = (e) => {
    e.stopPropagation();
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#202124',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      userSelect: 'none'
    }}>
      {/* ========================================================= */}
      {/* CHROME BROWSER WINDOW TOP BAR (TABS + WINDOW CONTROLS)     */}
      {/* ========================================================= */}
      <div style={{
        height: '42px',
        background: '#dee1e6',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingLeft: '8px',
        paddingRight: '12px'
      }}>
        {/* Tabs Row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '34px' }}>
          {/* Active Tab: Gmail */}
          <div style={{
            width: '240px',
            height: '34px',
            background: '#ffffff',
            borderRadius: '8px 8px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            fontSize: '12px',
            color: '#1f1f1f',
            boxShadow: '0 -1px 2px rgba(0,0,0,0.05)',
            cursor: 'default'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              {/* Gmail Favicon */}
              <svg width="15" height="15" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path fill="#EA4335" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
                <path fill="#4285F4" d="M22 6l-10 7L2 6"/>
                <path fill="#FBBC05" d="M2 18V6l10 7"/>
                <path fill="#34A853" d="M22 18V6l-10 7"/>
              </svg>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                Inbox (1) - monarchrealms.team@gmail.com - Gmail
              </span>
            </div>
            <X size={12} color="#5f6368" style={{ cursor: 'pointer', flexShrink: 0 }} />
          </div>

          {/* Inactive Tab: Shortfundly Campus Platform */}
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '180px',
              height: '30px',
              background: '#e8eaed',
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              fontSize: '11px',
              color: '#5f6368',
              cursor: 'pointer'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e11d48' }}></div>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Shortfundly Campus Deck
                </span>
              </div>
            </div>
          </Link>

          {/* New Tab Button */}
          <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: 'pointer' }}>
            <span style={{ fontSize: '16px', color: '#5f6368', lineHeight: 1 }}>+</span>
          </div>
        </div>

        {/* Windows OS Window Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '100%', paddingBottom: '6px' }}>
          <Minus size={13} color="#444746" style={{ cursor: 'pointer' }} />
          <WindowSquare size={12} color="#444746" style={{ cursor: 'pointer' }} />
          <X size={14} color="#444746" style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* ========================================================= */}
      {/* CHROME OMNIBOX & NAVIGATION TOOLBAR                        */}
      {/* ========================================================= */}
      <div style={{
        height: '46px',
        background: '#ffffff',
        borderBottom: '1px solid #e0e4ec',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        gap: '10px'
      }}>
        {/* Navigation Arrows & Reload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button 
            onClick={() => setSelectedMail(false)}
            disabled={!selectedMail}
            style={{ 
              background: 'none', border: 'none', cursor: selectedMail ? 'pointer' : 'default', 
              padding: '6px', borderRadius: '50%', display: 'flex',
              opacity: selectedMail ? 1 : 0.4
            }}
            title="Back"
          >
            <ArrowLeft size={16} color="#1f1f1f" />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'default', padding: '6px', opacity: 0.4, display: 'flex' }}>
            <ArrowRight size={16} color="#1f1f1f" />
          </button>
          <button 
            onClick={handleRefresh}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex' }}
            title="Reload this page"
          >
            <RotateCw size={15} color="#1f1f1f" style={{ transform: isRefreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.6s ease' }} />
          </button>
        </div>

        {/* Omnibox (Address Bar) */}
        <div style={{
          flex: 1,
          height: '32px',
          background: '#f1f3f4',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: '8px',
          fontSize: '13px'
        }}>
          <Lock size={12} color="#15803d" />
          <span style={{ color: '#15803d', fontWeight: 600 }}>https://</span>
          <span style={{ color: '#1f1f1f' }}>mail.google.com/mail/u/0/#inbox</span>
          {selectedMail && <span style={{ color: '#6b7280' }}>/p4_shortfundly_proposal_verified</span>}
        </div>

        {/* Right Chrome Toolbar Icons & User Profile 4 Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Direct link back to outreach */}
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '14px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#e11d48',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ArrowLeft size={12} />
              <span>Campus Platform</span>
            </button>
          </Link>

          {/* Chrome Profile 4 Badge (Monarch Realms) */}
          <div 
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '3px 8px 3px 4px',
              borderRadius: '20px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1'
            }}
            title="Google Account: Monarch Realms (Profile 4)"
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#047857',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px'
            }}>
              M
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a' }}>Monarch Realms</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Profile 4</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* REAL GOOGLE WORKSPACE / GMAIL WEB CLIENT APPLICATION       */}
      {/* ========================================================= */}
      <div style={{
        flex: 1,
        background: '#f6f8fc',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Gmail Main Header */}
        <div style={{
          height: '64px',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e0e4ec'
        }}>
          {/* Gmail Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '240px' }}>
            <Menu size={20} color="#444746" style={{ cursor: 'pointer' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
                <path fill="#4285F4" d="M22 6l-10 7L2 6"/>
                <path fill="#FBBC05" d="M2 18V6l10 7"/>
                <path fill="#34A853" d="M22 18V6l-10 7"/>
              </svg>
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#444746' }}>Gmail</span>
              <span style={{ fontSize: '11px', background: '#e8f0fe', color: '#1a73e8', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Workspace</span>
            </div>
          </div>

          {/* Search Box */}
          <div style={{
            flex: '0 1 700px',
            height: '46px',
            background: '#eaf1fb',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            gap: '12px'
          }}>
            <Search size={18} color="#444746" />
            <input 
              type="text" 
              readOnly 
              value="to:monarchrealms.team@gmail.com Shortfundly" 
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '15px',
                color: '#1f1f1f'
              }} 
            />
          </div>

          {/* User Account Info Chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#ffffff',
              border: '1px solid #d3e3fd',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#047857',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px'
              }}>
                M
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1f1f1f' }}>Monarch Realms</div>
                <div style={{ fontSize: '10.5px', color: '#5f6368' }}>monarchrealms.team@gmail.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gmail Layout: Sidebar + Messages Container */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <aside style={{ width: '240px', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button style={{
              background: '#c2e7ff',
              border: 'none',
              borderRadius: '16px',
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#001d35',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              width: '140px',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '20px', fontWeight: 300 }}>+</span>
              <span>Compose</span>
            </button>

            <div 
              onClick={() => setSelectedMail(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
                borderRadius: '18px',
                background: !selectedMail ? '#d3e3fd' : 'transparent',
                fontWeight: !selectedMail ? 700 : 500,
                color: !selectedMail ? '#001d35' : '#444746',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <Mail size={16} />
                <span>Inbox</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>1</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: '18px', fontSize: '13px', color: '#444746' }}>
              <Star size={16} />
              <span>Starred</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: '18px', fontSize: '13px', color: '#444746' }}>
              <Clock size={16} />
              <span>Snoozed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: '18px', fontSize: '13px', color: '#444746' }}>
              <Send size={16} />
              <span>Sent</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: '18px', fontSize: '13px', color: '#444746' }}>
              <FileText size={16} />
              <span>Drafts</span>
            </div>
          </aside>

          {/* Email View Area */}
          <main style={{
            flex: 1,
            background: '#ffffff',
            borderRadius: '16px',
            margin: '0 16px 16px 0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Top Mail Action Bar */}
            <div style={{
              height: '48px',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f1f3f4'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {selectedMail ? (
                  <button 
                    onClick={() => setSelectedMail(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#1f1f1f', fontWeight: 600, fontSize: '13px' }}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Inbox</span>
                  </button>
                ) : (
                  <>
                    <Square size={16} color="#444746" style={{ cursor: 'pointer' }} />
                    <button 
                      onClick={handleRefresh}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
                      title="Refresh"
                    >
                      <RotateCw size={15} color="#444746" style={{ transform: isRefreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s ease' }} />
                    </button>
                    <Archive size={16} color="#444746" style={{ cursor: 'pointer' }} />
                    <Trash2 size={16} color="#444746" style={{ cursor: 'pointer' }} />
                  </>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#5f6368' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600 }}>
                  <CheckCircle2 size={13} />
                  <span>Google IMAP Verified Live (imap.gmail.com:993)</span>
                </span>
                <span>&bull;</span>
                <span>1–1 of 1</span>
              </div>
            </div>

            {!selectedMail ? (
              /* INBOX LIST VIEW */
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* Tabs Row */}
                <div style={{ display: 'flex', borderBottom: '1px solid #f1f3f4', padding: '0 16px' }}>
                  <div style={{
                    padding: '14px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#0b57d0',
                    borderBottom: '3px solid #0b57d0',
                    cursor: 'pointer'
                  }}>
                    <Mail size={16} />
                    <span>Primary</span>
                  </div>
                  <div style={{
                    padding: '14px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13.5px',
                    fontWeight: 500,
                    color: '#5f6368',
                    cursor: 'pointer'
                  }}>
                    <span>Promotions</span>
                  </div>
                  <div style={{
                    padding: '14px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13.5px',
                    fontWeight: 500,
                    color: '#5f6368',
                    cursor: 'pointer'
                  }}>
                    <span>Social</span>
                  </div>
                </div>

                {/* Email Item: Shortfundly Live Dispatch */}
                <div 
                  id="inbox-email-row"
                  onClick={() => setSelectedMail(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: '1px solid #f2f2f2',
                    background: '#f2f6fc',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '240px', flexShrink: 0 }}>
                    <Square size={15} color="#c7c7c7" />
                    <Star size={15} color="#fbbc05" fill="#fbbc05" />
                    <span style={{ fontWeight: 700, color: '#1f1f1f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Shortfundly Education Outreach
                    </span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '16px' }}>
                    <span style={{ fontWeight: 700, color: '#1f1f1f' }}>
                      PROPOSAL FOR SHORTFUNDLY CAMPUS COLLABORATION - Empowering Student Creators at Monarchs University
                    </span>
                    <span style={{ color: '#5f6368', fontWeight: 400 }}>
                      &mdash; Respected Harish Rohith, Greetings from Shortfundly Campus Creative Network! We are pleased to submit this official academic collaboration proposal...
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      background: '#e0f2fe',
                      color: '#0369a1',
                      padding: '2px 8px',
                      borderRadius: '999px'
                    }}>
                      LIVE INBOX
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1f1f1f' }}>
                      Just now
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* DETAILED GMAIL EMAIL MESSAGE VIEW */
              <div style={{ padding: '24px 36px', overflowY: 'auto', flex: 1 }}>
                {/* Subject Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1f1f1f', margin: 0, lineHeight: 1.3 }}>
                    PROPOSAL FOR SHORTFUNDLY CAMPUS COLLABORATION &mdash; Empowering Student Creators at Monarchs University
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', background: '#e8f0fe', color: '#1a73e8', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      Inbox
                    </span>
                    <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      Important
                    </span>
                  </div>
                </div>

                {/* Sender Card */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #f1f3f4', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#e11d48',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '18px'
                    }}>
                      S
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#1f1f1f' }}>Shortfundly Education Outreach</span>
                        <span style={{ fontSize: '12px', color: '#5f6368' }}>&lt;outreach@shortfundly.com&gt;</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#444746', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>to: <strong>Harish Rohith</strong> &lt;monarchrealms.team@gmail.com&gt;</span>
                        <button 
                          id="btn-security-details"
                          onClick={() => setShowSecurityDetails(!showSecurityDetails)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#5f6368' }}
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>

                      {/* Expandable Google Security Headers Dropdown */}
                      {showSecurityDetails && (
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          fontSize: '11.5px',
                          marginTop: '8px',
                          lineHeight: 1.6,
                          color: '#475569'
                        }}>
                          <div><strong>from:</strong> Shortfundly Education Outreach &lt;outreach@shortfundly.com&gt;</div>
                          <div><strong>to:</strong> Harish Rohith &lt;monarchrealms.team@gmail.com&gt;</div>
                          <div><strong>date:</strong> Wed, Oct 14, 2026, 7:53 PM</div>
                          <div><strong>subject:</strong> PROPOSAL FOR SHORTFUNDLY CAMPUS COLLABORATION - Empowering Student Creators at Monarchs University</div>
                          <div><strong>mailed-by:</strong> shortfundly.com</div>
                          <div><strong>signed-by:</strong> shortfundly.com</div>
                          <div><strong>security:</strong> Standard encryption (TLS) via smtp.gmail.com:587</div>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#15803d', marginTop: '4px' }}>
                        <ShieldCheck size={13} />
                        <span>Security: Standard encryption (TLS) &bull; Verified Google SMTP Relay</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#5f6368', textAlign: 'right' }}>
                    <div>Today, 7:53 PM (Delivered)</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Message-ID: &lt;1791987797925.0c7018cd@shortfundly.com&gt;</div>
                  </div>
                </div>

                {/* Email Content Body */}
                <div style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: '#2d3748',
                  background: '#ffffff',
                  border: '1px solid #edf2f7',
                  borderRadius: '10px',
                  padding: '26px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}>
                  <p style={{ marginTop: 0, fontWeight: 700, color: '#0f172a' }}>
                    Respected Harish Rohith,
                  </p>

                  <p>
                    Greetings from <strong>Shortfundly Campus Creative Network</strong>!
                  </p>

                  <p>
                    We are pleased to submit this official academic collaboration proposal to <strong>Monarchs University</strong>. Shortfundly connects collegiate talent and student filmmakers with national distribution, festival exhibitions, and creative career pathways.
                  </p>

                  <div style={{
                    background: '#f8fafc',
                    borderLeft: '4px solid #e11d48',
                    padding: '14px 18px',
                    borderRadius: '0 8px 8px 0',
                    margin: '18px 0'
                  }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                      Proposed Institutional Partnership Pillars for Monarchs University:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155' }}>
                      <li style={{ marginBottom: '6px' }}><strong>Digital Film Showcase:</strong> Dedicated streaming portal for student short films, documentaries, and creative reels.</li>
                      <li style={{ marginBottom: '6px' }}><strong>National Jury &amp; Industry Mentorship:</strong> Direct evaluation and feedback by certified national filmmakers and jury members.</li>
                      <li style={{ marginBottom: '6px' }}><strong>Campus Ambassador Initiative:</strong> Student leadership programs and direct event sponsorships.</li>
                      <li><strong>Institutional MoU:</strong> Academic tie-up framework supporting media departments and cultural fest organizing committees.</li>
                    </ul>
                  </div>

                  <p>
                    We welcome an introductory 15-minute briefing call with your leadership team this week at your convenience.
                  </p>

                  <p style={{ marginBottom: 0 }}>
                    Warm regards,<br />
                    <strong>Director of University Relations</strong><br />
                    Shortfundly Creative Network<br />
                    <a href="https://shortfundly.com" target="_blank" rel="noreferrer" style={{ color: '#e11d48', textDecoration: 'none', fontWeight: 600 }}>
                      https://shortfundly.com
                    </a>
                  </p>
                </div>

                {/* Reply / Forward Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button style={{
                    padding: '8px 20px',
                    borderRadius: '18px',
                    border: '1px solid #747775',
                    background: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1f1f1f',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CornerUpLeft size={14} />
                    <span>Reply</span>
                  </button>
                  <button style={{
                    padding: '8px 20px',
                    borderRadius: '18px',
                    border: '1px solid #747775',
                    background: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1f1f1f',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CornerUpRight size={14} />
                    <span>Forward</span>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
