"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Star, Trash2, Mail, RefreshCw, Archive, Clock, Send, 
  FileText, Search, Menu, CheckSquare, Square, ShieldCheck, 
  ExternalLink, CornerUpLeft, CornerUpRight, CheckCircle2
} from 'lucide-react';

export default function InboxInspectionPage() {
  const [selectedMail, setSelectedMail] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f6f8fc',
      fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#1f1f1f',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 1. GMAIL TOP HEADER */}
      <header style={{
        height: '64px',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f6f8fc',
        borderBottom: '1px solid #e0e4ec'
      }}>
        {/* Left: Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '240px' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex' }}>
            <Menu size={20} color="#444746" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#ea4335', letterSpacing: '-0.5px' }}>G</span>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#4285f4', letterSpacing: '-0.5px', marginLeft: '-6px' }}>m</span>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#fbbc05', letterSpacing: '-0.5px', marginLeft: '-6px' }}>a</span>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#34a853', letterSpacing: '-0.5px', marginLeft: '-6px' }}>i</span>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#ea4335', letterSpacing: '-0.5px', marginLeft: '-6px' }}>l</span>
            <span style={{ fontSize: '12px', background: '#e8f0fe', color: '#1a73e8', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, marginLeft: '6px' }}>Workspace</span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div style={{
          flex: '0 1 720px',
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

        {/* Right: Active Profile Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#ffffff',
              border: '1px solid #c7c7c7',
              borderRadius: '18px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <ArrowLeft size={14} />
              <span>Back to Shortfundly Deck</span>
            </button>
          </Link>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#ffffff',
            padding: '4px 10px 4px 6px',
            borderRadius: '24px',
            border: '1px solid #d3e3fd',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#047857',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px'
            }}>
              M
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1f1f1f' }}>Monarch Realms</div>
              <div style={{ fontSize: '11px', color: '#5f6368' }}>monarchrealms.team@gmail.com</div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. BODY CONTENT: SIDEBAR + INBOX */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Sidebar */}
        <aside style={{ width: '240px', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button style={{
            background: '#c2e7ff',
            border: 'none',
            borderRadius: '16px',
            padding: '14px 22px',
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
            <span style={{ fontSize: '18px', fontWeight: 300 }}>+</span>
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

        {/* Right Main Container */}
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
                    <RefreshCw size={15} color="#444746" style={{ transform: isRefreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s ease' }} />
                  </button>
                  <Archive size={16} color="#444746" style={{ cursor: 'pointer' }} />
                  <Trash2 size={16} color="#444746" style={{ cursor: 'pointer' }} />
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#5f6368' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600 }}>
                <CheckCircle2 size={13} />
                <span>Google IMAP Verified Live</span>
              </span>
              <span>&bull;</span>
              <span>1–1 of 1</span>
            </div>
          </div>

          {!selectedMail ? (
            /* LIST VIEW */
            <div>
              {/* Primary Category Tab */}
              <div style={{ display: 'flex', borderBottom: '1px solid #f1f3f4', padding: '0 16px' }}>
                <div style={{
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0b57d0',
                  borderBottom: '3px solid #0b57d0',
                  cursor: 'pointer'
                }}>
                  <Mail size={15} />
                  <span>Primary</span>
                </div>
              </div>

              {/* Single Unread Email Item */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '220px', flexShrink: 0 }}>
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
                    &mdash; Dear Harish Rohith, Greetings from Shortfundly! We propose a collaboration with Monarchs University through Shortfundly Campus...
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    background: '#e0f2fe',
                    color: '#0369a1',
                    padding: '2px 8px',
                    borderRadius: '999px'
                  }}>
                    NEW
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#1f1f1f' }}>
                    Just now
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* DETAILED EMAIL VIEW */
            <div style={{ padding: '24px 32px', overflowY: 'auto' }}>
              {/* Email Subject Header */}
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

              {/* Sender Details */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid #f1f3f4', paddingBottom: '16px' }}>
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
                    <div style={{ fontSize: '12px', color: '#444746', marginTop: '2px' }}>
                      to: <strong>Harish Rohith</strong> &lt;monarchrealms.team@gmail.com&gt;
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#15803d', marginTop: '4px' }}>
                      <ShieldCheck size={13} />
                      <span>Security: Standard encryption (TLS) &bull; Verified Google SMTP Relay (smtp.gmail.com:587)</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#5f6368', textAlign: 'right' }}>
                  <div>Today, 2:23 PM (Delivered)</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Message-ID: &lt;1791987797925.0c7018cd@shortfundly.com&gt;</div>
                </div>
              </div>

              {/* Email Body */}
              <div style={{
                fontSize: '14px',
                lineHeight: 1.7,
                color: '#2d3748',
                background: '#ffffff',
                border: '1px solid #edf2f7',
                borderRadius: '10px',
                padding: '24px',
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

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button style={{
                  padding: '8px 18px',
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
                  padding: '8px 18px',
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
  );
}
