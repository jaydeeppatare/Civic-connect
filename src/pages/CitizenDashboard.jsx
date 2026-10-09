import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { 
  PlusCircle, Search, Filter, AlertCircle, CheckCircle2, 
  Clock, MapPin, Eye, ArrowRight, Shield, ThumbsUp, Lock
} from 'lucide-react';

export function CitizenDashboard({ setActivePage, onSelectComplaint }) {
  const { complaints, roleStats } = useComplaints();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // NOTE: complaints is already filtered to logged-in citizen by ComplaintContext / complaintService!
  // It only contains complaints where complaint.citizenId === currentUser.id
  const citizenComplaints = complaints;

  // Filter complaints
  const filtered = citizenComplaints.filter(c => {
    const matchesTab = activeTab === 'all' 
      ? true 
      : activeTab === 'pending'
      ? ['SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'ACCEPTED'].includes(c.status)
      : activeTab === 'in_progress'
      ? c.status === 'IN PROGRESS'
      : activeTab === 'resolved'
      ? ['RESOLVED', 'RESOLUTION SUBMITTED'].includes(c.status)
      : activeTab === 'closed'
      ? c.status === 'CLOSED'
      : activeTab === 'reopened'
      ? c.status === 'REOPENED'
      : true;

    const matchesSearch = searchTerm.trim() === '' || 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Personal Citizen Portal
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} color="#10b981" /> Private & Confidential to {currentUser?.name || 'Citizen'}
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            Welcome, {currentUser?.name || 'Citizen'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Manage and track your registered municipal complaints, view field updates, and verify completed repairs.
          </p>
        </div>

        <button 
          className="btn btn-primary btn-lg"
          onClick={() => setActivePage('report')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <PlusCircle size={18} />
          <span>Lodge New Grievance</span>
        </button>
      </div>

      {/* ACTION REQUIRED: CITIZEN VERIFICATION BANNER */}
      {roleStats.needsVerification && roleStats.needsVerification.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
          border: '2px solid #86efac',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ThumbsUp size={22} />
            </div>
            <div>
              <strong style={{ fontSize: '1rem', color: '#065f46' }}>
                Action Required: Remediation Completed for {roleStats.needsVerification[0].id}!
              </strong>
              <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '2px' }}>
                Municipal crew has finished work on "<strong>{roleStats.needsVerification[0].title}</strong>". Please inspect the photo evidence and confirm satisfaction.
              </p>
            </div>
          </div>

          <button
            className="btn btn-success btn-sm"
            onClick={() => {
              if (onSelectComplaint) onSelectComplaint(roleStats.needsVerification[0].id);
              setActivePage('track');
            }}
            style={{ fontWeight: 700 }}
          >
            Review Evidence & Verify →
          </button>
        </div>
      )}

      {/* Summary KPI Cards - CALCULATED FROM LOGGED-IN CITIZEN'S COMPLAINTS ONLY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>My Total Complaints</span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.3rem 0' }}>{roleStats.total}</div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Lodged by {currentUser?.name ? currentUser.name.split(' ')[0] : 'Citizen'}</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 600, textTransform: 'uppercase' }}>Pending / In Review</span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706', margin: '0.3rem 0' }}>{roleStats.pending}</div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Queued for Engineer</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, textTransform: 'uppercase' }}>In Progress</span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2563eb', margin: '0.3rem 0' }}>{roleStats.inProgress}</div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Field Crew Active</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, textTransform: 'uppercase' }}>Resolved</span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981', margin: '0.3rem 0' }}>{roleStats.resolved}</div>
          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Needs Your Verification</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #64748b' }}>
          <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>Closed & Verified</span>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#475569', margin: '0.3rem 0' }}>{roleStats.closed}</div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Archived</span>
        </div>
      </div>

      {/* Complaints List & Table */}
      <div className="card" style={{ padding: '1.75rem' }}>
        {/* Controls: Search & Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', padding: '4px', borderRadius: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All My Issues (${citizenComplaints.length})` },
              { id: 'pending', label: 'Pending / Assigned' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'resolved', label: 'Resolved (To Verify)' },
              { id: 'closed', label: 'Closed' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: activeTab === tab.id ? '#ffffff' : 'transparent',
                  color: activeTab === tab.id ? '#0f172a' : '#64748b',
                  boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.2rem', paddingRight: '0.8rem', fontSize: '0.85rem', height: '38px' }}
              placeholder="Search my issues by ID, Road..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
          </div>
        </div>

        {/* Data Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Category</th>
                <th>Grievance Summary</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Department</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                    No complaints found under this filter for your account.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <span className="code-badge">{c.id}</span>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                        {new Date(c.createdAt).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>
                        {c.categoryName}
                      </span>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.description}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                      <div>{c.location.address}</div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{c.location.ward}</span>
                    </td>
                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                      {/* Resolution details shown for RESOLVED or CLOSED complaints */}
                      {['RESOLVED', 'CLOSED'].includes(c.status) && c.resolutionDetails && (
                        <div style={{ 
                          marginTop: '0.5rem', 
                          padding: '0.45rem 0.6rem', 
                          background: '#f0fdf4', 
                          borderRadius: '6px', 
                          border: '1px solid #bbf7d0',
                          fontSize: '0.75rem',
                          color: '#166534',
                          lineHeight: 1.4
                        }}>
                          <div style={{ fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🟢 Resolution:
                          </div>
                          <div style={{ color: '#15803d' }}>
                            {c.resolutionDetails.description?.substring(0, 100)}{c.resolutionDetails.description?.length > 100 ? '...' : ''}
                          </div>
                          {c.resolutionDetails.completedAt && (
                            <div style={{ fontSize: '0.68rem', color: '#047857', marginTop: '3px', fontWeight: 600 }}>
                              Resolved: {c.resolutionDetails.completedAt}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#334155' }}>
                      {c.departmentName}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          if (onSelectComplaint) onSelectComplaint(c.id);
                          setActivePage('track');
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={13} />
                        <span>Track</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
