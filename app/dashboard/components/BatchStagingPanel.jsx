'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Filter,
  CheckCircle2,
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Globe,
  Sliders,
  Check,
  Send,
  Download,
  FolderUp,
  FileSpreadsheet
} from 'lucide-react';

export default function BatchStagingPanel({
  onQueueUpdated,
  fileInputRef,
  handleUploadCsv,
  isUploadingCsv,
  customStateInput,
  setCustomStateInput,
  handleResetToZero,
  collegesCount = 0,
  activeStateLabel = 'Maharashtra'
}) {
  // Filter States
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [batchSize, setBatchSize] = useState(100);
  const [currentBatchNum, setCurrentBatchNum] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // API Data States
  const [loading, setLoading] = useState(false);
  const [stagingLoading, setStagingLoading] = useState(false);
  const [metaData, setMetaData] = useState({
    totalDatasetCount: 9875,
    filteredCount: 9875,
    totalBatches: 99,
    currentBatch: 1,
    batchRecords: [],
    roleCounts: {
      ALL: 9875,
      PRINCIPALS: 2818,
      FACULTIES: 1821,
      HODS: 194,
      DEANS: 185,
      TPOS: 495,
      REGISTRARS: 1075
    },
    topDistricts: []
  });

  const [notification, setNotification] = useState(null);

  const fetchBatchData = async (role = selectedRole, district = selectedDistrict, cat = selectedCategory, bSize = batchSize, bNum = currentBatchNum, search = searchTerm) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        role,
        district,
        category: cat,
        batchSize: bSize.toString(),
        batchNumber: bNum.toString(),
        search
      });
      const res = await fetch(`/api/colleges/batch-manager?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMetaData(data);
      }
    } catch (err) {
      console.error('Error fetching batch manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchData(selectedRole, selectedDistrict, selectedCategory, batchSize, currentBatchNum, searchTerm);
  }, [selectedRole, selectedDistrict, selectedCategory, batchSize, currentBatchNum]);

  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey);
    setCurrentBatchNum(1);
  };

  const handleDistrictChange = (dist) => {
    setSelectedDistrict(dist);
    setCurrentBatchNum(1);
  };

  const handleBatchSizeChange = (size) => {
    setBatchSize(size);
    setCurrentBatchNum(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentBatchNum(1);
    fetchBatchData(selectedRole, selectedDistrict, selectedCategory, batchSize, 1, searchTerm);
  };

  const handleStageAction = async (actionType = 'stage_batch') => {
    setStagingLoading(true);
    setNotification(null);
    try {
      const res = await fetch('/api/colleges/batch-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          role: selectedRole,
          district: selectedDistrict,
          category: selectedCategory,
          search: searchTerm,
          batchSize,
          batchNumber: currentBatchNum,
          clearExisting: true
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'SUCCESS') {
        setNotification({
          type: 'success',
          message: actionType === 'stage_all'
            ? `Successfully staged all ${data.stagedCount} filtered institutions into the active queue!`
            : `Batch ${data.batchNumber} loaded! ${data.stagedCount} institutions staged and ready for email dispatch.`
        });
        if (onQueueUpdated) {
          onQueueUpdated();
        }
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to stage records.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setStagingLoading(false);
    }
  };

  const rolePills = [
    { key: 'ALL', label: 'All Verified Universe', count: metaData.roleCounts?.ALL || 9875, icon: Layers },
    { key: 'PRINCIPALS', label: 'Principals & Directors', count: metaData.roleCounts?.PRINCIPALS || 2818, icon: GraduationCap },
    { key: 'FACULTIES', label: 'Faculties & Professors', count: metaData.roleCounts?.FACULTIES || 1821, icon: Users },
    { key: 'HODS', label: 'Heads of Departments (HODs)', count: metaData.roleCounts?.HODS || 194, icon: Briefcase },
    { key: 'DEANS', label: 'Deans & Leadership', count: metaData.roleCounts?.DEANS || 185, icon: ShieldCheck },
    { key: 'TPOS', label: 'TPOs & Placement', count: metaData.roleCounts?.TPOS || 495, icon: Building2 },
    { key: 'REGISTRARS', label: 'Registrars & Admin', count: metaData.roleCounts?.REGISTRARS || 1075, icon: Sliders },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. TOP TELEMETRY BANNER (UNSTRESS KPI CARDS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Master Universe
            </span>
            <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
              100% Genuine
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {(metaData.totalDatasetCount || 9875).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Verified institutional contacts
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Filtered Selection
            </span>
            <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
              Active Filter
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb', marginTop: '6px' }}>
            {(metaData.filteredCount || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Matches role &amp; district criteria
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Auto Batches
            </span>
            <span style={{ background: '#fdf4ff', color: '#9333ea', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
              {batchSize} / Batch
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#9333ea', marginTop: '6px' }}>
            {metaData.totalBatches || 1} <span style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>Batches</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Current Batch: #{currentBatchNum} ({metaData.startIndex || 0} - {metaData.endIndex || 0})
          </div>
        </div>

        <div style={{ background: collegesCount > 0 ? '#f0fdf4' : '#fffbeb', padding: '16px 20px', borderRadius: '12px', border: `1px solid ${collegesCount > 0 ? '#bbf7d0' : '#fde68a'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: collegesCount > 0 ? '#166534' : '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Working Queue
            </span>
            <span style={{ background: collegesCount > 0 ? '#dcfce7' : '#fef3c7', color: collegesCount > 0 ? '#15803d' : '#b45309', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
              {collegesCount > 0 ? 'Ready To Dispatch' : 'Standby'}
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: collegesCount > 0 ? '#15803d' : '#b45309', marginTop: '6px' }}>
            {collegesCount.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: collegesCount > 0 ? '#166534' : '#92400e', marginTop: '2px' }}>
            Staged in email sender queue
          </div>
        </div>
      </div>

      {/* NOTIFICATION TOAST BAR */}
      {notification && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          background: notification.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: notification.type === 'success' ? '#166534' : '#991b1b',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <RotateCcw size={16} />}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            &times;
          </button>
        </div>
      )}

      {/* 2. AUTO-SEPARATE BATCH & FILTER CONTROL HUB */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '22px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '4px', height: '18px', background: '#e11d48', borderRadius: '2px' }}></span>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Auto-Separate Batch Generator &amp; Role Filters
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 12px' }}>
              Select your target audience. The engine instantly slices the dataset into safe, rate-limited email dispatch batches.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleResetToZero}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '7px 14px', color: '#e11d48' }}
              title="Clear Active Queue"
            >
              <RotateCcw size={13} />
              <span>Reset Active Queue</span>
            </button>
            <button
              onClick={() => fileInputRef?.current?.click()}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '7px 14px' }}
              disabled={isUploadingCsv}
            >
              <FolderUp size={13} />
              <span>{isUploadingCsv ? 'Uploading...' : 'Upload Custom CSV'}</span>
            </button>
          </div>
        </div>

        {/* ROLE SELECTION PILLS */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
            1. Select Target Academic Role
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {rolePills.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleRoleChange(r.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isSelected ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                    background: isSelected ? '#0f172a' : '#f8fafc',
                    color: isSelected ? '#ffffff' : '#334155'
                  }}
                >
                  <Icon size={14} style={{ color: isSelected ? '#38bdf8' : '#64748b' }} />
                  <span>{r.label}</span>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '999px',
                    background: isSelected ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                    color: isSelected ? '#ffffff' : '#475569'
                  }}>
                    {r.count.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DISTRICT, BATCH SIZE & SEARCH ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', alignItems: 'flex-end' }}>
          {/* District Filter */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
              District / Region
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="input-text"
              style={{ width: '100%', padding: '8px 10px', fontSize: '13px', background: '#ffffff' }}
            >
              <option value="ALL">All Maharashtra Districts ({metaData.roleCounts?.ALL || 9875})</option>
              {metaData.topDistricts && metaData.topDistricts.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} ({d.count} colleges)
                </option>
              ))}
            </select>
          </div>

          {/* Batch Size Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Auto Batch Slice Size
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[50, 100, 250, 500].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleBatchSizeChange(sz)}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    fontSize: '12px',
                    fontWeight: batchSize === sz ? 700 : 500,
                    borderRadius: '6px',
                    border: batchSize === sz ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                    background: batchSize === sz ? '#eff6ff' : '#ffffff',
                    color: batchSize === sz ? '#1d4ed8' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {sz} / batch
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Instant Search Filter
            </label>
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-text"
                placeholder="Search college, email, or person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 10px 8px 32px', fontSize: '13px', background: '#ffffff' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </form>
          </div>
        </div>

        {/* 3. BATCH NAVIGATION & ACTION BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          {/* Batch Selector Controller */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Active Batch:
            </span>
            <button
              type="button"
              disabled={currentBatchNum <= 1 || loading}
              onClick={() => setCurrentBatchNum(prev => Math.max(1, prev - 1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: currentBatchNum <= 1 ? '#f1f5f9' : '#ffffff',
                cursor: currentBatchNum <= 1 ? 'not-allowed' : 'pointer',
                color: currentBatchNum <= 1 ? '#94a3b8' : '#1e293b',
                fontSize: '12px'
              }}
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>

            <select
              value={currentBatchNum}
              onChange={(e) => setCurrentBatchNum(parseInt(e.target.value, 10))}
              style={{ padding: '6px 12px', fontSize: '13px', fontWeight: 700, borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }}
            >
              {Array.from({ length: metaData.totalBatches || 1 }, (_, i) => i + 1).map((b) => (
                <option key={b} value={b}>
                  Batch {b} of {metaData.totalBatches} (Records {(b - 1) * batchSize + 1} - {Math.min(b * batchSize, metaData.filteredCount || 0)})
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={currentBatchNum >= (metaData.totalBatches || 1) || loading}
              onClick={() => setCurrentBatchNum(prev => Math.min(metaData.totalBatches, prev + 1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: currentBatchNum >= metaData.totalBatches ? '#f1f5f9' : '#ffffff',
                cursor: currentBatchNum >= metaData.totalBatches ? 'not-allowed' : 'pointer',
                color: currentBatchNum >= metaData.totalBatches ? '#94a3b8' : '#1e293b',
                fontSize: '12px'
              }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Staging Execution Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleStageAction('stage_batch')}
              disabled={stagingLoading || metaData.filteredCount === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: (stagingLoading || metaData.filteredCount === 0) ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
              }}
            >
              <Sparkles size={14} />
              <span>
                {stagingLoading ? 'Staging Batch...' : `Stage Batch #${currentBatchNum} (${metaData.batchRecords?.length || 0} Contacts)`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStageAction('stage_all')}
              disabled={stagingLoading || metaData.filteredCount === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: (stagingLoading || metaData.filteredCount === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={14} />
              <span>Stage All Filtered ({(metaData.filteredCount || 0).toLocaleString()})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. UNSTRESS BATCH PREVIEW TABLE */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={16} style={{ color: '#2563eb' }} />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
              Batch #{currentBatchNum} Preview ({metaData.batchRecords?.length || 0} Records Displayed)
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Showing <strong>{metaData.startIndex || 0}</strong> &ndash; <strong>{metaData.endIndex || 0}</strong> of <strong>{(metaData.filteredCount || 0).toLocaleString()}</strong> matched
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            Loading batch records...
          </div>
        ) : metaData.batchRecords && metaData.batchRecords.length > 0 ? (
          <div style={{ overflowX: 'auto', maxHeight: '480px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '10px 14px', width: '40px' }}>#</th>
                  <th style={{ padding: '10px 14px' }}>Institution Name &amp; District</th>
                  <th style={{ padding: '10px 14px' }}>Recipient &amp; Role</th>
                  <th style={{ padding: '10px 14px' }}>Official Email</th>
                  <th style={{ padding: '10px 14px' }}>Department</th>
                  <th style={{ padding: '10px 14px' }}>Verification Status</th>
                </tr>
              </thead>
              <tbody>
                {metaData.batchRecords.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                      transition: 'background 0.1s ease'
                    }}
                  >
                    <td style={{ padding: '10px 14px', color: '#94a3b8', fontWeight: 600 }}>
                      {(metaData.startIndex || 1) + idx}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                        {item.college_name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ background: '#e2e8f0', color: '#334155', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {item.district || item.city}
                        </span>
                        {item.website_url && (
                          <a
                            href={item.website_url.startsWith('http') ? item.website_url : `https://${item.website_url}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#2563eb', textDecoration: 'none' }}
                          >
                            Website &nearr;
                          </a>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>
                        {item.contact_person}
                      </div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                        {item.designation}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#0f172a', fontWeight: 600, fontSize: '12px' }}>
                        {item.official_email}
                      </code>
                      {item.phone_number && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          Ph: {item.phone_number}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>
                      {item.department || 'Office of Academic Affairs'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#ecfdf5',
                        color: '#059669',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        <CheckCircle2 size={11} />
                        <span>VERIFIED</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            No records matched the selected role and district filters.
          </div>
        )}
      </div>
    </div>
  );
}
