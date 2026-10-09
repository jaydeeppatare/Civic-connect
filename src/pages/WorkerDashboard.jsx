import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { 
  HardHat, MapPin, Play, CheckCircle, Upload, 
  Camera, ArrowRight, Clock, AlertCircle, FileText, Lock, ThumbsUp
} from 'lucide-react';

const AFTER_REPAIR_SAMPLES = [
  { label: 'Cleaned & Swept Roadway', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80' },
  { label: 'Fresh Bitumen Asphalt Patch', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cleaned Storm Drain Culvert', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80' },
  { label: 'Park Path Cleared of Fallen Wood', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80' }
];

export function WorkerDashboard({ onSelectComplaint }) {
  const { complaints, roleStats, workerAcceptWork, workerStartWork, workerSubmitResolution, workerMarkResolved } = useComplaints();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('all');
  const [completeModalItem, setCompleteModalItem] = useState(null);

  // Completion Form
  const [resolutionDesc, setResolutionDesc] = useState('');
  const [afterImages, setAfterImages] = useState([AFTER_REPAIR_SAMPLES[0].url]);
  const [workerRemarks, setWorkerRemarks] = useState('');

  // NOTE: complaints is already strictly filtered to this worker by complaintService!
  // Worker A can NEVER see Worker B's assigned tasks
  const myAssignedTasks = complaints;

  const newTasks = myAssignedTasks.filter(c => c.status === 'ASSIGNED');
  const acceptedTasks = myAssignedTasks.filter(c => c.status === 'ACCEPTED');
  const inProgressTasks = myAssignedTasks.filter(c => c.status === 'IN PROGRESS');
  const submittedTasks = myAssignedTasks.filter(c => c.status === 'RESOLUTION SUBMITTED');
  const completedTasks = myAssignedTasks.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status));

  const handleAcceptTask = (complaint) => {
    workerAcceptWork(complaint.id);
  };

  const handleStartTask = (complaint) => {
    workerStartWork(complaint.id, {
      workerNotes: `Worker ${currentUser.name} (${currentUser.workerId}) arrived on location and commenced field operations.`
    });
  };

  const openCompleteModal = (complaint) => {
    setCompleteModalItem(complaint);
    setResolutionDesc('Defect rectified in compliance with municipal standard engineering protocols.');
    setWorkerRemarks('Site cleaned, warning cones removed, safe for public use.');
  };

  const handleSubmitCompletion = () => {
    if (!completeModalItem) return;
    if (!resolutionDesc.trim()) {
      alert('Please enter a description of the resolution work done.');
      return;
    }
    workerMarkResolved(completeModalItem.id, {
      description: resolutionDesc,
      afterImages: afterImages,
      workerNotes: workerRemarks
    });
    setCompleteModalItem(null);
  };

  const getFilteredTasks = () => {
    switch (activeTab) {
      case 'assigned': return newTasks;
      case 'accepted': return acceptedTasks;
      case 'in_progress': return inProgressTasks;
      case 'submitted': return submittedTasks;
      case 'completed': return completedTasks;
      default: return myAssignedTasks;
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header Banner */}
      <div style={{ background: '#0f172a', color: '#ffffff', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardHat size={30} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Municipal Field Crew Operations Board
              </span>
              <span style={{ fontSize: '0.72rem', background: '#1e293b', color: '#cbd5e1', padding: '1px 6px', borderRadius: '4px' }}>
                Roster: {currentUser.workerId || 'wrk-01'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800, margin: '2px 0' }}>
              {currentUser.name}
            </h1>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              {currentUser.designation || 'Field Technician'} | {currentUser.zone || 'Central Ward'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', background: 'rgba(255,255,255,0.08)', padding: '0.75rem 1.25rem', borderRadius: '10px' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>New Assigned</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>{newTasks.length}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Accepted</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#14b8a6' }}>{acceptedTasks.length}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>In Progress</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>{inProgressTasks.length}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Pending Audit</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#818cf8' }}>{submittedTasks.length}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Completed</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>{completedTasks.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: `My Work Orders (${myAssignedTasks.length})` },
          { id: 'assigned', label: `New Assigned (${newTasks.length})` },
          { id: 'accepted', label: `Accepted (${acceptedTasks.length})` },
          { id: 'in_progress', label: `Active In-Progress (${inProgressTasks.length})` },
          { id: 'submitted', label: `Submitted for Audit (${submittedTasks.length})` },
          { id: 'completed', label: `Finished & Closed (${completedTasks.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: '8px',
              background: activeTab === tab.id ? '#2563eb' : '#f1f5f9',
              color: activeTab === tab.id ? '#ffffff' : '#64748b'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      {myAssignedTasks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: '#64748b' }}>
          <HardHat size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
            No Work Orders Assigned to Your Personnel ID ({currentUser.workerId})
          </h3>
          <p style={{ fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto' }}>
            You are operating in strict field isolation. Only tasks directly dispatched to you by the Executive Engineer appear on your board.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {getFilteredTasks().map(task => (
            <div key={task.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="code-badge">{task.id}</span>
                <StatusBadge status={task.status} />
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                {task.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.82rem', color: '#475569', marginBottom: '0.85rem', background: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '8px' }}>
                <MapPin size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>{task.location.address}</strong>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{task.location.ward}</div>
                </div>
              </div>

              {/* Officer Instructions Banner */}
              {task.officerInstructions && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                    Officer Instructions:
                  </span>
                  <p style={{ fontSize: '0.82rem', color: '#78350f', margin: 0 }}>{task.officerInstructions}</p>
                </div>
              )}

              {/* Assigned By Officer */}
              {(task.assignedOfficerName || task.assignedOfficer) && (
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', 
                  fontSize: '0.78rem', color: '#475569', 
                  marginBottom: '0.85rem',
                  padding: '0.45rem 0.65rem',
                  background: '#f1f5f9',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}>
                  <span style={{ fontWeight: 700, color: '#64748b' }}>Assigned by:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>
                    {task.assignedOfficerName || task.assignedOfficer}
                  </span>
                </div>
              )}

              {/* Photo of Defect */}
              {task.images && task.images[0] && (
                <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.85rem', position: 'relative' }}>
                  <img src={task.images[0]} alt="Defect" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', top: '6px', right: '6px' }}>
                    <PriorityBadge priority={task.priority} />
                  </span>
                </div>
              )}

              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.4, flex: 1, marginBottom: '1.25rem' }}>
                {task.description}
              </p>

              {/* Worker Action Buttons - Status-specific */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', gap: '0.6rem' }}>
                {task.status === 'ASSIGNED' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAcceptTask(task)}
                    style={{ flex: 1 }}
                  >
                    <ThumbsUp size={16} />
                    <span>Accept Work</span>
                  </button>
                )}

                {task.status === 'ACCEPTED' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleStartTask(task)}
                    style={{ flex: 1, background: '#0284c7', borderColor: '#0284c7' }}
                  >
                    <Play size={16} />
                    <span>Start Work On Site</span>
                  </button>
                )}

                {task.status === 'IN PROGRESS' && (
                  <button
                    className="btn btn-success"
                    onClick={() => openCompleteModal(task)}
                    style={{ flex: 1 }}
                  >
                    <CheckCircle size={16} />
                    <span>Mark Work Finished</span>
                  </button>
                )}

                {task.status === 'RESOLUTION SUBMITTED' && (
                  <div style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', color: '#0369a1', fontWeight: 700, padding: '0.45rem', background: '#e0f2fe', borderRadius: '6px' }}>
                    ⏳ Under Executive Engineer Audit
                  </div>
                )}

                {['RESOLVED', 'CLOSED'].includes(task.status) && (
                  <div style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', color: '#059669', fontWeight: 700, padding: '0.45rem', background: '#ecfdf5', borderRadius: '6px' }}>
                    ✓ Work Verified & Accepted
                  </div>
                )}

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (onSelectComplaint) onSelectComplaint(task.id);
                  }}
                  title="Track Task"
                >
                  Inspect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MARK WORK FINISHED MODAL */}
      {completeModalItem && (
        <Modal
          isOpen={!!completeModalItem}
          onClose={() => setCompleteModalItem(null)}
          title={`Mark Work Finished: ${completeModalItem.id}`}
          maxWidth="640px"
        >
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
            <strong style={{ color: '#166534', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} /> Complete Work & Resolve Complaint
            </strong>
            <p style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '2px' }}>
              Provide resolution details. The citizen will be notified and asked to verify.
            </p>
          </div>

          {/* Complaint Summary */}
          <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <span className="code-badge">{completeModalItem.id}</span>
              <PriorityBadge priority={completeModalItem.priority} />
            </div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{completeModalItem.title}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{completeModalItem.location?.address}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Resolution Details (Work Done) <span className="req">*</span></label>
            <textarea
              className="form-textarea"
              rows={3}
              value={resolutionDesc}
              onChange={(e) => setResolutionDesc(e.target.value)}
              placeholder="Detail actions taken (e.g. Cleared 2 tons debris, resurfaced 15 sq meters asphalt)..."
            />
          </div>

          {/* Quick-Pick Verified After Photos */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Select After-Repair Photographic Proof <span className="req">*</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {AFTER_REPAIR_SAMPLES.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => setAfterImages([sample.url])}
                  style={{
                    border: afterImages.includes(sample.url) ? '2px solid #10b981' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px',
                    background: afterImages.includes(sample.url) ? '#f0fdf4' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <img src={sample.url} alt="Proof" style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>{sample.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Worker Remarks / Follow-up Notes</label>
            <input
              type="text"
              className="form-input"
              value={workerRemarks}
              onChange={(e) => setWorkerRemarks(e.target.value)}
              placeholder="e.g. Warning cones cleared, road tested."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setCompleteModalItem(null)}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={handleSubmitCompletion}>
              <CheckCircle size={16} />
              <span>Mark Work Finished & Resolve</span>
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
