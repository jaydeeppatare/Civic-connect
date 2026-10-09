import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../data/departments';
import { WORKERS } from '../data/workers';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { 
  ShieldCheck, Search, Filter, AlertTriangle, CheckCircle, 
  Clock, User, HardHat, Eye, MessageSquare, Send, XCircle, 
  RotateCcw, Lock, ThumbsUp, AlertCircle, UserPlus, RefreshCw
} from 'lucide-react';

export function OfficerDashboard({ onSelectComplaint }) {
  const { 
    complaints, roleStats, officerReviewComplaint, officerAssignWorker, 
    officerApproveResolution, escalateComplaint, addComplaintNote 
  } = useComplaints();
  const { currentUser } = useAuth();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Modal State
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [modalAction, setModalAction] = useState('review'); // 'review' | 'assign' | 'approve_resolution' | 'internal_note' | 'escalate'

  // Assign Worker Modal (dedicated)
  const [assignModalComplaint, setAssignModalComplaint] = useState(null);

  // Success banner
  const [successMessage, setSuccessMessage] = useState(null);

  // Action Form Inputs
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [workerInstructions, setWorkerInstructions] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [newPriority, setNewPriority] = useState('High');
  const [resolutionApprovalNote, setResolutionApprovalNote] = useState('');
  const [reworkFeedback, setReworkFeedback] = useState('');

  // Authorized workers for this officer's department
  const departmentWorkers = WORKERS.filter(
    w => !currentUser.departmentId || w.departmentId === currentUser.departmentId
  );

  // Filter complaints
  const filtered = complaints.filter(c => {
    const matchesSearch = searchTerm.trim() === '' ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || c.status.toUpperCase() === selectedStatus.toUpperCase();
    const matchesPriority = selectedPriority === 'all' || c.priority.toLowerCase() === selectedPriority.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openManageModal = (complaint, action = 'review') => {
    setActiveComplaint(complaint);
    setModalAction(action);
    setNewPriority(complaint.priority);
    setSelectedWorkerId(complaint.assignedWorkerId || (departmentWorkers[0]?.id || WORKERS[0].id));
    setWorkerInstructions(complaint.officerInstructions || '');
    setInternalNote('');
    setRejectReason('');
    setResolutionApprovalNote('Photo evidence reviewed and certified to municipal engineering specifications.');
    setReworkFeedback('');
  };

  // Open dedicated Assign Work modal
  const openAssignModal = (complaint) => {
    setAssignModalComplaint(complaint);
    setSelectedWorkerId(complaint.assignedWorkerId || (departmentWorkers[0]?.id || WORKERS[0].id));
    setWorkerInstructions(complaint.officerInstructions || '');
    setInternalNote('');
  };

  const handleApproveReview = () => {
    if (!activeComplaint) return;
    officerReviewComplaint(activeComplaint.id, {
      accepted: true,
      priority: newPriority,
      departmentId: activeComplaint.departmentId,
      internalNote: internalNote || 'Site verified by Executive Engineer. Work order issued.'
    });
    setActiveComplaint(null);
  };

  const handleRejectComplaint = () => {
    if (!activeComplaint) return;
    if (!rejectReason.trim()) {
      alert('Please provide an official justification for rejecting this grievance.');
      return;
    }
    officerReviewComplaint(activeComplaint.id, {
      accepted: false,
      rejectionReason: rejectReason,
      internalNote: `REJECTED: ${rejectReason}`
    });
    setActiveComplaint(null);
  };

  // Handle Assign Worker from DEDICATED assign modal
  const handleAssignWorkerFromModal = () => {
    if (!assignModalComplaint || !selectedWorkerId) return;
    const worker = WORKERS.find(w => w.id === selectedWorkerId);
    const isReassign = !!assignModalComplaint.assignedWorkerId;
    
    officerAssignWorker(assignModalComplaint.id, {
      workerId: selectedWorkerId,
      instructions: workerInstructions,
      internalNote: internalNote || `Worker ${isReassign ? 'reassigned' : 'assigned'} by ${currentUser.name}`
    });
    
    setAssignModalComplaint(null);
    setSuccessMessage(`✓ ${isReassign ? 'Worker reassigned' : 'Work assigned'} successfully — ${worker?.name} dispatched to ${assignModalComplaint.id}`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Handle Assign Worker from MANAGE modal (legacy tab)
  const handleAssignWorker = () => {
    if (!activeComplaint || !selectedWorkerId) return;
    const worker = WORKERS.find(w => w.id === selectedWorkerId);
    const isReassign = !!activeComplaint.assignedWorkerId;

    officerAssignWorker(activeComplaint.id, {
      workerId: selectedWorkerId,
      instructions: workerInstructions,
      internalNote: internalNote || `Worker ${isReassign ? 'reassigned' : 'assigned'} by ${currentUser.name}`
    });
    
    setActiveComplaint(null);
    setSuccessMessage(`✓ ${isReassign ? 'Worker reassigned' : 'Work assigned'} successfully — ${worker?.name} dispatched to ${activeComplaint.id}`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleApproveWorkerResolution = () => {
    if (!activeComplaint) return;
    officerApproveResolution(activeComplaint.id, {
      approved: true,
      feedback: resolutionApprovalNote,
      internalNote: `OFFICER APPROVED RESOLUTION: ${resolutionApprovalNote}`
    });
    setActiveComplaint(null);
  };

  const handleRejectWorkerResolution = () => {
    if (!activeComplaint) return;
    if (!reworkFeedback.trim()) {
      alert('Please enter instructions for the field worker on what needs rework.');
      return;
    }
    officerApproveResolution(activeComplaint.id, {
      approved: false,
      feedback: reworkFeedback,
      internalNote: `REWORK ORDERED: ${reworkFeedback}`
    });
    setActiveComplaint(null);
  };

  const handleSaveInternalNote = (e) => {
    e.preventDefault();
    if (!activeComplaint || !internalNote.trim()) return;
    addComplaintNote(activeComplaint.id, {
      message: internalNote.trim(),
      isInternal: true
    });
    setInternalNote('');
    setActiveComplaint(null);
  };

  return (
    <div className="container-wide" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Officer Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Official Municipal Command Deck
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {currentUser.departmentName || 'General Administration'}
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            {currentUser.name}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            {currentUser.designation || 'Executive Engineer'} — Managing complaints authorized for your department.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Department Workload</span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{complaints.length} Assigned Records</div>
          </div>
        </div>
      </div>

      {/* Success Message Banner */}
      {successMessage && (
        <div style={{
          background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
          border: '2px solid #86efac',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'fadeIn 0.3s ease',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.12)'
        }}>
          <CheckCircle size={22} color="#10b981" />
          <span style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage(null)} 
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.1rem' }}
          >
            ×
          </button>
        </div>
      )}

      {/* KPI Stats Bar - AUTHORIZED DEPARTMENT COMPLAINTS ONLY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Department Total</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>{roleStats.total}</div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Under Your Jurisdiction</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600, textTransform: 'uppercase' }}>New / To Review</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', margin: '0.25rem 0' }}>{roleStats.newSubmitted}</div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Awaiting Validation</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600, textTransform: 'uppercase' }}>In Progress</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', margin: '0.25rem 0' }}>{roleStats.inProgress}</div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Workers on Site</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7', background: roleStats.needsOfficerApproval > 0 ? '#f0f9ff' : '#ffffff' }}>
          <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>Resolution Submitted</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', margin: '0.25rem 0' }}>{roleStats.needsOfficerApproval}</div>
          <span style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600 }}>Needs Officer Approval</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600, textTransform: 'uppercase' }}>Resolved / Closed</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', margin: '0.25rem 0' }}>{roleStats.resolved}</div>
          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Remediation Completed</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #e11d48' }}>
          <span style={{ fontSize: '0.75rem', color: '#9f1239', fontWeight: 600, textTransform: 'uppercase' }}>Reopened / Escalated</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e11d48', margin: '0.25rem 0' }}>{roleStats.reopenedOrEscalated}</div>
          <span style={{ fontSize: '0.72rem', color: '#e11d48', fontWeight: 600 }}>Urgent Attention</span>
        </div>
      </div>

      {/* Main Data Table Card */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem', height: '40px', fontSize: '0.88rem' }}
              placeholder="Search by ID, Citizen, Road..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
            >
              <option value="all">All Lifecycle Statuses</option>
              <option value="SUBMITTED">Submitted (New)</option>
              <option value="UNDER REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned to Crew</option>
              <option value="ACCEPTED">Work Accepted</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="RESOLUTION SUBMITTED">Resolution Submitted (Audit)</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REOPENED">Reopened by Citizen</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Master Officer Data Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Citizen</th>
                <th>Grievance Summary</th>
                <th>Location / Ward</th>
                <th>Priority</th>
                <th>Assigned Worker</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Official Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                    No municipal grievances currently in your department queue matching filter.
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

                    <td style={{ fontSize: '0.82rem' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{c.submittedBy.name}</strong>
                      <span style={{ color: '#64748b' }}>{c.submittedBy.phone}</span>
                    </td>

                    <td style={{ maxWidth: '240px' }}>
                      <span style={{ fontSize: '0.72rem', background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                        {c.categoryName}
                      </span>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.title}
                      </div>
                    </td>

                    <td style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '200px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.location.address}</div>
                      <span style={{ fontSize: '0.72rem', color: '#2563eb' }}>{c.location.ward}</span>
                    </td>

                    <td>
                      <PriorityBadge priority={c.priority} />
                    </td>

                    <td style={{ fontSize: '0.8rem' }}>
                      {c.assignedWorker ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0f172a', fontWeight: 600 }}>
                            <HardHat size={14} color="#2563eb" />
                            <span>{c.assignedWorker.name}</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>
                            {c.assignedWorker.role}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#d97706', fontSize: '0.75rem', fontWeight: 600 }}>
                          Not Assigned
                        </span>
                      )}
                    </td>

                    <td>
                      <StatusBadge status={c.status} />
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {/* ASSIGN WORK button — shown when NO worker assigned */}
                        {!c.assignedWorkerId && !['RESOLVED', 'CLOSED', 'REJECTED'].includes(c.status) && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openAssignModal(c)}
                            style={{ 
                              padding: '0.35rem 0.65rem', 
                              fontSize: '0.78rem',
                              background: '#2563eb',
                              borderColor: '#2563eb',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Assign a field worker to this complaint"
                          >
                            <UserPlus size={13} />
                            <span>Assign Work</span>
                          </button>
                        )}

                        {/* REASSIGN WORKER button — shown when worker IS assigned and status is not terminal */}
                        {c.assignedWorkerId && !['RESOLVED', 'CLOSED', 'REJECTED'].includes(c.status) && (
                          <button
                            className="btn btn-sm"
                            onClick={() => openAssignModal(c)}
                            style={{ 
                              padding: '0.35rem 0.65rem', 
                              fontSize: '0.78rem',
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              color: '#0369a1',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 600,
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            title="Reassign to a different worker"
                          >
                            <RefreshCw size={12} />
                            <span>Reassign</span>
                          </button>
                        )}

                        {/* AUDIT EVIDENCE button — shown when resolution submitted */}
                        {c.status === 'RESOLUTION SUBMITTED' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openManageModal(c, 'approve_resolution')}
                            style={{ background: '#0284c7', borderColor: '#0284c7', fontSize: '0.78rem' }}
                            title="Audit Worker Evidence"
                          >
                            Audit Evidence
                          </button>
                        )}

                        {/* MANAGE button */}
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => openManageModal(c, 'review')}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          title="Manage Complaint"
                        >
                          Manage
                        </button>

                        {/* VIEW button */}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            if (onSelectComplaint) onSelectComplaint(c.id);
                          }}
                          style={{ padding: '0.35rem 0.55rem' }}
                          title="View Full Live File"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* DEDICATED ASSIGN WORK MODAL               */}
      {/* ========================================= */}
      {assignModalComplaint && (
        <Modal
          isOpen={!!assignModalComplaint}
          onClose={() => setAssignModalComplaint(null)}
          title={assignModalComplaint.assignedWorkerId ? `Reassign Worker: ${assignModalComplaint.id}` : `Assign Work: ${assignModalComplaint.id}`}
          maxWidth="600px"
        >
          {/* Complaint Summary Header */}
          <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="code-badge">{assignModalComplaint.id}</span>
                <StatusBadge status={assignModalComplaint.status} />
                <PriorityBadge priority={assignModalComplaint.priority} />
              </div>
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
              {assignModalComplaint.categoryName}
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '0.5rem' }}>
              {assignModalComplaint.description?.substring(0, 150)}{assignModalComplaint.description?.length > 150 ? '...' : ''}
            </p>
            <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>📍</span> {assignModalComplaint.location?.address}
            </div>
          </div>

          {/* Currently Assigned Worker (if reassigning) */}
          {assignModalComplaint.assignedWorker && (
            <div style={{ 
              background: '#fffbeb', 
              border: '1px solid #fde68a', 
              borderRadius: '8px', 
              padding: '0.75rem 1rem', 
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <HardHat size={18} color="#b45309" />
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', display: 'block' }}>
                  Currently Assigned Worker
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#78350f' }}>
                  {assignModalComplaint.assignedWorker.name} — {assignModalComplaint.assignedWorker.role}
                </span>
              </div>
            </div>
          )}

          {/* Worker Selection */}
          <div className="form-group">
            <label className="form-label">
              {assignModalComplaint.assignedWorkerId ? 'Select New Worker' : 'Select Field Worker / Crew Lead'}
            </label>
            {departmentWorkers.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#ef4444', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <AlertCircle size={20} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                <strong>No eligible workers available for this complaint.</strong>
                <p style={{ fontSize: '0.82rem', color: '#dc2626', marginTop: '0.25rem' }}>
                  No workers are registered for the {currentUser.departmentName || 'department'}.
                </p>
              </div>
            ) : (
              <select
                className="form-select"
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                style={{ fontSize: '0.92rem' }}
              >
                {departmentWorkers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} — {w.role} ({w.assignedZone}) {w.status === 'Available' ? '✅ Available' : `⚠️ ${w.status}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Worker Detail Card */}
          {selectedWorkerId && (() => {
            const sw = WORKERS.find(w => w.id === selectedWorkerId);
            if (!sw) return null;
            return (
              <div style={{ 
                background: '#f0f9ff', 
                border: '1px solid #bae6fd', 
                borderRadius: '10px', 
                padding: '0.85rem 1rem', 
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}>
                <img 
                  src={sw.avatar} 
                  alt={sw.name} 
                  style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #bae6fd' }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#0c4a6e', fontSize: '0.92rem' }}>{sw.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#0369a1' }}>{sw.role} • {sw.assignedZone}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    Active: {sw.activeTasksCount} tasks | Completed: {sw.completedTasksCount} tasks | {sw.status}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Worker Instructions */}
          <div className="form-group">
            <label className="form-label">Worker Instructions (Visible in Worker Portal)</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Deploy bitumen roller. Ensure road cleared before evening traffic..."
              value={workerInstructions}
              onChange={(e) => setWorkerInstructions(e.target.value)}
            />
          </div>

          {/* Internal Note */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} color="#64748b" /> Internal Note (Officer only, not visible to citizen)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Optional internal note..."
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <button className="btn btn-secondary" onClick={() => setAssignModalComplaint(null)}>
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleAssignWorkerFromModal}
              disabled={departmentWorkers.length === 0}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px',
                opacity: departmentWorkers.length === 0 ? 0.5 : 1
              }}
            >
              <HardHat size={16} />
              <span>{assignModalComplaint.assignedWorkerId ? 'Reassign Worker' : 'Assign Work'}</span>
            </button>
          </div>
        </Modal>
      )}

      {/* ========================================= */}
      {/* OFFICER MANAGEMENT MODAL (Review/Audit)   */}
      {/* ========================================= */}
      {activeComplaint && (
        <Modal
          isOpen={!!activeComplaint}
          onClose={() => setActiveComplaint(null)}
          title={`Officer Action: ${activeComplaint.id}`}
          maxWidth="720px"
        >
          {/* Grievance Quick Header */}
          <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="code-badge">{activeComplaint.id}</span>
                <StatusBadge status={activeComplaint.status} />
                <PriorityBadge priority={activeComplaint.priority} />
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Citizen: <strong>{activeComplaint.submittedBy.name}</strong> ({activeComplaint.submittedBy.phone})
              </span>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
              {activeComplaint.title}
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              {activeComplaint.description}
            </p>

            {/* Current Assignment Status */}
            {activeComplaint.assignedWorker && (
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 0.75rem', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                <HardHat size={15} color="#2563eb" />
                <span style={{ fontSize: '0.82rem', color: '#1e40af', fontWeight: 600 }}>
                  Assigned: {activeComplaint.assignedWorker.name} — {activeComplaint.assignedWorker.role}
                </span>
              </div>
            )}

            {/* Photos */}
            {activeComplaint.images && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                {activeComplaint.images.map((img, i) => (
                  <img key={i} src={img} alt="Evidence" style={{ width: '80px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
                ))}
              </div>
            )}
          </div>

          {/* Action Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'review', label: '1. Review & Priority' },
              { id: 'assign', label: '2. Dispatch Worker' },
              { id: 'approve_resolution', label: '3. Audit Worker Evidence' },
              { id: 'internal_note', label: '4. Internal Note (Confidential)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setModalAction(tab.id)}
                style={{
                  padding: '0.65rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: modalAction === tab.id ? '#2563eb' : '#64748b',
                  borderBottom: modalAction === tab.id ? '2px solid #2563eb' : 'none',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: REVIEW & PRIORITY */}
          {modalAction === 'review' && (
            <div>
              <div className="form-group">
                <label className="form-label">Set Priority Level</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: newPriority === p ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: newPriority === p ? '#eff6ff' : '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color: newPriority === p ? '#1d4ed8' : '#334155'
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Internal Officer Assessment (Confidential — Stored in Internal Notes)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Verified road cave-in hazard. Crew dispatch authorized."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                />
              </div>

              <button
                className="btn btn-success"
                onClick={handleApproveReview}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <CheckCircle size={16} />
                <span>Approve Review & Authorize Remediation</span>
              </button>

              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
                <label className="form-label" style={{ color: '#ef4444' }}>Reject Grievance (With Justification)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Reason for rejection (e.g. Private residential boundary)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ marginBottom: '0.75rem' }}
                />
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleRejectComplaint}
                >
                  <XCircle size={14} />
                  <span>Reject Grievance</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DISPATCH WORKER */}
          {modalAction === 'assign' && (
            <div>
              {/* Current Assignment Banner */}
              {activeComplaint.assignedWorker && (
                <div style={{ 
                  background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', 
                  padding: '0.75rem 1rem', marginBottom: '1.25rem',
                  display: 'flex', alignItems: 'center', gap: '0.75rem'
                }}>
                  <HardHat size={16} color="#b45309" />
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Currently Assigned</span>
                    <div style={{ fontWeight: 600, color: '#78350f', fontSize: '0.88rem' }}>
                      {activeComplaint.assignedWorker.name} — {activeComplaint.assignedWorker.role}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Select Field Worker / Crew Lead</label>
                <select
                  className="form-select"
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                >
                  {departmentWorkers.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.role} ({w.assignedZone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Specific Worker Instructions (Appears in Worker Portal)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Deploy bitumen roller. Ensure road cleared before evening traffic..."
                  value={workerInstructions}
                  onChange={(e) => setWorkerInstructions(e.target.value)}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleAssignWorker}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <HardHat size={16} />
                <span>{activeComplaint.assignedWorkerId ? 'Reassign Worker' : 'Issue Dispatch Order to Worker'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: AUDIT WORKER EVIDENCE */}
          {modalAction === 'approve_resolution' && (
            <div>
              {activeComplaint.resolutionDetails ? (
                <div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                      Worker Resolution Evidence:
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#15803d', marginBottom: '0.75rem' }}>
                      "{activeComplaint.resolutionDetails.description}"
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444' }}>ORIGINAL DEFECT (BEFORE)</span>
                        <img src={activeComplaint.images[0]} alt="Before" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px', marginTop: '3px' }} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981' }}>REPAIRED SITE (AFTER PROOF)</span>
                        <img src={activeComplaint.resolutionDetails.afterImages[0]} alt="After" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px', marginTop: '3px' }} />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Officer Audit Certification Note</label>
                    <input
                      type="text"
                      className="form-input"
                      value={resolutionApprovalNote}
                      onChange={(e) => setResolutionApprovalNote(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                      className="btn btn-success"
                      onClick={handleApproveWorkerResolution}
                      style={{ flex: 1 }}
                    >
                      <CheckCircle size={16} />
                      <span>Approve Resolution & Route to Citizen</span>
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
                    <label className="form-label" style={{ color: '#ef4444' }}>Order Rework (Reject Worker Evidence)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Specify deficiency requiring rework..."
                      value={reworkFeedback}
                      onChange={(e) => setReworkFeedback(e.target.value)}
                      style={{ marginBottom: '0.75rem' }}
                    />
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleRejectWorkerResolution}
                    >
                      <span>Return Task to Worker for Rework</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  ⏳ Worker has not submitted completion evidence yet. Status: <strong>{activeComplaint.status}</strong>.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INTERNAL NOTE */}
          {modalAction === 'internal_note' && (
            <form onSubmit={handleSaveInternalNote}>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={13} /> This note will be recorded in Internal Notes only and will NEVER be shown to the citizen.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Confidential Municipal Engineering Note</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="e.g. Contractor penalty recorded under Section 14(a)..."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                <span>Save to Internal Municipal Record</span>
              </button>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
