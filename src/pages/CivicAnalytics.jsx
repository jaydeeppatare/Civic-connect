import React, { useState, useMemo } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth, USER_ROLES } from '../context/AuthContext';
import { CATEGORIES } from '../data/categories';
import { DEPARTMENTS } from '../data/departments';
import { AccessDenied } from '../components/common/AccessDenied';
import {
  BarChart3, TrendingUp, PieChart, Clock, AlertTriangle,
  Download, Calendar, CheckCircle2, XCircle, RotateCcw,
  ArrowUp, ArrowDown, MapPin, Filter, FileText, Shield,
  Users, Building, Layers, Activity, Zap
} from 'lucide-react';

/**
 * Admin-Only Civic Analytics Dashboard
 * Comprehensive municipal analytics with real-time data from complaint records.
 * ACCESS: ADMIN role only. Enforced at both routing and data level.
 */
export function CivicAnalytics({ onBackToDashboard }) {
  const { allComplaintsRaw: complaints, auditLogs } = useComplaints();
  const { currentUser } = useAuth();

  const [dateFilter, setDateFilter] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  // ═══════════════════════════════════════════
  // RBAC ENFORCEMENT — Admin Only
  // ═══════════════════════════════════════════
  if (currentUser?.role !== USER_ROLES.ADMIN) {
    return (
      <AccessDenied
        title="403 — Civic Analytics Access Restricted"
        message={`You are authenticated as "${currentUser?.name || 'Guest'}" with role [${currentUser?.role || 'None'}]. The Civic Analytics Intelligence Center contains sensitive municipal data and is restricted to authorized administrators.`}
        attemptedResource="/civic-analytics"
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  // ═══════════════════════════════════════════
  // DATE FILTERING
  // ═══════════════════════════════════════════
  const filteredComplaints = useMemo(() => {
    if (dateFilter === 'all') return complaints;

    const now = new Date();
    let fromDate;

    switch (dateFilter) {
      case 'today':
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7days':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6months':
        fromDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        fromDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        fromDate = customFrom ? new Date(customFrom) : new Date(0);
        break;
      default:
        return complaints;
    }

    const toDate = dateFilter === 'custom' && customTo ? new Date(customTo + 'T23:59:59') : now;

    return complaints.filter(c => {
      const d = new Date(c.createdAt);
      return d >= fromDate && d <= toDate;
    });
  }, [complaints, dateFilter, customFrom, customTo]);

  // ═══════════════════════════════════════════
  // COMPUTED STATISTICS
  // ═══════════════════════════════════════════
  const stats = useMemo(() => {
    const fc = filteredComplaints;
    const total = fc.length;
    const submitted = fc.filter(c => c.status === 'SUBMITTED').length;
    const underReview = fc.filter(c => c.status === 'UNDER REVIEW').length;
    const assigned = fc.filter(c => c.status === 'ASSIGNED').length;
    const inProgress = fc.filter(c => c.status === 'IN PROGRESS').length;
    const resolutionSubmitted = fc.filter(c => c.status === 'RESOLUTION SUBMITTED').length;
    const resolved = fc.filter(c => c.status === 'RESOLVED').length;
    const closed = fc.filter(c => c.status === 'CLOSED').length;
    const reopened = fc.filter(c => c.status === 'REOPENED').length;
    const rejected = fc.filter(c => c.status === 'REJECTED').length;
    const escalated = fc.filter(c => c.status === 'ESCALATED').length;

    const pending = submitted + underReview + assigned;
    const active = inProgress + resolutionSubmitted;
    const completedTotal = resolved + closed;
    const resolutionRate = total > 0 ? Math.round((completedTotal / total) * 100) : 0;

    // Overdue: complaints where SLA deadline has passed and not resolved/closed
    const now = new Date();
    const overdue = fc.filter(c => {
      if (['RESOLVED', 'CLOSED', 'REJECTED'].includes(c.status)) return false;
      if (!c.slaDeadline) return false;
      return new Date(c.slaDeadline) < now;
    }).length;

    // Average resolution time (from created to when status became RESOLVED/CLOSED)
    const resolvedItems = fc.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status) && c.createdAt && c.updatedAt);
    let avgResolutionHours = 0;
    let fastestHours = Infinity;
    if (resolvedItems.length > 0) {
      const totalHours = resolvedItems.reduce((sum, c) => {
        const hours = (new Date(c.updatedAt) - new Date(c.createdAt)) / (1000 * 60 * 60);
        if (hours < fastestHours) fastestHours = hours;
        return sum + hours;
      }, 0);
      avgResolutionHours = totalHours / resolvedItems.length;
    }
    if (fastestHours === Infinity) fastestHours = 0;

    return {
      total, submitted, underReview, assigned, inProgress, resolutionSubmitted,
      resolved, closed, reopened, rejected, escalated, pending, active,
      completedTotal, resolutionRate, overdue, avgResolutionHours, fastestHours
    };
  }, [filteredComplaints]);

  // Category Stats
  const categoryStats = useMemo(() => {
    return CATEGORIES.map(cat => {
      const catComplaints = filteredComplaints.filter(c => c.category === cat.id);
      const resolvedCount = catComplaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
      return {
        ...cat,
        total: catComplaints.length,
        resolved: resolvedCount,
        pending: catComplaints.filter(c => ['SUBMITTED', 'UNDER REVIEW', 'ASSIGNED'].includes(c.status)).length,
        inProgress: catComplaints.filter(c => ['IN PROGRESS', 'RESOLUTION SUBMITTED'].includes(c.status)).length,
        rate: catComplaints.length > 0 ? Math.round((resolvedCount / catComplaints.length) * 100) : 0
      };
    }).sort((a, b) => b.total - a.total);
  }, [filteredComplaints]);

  // Department Stats
  const departmentStats = useMemo(() => {
    return DEPARTMENTS.map(dept => {
      const deptComplaints = filteredComplaints.filter(c => c.departmentId === dept.id);
      const now = new Date();
      const resolvedCount = deptComplaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
      const overdueCount = deptComplaints.filter(c => {
        if (['RESOLVED', 'CLOSED', 'REJECTED'].includes(c.status)) return false;
        return c.slaDeadline && new Date(c.slaDeadline) < now;
      }).length;

      return {
        ...dept,
        total: deptComplaints.length,
        resolved: resolvedCount,
        pending: deptComplaints.filter(c => ['SUBMITTED', 'UNDER REVIEW', 'ASSIGNED'].includes(c.status)).length,
        inProgress: deptComplaints.filter(c => ['IN PROGRESS', 'RESOLUTION SUBMITTED'].includes(c.status)).length,
        overdue: overdueCount,
        rate: deptComplaints.length > 0 ? Math.round((resolvedCount / deptComplaints.length) * 100) : 0
      };
    }).sort((a, b) => b.total - a.total);
  }, [filteredComplaints]);

  // Priority Stats
  const priorityStats = useMemo(() => {
    const priorities = ['Low', 'Medium', 'High', 'Urgent'];
    return priorities.map(p => ({
      label: p,
      count: filteredComplaints.filter(c => c.priority === p).length,
      color: p === 'Urgent' ? '#dc2626' : p === 'High' ? '#f59e0b' : p === 'Medium' ? '#3b82f6' : '#10b981'
    }));
  }, [filteredComplaints]);

  // Status distribution for chart
  const statusDistribution = useMemo(() => ([
    { label: 'Submitted', count: stats.submitted, color: '#f59e0b' },
    { label: 'Under Review', count: stats.underReview, color: '#d97706' },
    { label: 'Assigned', count: stats.assigned, color: '#6366f1' },
    { label: 'In Progress', count: stats.inProgress, color: '#3b82f6' },
    { label: 'Resolution Submitted', count: stats.resolutionSubmitted, color: '#0284c7' },
    { label: 'Resolved', count: stats.resolved, color: '#10b981' },
    { label: 'Closed', count: stats.closed, color: '#64748b' },
    { label: 'Reopened', count: stats.reopened, color: '#dc2626' },
    { label: 'Rejected', count: stats.rejected, color: '#ef4444' },
    { label: 'Escalated', count: stats.escalated, color: '#e11d48' }
  ]), [stats]);

  // Area-wise analytics
  const areaStats = useMemo(() => {
    const areas = {};
    filteredComplaints.forEach(c => {
      const ward = c.location?.ward || c.ward || 'Unknown Ward';
      if (!areas[ward]) {
        areas[ward] = { ward, total: 0, resolved: 0, pending: 0, complaints: [] };
      }
      areas[ward].total++;
      areas[ward].complaints.push(c);
      if (['RESOLVED', 'CLOSED'].includes(c.status)) areas[ward].resolved++;
      else areas[ward].pending++;
    });
    return Object.values(areas).sort((a, b) => b.total - a.total);
  }, [filteredComplaints]);

  const maxCatCount = Math.max(...categoryStats.map(c => c.total), 1);
  const maxStatusCount = Math.max(...statusDistribution.map(s => s.count), 1);

  // ═══════════════════════════════════════════
  // CSV EXPORT
  // ═══════════════════════════════════════════
  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Status', 'Priority', 'Department', 'Address', 'Latitude', 'Longitude', 'Created At', 'Updated At'];
    const rows = filteredComplaints.map(c => [
      c.id,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      c.categoryName || c.category,
      c.status,
      c.priority,
      c.departmentName || '',
      `"${(c.location?.address || c.address || '').replace(/"/g, '""')}"`,
      c.location?.lat || c.lat || '',
      c.location?.lng || c.lng || '',
      c.createdAt || '',
      c.updatedAt || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `civic_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Summary Report PDF (via print)
  const exportPDF = () => {
    window.print();
  };

  // ═══════════════════════════════════════════
  // SECTION NAV
  // ═══════════════════════════════════════════
  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'status', label: 'Status Breakdown', icon: PieChart },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'areas', label: 'Area Analysis', icon: MapPin },
    { id: 'resolution', label: 'Resolution Metrics', icon: Clock },
    { id: 'priority', label: 'Priority Analysis', icon: AlertTriangle }
  ];

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', background: '#fce7f3', color: '#be185d', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              🔒 Admin-Only Intelligence
            </span>
            <span style={{ fontSize: '0.78rem', background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              <Activity size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> Live Data
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            Civic Analytics Intelligence Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Comprehensive municipal grievance analytics. All metrics are computed in real-time from {complaints.length} complaint records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={exportCSV} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Download size={14} /> Export CSV
          </button>
          <button onClick={exportPDF} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={14} /> Print Report
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Calendar size={16} color="#64748b" />
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Time Period:</span>
        {[
          { id: 'all', label: 'All Time' },
          { id: 'today', label: 'Today' },
          { id: '7days', label: '7 Days' },
          { id: '30days', label: '30 Days' },
          { id: '3months', label: '3 Months' },
          { id: '6months', label: '6 Months' },
          { id: 'year', label: 'This Year' },
          { id: 'custom', label: 'Custom' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setDateFilter(f.id)}
            style={{
              padding: '0.3rem 0.7rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: '6px',
              background: dateFilter === f.id ? '#2563eb' : '#f1f5f9',
              color: dateFilter === f.id ? '#ffffff' : '#64748b',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {f.label}
          </button>
        ))}

        {dateFilter === 'custom' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="form-input" style={{ height: '32px', fontSize: '0.78rem', width: '140px' }} />
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>to</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="form-input" style={{ height: '32px', fontSize: '0.78rem', width: '140px' }} />
          </div>
        )}

        <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: 'auto' }}>
          Showing {filteredComplaints.length} of {complaints.length} records
        </span>
      </div>

      {/* Section Navigation */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.6rem', overflowX: 'auto' }}>
        {sections.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.4rem 0.85rem',
                fontWeight: 700,
                fontSize: '0.8rem',
                borderRadius: '8px',
                background: activeSection === s.id ? '#0f172a' : 'transparent',
                color: activeSection === s.id ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                border: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════ */}
      {/* SECTION: OVERVIEW */}
      {/* ══════════════════════════════════════ */}
      {activeSection === 'overview' && (
        <>
          {/* Summary KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Complaints', value: stats.total, color: '#0f172a', icon: BarChart3 },
              { label: 'Pending', value: stats.pending, color: '#f59e0b', icon: Clock },
              { label: 'In Progress', value: stats.active, color: '#3b82f6', icon: Activity },
              { label: 'Resolved', value: stats.resolved, color: '#10b981', icon: CheckCircle2 },
              { label: 'Closed & Verified', value: stats.closed, color: '#64748b', icon: Shield },
              { label: 'Reopened', value: stats.reopened, color: '#dc2626', icon: RotateCcw },
              { label: 'Escalated', value: stats.escalated, color: '#e11d48', icon: AlertTriangle },
              { label: 'Overdue', value: stats.overdue, color: '#ef4444', icon: XCircle }
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${card.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{card.label}</span>
                    <Icon size={16} color={card.color} />
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: card.color }}>{card.value}</div>
                </div>
              );
            })}
          </div>

          {/* Resolution Rate + Avg Time Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' }}>
              <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Resolution Rate</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#16a34a', margin: '0.25rem 0' }}>{stats.resolutionRate}%</div>
              <div style={{ fontSize: '0.78rem', color: '#166534' }}>{stats.completedTotal} of {stats.total} resolved or closed</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Avg Resolution Time</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#2563eb', margin: '0.25rem 0' }}>{stats.avgResolutionHours.toFixed(1)}<span style={{ fontSize: '1.2rem' }}>h</span></div>
              <div style={{ fontSize: '0.78rem', color: '#1e40af' }}>Fastest: {stats.fastestHours.toFixed(1)} hours</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #fef3c7, #fffbeb)' }}>
              <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 700, textTransform: 'uppercase' }}>Pending Resolution Rate</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#d97706', margin: '0.25rem 0' }}>{stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%</div>
              <div style={{ fontSize: '0.78rem', color: '#92400e' }}>{stats.pending} complaints awaiting action</div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════ */}
      {/* SECTION: STATUS BREAKDOWN */}
      {/* ══════════════════════════════════════ */}
      {activeSection === 'status' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
            Complaint Status Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {statusDistribution.map(s => {
              const pct = stats.total > 0 ? Math.round((s.count / stats.total) * 100) : 0;
              return (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{s.label}</span>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      {s.count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.max((s.count / maxStatusCount) * 100, s.count > 0 ? 5 : 0)}%`,
                      background: s.color,
                      borderRadius: '5px',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* SECTION: CATEGORIES */}
      {/* ══════════════════════════════════════ */}
      {activeSection === 'categories' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
            Complaints by Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categoryStats.map(cat => {
              const pct = stats.total > 0 ? Math.round((cat.total / stats.total) * 100) : 0;
              return (
                <div key={cat.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{cat.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '8px' }}>SLA: {cat.slaHours}h</span>
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: cat.color }}>{cat.total}</span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ height: '100%', width: `${(cat.total / maxCatCount) * 100}%`, background: cat.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>Pending: <strong style={{ color: '#d97706' }}>{cat.pending}</strong></span>
                    <span>In Progress: <strong style={{ color: '#2563eb' }}>{cat.inProgress}</strong></span>
                    <span>Resolved: <strong style={{ color: '#10b981' }}>{cat.resolved}</strong></span>
                    <span>Resolution: <strong style={{ color: cat.rate >= 80 ? '#16a34a' : '#d97706' }}>{cat.rate}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* SECTION: DEPARTMENTS */}
      {/* ══════════════════════════════════════ */}
      {activeSection === 'departments' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
            Department-wise Performance Scorecard
          </h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total</th>
                  <th>Pending</th>
                  <th>In Progress</th>
                  <th>Resolved</th>
                  <th>Overdue</th>
                  <th>Resolution %</th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map(d => (
                  <tr key={d.id}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{d.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{d.code} · {d.headOfficer}</div>
                    </td>
                    <td><strong>{d.total}</strong></td>
                    <td><span style={{ color: '#d97706', fontWeight: 700 }}>{d.pending}</span></td>
                    <td><span style={{ color: '#2563eb', fontWeight: 700 }}>{d.inProgress}</span></td>
                    <td><span style={{ color: '#10b981', fontWeight: 700 }}>{d.resolved}</span></td>
                    <td><span style={{ color: d.overdue > 0 ? '#ef4444' : '#94a3b8', fontWeight: 700 }}>{d.overdue}</span></td>
                    <td>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: d.rate >= 80 ? '#dcfce7' : d.rate >= 50 ? '#fef9c3' : '#fee2e2',
                        color: d.rate >= 80 ? '#166534' : d.rate >= 50 ? '#854d0e' : '#991b1b'
                      }}>{d.rate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* SECTION: AREA ANALYSIS */}
      {/* ══════════════════════════════════════ */}
      {activeSection === 'areas' && (
        <div>
          <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
              Area-Wise Complaint Distribution
            </h3>
            {areaStats.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No area data available.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {areaStats.map((area, i) => {
                  const maxAreaCount = Math.max(...areaStats.map(a => a.total), 1);
                  return (
                    <div key={i} style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} color="#2563eb" />
                          <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{area.ward}</strong>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{area.total}</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                        <div style={{ height: '100%', width: `${(area.total / maxAreaCount) * 100}%`, background: 'linear-gradient(90deg, #3b82f6, #2563eb)', borderRadius: '3px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.72rem', color: '#64748b' }}>
                        <span>Pending: <strong style={{ color: '#d97706' }}>{area.pending}</strong></span>
                        <span>Resolved: <strong style={{ color: '#10b981' }}>{area.resolved}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Complaint Locations Map */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Complaint Hotspot Map (Admin View)
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
              All {filteredComplaints.length} complaint locations plotted. Clusters indicate civic problem hotspots.
            </p>
            <AdminComplaintMap complaints={filteredComplaints} />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* SECTION: RESOLUTION METRICS */}
      {/* ══════════════════════════════════════ */}
      {activeSection === 'resolution' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[
            { label: 'Average Resolution Time', value: `${stats.avgResolutionHours.toFixed(1)} hrs`, color: '#2563eb', sub: 'Time from submission to resolution' },
            { label: 'Fastest Resolution', value: `${stats.fastestHours.toFixed(1)} hrs`, color: '#10b981', sub: 'Quickest complaint turnaround' },
            { label: 'Overall Resolution Rate', value: `${stats.resolutionRate}%`, color: '#16a34a', sub: `${stats.completedTotal} resolved out of ${stats.total}` },
            { label: 'Pending Resolution Rate', value: `${stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%`, color: '#d97706', sub: `${stats.pending} complaints awaiting action` },
            { label: 'Overdue Complaints', value: stats.overdue, color: '#ef4444', sub: 'Past SLA deadline and unresolved' },
            { label: 'Reopened Complaints', value: stats.reopened, color: '#dc2626', sub: 'Citizen reported unresolved after closure' },
            { label: 'Escalated to Commissioner', value: stats.escalated, color: '#e11d48', sub: 'Requires urgent administrative intervention' },
            { label: 'Rejected Complaints', value: stats.rejected, color: '#94a3b8', sub: 'Did not meet validation criteria' }
          ].map((m, i) => (
            <div key={i} className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${m.color}` }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{m.label}</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: m.color, margin: '0.25rem 0' }}>{m.value}</div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.sub}</span>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* SECTION: PRIORITY ANALYSIS */}
      {/* ══════════════════════════════════════ */}
      {activeSection === 'priority' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
            Complaint Priority Distribution
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {priorityStats.map(p => (
              <div key={p.label} className="card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: `4px solid ${p.color}` }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: p.color }}>{p.count}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>{p.label}</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  {stats.total > 0 ? Math.round((p.count / stats.total) * 100) : 0}% of total
                </div>
              </div>
            ))}
          </div>

          {/* Priority bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', justifyContent: 'center', height: '200px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
            {priorityStats.map(p => {
              const maxP = Math.max(...priorityStats.map(x => x.count), 1);
              const h = (p.count / maxP) * 170;
              return (
                <div key={p.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: p.color }}>{p.count}</span>
                  <div style={{ width: '48px', height: `${Math.max(h, 4)}px`, background: p.color, borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>{p.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Admin Complaint Heatmap using Leaflet (available without Google Maps API key).
 * Shows all complaint locations as colored markers.
 */
function AdminComplaintMap({ complaints }) {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);

  React.useEffect(() => {
    if (!mapRef.current || typeof L === 'undefined') return;

    // Cleanup previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [18.5204, 73.8567],
      zoom: 11,
      scrollWheelZoom: true
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const bounds = L.latLngBounds([]);
    let validCount = 0;

    complaints.forEach(c => {
      const lat = c.location?.lat || c.lat;
      const lng = c.location?.lng || c.lng;
      if (!lat || !lng) return;

      const statusColors = {
        'SUBMITTED': '#f59e0b',
        'UNDER REVIEW': '#d97706',
        'ASSIGNED': '#6366f1',
        'IN PROGRESS': '#3b82f6',
        'RESOLUTION SUBMITTED': '#0284c7',
        'RESOLVED': '#10b981',
        'CLOSED': '#64748b',
        'REOPENED': '#dc2626',
        'ESCALATED': '#e11d48',
        'REJECTED': '#94a3b8'
      };
      const color = statusColors[c.status] || '#f59e0b';

      const icon = L.divIcon({
        className: 'analytics-pin',
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:system-ui;font-size:12px;min-width:160px;">
          <strong style="color:#0f172a;">${c.id}</strong><br/>
          <span style="color:${color};font-weight:700;">${c.status}</span><br/>
          <span style="color:#64748b;">${c.categoryName || c.category}</span><br/>
          <span style="color:#94a3b8;font-size:11px;">${c.location?.address || c.address || ''}</span>
        </div>
      `);

      bounds.extend([lat, lng]);
      validCount++;
    });

    if (validCount > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [complaints]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '400px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
  );
}

export default CivicAnalytics;
