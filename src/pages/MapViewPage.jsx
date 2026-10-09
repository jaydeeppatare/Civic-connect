import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth, USER_ROLES } from '../context/AuthContext';
import { ComplaintMap } from '../components/map/ComplaintMap';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { 
  MapPin, Layers, Info, Shield, HardHat, User, 
  Building2, AlertTriangle, CheckCircle, Clock, 
  ArrowRight, Filter, ChevronRight, Eye
} from 'lucide-react';

export function MapViewPage({ onSelectComplaint }) {
  const { complaints: authorizedComplaints, allComplaintsRaw, roleStats, stats } = useComplaints();
  const { currentUser } = useAuth();
  const [selectedListTab, setSelectedListTab] = useState('all');

  // Role-Based Complaints List:
  // Admin sees allComplaintsRaw or authorizedComplaints (all)
  // Officer sees authorized department complaints
  // Worker sees authorized assigned jobs
  // Citizen sees ONLY their own reported complaints
  const complaints = authorizedComplaints || [];

  // Categorized counts for summary cards
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => ['SUBMITTED', 'UNDER REVIEW', 'ASSIGNED'].includes(c.status)).length;
  const inProgressCount = complaints.filter(c => ['IN PROGRESS', 'ACCEPTED'].includes(c.status)).length;
  const resolvedCount = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
  const escalatedCount = complaints.filter(c => ['ESCALATED', 'REOPENED'].includes(c.status)).length;

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* ═════════════════════════════════════════════════════ */}
      {/* 1. HEADER & ROLE-BASED ACCESS NOTICE */}
      {/* ═════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ 
              fontSize: '0.78rem', 
              background: currentUser?.role === USER_ROLES.ADMIN ? '#f5f3ff' : currentUser?.role === USER_ROLES.OFFICER ? '#fef3c7' : currentUser?.role === USER_ROLES.WORKER ? '#ecfdf5' : '#e0f2fe', 
              color: currentUser?.role === USER_ROLES.ADMIN ? '#6d28d9' : currentUser?.role === USER_ROLES.OFFICER ? '#b45309' : currentUser?.role === USER_ROLES.WORKER ? '#047857' : '#0369a1', 
              padding: '2px 8px', 
              borderRadius: '4px', 
              fontWeight: 700 
            }}>
              GIS Spatial Mapping
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Municipal Geographic Information System
            </span>
            <span style={{ 
              fontSize: '0.72rem', 
              color: '#10b981', 
              background: '#f0fdf4', 
              border: '1px solid #bbf7d0', 
              padding: '2px 7px', 
              borderRadius: '12px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <Shield size={11} />
              <span>RBAC Active ({currentUser?.role || 'CITIZEN'})</span>
            </span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0.2rem 0 0.35rem' }}>
            Complaint Map
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '780px', lineHeight: 1.5 }}>
            View reported civic issues by location. Click any complaint marker to inspect grievance evidence, dispatch timeline, and full tracking details.
          </p>
        </div>

        {/* Role Scope Info Callout */}
        <div style={{ 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '10px', 
          padding: '0.75rem 1rem', 
          fontSize: '0.8rem', 
          color: '#475569',
          maxWidth: '340px'
        }}>
          {currentUser?.role === USER_ROLES.CITIZEN && (
            <div>
              <strong style={{ color: '#0f172a' }}>🔒 Citizen Privacy Guard:</strong>
              <div style={{ marginTop: '2px', color: '#64748b' }}>
                Showing only grievances filed under your citizen account ({currentUser.name}).
              </div>
            </div>
          )}
          {currentUser?.role === USER_ROLES.OFFICER && (
            <div>
              <strong style={{ color: '#0f172a' }}>🏛️ Officer Jurisdiction:</strong>
              <div style={{ marginTop: '2px', color: '#64748b' }}>
                Showing grievances assigned to {currentUser.departmentName || 'your department'}.
              </div>
            </div>
          )}
          {currentUser?.role === USER_ROLES.WORKER && (
            <div>
              <strong style={{ color: '#0f172a' }}>👷 Worker Task Board:</strong>
              <div style={{ marginTop: '2px', color: '#64748b' }}>
                Showing work orders assigned to field technician {currentUser.name} ({currentUser.workerId}).
              </div>
            </div>
          )}
          {currentUser?.role === USER_ROLES.ADMIN && (
            <div>
              <strong style={{ color: '#0f172a' }}>🌐 Municipal Master Oversight:</strong>
              <div style={{ marginTop: '2px', color: '#64748b' }}>
                Full system-wide spatial visualization across all municipal wards and departments.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════ */}
      {/* 2. DYNAMIC SUMMARY METRIC CARDS ABOVE MAP */}
      {/* ═════════════════════════════════════════════════════ */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '1rem', 
        marginBottom: '1.75rem' 
      }}>
        {/* Total Visible */}
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Visible
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
            {totalCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Authorized Grievances</span>
        </div>

        {/* Pending Review */}
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending Review
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', margin: '0.2rem 0' }}>
            {pendingCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Submitted & Under Review</span>
        </div>

        {/* Active In Progress */}
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            In Progress
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', margin: '0.2rem 0' }}>
            {inProgressCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Active Field Remediation</span>
        </div>

        {/* Resolved & Verified */}
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Resolved
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', margin: '0.2rem 0' }}>
            {resolvedCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Rectified & Closed</span>
        </div>

        {/* Critical Escalations */}
        <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #e11d48' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Escalated
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e11d48', margin: '0.2rem 0' }}>
            {escalatedCount}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Urgent Commissioner Attention</span>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════ */}
      {/* 3. INTERACTIVE COMPLAINT MAP */}
      {/* ═════════════════════════════════════════════════════ */}
      <div style={{ height: '620px', width: '100%', marginBottom: '2.5rem' }}>
        <ComplaintMap 
          complaints={complaints} 
          onSelectComplaint={onSelectComplaint} 
          title="Complaint Map"
        />
      </div>

      {/* ═════════════════════════════════════════════════════ */}
      {/* 4. AUTHORIZED COMPLAINTS DIRECTORY TABLE / CARDS */}
      {/* ═════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#2563eb" />
              <span>Authorized Complaints List ({complaints.length})</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              Click any grievance below to view detailed tracking timeline or inspect its pin on the map.
            </p>
          </div>
        </div>

        {complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <MapPin size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>No complaint records found for current user.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1rem' }}>
            {complaints.map(complaint => (
              <div 
                key={complaint.id}
                onClick={() => {
                  if (onSelectComplaint) onSelectComplaint(complaint.id);
                }}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#93c5fd';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.78rem', color: '#1e40af', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                      {complaint.id}
                    </span>
                    <StatusBadge status={complaint.status} />
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem', lineHeight: 1.35 }}>
                    {complaint.title}
                  </h4>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '0.5rem' }}>
                    <MapPin size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{complaint.location.address || 'Municipal Ward Area'}</span>
                  </div>
                </div>

                <div style={{ 
                  borderTop: '1px solid #f1f5f9', 
                  paddingTop: '0.65rem', 
                  marginTop: '0.5rem',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between' 
                }}>
                  <PriorityBadge priority={complaint.priority} />
                  <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span>Track Issue</span>
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
