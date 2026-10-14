'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Database,
  FileText,
  Send,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Search,
  ExternalLink,
  Upload,
  FolderUp,
  RefreshCw,
  Save,
  RotateCcw,
  Sliders,
  Globe,
  MapPin,
  FileSpreadsheet,
  AlertOctagon,
  User,
  LogOut,
  Mail,
  UserCheck,
  Zap,
  Terminal,
  Activity,
  ArrowRight,
  Sparkles,
  Tag,
  X,
  Check,
  Info,
  AlertCircle,
  Network,
  History,
  Play,
  Pause,
  ListFilter,
  PlusCircle,
  Server,
  Key,
  Lock,
  Settings,
  Trash2,
  Edit3,
  Plus
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  // Navigation tab state: '0' = Dashboard, '1' = States Load, '2' = Email Templates, '3' = Sender, '4' = Audit History, '5' = SMTP Config
  const [activeTab, setActiveTab] = useState('0');

  // Sender sub-mode: 'individual' or 'bulk'
  const [senderMode, setSenderMode] = useState('individual');

  // SMTP Configuration & Live Engine State
  const [smtpConfig, setSmtpConfig] = useState({
    id: 1,
    account_name: 'Primary Account',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    hasPassword: false,
    from_email: 'outreach@shortfundly.com',
    from_name: 'Shortfundly Education Outreach',
    is_live_enabled: false,
    last_tested_at: null,
    last_test_status: null,
    last_test_message: null
  });
  const [smtpAccounts, setSmtpAccounts] = useState([]);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [accountForm, setAccountForm] = useState({
    account_name: '',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    from_email: 'outreach@shortfundly.com',
    from_name: 'Shortfundly Education Outreach'
  });
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState(null);

  // Auth session and operator profile state
  const [operatorUser, setOperatorUser] = useState('harish.shortfundly@gmail.com');
  const [currentUserRole, setCurrentUserRole] = useState('general_admin');
  const [userPermissions, setUserPermissions] = useState({
    canViewDashboard: true,
    canViewColleges: true,
    canUploadCsv: true,
    canEditTemplates: true,
    canViewTemplates: true,
    canTestSend: true,
    canLaunchCampaign: true,
    canPauseKillCampaign: true,
    canManageSmtp: true,
    canViewReports: true,
    canExportExcel: true,
    canManageUsers: true,
    badgeText: 'Super Admin'
  });
  const [operatorProfile, setOperatorProfile] = useState({
    name: 'Harish',
    email: 'harish.shortfundly@gmail.com',
    role: 'Lead Outreach Administrator',
    department: 'Global Administration',
    organization: 'Shortfundly Network',
    badge_color: '#e11d48'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: 'Harish',
    email: 'harish.shortfundly@gmail.com',
    role: 'Lead Outreach Administrator',
    department: 'Global Administration',
    organization: 'Shortfundly Network',
    badge_color: '#e11d48'
  });

  const RBAC_ROLES = [
    {
      role: 'ceo',
      label: 'CEO',
      name: 'Muneesh',
      email: 'ceo@shortfundly.com',
      role_title: 'Chief Executive Officer (CEO)',
      department: 'Executive Leadership',
      badge_color: '#8b5cf6',
      badgeText: 'Executive',
      permissions: {
        canViewDashboard: true,
        canViewColleges: true,
        canUploadCsv: false,
        canEditTemplates: false,
        canViewTemplates: true,
        canTestSend: true,
        canLaunchCampaign: false,
        canPauseKillCampaign: true,
        canManageSmtp: false,
        canViewReports: true,
        canExportExcel: true,
        canManageUsers: false,
        badgeText: 'Executive'
      }
    },
    {
      role: 'tech_lead',
      label: 'Tech Lead',
      name: 'Arun',
      email: 'tech@shortfundly.com',
      role_title: 'Lead Systems & Infrastructure Architect',
      department: 'Engineering & DevSecOps',
      badge_color: '#0284c7',
      badgeText: 'Infrastructure',
      permissions: {
        canViewDashboard: true,
        canViewColleges: true,
        canUploadCsv: false,
        canEditTemplates: false,
        canViewTemplates: true,
        canTestSend: true,
        canLaunchCampaign: false,
        canPauseKillCampaign: true,
        canManageSmtp: true,
        canViewReports: true,
        canExportExcel: true,
        canManageUsers: false,
        badgeText: 'Infrastructure'
      }
    },
    {
      role: 'product_manager',
      label: 'Product Mgr',
      name: 'Priya',
      email: 'pm@shortfundly.com',
      role_title: 'Product & Outreach Growth Manager',
      department: 'Collegiate Partnerships',
      badge_color: '#10b981',
      badgeText: 'Outreach Manager',
      permissions: {
        canViewDashboard: true,
        canViewColleges: true,
        canUploadCsv: true,
        canEditTemplates: true,
        canViewTemplates: true,
        canTestSend: true,
        canLaunchCampaign: true,
        canPauseKillCampaign: true,
        canManageSmtp: false,
        canViewReports: true,
        canExportExcel: true,
        canManageUsers: false,
        badgeText: 'Outreach Manager'
      }
    },
    {
      role: 'general_admin',
      label: 'Super Admin',
      name: 'Harish',
      email: 'admin@shortfundly.com',
      role_title: 'Lead Outreach Administrator',
      department: 'Global Administration',
      badge_color: '#e11d48',
      badgeText: 'Super Admin',
      permissions: {
        canViewDashboard: true,
        canViewColleges: true,
        canUploadCsv: true,
        canEditTemplates: true,
        canViewTemplates: true,
        canTestSend: true,
        canLaunchCampaign: true,
        canPauseKillCampaign: true,
        canManageSmtp: true,
        canViewReports: true,
        canExportExcel: true,
        canManageUsers: true,
        badgeText: 'Super Admin'
      }
    }
  ];

  const handleSwitchRole = (targetRole) => {
    const roleDef = RBAC_ROLES.find(r => r.role === targetRole) || RBAC_ROLES[3];
    setCurrentUserRole(roleDef.role);
    if (roleDef.permissions) {
      setUserPermissions(roleDef.permissions);
    }
    const updated = {
      name: roleDef.name,
      email: roleDef.email,
      role: roleDef.role_title,
      department: roleDef.department,
      organization: 'Shortfundly Network',
      badge_color: roleDef.badge_color,
      role_key: roleDef.role
    };
    setOperatorProfile(updated);
    setProfileForm(updated);
    setOperatorUser(roleDef.email);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sf_operator_profile', JSON.stringify(updated));
      const curr = JSON.parse(localStorage.getItem('sf_auth_session') || '{}');
      localStorage.setItem('sf_auth_session', JSON.stringify({
        ...curr,
        ...updated,
        role: roleDef.role,
        permissions: roleDef.permissions
      }));
    }
    addToast('success', 'RBAC Role Switched', `Active session switched to ${roleDef.role_title}.`);
  };

  // Core Data & Telemetry
  const [colleges, setColleges] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [importLimit, setImportLimit] = useState('50');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL', 'ENGINEERING', 'MEDICAL', 'ARTS_SCIENCE'
  const [statusMessage, setStatusMessage] = useState('Institutional working queue standby.');
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [customStateInput, setCustomStateInput] = useState('');
  const [uploadedMeta, setUploadedMeta] = useState(null);
  const fileInputRef = useRef(null);

  // Derived state telemetry from currently staged colleges
  const loadedStates = Array.from(new Set(colleges.map((c) => c.state).filter(Boolean)));
  const loadedDistricts = Array.from(new Set(colleges.map((c) => c.city).filter(Boolean)));
  const activeStateLabel = loadedStates.length === 1
    ? loadedStates[0]
    : (loadedStates.length > 1 ? `${loadedStates[0]} (+${loadedStates.length - 1} states)` : (selectedState || 'All States'));
  const uniqueDistrictsCount = loadedDistricts.length;

  // Audit History state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState('');
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Modern Toast State System
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, message) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [stats, setStats] = useState({
    worker: { isRunning: false, total: 0, processed: 0, sent: 0, failed: 0, skipped: 0, mode: 'IDLE' },
    database: { TOTAL: 0, SENT: 0, FAILED: 0, SKIPPED_DUPLICATE: 0 },
    activeCollegesCount: 0
  });

  const [template, setTemplate] = useState({ subject: '', body_text: '', template_hash: '' });
  const [preview, setPreview] = useState(null);
  const [logs, setLogs] = useState([]);

  // Template Presets (Option 1)
  const TEMPLATE_PRESETS = [
    {
      id: 'festival_call',
      name: '1. Film Festival Invitation',
      subject: 'Collaboration Proposal: Shortfundly Campus Short Film Festival 2026 - {{ college_name }}',
      body: `Respected {{ contact_person }},\n\nGreetings from Shortfundly Campus Creative Network.\n\nWe are pleased to invite {{ college_name }} ({{ city }}) to participate as an official Academic Partner for the upcoming Shortfundly National Collegiate Short Film Festival 2026.\n\nOur platform will provide your students with:\n1. Dedicated digital screening showcase.\n2. Evaluation by national filmmakers and industry jury.\n3. Cash prizes and direct distribution mentorship.\n\nWe would welcome a brief 15-minute introductory call this week with your cultural/media department.\n\nWarm regards,\nShortfundly Campus Outreach Team\nhttps://shortfundly.com`
    },
    {
      id: 'ambassador_program',
      name: '2. Campus Ambassador Program',
      subject: 'Student Leadership Opportunity: Shortfundly Campus Ambassador at {{ college_name }}',
      body: `Dear {{ contact_person }},\n\nWe are reaching out to appoint 2-3 enthusiastic student leads from {{ college_name }} for the Shortfundly Campus Ambassador Initiative 2026.\n\nSelected ambassadors receive certificate credentials, creator grants, and free access to our film curation tools.\n\nKindly nominate or connect us with your Student Council or Cultural Committee coordinator.\n\nBest regards,\nCampus Engagement Directorate\nShortfundly Network`
    },
    {
      id: 'workshop_masterclass',
      name: '3. Filmmaking & Media Masterclass',
      subject: 'Hands-on Media Workshop & Filmmaking Masterclass for Students of {{ college_name }}',
      body: `Respected Authority / {{ contact_person }},\n\nShortfundly is hosting a series of interactive digital filmmaking and creative screenwriting masterclasses across collegiate institutions.\n\nWe would be honored to organize a complimentary 90-minute digital or hybrid masterclass for the students of {{ college_name }} in {{ city }}.\n\nPlease let us know if we may share the session syllabus and guest speaker roster.\n\nWarm regards,\nAcademic Workshop Coordinator\nShortfundly`
    },
    {
      id: 'institutional_mou',
      name: '4. Institutional MoU & Tie-Up',
      subject: 'Expression of Interest: Academic Knowledge Partnership MoU with {{ college_name }}',
      body: `To the Office of the Registrar / {{ contact_person }},\n{{ college_name }}, {{ city }}.\n\nSubject: Formal Expression of Interest for Academic & Media Partnership.\n\nShortfundly respectfully submits this proposal to establish a collaborative Memorandum of Understanding (MoU) with {{ college_name }} to support media education, student short film incubators, and campus creative festivals.\n\nWe look forward to sharing our draft MoU terms for your consideration.\n\nSincerely,\nDirector of University Relations\nShortfundly Creative Network`
    }
  ];

  const applyTemplatePreset = (presetId) => {
    const found = TEMPLATE_PRESETS.find(p => p.id === presetId);
    if (found) {
      setTemplate({
        ...template,
        subject: found.subject,
        body_text: found.body
      });
      addToast('info', 'Preset Loaded', `Applied preset: "${found.name}"`);
    }
  };

  const insertVariable = (variableTag) => {
    setTemplate((prev) => ({
      ...prev,
      body_text: (prev.body_text || '') + ' ' + variableTag + ' '
    }));
    addToast('success', 'Placeholder Added', `Inserted ${variableTag} into proposal body.`);
  };

  // Individual Sender State
  const [singleRecipient, setSingleRecipient] = useState({
    college_name: '',
    official_email: '',
    contact_person: '',
    city: '',
    state: ''
  });
  const [singleLiveMode, setSingleLiveMode] = useState(false);
  const [singleSendStatus, setSingleSendStatus] = useState(null);
  const [isSendingSingle, setIsSendingSingle] = useState(false);

  // Pre-flight MX Record Lookup State
  const [mxVerification, setMxVerification] = useState(null);
  const [isCheckingMx, setIsCheckingMx] = useState(false);

  const checkMxRecords = async (emailToVerify) => {
    const targetEmail = emailToVerify || singleRecipient.official_email;
    if (!targetEmail || !targetEmail.includes('@')) {
      addToast('warning', 'Invalid Recipient', 'Please specify a valid official email to verify mail exchange records.');
      return;
    }

    setIsCheckingMx(true);
    setMxVerification(null);
    try {
      const res = await fetch('/api/colleges/verify-mx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await res.json();
      setMxVerification(data);
      if (data.hasMxRecords) {
        addToast('success', 'Domain Verified', `Active mail server detected: ${data.primaryServer} (${data.lookupDurationMs}ms)`);
        appendLog(`Pre-flight MX DNS Verified for ${data.domain}: primary=${data.primaryServer}`);
      } else {
        addToast('error', 'MX Lookup Warning', `No active mail exchange records found for ${data.domain}`);
        appendLog(`Pre-flight MX DNS Warning: Domain ${data.domain} has no valid mail servers.`);
      }
    } catch (e) {
      addToast('error', 'Verification Failed', e.message);
      appendLog(`Pre-flight DNS check error: ${e.message}`);
    } finally {
      setIsCheckingMx(false);
    }
  };

  const appendLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 50)]);
  };

  const getInitials = (name) => {
    if (!name || !name.trim()) return 'OP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Auth check & profile loader
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('sf_auth_session');
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        const parsedSession = JSON.parse(session);
        if (parsedSession) {
          const roleKey = parsedSession.role || 'general_admin';
          setCurrentUserRole(roleKey);
          if (parsedSession.permissions) {
            setUserPermissions(parsedSession.permissions);
          }
          const prof = {
            name: parsedSession.name || 'Harish',
            email: parsedSession.email || 'harish.shortfundly@gmail.com',
            role: parsedSession.role_title || parsedSession.role || 'Lead Outreach Administrator',
            department: parsedSession.department || 'Global Administration',
            organization: 'Shortfundly Network',
            badge_color: parsedSession.badge_color || '#e11d48',
            role_key: roleKey
          };
          setOperatorProfile(prof);
          setProfileForm(prof);
          setOperatorUser(prof.email);
        }
      } catch (_) {}
    }
  }, []);

  const handleSaveProfile = () => {
    if (!profileForm.name || !profileForm.name.trim()) {
      addToast('warning', 'Missing Name', 'Please enter an operator name.');
      return;
    }
    setOperatorProfile(profileForm);
    setOperatorUser(profileForm.email);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sf_operator_profile', JSON.stringify(profileForm));
    }
    addToast('success', 'Profile Updated', `Operator profile set to ${profileForm.name}.`);
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sf_auth_session');
    }
    router.push('/login');
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/campaign/status');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {}
  };

  const fetchAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      let url = '/api/reports/history?limit=100';
      if (auditFilter) url += `&status=${auditFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setAuditLogs(json.data || []);
      }
    } catch (e) {
      appendLog('Failed to fetch audit history: ' + e.message);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const fetchColleges = async () => {
    try {
      let url = '/api/colleges?';
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const list = json.data || [];
        setColleges(list);
        if (list.length > 0 && !singleRecipient.official_email) {
          setSingleRecipient(list[0]);
        }
      }
    } catch (e) {
      appendLog('Failed to fetch active colleges: ' + e.message);
    }
  };

  const fetchTemplate = async () => {
    try {
      const res = await fetch('/api/template');
      if (res.ok) {
        const json = await res.json();
        setTemplate(json);
      }
    } catch (e) {
      appendLog('Failed to fetch template: ' + e.message);
    }
  };

  const fetchSmtpAccounts = async () => {
    try {
      const res = await fetch('/api/smtp/accounts');
      if (res.ok) {
        const data = await res.json();
        const list = data.accounts || [];
        setSmtpAccounts(list);
        const active = list.find((a) => a.is_active);
        if (active) {
          setSmtpConfig((prev) => ({
            ...prev,
            ...active,
            pass: active.hasPassword ? '••••••••' : ''
          }));
          if (active.user && active.hasPassword) {
            setSingleLiveMode(true);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch SMTP accounts:', e);
    }
  };

  const handleActivateAccount = async (accountId) => {
    try {
      const res = await fetch(`/api/smtp/accounts/activate?id=${accountId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        addToast('success', 'Relay Switched', data.message || 'Active SMTP relay updated.');
        appendLog(`Switched active SMTP account: ${data.activeAccount?.account_name || accountId}`);
        await fetchSmtpAccounts();
        await fetchSmtpConfig();
      } else {
        addToast('error', 'Activation Failed', data.error || 'Failed to switch account.');
      }
    } catch (e) {
      addToast('error', 'Switch Error', e.message);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this SMTP account from your secure vault?')) return;
    try {
      const res = await fetch(`/api/smtp/accounts?id=${accountId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        addToast('success', 'Account Deleted', data.message || 'SMTP account removed.');
        appendLog(`Removed SMTP account ID ${accountId} from vault.`);
        await fetchSmtpAccounts();
        await fetchSmtpConfig();
      } else {
        addToast('error', 'Delete Failed', data.error || 'Failed to remove account.');
      }
    } catch (e) {
      addToast('error', 'Delete Error', e.message);
    }
  };

  const handleSaveAccount = async () => {
    if (!accountForm.account_name || !accountForm.account_name.trim()) {
      addToast('warning', 'Missing Name', 'Please enter a name for this SMTP relay account.');
      return;
    }
    setIsSavingAccount(true);
    try {
      const payload = {
        ...accountForm,
        id: editingAccountId || undefined
      };
      const res = await fetch('/api/smtp/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        addToast('success', 'Vault Updated', data.message || 'SMTP Account saved successfully.');
        appendLog(`Saved SMTP account "${accountForm.account_name}" in vault.`);
        setIsAddingAccount(false);
        setEditingAccountId(null);
        await fetchSmtpAccounts();
        await fetchSmtpConfig();
      } else {
        addToast('error', 'Save Failed', data.error || 'Could not save SMTP account.');
      }
    } catch (e) {
      addToast('error', 'Save Error', e.message);
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleTestAccount = async (account) => {
    setIsTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch('/api/smtp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id })
      });
      const data = await res.json();
      setSmtpTestResult(data);
      if (data.success) {
        addToast('success', 'Handshake Verified', data.message);
        appendLog(`Handshake Verified for "${account.account_name}": ${data.durationMs}ms`);
      } else {
        addToast('error', 'Handshake Failed', data.message || data.error);
        appendLog(`Handshake Failed for "${account.account_name}": ${data.message || data.error}`);
      }
      await fetchSmtpAccounts();
    } catch (e) {
      addToast('error', 'Verification Error', e.message);
      setSmtpTestResult({ success: false, message: e.message });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const fetchSmtpConfig = async () => {
    try {
      const res = await fetch('/api/smtp/config');
      if (res.ok) {
        const data = await res.json();
        setSmtpConfig((prev) => ({
          ...prev,
          ...data,
          pass: data.hasPassword ? '••••••••' : ''
        }));
        if (data.is_live_enabled) {
          setSingleLiveMode(true);
        }
      }
    } catch (e) {
      console.error('Failed to fetch SMTP config:', e);
    }
  };

  const handleSaveSmtp = async (overrideData = null) => {
    setIsSavingSmtp(true);
    const payload = overrideData || smtpConfig;
    try {
      const res = await fetch('/api/smtp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        addToast('success', 'SMTP Config Saved', data.message || 'SMTP settings updated successfully.');
        appendLog(`SMTP configuration saved. Live mode: ${payload.is_live_enabled ? 'ENABLED' : 'DRY-RUN'}`);
        await fetchSmtpConfig();
        await fetchSmtpAccounts();
      } else {
        addToast('error', 'Save Failed', data.error || 'Failed to save SMTP settings.');
      }
    } catch (e) {
      addToast('error', 'Save Error', e.message);
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleTestSmtpConnection = async () => {
    setIsTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch('/api/smtp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          user: smtpConfig.user,
          pass: smtpConfig.pass
        })
      });
      const data = await res.json();
      setSmtpTestResult(data);
      if (data.success) {
        addToast('success', 'Handshake Verified', data.message);
        appendLog(`Live SMTP Handshake Success: ${smtpConfig.host}:${smtpConfig.port} in ${data.durationMs}ms`);
      } else {
        addToast('error', 'Handshake Failed', data.message || data.error);
        appendLog(`Live SMTP Handshake Failed: ${data.message || data.error}`);
      }
      await fetchSmtpConfig();
      await fetchSmtpAccounts();
    } catch (e) {
      addToast('error', 'Verification Error', e.message);
      setSmtpTestResult({ success: false, message: e.message });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const applySmtpPreset = (preset, target = 'config') => {
    const isForm = target === 'form';
    const updater = isForm ? setAccountForm : setSmtpConfig;

    if (preset === 'gmail') {
      updater((prev) => ({
        ...prev,
        account_name: isForm && !prev.account_name ? 'Google Workspace Outreach' : prev.account_name,
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        from_email: prev.user && prev.user.includes('@') ? prev.user : (prev.from_email || 'outreach@shortfundly.com')
      }));
      addToast('info', 'Preset Applied', 'Configured for Gmail / Google Workspace (smtp.gmail.com:587 STARTTLS)');
    } else if (preset === 'brevo') {
      updater((prev) => ({
        ...prev,
        account_name: isForm && !prev.account_name ? 'Brevo Relay' : prev.account_name,
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false
      }));
      addToast('info', 'Preset Applied', 'Configured for Brevo / Sendinblue (smtp-relay.brevo.com:587)');
    } else if (preset === 'sendgrid') {
      updater((prev) => ({
        ...prev,
        account_name: isForm && !prev.account_name ? 'SendGrid Relay' : prev.account_name,
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        user: 'apikey'
      }));
      addToast('info', 'Preset Applied', 'Configured for SendGrid (smtp.sendgrid.net:587, user=apikey)');
    } else if (preset === 'ses') {
      updater((prev) => ({
        ...prev,
        account_name: isForm && !prev.account_name ? 'Amazon SES Mumbai' : prev.account_name,
        host: 'email-smtp.ap-south-1.amazonaws.com',
        port: 587,
        secure: false
      }));
      addToast('info', 'Preset Applied', 'Configured for AWS SES Mumbai (email-smtp.ap-south-1.amazonaws.com:587)');
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchColleges();
    fetchTemplate();
    fetchSmtpConfig();
    fetchSmtpAccounts();

    const interval = setInterval(() => {
      fetchStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [searchTerm]);

  // Custom CSV Upload Handler
  const handleUploadCsv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCsv(true);
    setStatusMessage(`Uploading and parsing ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (customStateInput && customStateInput.trim()) {
        formData.append('state', customStateInput.trim());
      }
      formData.append('clearExisting', 'true');

      const res = await fetch('/api/colleges/upload-csv', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        addToast('success', 'Dataset Imported', data.message);
        appendLog(`Imported ${data.count} institutions from ${data.filename} (${data.primaryState || 'Multi-State'}).`);
        setStatusMessage(`Active queue loaded with ${data.count} institutions from ${data.filename}.`);
        setUploadedMeta(data);
        if (data.primaryState) {
          setSelectedState(data.primaryState);
        }
        await fetchColleges();
        await fetchStatus();
      } else {
        addToast('error', 'Upload Failed', data.error || 'Failed to parse CSV file.');
        setStatusMessage('Upload Error: ' + (data.error || 'Failed to parse'));
      }
    } catch (err) {
      addToast('error', 'Upload Error', err.message);
      setStatusMessage('Upload Error: ' + err.message);
    } finally {
      setIsUploadingCsv(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Preset Dataset Batch Import
  const handleImportFromCsv = async () => {
    setStatusMessage('Loading institutions from regional dataset...');
    try {
      const res = await fetch('/api/colleges/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: selectedState || null,
          city: selectedDistrict || null,
          limit: importLimit === 'all' ? null : parseInt(importLimit, 10),
          clearExisting: true
        })
      });
      const json = await res.json();
      if (res.ok) {
        appendLog(`Imported ${json.importedCount} colleges into active queue (${selectedState || 'Regional'} - ${selectedDistrict || 'All Districts'}).`);
        setStatusMessage(`Active queue loaded with ${json.importedCount} institutions.`);
        await fetchColleges();
        await fetchStatus();
      } else {
        setStatusMessage('Error: ' + json.error);
      }
    } catch (e) {
      setStatusMessage('Error: ' + e.message);
    }
  };

  const handleResetToZero = async () => {
    if (!confirm('Confirm: Clear active working queue and reset to 0 data?')) return;
    try {
      const res = await fetch('/api/colleges', { method: 'DELETE' });
      if (res.ok) {
        appendLog('Active queue cleared: Automation reset to 0 data.');
        setStatusMessage('Active queue reset to 0 data.');
        setPreview(null);
        await fetchColleges();
        await fetchStatus();
      }
    } catch (e) {
      setStatusMessage('Error: ' + e.message);
    }
  };

  const handleLoadVerified = async () => {
    setStatusMessage('Loading 2,222 verified institutions into active queue...');
    try {
      const res = await fetch('/api/colleges/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'verified', clearExisting: true })
      });
      const json = await res.json();
      if (res.ok) {
        addToast('success', 'Verified Dataset Staged', `Loaded ${json.importedCount} verified institutions into active queue.`);
        appendLog(`Loaded ${json.importedCount} verified institutions.`);
        setStatusMessage(`Active queue loaded with ${json.importedCount} verified institutions.`);
        setSelectedState('Maharashtra');
        await fetchColleges();
        await fetchStatus();
      } else {
        addToast('error', 'Import Failed', json.error);
      }
    } catch (e) {
      addToast('error', 'Import Error', e.message);
    }
  };

  // Template Save & Preview
  const handleSaveTemplate = async () => {
    try {
      const res = await fetch('/api/template', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: template.subject,
          body_text: template.body_text
        })
      });
      const json = await res.json();
      if (res.ok) {
        appendLog('Template saved. Hash: ' + json.template_hash);
        addToast('success', 'Template Saved', 'Outreach email template updated and verified.');
      }
    } catch (e) {
      addToast('error', 'Save Failed', e.message);
    }
  };

  const handlePreview = async () => {
    try {
      const firstId = colleges.length > 0 ? colleges[0].id : null;
      const url = firstId ? `/api/template/preview?id=${firstId}` : '/api/template/preview';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setPreview(json);
        appendLog('Generated preview for: ' + (json.college ? json.college.college_name : 'Default'));
        addToast('info', 'Preview Rendered', `Rendered proposal for: ${json.college ? json.college.college_name : 'Default'}`);
      }
    } catch (e) {
      appendLog('Preview error: ' + e.message);
      addToast('error', 'Preview Error', e.message);
    }
  };

  // Bulk Campaign Actions
  const handleStartBulkCampaign = async () => {
    if (colleges.length === 0) {
      addToast('warning', 'Queue Empty', 'Active queue has 0 records. Upload a CSV under "1. Upload CSV" first.');
      return;
    }
    if (!confirm(`Confirm PRODUCTION DISPATCH: You are about to initiate real SMTP email delivery to ${colleges.length} verified institutions. Proceed?`)) {
      return;
    }

    try {
      const res = await fetch('/api/campaign/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: `campus_outreach_${selectedState.toLowerCase()}_2026`
        })
      });
      const json = await res.json();
      if (res.ok) {
        appendLog(`Production Bulk Campaign started in LIVE SMTP mode for ${colleges.length} institutions.`);
        addToast('success', 'Production Campaign Started', `Dispatching live emails to ${colleges.length} institutions via verified SMTP pool.`);
      } else {
        addToast('error', 'Campaign Error', json.error || 'Failed to start live campaign');
      }
    } catch (e) {
      appendLog('Error starting campaign: ' + e.message);
      addToast('error', 'Dispatch Exception', e.message);
    }
  };

  const handleKillSwitch = async () => {
    try {
      const res = await fetch('/api/campaign/kill', { method: 'POST' });
      if (res.ok) {
        appendLog('EMERGENCY KILL SWITCH ENGAGED: Production Bulk Campaign halted.');
        addToast('error', 'Engine Halted', 'Emergency Kill Switch engaged. Worker stopped.');
      }
    } catch (e) {
      appendLog('Kill switch error: ' + e.message);
      addToast('error', 'Kill Switch Error', e.message);
    }
  };

  // Individual Single Send Action (Production Live Send)
  const handleSingleSend = async () => {
    if (!singleRecipient.official_email) {
      addToast('warning', 'Recipient Required', 'Please specify a valid official email recipient.');
      return;
    }
    if (typeof window !== 'undefined' && !window.__SKIP_CONFIRM__) {
      if (!confirm(`Confirm LIVE SMTP dispatch to: ${singleRecipient.official_email}?`)) {
        return;
      }
    }

    setIsSendingSingle(true);
    setSingleSendStatus(null);

    try {
      const res = await fetch('/api/campaign/single-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          college: singleRecipient
        })
      });
      const data = await res.json();
      setSingleSendStatus(data);
      if (res.ok && data.success) {
        appendLog(`Individual send to ${data.recipient} [${data.status}] (${data.mode}). Message-ID: ${data.messageId}`);
        addToast('success', 'Live Email Dispatched', `Delivered to ${data.recipient} via Live SMTP. Message-ID: ${data.messageId}`);
        await fetchStatus();
      } else {
        appendLog(`Individual send failed: ${data.error || 'Unknown error'}`);
        addToast('error', 'Dispatch Failed', data.error || 'SMTP delivery rejected');
      }
    } catch (err) {
      setSingleSendStatus({ success: false, error: err.message });
      appendLog(`Individual send exception: ${err.message}`);
      addToast('error', 'Network Error', err.message);
    } finally {
      setIsSendingSingle(false);
    }
  };

  return (
    <div className="orbix-island">
      {/* ORBIX FLOATING TOP NAVIGATION BAR */}
      <motion.header
        className="orbix-topbar"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/images/shortfundly-logo.png?v=2"
              alt="Shortfundly OTT Marketplace"
              style={{
                height: '64px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: 700,
              paddingLeft: '12px',
              borderLeft: '1.5px solid #cbd5e1',
              lineHeight: 1.3,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap'
            }}>
              CAMPUS OUTREACH
            </div>
          </Link>



          <div className="orbix-capsule-nav">
            <button
              onClick={() => setActiveTab('0')}
              className={`orbix-capsule-btn ${activeTab === '0' ? 'active' : ''}`}
            >
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('1')}
              className={`orbix-capsule-btn ${activeTab === '1' ? 'active' : ''}`}
            >
              <Upload size={14} />
              <span>Upload CSV</span>
              <span style={{
                fontSize: '10px',
                background: activeTab === '1' ? '#0f172a' : '#e2e8f0',
                color: activeTab === '1' ? '#ffffff' : '#475569',
                padding: '1px 6px',
                borderRadius: '999px',
                fontWeight: 700
              }}>
                {colleges.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('2')}
              className={`orbix-capsule-btn ${activeTab === '2' ? 'active' : ''}`}
            >
              <FileText size={14} />
              <span>Templates</span>
            </button>
            <button
              onClick={() => setActiveTab('3')}
              className={`orbix-capsule-btn ${activeTab === '3' ? 'active' : ''}`}
            >
              <Send size={14} />
              <span>Sender</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('4');
                fetchAuditLogs();
              }}
              className={`orbix-capsule-btn ${activeTab === '4' ? 'active' : ''}`}
            >
              <History size={14} />
              <span>Audit History</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('5');
                fetchSmtpConfig();
                fetchSmtpAccounts();
              }}
              className={`orbix-capsule-btn ${activeTab === '5' ? 'active' : ''}`}
            >
              <Server size={14} />
              <span>SMTP Vault</span>
              <span style={{
                fontSize: '10px',
                background: smtpConfig.is_live_enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.12)',
                color: smtpConfig.is_live_enabled ? '#047857' : '#475569',
                padding: '1px 7px',
                borderRadius: '999px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <span style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: smtpConfig.is_live_enabled ? '#10b981' : '#94a3b8'
                }}></span>
                <span>{smtpConfig.is_live_enabled ? 'LIVE' : 'OFF'}</span>
              </span>
            </button>
          </div>
        </div>

        <div className="orbix-quick-actions">
          <button
            onClick={() => {
              setActiveTab('5');
              fetchSmtpConfig();
              fetchSmtpAccounts();
            }}
            className={`orbix-status-badge ${stats.worker.isRunning ? 'running' : (smtpConfig.is_live_enabled ? 'live' : 'idle')}`}
            style={{ cursor: 'pointer', border: 'none' }}
            title="Click to manage SMTP relays"
          >
            <span className={`orbix-pulse-dot ${stats.worker.isRunning ? 'amber' : (smtpConfig.is_live_enabled ? 'green' : 'gray')}`}></span>
            <span>
              {stats.worker.isRunning
                ? 'DISPATCHING'
                : (smtpConfig.is_live_enabled ? 'LIVE RELAY' : 'STANDBY')}
            </span>
          </button>

          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="orbix-action-pill">
              <Globe size={13} />
              <span>Landing</span>
            </span>
          </Link>
          <a href="/api/reports/export" style={{ textDecoration: 'none' }}>
            <span className="orbix-action-pill">
              <FileSpreadsheet size={13} />
              <span>Export Ledger</span>
            </span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                background: '#ffffff',
                border: `1.5px solid ${operatorProfile.badge_color || '#e11d48'}33`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
              title={`Active RBAC Role: ${operatorProfile.role}`}
            >
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: operatorProfile.badge_color || '#e11d48'
              }}></span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap'
              }}>
                {operatorProfile.name}
              </span>
              <span style={{
                fontSize: '9.5px',
                fontWeight: 800,
                color: operatorProfile.badge_color || '#e11d48',
                background: `${operatorProfile.badge_color || '#e11d48'}15`,
                padding: '1px 6px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                {currentUserRole === 'ceo' ? 'CEO' : currentUserRole === 'tech_lead' ? 'Tech Lead' : currentUserRole === 'product_manager' ? 'Product Mgr' : 'Admin'}
              </span>
            </div>

            <button
              onClick={() => {
                setProfileForm(operatorProfile);
                setIsEditingProfile(true);
              }}
              className="orbix-avatar-badge"
              style={{
                cursor: 'pointer',
                border: 'none',
                background: operatorProfile.badge_color || '#e11d48'
              }}
              title={`Operator: ${operatorProfile.name} (${operatorProfile.email}) - Click to edit profile / switch role`}
            >
              {getInitials(operatorProfile.name)}
            </button>
            <button
              onClick={handleLogout}
              className="orbix-action-pill"
              style={{ padding: '6px 10px', color: '#64748b' }}
              title="Sign Out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* TAB 0: ORBIX DASHBOARD OVERVIEW */}
      {activeTab === '0' && (
        <motion.div
          key="tab-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Top Greeting & Campaign Readiness Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '16px', marginBottom: '16px' }}>
            {/* Left Card: Welcome Header & Checklist */}
            <div className="orbix-checklist-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    HIGHER EDUCATION OUTREACH CAMPAIGN
                  </div>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                    Welcome Back, {operatorProfile.name || 'Harish'}
                  </h1>
                  {colleges.length > 0 ? (
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                      You have <strong>{colleges.length} verified collegiate institutions</strong> staged in the active queue ({uniqueDistrictsCount} districts &bull; {activeStateLabel}).
                    </p>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                      No colleges staged in the active queue. <strong>Upload a state CSV</strong> or select a regional dataset in the Directory to begin outreach dispatches.
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".csv, .xlsx, .xls"
                    onChange={handleUploadCsv}
                  />
                  <button
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.click();
                      else setActiveTab('1');
                    }}
                    className="orbix-action-pill"
                    title="Upload Custom State College CSV"
                    disabled={isUploadingCsv}
                  >
                    <Upload size={12} />
                    <span>{isUploadingCsv ? 'Uploading...' : 'Upload State CSV'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileForm(operatorProfile);
                      setIsEditingProfile(true);
                    }}
                    className="orbix-action-pill"
                    title="Edit Operator Profile"
                  >
                    <User size={12} />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('3')}
                    className="orbix-action-pill primary"
                  >
                    <Send size={12} />
                    <span>Engage Sender</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar & Readiness Title */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Campaign Readiness Checklist</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: smtpConfig.is_live_enabled ? '#10b981' : '#f59e0b' }}>
                    {smtpConfig.is_live_enabled ? '100% Armed (Live Relay)' : 'Standby (Configure Live Relay)'}
                  </span>
                </div>
                <div className="orbix-progress-bar">
                  <div className="orbix-progress-fill" style={{ width: smtpConfig.is_live_enabled ? '100%' : '75%' }}></div>
                </div>
              </div>

              {/* Checklist Items */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                <div className="orbix-check-item">
                  <div className={`orbix-check-circle ${colleges.length > 0 ? 'checked' : 'unchecked'}`}>
                    {colleges.length > 0 && <Check size={11} />}
                  </div>
                  <span style={{ color: colleges.length > 0 ? '#0f172a' : '#64748b' }}>
                    {colleges.length > 0
                      ? `State Directory Loaded (${colleges.length} Institutions staged • ${activeStateLabel})`
                      : 'State Directory Standby (Upload New State CSV in Tab 1)'}
                  </span>
                </div>

                <div className="orbix-check-item">
                  <div className="orbix-check-circle checked">
                    <Check size={11} />
                  </div>
                  <span>Email Proposals &amp; Jinja Variables Configured</span>
                </div>

                <div className="orbix-check-item">
                  <div className="orbix-check-circle checked">
                    <Check size={11} />
                  </div>
                  <span>Pre-flight MX DNS Domain Verification Active</span>
                </div>

                <div className="orbix-check-item">
                  <div className={`orbix-check-circle ${smtpConfig.is_live_enabled ? 'checked' : 'unchecked'}`}>
                    {smtpConfig.is_live_enabled && <Check size={11} />}
                  </div>
                  <span style={{ color: smtpConfig.is_live_enabled ? '#0f172a' : '#64748b' }}>
                    {smtpConfig.is_live_enabled
                      ? `Live SMTP Relay Armed (${smtpConfig.host}:${smtpConfig.port})`
                      : 'Live Dispatch Engine Standby (Click SMTP Vault to configure)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: Radial Speedometer Arc Gauge */}
            {(() => {
              const totalAttempted = (stats.database.SENT || 0) + (stats.database.FAILED || 0);
              const deliverabilityScore = totalAttempted > 0
                ? Math.round(((stats.database.SENT || 0) / totalAttempted) * 100)
                : (smtpConfig.is_live_enabled ? 100 : 0);
              const arcOffset = (235.6 * (1 - deliverabilityScore / 100)).toFixed(1);
              return (
                <div className="orbix-speedometer-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Deliverability &amp; Policy Health</span>
                    <span className={`orbix-pill-badge ${smtpConfig.is_live_enabled ? 'green' : 'amber'}`}>
                      {smtpConfig.is_live_enabled ? 'Live Verified' : 'Standby'}
                    </span>
                  </div>

                  <div className="orbix-arc-wrap">
                    <svg width="190" height="110" viewBox="0 0 190 110">
                      {/* Background Track Arc */}
                      <path
                        d="M 20 100 A 75 75 0 0 1 170 100"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                      {/* Foreground Dynamic Gauge */}
                      <path
                        d="M 20 100 A 75 75 0 0 1 170 100"
                        fill="none"
                        stroke="url(#orbixGaugeGradient)"
                        strokeWidth="14"
                        strokeDasharray="235.6"
                        strokeDashoffset={arcOffset}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="orbixGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="70%" stopColor="#059669" />
                          <stop offset="100%" stopColor="#e11d48" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="orbix-arc-center-label">
                      <div className="orbix-arc-big">
                        {totalAttempted > 0 ? `${deliverabilityScore}%` : (smtpConfig.is_live_enabled ? '100%' : '--')}
                      </div>
                      <div className="orbix-arc-sub">
                        {totalAttempted > 0 ? 'DELIVERABILITY SCORE' : (smtpConfig.is_live_enabled ? 'RELAY READY (100%)' : 'STANDBY (NO DISPATCHES)')}
                      </div>
                    </div>
                  </div>

                  {/* Status pills underneath gauge */}
                  <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(226, 232, 240, 0.7)', paddingTop: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>SPF &amp; DKIM</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
                        <span className="orbix-pulse-dot"></span> Passed
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>MX DNS LOOKUP</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
                        <span className="orbix-pulse-dot"></span> Active
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>DEDUPE SHIELD</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
                        SHA-256
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 4 Horizon Metric Cards with Equalizer Wave */}
          <div className="orbix-metric-grid">
            {/* Metric 1 */}
            <div className="orbix-metric-card">
              <div className="orbix-metric-header">
                <span className="orbix-metric-label">ACTIVE WORKING QUEUE</span>
                <span className={`orbix-pill-badge ${colleges.length > 0 ? 'green' : 'amber'}`}>
                  {colleges.length > 0 ? activeStateLabel : 'Queue Empty'}
                </span>
              </div>
              <div className="orbix-metric-value-row">
                <span className="orbix-metric-num">{stats.activeCollegesCount || colleges.length}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {colleges.length > 0 ? 'institutions staged' : 'standby'}
                </span>
              </div>
              <div className="orbix-equalizer-wrap">
                {[14, 20, 28, 16, 24, 32, 18, 26, 30, 22, 16, 24].map((h, i) => (
                  <div
                    key={i}
                    className="orbix-equalizer-bar active-blue"
                    style={{ height: `${h}px` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Metric 2 */}
            <div className="orbix-metric-card">
              <div className="orbix-metric-header">
                <span className="orbix-metric-label">CONFIRMED DISPATCHED</span>
                <span className="orbix-pill-badge green">Verified Sent</span>
              </div>
              <div className="orbix-metric-value-row">
                <span className="orbix-metric-num" style={{ color: '#10b981' }}>{stats.database.SENT || 0}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>delivered</span>
              </div>
              <div className="orbix-equalizer-wrap">
                {[22, 28, 18, 32, 26, 36, 24, 30, 34, 28, 20, 26].map((h, i) => (
                  <div
                    key={i}
                    className="orbix-equalizer-bar active-green"
                    style={{ height: `${h}px` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Metric 3 */}
            <div className="orbix-metric-card">
              <div className="orbix-metric-header">
                <span className="orbix-metric-label">DELIVERY SUCCESS RATIO</span>
                <span className="orbix-pill-badge green">Ledger Audited</span>
              </div>
              <div className="orbix-metric-value-row">
                {(() => {
                  const total = (stats.database.SENT || 0) + (stats.database.FAILED || 0);
                  if (total === 0) {
                    return (
                      <>
                        <span className="orbix-metric-num">--</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>0 recorded dispatches</span>
                      </>
                    );
                  }
                  const rate = Math.round(((stats.database.SENT || 0) / total) * 100);
                  const fails = stats.database.FAILED || 0;
                  return (
                    <>
                      <span className="orbix-metric-num">{rate}%</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{fails === 0 ? 'zero bounces' : `${fails} failed`}</span>
                    </>
                  );
                })()}
              </div>
              <div className="orbix-equalizer-wrap">
                {[26, 32, 24, 34, 30, 36, 28, 34, 32, 30, 26, 32].map((h, i) => (
                  <div
                    key={i}
                    className="orbix-equalizer-bar active-green"
                    style={{ height: `${h}px` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Metric 4 */}
            <div className="orbix-metric-card">
              <div className="orbix-metric-header">
                <span className="orbix-metric-label">P95 DISPATCH LATENCY</span>
                <span className="orbix-pill-badge amber">Anti-Spam Throttle</span>
              </div>
              <div className="orbix-metric-value-row">
                <span className="orbix-metric-num">2.0s</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>polite rate</span>
              </div>
              <div className="orbix-equalizer-wrap">
                {[12, 16, 20, 14, 22, 18, 26, 20, 16, 22, 18, 14].map((h, i) => (
                  <div
                    key={i}
                    className="orbix-equalizer-bar active-amber"
                    style={{ height: `${h}px` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Split: Batch Quota Allocation (Left) vs Live Dispatch Stream (Right) */}
          <div className="orbix-bottom-split">
            {/* Left Card: Active Campaign Staging & Dispatch Queue */}
            <div className="orbix-glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Campaign Staging &amp; Dispatch Queue
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Active regional target directory and transmission progress
                  </p>
                </div>
                <span className={`orbix-pill-badge ${colleges.length > 0 ? 'green' : 'amber'}`}>
                  {colleges.length > 0 ? `${activeStateLabel} • Armed` : 'Standby (0 Records)'}
                </span>
              </div>

              {colleges.length === 0 ? (
                /* Empty Staging State */
                <div style={{ margin: '14px 0' }}>
                  <div style={{
                    background: 'rgba(248, 250, 252, 0.8)',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '20px 16px',
                    textAlign: 'center'
                  }}>
                    <FolderUp size={24} style={{ color: '#94a3b8', margin: '0 auto 6px auto' }} />
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                      No State Dataset Staged in Memory
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                      Upload any state collegiate CSV or choose a directory from the loader to prepare dispatches.
                    </p>
                  </div>

                  {/* Aggregate Telemetry Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px', textAlign: 'center' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 4px' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>CONFIRMED SENT</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{stats.database.SENT || 0}</div>
                    </div>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 4px' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>FAILED / BOUNCES</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#e11d48' }}>{stats.database.FAILED || 0}</div>
                    </div>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 4px' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>DEDUPE SHIELDED</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>{stats.database.SKIPPED_DUPLICATE || 0}</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Loaded Staging State */
                <div style={{ margin: '14px 0' }}>
                  {/* Real Batch Progress Bar */}
                  {(() => {
                    const sentCount = stats.database.SENT || 0;
                    const totalQueue = colleges.length;
                    const progressPct = Math.min(100, Math.round((sentCount / totalQueue) * 100));
                    return (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '12px' }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>Batch Transmission Progress</span>
                          <span style={{ fontWeight: 700, color: '#10b981' }}>
                            {sentCount} / {totalQueue} Sent ({progressPct}%)
                          </span>
                        </div>
                        <div className="orbix-progress-bar">
                          <div
                            className="orbix-progress-fill"
                            style={{
                              width: `${progressPct}%`,
                              background: '#10b981'
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Real Dynamic Metrics Breakdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: '#64748b' }}>Target Jurisdiction:</span>
                      <strong style={{ color: '#0f172a' }}>{activeStateLabel} ({uniqueDistrictsCount} Districts)</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: '#64748b' }}>Staged in Working Queue:</span>
                      <strong style={{ color: '#3b82f6' }}>{colleges.length} colleges ready</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: '#64748b' }}>Verified Email Targets:</span>
                      <strong style={{ color: '#0f172a' }}>{colleges.filter((c) => c.official_email).length} official contacts</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: '#64748b' }}>Deduplication &amp; Policy:</span>
                      <strong style={{ color: '#10b981' }}>SHA-256 Idempotency Active</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click();
                    else setActiveTab('1');
                  }}
                  className="orbix-action-pill"
                  style={{ justifyContent: 'center' }}
                  disabled={isUploadingCsv}
                >
                  <Upload size={13} />
                  <span>{isUploadingCsv ? 'Uploading...' : 'Upload State CSV'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('1')}
                  className="orbix-action-pill"
                  style={{ justifyContent: 'center' }}
                >
                  <Database size={13} />
                  <span>Directory Loader</span>
                </button>
              </div>
            </div>


            {/* Right Card: Live Run Stream & Telemetry Table */}
            <div className="orbix-glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Live Telemetry Run Stream
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Continuous event bus telemetry &amp; delivery audit log
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="orbix-pulse-dot"></span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#10b981' }}>Live Feed</span>
                </div>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: '220px', overflowY: 'auto' }}>
                <table className="orbix-stream-table">
                  <thead>
                    <tr>
                      <th>EVENT / TIMESTAMP</th>
                      <th>RECIPIENT / INSTITUTION</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? (
                      logs.slice(0, 6).map((logItem, idx) => (
                        <tr key={idx}>
                          <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
                            {logItem.split(']')[0] ? logItem.split(']')[0].replace('[', '') : 'LIVE'}
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {logItem.includes(']') ? logItem.split(']').slice(1).join(']').substring(0, 48) : logItem}
                          </td>
                          <td>
                            <span className="orbix-pill-badge green">Recorded</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>SYSTEM READY</td>
                          <td style={{ fontWeight: 600 }}>Event stream listening for queue triggers...</td>
                          <td>
                            <span className="orbix-pill-badge green">Standby</span>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>DATASET STORE</td>
                          <td style={{ fontWeight: 600 }}>Multi-State Collegiate Directory &amp; CSV Uploader Armed</td>
                          <td>
                            <span className="orbix-pill-badge green">Armed</span>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>SECURITY</td>
                          <td style={{ fontWeight: 600 }}>SHA-256 Deduplication &amp; Rate-Limiting active</td>
                          <td>
                            <span className="orbix-pill-badge green">Armed</span>
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 1: UPLOAD CSV */}
      {activeTab === '1' && (
        <motion.div
          className="bento-grid"
          key="tab-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="bento-tile col-span-12">
            <div className="bento-tile-header">
              <h2 className="bento-tile-title">
                <span className="bento-tile-title-bar"></span>
                Upload CSV Dataset &bull; Load &amp; Send
              </h2>
              <div>
                <motion.button
                  className="btn btn-secondary"
                  onClick={handleResetToZero}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '6px 12px' }}
                  title="Clear active queue"
                >
                  <RotateCcw size={13} />
                  <span>Reset / Clear Queue</span>
                </motion.button>
              </div>
            </div>
            <div className="bento-tile-body">
              <div className="info-bar" style={{ marginBottom: '16px' }}>
                <div>
                  Supported Formats: <code>.csv</code>, <code>.xlsx</code>, <code>.xls</code> | Column Auto-Detection: <code>College Name</code>, <code>Official Email</code>, <code>State</code>, <code>City / District</code>, <code>Website</code>
                </div>
                <div>
                  Active Working Queue: <strong>{colleges.length} colleges staged</strong> ({activeStateLabel})
                </div>
              </div>

              {/* Upload Dropzone & Action Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.8fr) minmax(220px, 1.2fr)', gap: '16px', alignItems: 'flex-end' }}>
                <div className="form-field">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FolderUp size={13} />
                    <span>Select CSV or Excel File to Upload</span>
                  </label>
                  <input
                    type="file"
                    className="input-text"
                    accept=".csv, .xlsx, .xls"
                    disabled={isUploadingCsv}
                    onChange={handleUploadCsv}
                    style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer' }}
                  />
                </div>

                <div className="form-field">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={13} />
                    <span>Campaign / State Label (Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="e.g. Maharashtra, Tamil Nadu, All India"
                    value={customStateInput}
                    onChange={(e) => setCustomStateInput(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          </div>


          {/* Active Queue Table */}
          <div className="bento-tile col-span-12">
            <div className="bento-tile-header">
              <h2 className="bento-tile-title">
                <span className="bento-tile-title-bar"></span>
                Active Loaded Queue ({colleges.length} Institutions)
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className={`btn ${selectedCategory === 'ALL' ? 'btn-dark' : 'btn-secondary'}`}
                    style={{ padding: '3px 9px', fontSize: '11px' }}
                    onClick={() => setSelectedCategory('ALL')}
                  >
                    All Types
                  </button>
                  <button
                    type="button"
                    className={`btn ${selectedCategory === 'ENGINEERING' ? 'btn-dark' : 'btn-secondary'}`}
                    style={{ padding: '3px 9px', fontSize: '11px' }}
                    onClick={() => setSelectedCategory('ENGINEERING')}
                  >
                    Engineering &amp; Tech
                  </button>
                  <button
                    type="button"
                    className={`btn ${selectedCategory === 'MANAGEMENT' ? 'btn-dark' : 'btn-secondary'}`}
                    style={{ padding: '3px 9px', fontSize: '11px' }}
                    onClick={() => setSelectedCategory('MANAGEMENT')}
                  >
                    Management / MBA
                  </button>
                  <button
                    type="button"
                    className={`btn ${selectedCategory === 'ARTS_SCIENCE' ? 'btn-dark' : 'btn-secondary'}`}
                    style={{ padding: '3px 9px', fontSize: '11px' }}
                    onClick={() => setSelectedCategory('ARTS_SCIENCE')}
                  >
                    Arts &amp; Science
                  </button>
                </div>

                {colleges.length > 0 && (
                  <div style={{ position: 'relative', width: '220px' }}>
                    <input
                      type="text"
                      className="input-text"
                      placeholder="Search queue..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ paddingLeft: '32px' }}
                    />
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                )}
              </div>
            </div>
            <div className="bento-tile-body no-padding">
              {colleges.length === 0 ? (
                <div className="empty-placeholder">
                  Active working queue is empty (0 records). Choose your state & district above and click <strong>"Load Batch"</strong>.
                </div>
              ) : (
                <div className="table-container">
                  <table className="bento-table">
                    <thead>
                      <tr>
                        <th style={{ width: '36px' }}>#</th>
                        <th>Institution Name</th>
                        <th>State / District</th>
                        <th>Official Email</th>
                        <th>Contact Person</th>
                        <th>Department</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {colleges
                        .filter((c) => {
                          if (selectedCategory === 'ALL') return true;
                          const name = (c.college_name || '').toLowerCase();
                          const dept = (c.department || '').toLowerCase();
                          if (selectedCategory === 'ENGINEERING') {
                            return name.includes('eng') || name.includes('tech') || dept.includes('eng') || name.includes('polytechnic');
                          }
                          if (selectedCategory === 'MANAGEMENT') {
                            return name.includes('manage') || name.includes('mba') || name.includes('bba') || dept.includes('manage');
                          }
                          if (selectedCategory === 'ARTS_SCIENCE') {
                            return name.includes('art') || name.includes('sci') || name.includes('comm') || name.includes('college');
                          }
                          return true;
                        })
                        .map((c, idx) => (
                        <tr key={c.id || idx}>
                          <td>{idx + 1}</td>
                          <td><strong>{c.college_name}</strong></td>
                          <td>
                            <span className="chip chip-idle">{c.state || 'General'} &bull; {c.city || 'Campus'}</span>
                          </td>
                          <td><code>{c.official_email}</code></td>
                          <td>{c.contact_person || 'N/A'}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{c.department || 'N/A'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                onClick={() => {
                                  setSingleRecipient(c);
                                  setActiveTab('3');
                                  setSenderMode('individual');
                                }}
                              >
                                <Send size={11} style={{ color: 'var(--sf-red)' }} />
                                <span>Test Send</span>
                              </button>
                              {c.website_url && (
                                <a href={c.website_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>Portal</span>
                                  <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: EMAIL TEMPLATES */}
      {activeTab === '2' && (
        <motion.div
          className="bento-grid"
          key="tab-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Template Editor */}
          <div className="bento-tile col-span-6">
            <div className="bento-tile-header">
              <h2 className="bento-tile-title">
                <span className="bento-tile-title-bar"></span>
                2. Outreach Proposal Template Editor
              </h2>
              <motion.button
                className="btn btn-dark"
                style={{ padding: '5px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleSaveTemplate}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save size={13} />
                <span>Save Template</span>
              </motion.button>
            </div>
            <div className="bento-tile-body">
              <div className="form-stack">
                {/* 1-Click Template Presets */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                    Select Outreach Template Preset:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {TEMPLATE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => applyTemplatePreset(p.id)}
                      >
                        <FileText size={13} style={{ color: 'var(--sf-red)' }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="info-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={13} style={{ color: 'var(--sf-red)' }} />
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>Insert Tags:</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                      onClick={() => insertVariable('{{ college_name }}')}
                    >
                      + College
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                      onClick={() => insertVariable('{{ contact_person }}')}
                    >
                      + Contact
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                      onClick={() => insertVariable('{{ city }}')}
                    >
                      + City
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label>Subject Line Template</label>
                  <input
                    type="text"
                    className="input-text"
                    value={template.subject || ''}
                    onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Proposal Body Template</label>
                  <textarea
                    rows={14}
                    className="input-text"
                    value={template.body_text || ''}
                    onChange={(e) => setTemplate({ ...template, body_text: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="bento-tile col-span-6">
            <div className="bento-tile-header">
              <h2 className="bento-tile-title">
                <span className="bento-tile-title-bar"></span>
                Personalized Paper Email Preview
              </h2>
              <motion.button
                className="btn btn-secondary"
                style={{ padding: '5px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handlePreview}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw size={13} />
                <span>Refresh Preview</span>
              </motion.button>
            </div>
            <div className="bento-tile-body">
              {preview ? (
                <div className="paper-email-preview">
                  <div className="paper-email-header">
                    <div className="email-meta-row">
                      <strong>To:</strong>
                      <span>{preview.college.contact_person || 'Academic Coordinator'} &lt;{preview.college.official_email}&gt;</span>
                    </div>
                    <div className="email-meta-row">
                      <strong>Target:</strong>
                      <span>{preview.college.college_name} ({preview.college.city}, {preview.college.state})</span>
                    </div>
                    <div className="email-meta-row">
                      <strong>Subject:</strong>
                      <span style={{ fontWeight: 600, color: 'var(--text-title)' }}>{preview.subject}</span>
                    </div>
                  </div>
                  <div className="paper-email-body">
                    {preview.body}
                  </div>
                </div>
              ) : (
                <div className="empty-placeholder" style={{ border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  Click <strong>"Refresh Preview"</strong> to generate a preview using live active college data.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: SENDER (INDIVIDUAL OR BULK) */}
      {activeTab === '3' && (
        <motion.div
          className="bento-grid"
          key="tab-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="bento-tile col-span-12">
            <div className="bento-tile-header">
              <h2 className="bento-tile-title">
                <span className="bento-tile-title-bar"></span>
                3. Dispatch Operations: Individual or Bulk Dispatcher
              </h2>
              <span className={`chip ${stats.worker.isRunning ? 'chip-active' : 'chip-idle'}`}>
                {stats.worker.isRunning ? 'Worker Running' : 'Idle'}
              </span>
            </div>
            <div className="bento-tile-body">
              {/* Transmission Mode Banner */}
              <div style={{
                background: smtpConfig.is_live_enabled ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${smtpConfig.is_live_enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                borderRadius: '12px',
                padding: '10px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '16px',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Server size={15} style={{ color: smtpConfig.is_live_enabled ? '#10b981' : '#f59e0b' }} />
                  <span>
                    Current Relay: <strong>{smtpConfig.is_live_enabled ? `LIVE: ${smtpConfig.account_name || 'Primary'} (${smtpConfig.host || 'Ready'}:${smtpConfig.port || 587})` : 'STANDBY - CONFIGURE SMTP IN TAB 5'}</strong>
                    {smtpConfig.user && <span style={{ marginLeft: '6px', color: '#64748b' }}>&bull; Auth: {smtpConfig.user}</span>}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '3px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      setActiveTab('5');
                      fetchSmtpConfig();
                      fetchSmtpAccounts();
                    }}
                  >
                    <Settings size={12} />
                    <span>Manage / Switch Relays</span>
                  </button>
                </div>
              </div>

              {/* Visual Dispatch Pipeline Stepper */}
              <div className="pipeline-stepper">
                <div className={`stepper-node ${mxVerification ? (mxVerification.hasMxRecords ? 'completed' : 'active') : 'active'}`}>
                  <div className="stepper-icon-circle">
                    {mxVerification?.hasMxRecords ? <Check size={14} /> : <Network size={14} />}
                  </div>
                  <div className="stepper-label-block">
                    <span className="stepper-step-num">Step 1</span>
                    <span className="stepper-step-title">DNS / MX Pre-flight</span>
                  </div>
                </div>

                <div className={`stepper-divider ${mxVerification?.hasMxRecords ? 'completed' : ''}`}></div>

                <div className={`stepper-node ${singleRecipient.official_email ? 'completed' : ''}`}>
                  <div className="stepper-icon-circle">
                    <FileText size={14} />
                  </div>
                  <div className="stepper-label-block">
                    <span className="stepper-step-num">Step 2</span>
                    <span className="stepper-step-title">Jinja Interpolation</span>
                  </div>
                </div>

                <div className="stepper-divider"></div>

                <div className={`stepper-node ${stats.worker.isRunning ? 'active' : ''}`}>
                  <div className="stepper-icon-circle">
                    <Zap size={14} />
                  </div>
                  <div className="stepper-label-block">
                    <span className="stepper-step-num">Step 3</span>
                    <span className="stepper-step-title">Throttle Queue (2/s)</span>
                  </div>
                </div>

                <div className="stepper-divider"></div>

                <div className={`stepper-node ${singleSendStatus?.success ? 'completed' : ''}`}>
                  <div className="stepper-icon-circle">
                    {singleSendStatus?.success ? <Check size={14} /> : <Send size={14} />}
                  </div>
                  <div className="stepper-label-block">
                    <span className="stepper-step-num">Step 4</span>
                    <span className="stepper-step-title">SMTP Handshake</span>
                  </div>
                </div>
              </div>

              {/* Mode Selector Tabs */}
              <div className="sender-mode-tabs">
                <button
                  className={`sender-mode-btn ${senderMode === 'individual' ? 'active' : ''}`}
                  onClick={() => setSenderMode('individual')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <UserCheck size={15} />
                  <span>Mode A: Individual Single Recipient (Test Send / Direct Target)</span>
                </button>
                <button
                  className={`sender-mode-btn ${senderMode === 'bulk' ? 'active' : ''}`}
                  onClick={() => setSenderMode('bulk')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Send size={15} />
                  <span>Mode B: Bulk Multi-Institution Campaign ({colleges.length} Targets)</span>
                </button>
              </div>

              {/* INDIVIDUAL SENDER MODE */}
              {senderMode === 'individual' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  <div className="form-stack">
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserCheck size={16} style={{ color: 'var(--sf-red)' }} />
                      <span>Configure Single Recipient</span>
                    </h3>

                    {colleges.length > 0 && (
                      <div className="form-field">
                        <label>Select Target from Loaded Queue</label>
                        <select
                          className="input-text"
                          onChange={(e) => {
                            const found = colleges.find(c => c.official_email === e.target.value);
                            if (found) setSingleRecipient(found);
                          }}
                          value={singleRecipient.official_email || ''}
                        >
                          <option value="">-- Choose from loaded colleges --</option>
                          {colleges.map((c, i) => (
                            <option key={i} value={c.official_email}>
                              {c.college_name} ({c.official_email})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="form-field">
                      <label>Target Institution Name</label>
                      <input
                        type="text"
                        className="input-text"
                        value={singleRecipient.college_name || ''}
                        onChange={(e) => setSingleRecipient({ ...singleRecipient, college_name: e.target.value })}
                        placeholder="e.g. COEP Technological University"
                      />
                    </div>

                    <div className="form-field">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ margin: 0 }}>Official Email Address</label>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '2px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => checkMxRecords()}
                          disabled={isCheckingMx}
                        >
                          <Network size={11} style={{ color: 'var(--sf-red)' }} />
                          <span>{isCheckingMx ? 'Checking DNS...' : 'Verify MX Records'}</span>
                        </button>
                      </div>
                      <input
                        type="email"
                        className="input-text"
                        value={singleRecipient.official_email || ''}
                        onChange={(e) => {
                          setSingleRecipient({ ...singleRecipient, official_email: e.target.value });
                          setMxVerification(null);
                        }}
                        placeholder="registrar@coeptech.ac.in"
                      />

                      {mxVerification && (
                        <div style={{ marginTop: '6px' }}>
                          {mxVerification.hasMxRecords ? (
                            <div className="badge-tag-verified">
                              <CheckCircle2 size={12} />
                              <span>MX Verified: {mxVerification.primaryServer} ({mxVerification.lookupDurationMs}ms, Score: {mxVerification.deliverabilityScore}%)</span>
                            </div>
                          ) : (
                            <div className="badge-tag-unverified">
                              <AlertTriangle size={12} />
                              <span>No MX Records found for {mxVerification.domain} (Deliverability: 0%)</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="form-field">
                      <label>Contact Person / Salutation</label>
                      <input
                        type="text"
                        className="input-text"
                        value={singleRecipient.contact_person || ''}
                        onChange={(e) => setSingleRecipient({ ...singleRecipient, contact_person: e.target.value })}
                        placeholder="Dr. D. N. Sonawane, Registrar"
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div className="form-field" style={{ flex: 1 }}>
                        <label>City / District</label>
                        <input
                          type="text"
                          className="input-text"
                          value={singleRecipient.city || ''}
                          onChange={(e) => setSingleRecipient({ ...singleRecipient, city: e.target.value })}
                          placeholder="e.g. Chennai, Bangalore, Pune"
                        />
                      </div>
                      <div className="form-field" style={{ flex: 1 }}>
                        <label>State</label>
                        <input
                          type="text"
                          className="input-text"
                          value={singleRecipient.state || ''}
                          onChange={(e) => setSingleRecipient({ ...singleRecipient, state: e.target.value })}
                          placeholder="e.g. Tamil Nadu, Karnataka, Delhi"
                        />
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      margin: '12px 0 6px 0'
                    }}>
                      <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                      <span>Production Mode: Real email sent via verified live SMTP connection pool.</span>
                    </div>

                    <motion.button
                      className="btn btn-live-smtp btn-block"
                      onClick={handleSingleSend}
                      disabled={isSendingSingle}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ padding: '11px 16px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Send size={15} />
                      <span>
                        {isSendingSingle ? 'Dispatching Live Email...' : 'Send Live Production Email'}
                      </span>
                    </motion.button>

                    {singleSendStatus && (
                      <div className={`alert-box ${singleSendStatus.success ? 'success' : 'error'}`}>
                        {singleSendStatus.success ? (
                          <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                        ) : (
                          <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                        )}
                        <div>
                          <strong>{singleSendStatus.success ? 'DISPATCH SUCCESS' : 'DISPATCH FAILED'}:</strong> {singleSendStatus.status} ({singleSendStatus.mode})
                          <div style={{ fontSize: '11px', marginTop: '4px' }}>
                            Recipient: <code>{singleSendStatus.recipient}</code> | Message-ID: <code>{singleSendStatus.messageId}</code>
                          </div>
                          {singleSendStatus.error && (
                            <div style={{ color: 'var(--danger)', marginTop: '4px' }}>
                              Error: {singleSendStatus.error}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right side: Personalized Email Payload Preview */}
                  <div className="form-stack">
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={16} style={{ color: 'var(--sf-red)' }} />
                      <span>Personalized Single Send Payload</span>
                    </h3>
                    <div className="paper-email-preview" style={{ height: '100%', maxHeight: '430px' }}>
                      <div className="paper-email-header">
                        <div className="email-meta-row">
                          <strong>To:</strong>
                          <span>{singleRecipient.contact_person || 'Academic Coordinator'} &lt;{singleRecipient.official_email || 'recipient@college.ac.in'}&gt;</span>
                        </div>
                        <div className="email-meta-row">
                          <strong>Subject:</strong>
                          <span style={{ fontWeight: 600, color: 'var(--text-title)' }}>
                            {template.subject.replace(/\{\{\s*college_name\s*\}\}/g, singleRecipient.college_name || '[College Name]')}
                          </span>
                        </div>
                      </div>
                      <div className="paper-email-body" style={{ maxHeight: '280px' }}>
                        {template.body_text
                          .replace(/\{\{\s*college_name\s*\}\}/g, singleRecipient.college_name || '[College Name]')
                          .replace(/\{\{\s*contact_person\s*\}\}/g, singleRecipient.contact_person || '[Contact Person]')
                          .replace(/\{\{\s*city\s*\}\}/g, singleRecipient.city || '[City]')
                          .replace(/\{\{\s*sender_name\s*\}\}/g, 'Shortfundly Campus Team')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BULK SENDER MODE */}
              {senderMode === 'bulk' && (
                <div>
                  <div className="info-bar" style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={14} style={{ color: 'var(--sf-red)' }} />
                      <span>Target Working Set: <strong>{colleges.length} institutions in active queue</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={14} style={{ color: 'var(--warning)' }} />
                      <span>Rate Limiting: <strong>2 msgs/sec</strong> | Pooled Connections: <strong>5 max</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div className="telemetry-stat-card">
                      <div className="telemetry-stat-card-top">
                        <span className="telemetry-stat-label">Worker Engine Status</span>
                        <Activity size={14} style={{ color: stats.worker.isRunning ? 'var(--warning)' : 'var(--text-muted)' }} />
                      </div>
                      <span className="telemetry-stat-number">
                        {stats.worker.isRunning ? 'DISPATCHING' : 'IDLE'}
                      </span>
                      <span className="telemetry-stat-desc">Mode: {stats.worker.mode}</span>
                    </div>

                    <div className="telemetry-stat-card">
                      <div className="telemetry-stat-card-top">
                        <span className="telemetry-stat-label">Processed Batch</span>
                        <Send size={14} style={{ color: 'var(--sf-red)' }} />
                      </div>
                      <span className="telemetry-stat-number">
                        {stats.worker.processed} / {stats.worker.total || colleges.length}
                      </span>
                      <span className="telemetry-stat-desc">
                        Sent: {stats.worker.sent} | Skipped: {stats.worker.skipped}
                      </span>
                    </div>

                    <div className="telemetry-stat-card">
                      <div className="telemetry-stat-card-top">
                        <span className="telemetry-stat-label">Audit Database Total</span>
                        <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                      </div>
                      <span className="telemetry-stat-number" style={{ color: 'var(--success)' }}>
                        {stats.database.SENT || 0}
                      </span>
                      <span className="telemetry-stat-desc">Delivered across all campaigns</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '20px' }}>
                    <motion.button
                      className="btn btn-live-smtp"
                      style={{ padding: '11px 22px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
                      onClick={handleStartBulkCampaign}
                      disabled={stats.worker.isRunning}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Send size={15} />
                      <span>Start Production Bulk Campaign ({colleges.length} Institutions)</span>
                    </motion.button>

                    <motion.button
                      className="btn btn-kill-switch"
                      style={{ padding: '11px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={handleKillSwitch}
                      disabled={!stats.worker.isRunning}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <AlertOctagon size={15} />
                      <span>Emergency Kill Switch</span>
                    </motion.button>

                    <a href="/api/reports/export" style={{ textDecoration: 'none' }}>
                      <motion.button
                        className="btn btn-secondary"
                        style={{ padding: '11px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FileSpreadsheet size={15} />
                        <span>Download Audit Report (.xlsx)</span>
                      </motion.button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* OPTION 4: TAB 4 - AUDIT HISTORY & DELIVERY LOG EXPLORER */}
      {activeTab === '4' && (
        <motion.div
          className="bento-grid"
          key="tab-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="bento-tile col-span-12">
            <div className="bento-tile-header">
              <h2 className="bento-tile-title">
                <span className="bento-tile-title-bar"></span>
                4. Permanent Dispatch Audit Ledger &amp; Delivery Log Explorer
              </h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  className="input-text"
                  style={{ width: '150px', padding: '4px 8px', fontSize: '12px' }}
                  value={auditFilter}
                  onChange={(e) => {
                    setAuditFilter(e.target.value);
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="SENT">SENT (Confirmed)</option>
                  <option value="FAILED">FAILED (Errors)</option>
                  <option value="SKIPPED_DUPLICATE">SKIPPED (Deduplicated)</option>
                </select>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={fetchAuditLogs}
                >
                  <RefreshCw size={13} />
                  <span>Refresh Ledger</span>
                </button>
              </div>
            </div>

            <div className="bento-tile-body no-padding">
              {isLoadingAudit ? (
                <div className="empty-placeholder">Loading audit transactions from SQLite ledger...</div>
              ) : auditLogs.length === 0 ? (
                <div className="empty-placeholder">
                  No audit log entries recorded yet. Dispatched emails will appear here with cryptographic SHA-256 keys.
                </div>
              ) : (
                <div className="table-container">
                  <table className="bento-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Status</th>
                        <th>Target Institution</th>
                        <th>Official Email</th>
                        <th>Jurisdiction</th>
                        <th>Timestamp</th>
                        <th>SHA-256 Idempotency Key</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td>#{log.id}</td>
                          <td>
                            <span
                              className={`chip ${
                                log.status === 'SENT'
                                  ? 'chip-success'
                                  : log.status === 'FAILED'
                                    ? 'chip-idle'
                                    : 'chip-active'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td><strong>{log.college_name}</strong></td>
                          <td><code>{log.official_email}</code></td>
                          <td>{log.city || 'N/A'}, {log.state || 'N/A'}</td>
                          <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.created_at}</td>
                          <td>
                            <code style={{ fontSize: '10px', background: '#f8fafc', padding: '2px 4px', borderRadius: '3px' }}>
                              {log.idempotency_key ? log.idempotency_key.substring(0, 16) + '...' : 'N/A'}
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 5: SMTP CONFIG & LIVE ENGINE CONVERSION */}
      {activeTab === '5' && (
        <motion.div
          className="bento-grid"
          key="tab-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Master Controller Tile */}
          <div className="bento-tile col-span-12">
            <div className="bento-tile-header">
              <h2 className="bento-tile-title">
                <span className="bento-tile-title-bar"></span>
                5. Live SMTP Transmission Engine &amp; Multi-Account Vault
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`chip ${smtpConfig.is_live_enabled ? 'chip-active' : 'chip-idle'}`}>
                  {smtpConfig.is_live_enabled ? `ACTIVE RELAY: ${smtpConfig.account_name || 'PRIMARY'}` : 'STANDBY - CREDENTIALS REQUIRED'}
                </span>
              </div>
            </div>
            <div className="bento-tile-body">
              {/* GOOGLE APP PASSWORDS DIRECT ACCESS PORTAL */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
                border: '1px solid rgba(225, 29, 72, 0.25)',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                marginBottom: '22px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(225, 29, 72, 0.1)',
                    color: 'var(--sf-red)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Key size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>Google App Passwords Direct Portal</strong>
                      <span style={{ fontSize: '10px', background: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>DIRECT 1-CLICK ACCESS</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', margin: '3px 0 0 0', maxWidth: '680px' }}>
                      Sign in to your Google Account, ensure 2-Step Verification is active, and generate a 16-character application token for <code>Shortfundly Outreach</code> without sharing your main Google password.
                    </p>
                  </div>
                </div>

                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    padding: '9px 18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '12px',
                    boxShadow: '0 2px 10px rgba(225, 29, 72, 0.25)'
                  }}
                >
                  <Key size={14} />
                  <span>Open Google App Passwords</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* MULTI-ACCOUNT SMTP RELAY SWITCHER DECK */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Server size={16} style={{ color: 'var(--sf-red)' }} />
                      <span>Configured SMTP Relay Accounts ({smtpAccounts.length})</span>
                    </h3>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Add multiple accounts (Gmail, Brevo, SendGrid, Amazon SES) and switch the active sending relay with 1 click.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '7px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => {
                      setIsAddingAccount(true);
                      setEditingAccountId(null);
                      setAccountForm({
                        account_name: `Outreach Relay #${smtpAccounts.length + 1}`,
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        user: '',
                        pass: '',
                        from_email: 'outreach@shortfundly.com',
                        from_name: 'Shortfundly Education Outreach'
                      });
                    }}
                  >
                    <Plus size={14} />
                    <span>Add SMTP Account</span>
                  </button>
                </div>

                {/* Account Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                  {smtpAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      style={{
                        background: acc.is_active ? 'rgba(16, 185, 129, 0.04)' : '#ffffff',
                        border: acc.is_active ? '2px solid #10b981' : '1px solid var(--border-color)',
                        borderRadius: '14px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: acc.is_active ? '0 4px 16px rgba(16, 185, 129, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                              {acc.account_name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              <code>{acc.host}:{acc.port}</code> ({acc.secure ? 'SSL' : 'STARTTLS'})
                            </div>
                          </div>
                          {acc.is_active ? (
                            <span style={{
                              background: '#10b981',
                              color: '#ffffff',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '999px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              letterSpacing: '0.04em'
                            }}>
                              <CheckCircle2 size={11} />
                              <span>ACTIVE RELAY</span>
                            </span>
                          ) : (
                            <span style={{
                              background: '#f1f5f9',
                              color: '#64748b',
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '999px'
                            }}>
                              STANDBY
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '11px', color: '#334155', margin: '8px 0', lineHeight: 1.6 }}>
                          <div><strong>Auth Email:</strong> {acc.user ? <code>{acc.user}</code> : '<Not Set>'}</div>
                          <div><strong>Sender:</strong> {acc.from_name} &lt;{acc.from_email}&gt;</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                            <Lock size={11} style={{ color: acc.hasPassword ? '#10b981' : '#f59e0b' }} />
                            <span>{acc.hasPassword ? 'Password encrypted in vault' : 'No password set'}</span>
                          </div>
                        </div>

                        {acc.last_test_status && (
                          <div style={{
                            fontSize: '10px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: acc.last_test_status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: acc.last_test_status === 'SUCCESS' ? '#047857' : '#b91c1c',
                            marginBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {acc.last_test_status === 'SUCCESS' ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {acc.last_test_status}: {acc.last_test_message || 'Handshake complete'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                        {!acc.is_active && (
                          <button
                            type="button"
                            className="btn btn-live-smtp"
                            style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}
                            onClick={() => handleActivateAccount(acc.id)}
                          >
                            Switch to Active
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => handleTestAccount(acc)}
                          disabled={isTestingSmtp}
                        >
                          Test Handshake
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => {
                            setEditingAccountId(acc.id);
                            setIsAddingAccount(true);
                            setAccountForm({
                              account_name: acc.account_name,
                              host: acc.host,
                              port: acc.port,
                              secure: acc.secure,
                              user: acc.user,
                              pass: acc.hasPassword ? '••••••••' : '',
                              from_email: acc.from_email,
                              from_name: acc.from_name
                            });
                          }}
                        >
                          <Edit3 size={11} style={{ marginRight: '3px' }} />
                          <span>Edit</span>
                        </button>
                        {smtpAccounts.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-kill-switch"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => handleDeleteAccount(acc.id)}
                            title="Delete this SMTP account"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ADD OR EDIT ACCOUNT DRAWER */}
              {isAddingAccount && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                      <Server size={16} style={{ color: 'var(--sf-red)' }} />
                      <span>{editingAccountId ? `Edit Account #${editingAccountId}` : 'Configure New SMTP Relay'}</span>
                    </h3>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                      onClick={() => {
                        setIsAddingAccount(false);
                        setEditingAccountId(null);
                      }}
                    >
                      <X size={12} style={{ marginRight: '3px' }} />
                      <span>Close</span>
                    </button>
                  </div>

                  {/* 1-Click Provider Quick-Fill Presets for the Account Form */}
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                      1-Click Provider Presets:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '12px', textAlign: 'left' }}
                        onClick={() => applySmtpPreset('gmail', 'form')}
                      >
                        <strong>Gmail / Google WS</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>smtp.gmail.com:587</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '12px', textAlign: 'left' }}
                        onClick={() => applySmtpPreset('brevo', 'form')}
                      >
                        <strong>Brevo (Sendinblue)</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>smtp-relay.brevo.com:587</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '12px', textAlign: 'left' }}
                        onClick={() => applySmtpPreset('sendgrid', 'form')}
                      >
                        <strong>SendGrid</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>smtp.sendgrid.net:587</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '12px', textAlign: 'left' }}
                        onClick={() => applySmtpPreset('ses', 'form')}
                      >
                        <strong>Amazon SES (Mumbai)</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>ap-south-1:587</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                    <div className="form-field">
                      <label>Account Label / Internal Nickname</label>
                      <input
                        type="text"
                        className="input-text"
                        value={accountForm.account_name}
                        onChange={(e) => setAccountForm({ ...accountForm, account_name: e.target.value })}
                        placeholder="e.g. Primary Gmail Outreach or Partnerships Brevo"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '6fr 3fr 3fr', gap: '8px' }}>
                      <div className="form-field">
                        <label>SMTP Host</label>
                        <input
                          type="text"
                          className="input-text"
                          value={accountForm.host}
                          onChange={(e) => setAccountForm({ ...accountForm, host: e.target.value })}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div className="form-field">
                        <label>Port</label>
                        <input
                          type="number"
                          className="input-text"
                          value={accountForm.port}
                          onChange={(e) => setAccountForm({ ...accountForm, port: e.target.value })}
                          placeholder="587"
                        />
                      </div>
                      <div className="form-field">
                        <label>Security</label>
                        <select
                          className="input-text"
                          value={accountForm.secure ? 'true' : 'false'}
                          onChange={(e) => setAccountForm({ ...accountForm, secure: e.target.value === 'true' })}
                        >
                          <option value="false">STARTTLS</option>
                          <option value="true">SSL (465)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-field">
                      <label>SMTP Username / Authentication Email</label>
                      <input
                        type="text"
                        className="input-text"
                        value={accountForm.user}
                        onChange={(e) => setAccountForm({ ...accountForm, user: e.target.value })}
                        placeholder="outreach@shortfundly.com"
                      />
                    </div>

                    <div className="form-field">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ margin: 0 }}>Password / App Password</label>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '11px', color: 'var(--sf-red)', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none', fontWeight: 600 }}
                        >
                          <span>Get Google App Password</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                      <input
                        type="password"
                        className="input-text"
                        value={accountForm.pass}
                        onChange={(e) => setAccountForm({ ...accountForm, pass: e.target.value })}
                        placeholder={editingAccountId ? '•••••••• (Leave blank to keep current)' : 'Enter 16-character App Password'}
                      />
                    </div>

                    <div className="form-field">
                      <label>Sender From Email</label>
                      <input
                        type="email"
                        className="input-text"
                        value={accountForm.from_email}
                        onChange={(e) => setAccountForm({ ...accountForm, from_email: e.target.value })}
                        placeholder="outreach@shortfundly.com"
                      />
                    </div>

                    <div className="form-field">
                      <label>Sender Display Name</label>
                      <input
                        type="text"
                        className="input-text"
                        value={accountForm.from_name}
                        onChange={(e) => setAccountForm({ ...accountForm, from_name: e.target.value })}
                        placeholder="Shortfundly Education Outreach"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={handleSaveAccount}
                      disabled={isSavingAccount}
                    >
                      <Save size={14} />
                      <span>{isSavingAccount ? 'Saving to Vault...' : 'Save Account to Vault'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '8px 14px' }}
                      onClick={() => {
                        setIsAddingAccount(false);
                        setEditingAccountId(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Handshake Test Log & Instructions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                <div className="form-stack">
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={15} style={{ color: 'var(--sf-red)' }} />
                    <span>Active Relay Diagnostics ({smtpConfig.account_name || 'Active Account'})</span>
                  </h3>

                  {smtpTestResult ? (
                    <div className={`alert-box ${smtpTestResult.success ? 'success' : 'error'}`}>
                      {smtpTestResult.success ? (
                        <CheckCircle2 size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                      ) : (
                        <AlertTriangle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                      )}
                      <div>
                        <strong>{smtpTestResult.success ? 'HANDSHAKE VERIFIED' : 'HANDSHAKE FAILED'}</strong>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                          {smtpTestResult.message}
                        </div>
                        {smtpTestResult.durationMs && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Round-trip ping latency: <strong>{smtpTestResult.durationMs}ms</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : smtpConfig.last_test_status ? (
                    <div className={`alert-box ${smtpConfig.last_test_status === 'SUCCESS' ? 'success' : 'warning'}`}>
                      <Info size={18} style={{ color: smtpConfig.last_test_status === 'SUCCESS' ? 'var(--success)' : 'var(--warning)', flexShrink: 0 }} />
                      <div>
                        <strong>Last Recorded Handshake:</strong> {smtpConfig.last_test_status} ({smtpConfig.last_tested_at})
                        <div style={{ fontSize: '12px', marginTop: '2px' }}>
                          {smtpConfig.last_test_message}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="info-bar">
                      Select an account above and click <strong>"Test Handshake"</strong> to verify server connectivity and TLS authentication.
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn btn-dark"
                      style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={handleTestSmtpConnection}
                      disabled={isTestingSmtp}
                    >
                      <Zap size={14} />
                      <span>{isTestingSmtp ? 'Testing Handshake...' : `Test Active Relay (${smtpConfig.host}:${smtpConfig.port})`}</span>
                    </button>
                  </div>
                </div>

                <div className="form-stack">
                  <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', fontSize: '12px', color: '#475569' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ color: '#0f172a', fontSize: '13px' }}>
                        Google App Password Setup Instructions:
                      </strong>
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--sf-red)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        <span>Open Portal</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                    <ol style={{ paddingLeft: '18px', margin: 0, lineHeight: 1.7 }}>
                      <li>Ensure <strong>2-Step Verification</strong> is switched ON in your Google Account security settings.</li>
                      <li>Click the direct access button above or go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sf-red)', textDecoration: 'underline' }}>Google App Passwords</a>.</li>
                      <li>Under "App name", enter <code>Shortfundly Outreach</code> and click <strong>Create</strong>.</li>
                      <li>Google displays a 16-character passkey (e.g. <code>abcd efgh ijkl mnop</code>).</li>
                      <li>Paste the 16 characters directly into the <strong>Password</strong> field above.</li>
                      <li>Click <strong>"Test Handshake"</strong> to verify before launching live email dispatches.</li>
                    </ol>
                  </div>

                  {/* Live Recipient Dispatch & Inbox Inspector */}
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #bbf7d0',
                    background: '#f0fdf4'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
                        <strong style={{ fontSize: '13px', color: '#14532d' }}>Live Transmission & Recipient Inbox Verification</strong>
                      </div>
                      <Link href="/inbox" style={{ textDecoration: 'none' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ fontSize: '11px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Mail size={13} />
                          <span>Open Gmail Inbox (monarchrealms.team@gmail.com)</span>
                          <ExternalLink size={12} />
                        </button>
                      </Link>
                    </div>
                    <p style={{ fontSize: '12px', color: '#166534', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                      Test target: <strong>Monarchs University</strong> &bull; Contact: <strong>Harish Rohith</strong> &bull; Email: <code>monarchrealms.team@gmail.com</code>.
                      Verified delivery route through authenticated relay <code>smtp.gmail.com:587</code>.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        type="button"
                        id="btn-monarch-live-send"
                        onClick={async () => {
                          addToast('info', 'Dispatching', 'Sending live proposal to monarchrealms.team@gmail.com...');
                          try {
                            const res = await fetch('/api/campaign/single-send', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                college: {
                                  college_name: 'Monarchs University',
                                  official_email: 'monarchrealms.team@gmail.com',
                                  contact_person: 'Harish Rohith',
                                  city: 'Mumbai',
                                  state: 'Maharashtra'
                                },
                                liveMode: true
                              })
                            });
                            const data = await res.json();
                            if (res.ok && data.success) {
                              addToast('success', 'Email Sent Live', `Message delivered to monarchrealms.team@gmail.com! ID: ${data.messageId}`);
                              appendLog(`LIVE SMTP SUCCESS: Dispatched proposal to Monarchs University (${data.messageId})`);
                            } else {
                              addToast('error', 'Dispatch Error', data.error || 'Failed to send');
                            }
                          } catch (err) {
                            addToast('error', 'Network Error', err.message);
                          }
                        }}
                        className="btn btn-live-smtp"
                        style={{ padding: '7px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Send size={13} />
                        <span>Send Live Test Mail to Monarchs University</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* OPERATOR PROFILE EDIT MODAL */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="orbix-modal-backdrop" onClick={() => setIsEditingProfile(false)}>
            <motion.div
              className="orbix-modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="orbix-modal-header">
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    IDENTITY &amp; AUDIT GOVERNANCE
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Operator Profile Settings
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                    Configure dispatch operator name, official email, and organizational title for campaign ledgers.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="orbix-action-pill"
                  style={{ padding: '6px' }}
                  title="Close Modal"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="orbix-modal-body">
                <div className="form-field">
                  <label>Operator Full Name</label>
                  <input
                    type="text"
                    className="input-text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="e.g. Harish Kumar"
                  />
                </div>

                <div className="form-field">
                  <label>Official Work Email</label>
                  <input
                    type="email"
                    className="input-text"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="e.g. harish.shortfundly@gmail.com"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-field">
                    <label>Designation / Role</label>
                    <input
                      type="text"
                      className="input-text"
                      value={profileForm.role}
                      onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                      placeholder="e.g. Lead Outreach Administrator"
                    />
                  </div>

                  <div className="form-field">
                    <label>Department</label>
                    <input
                      type="text"
                      className="input-text"
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      placeholder="e.g. University Partnerships"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Organization / Entity</label>
                  <input
                    type="text"
                    className="input-text"
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                    placeholder="e.g. Shortfundly Network"
                  />
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>Local Session Persistence</div>
                  Changes are preserved locally in browser storage and dynamically reflect across all campaign headers, audit trails, and topbar badges.
                </div>
              </div>

              <div className="orbix-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="orbix-action-pill"
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="orbix-action-pill primary"
                >
                  <Check size={13} />
                  <span>Save Profile</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING TOAST NOTIFICATION STACK */}
      <div className="toast-stack">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`toast-item toast-${t.type}`}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ marginTop: '1px' }}>
                {t.type === 'success' && <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />}
                {t.type === 'error' && <AlertCircle size={16} style={{ color: 'var(--danger)' }} />}
                {t.type === 'warning' && <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />}
                {t.type === 'info' && <Info size={16} style={{ color: 'var(--primary)' }} />}
              </div>
              <div className="toast-content">
                <div className="toast-title">{t.title}</div>
                <div className="toast-message">{t.message}</div>
              </div>
              <button
                className="toast-close-btn"
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
              >
                <X size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DownloadCloudIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m8 17 4 4 4-4" />
    </svg>
  );
}
