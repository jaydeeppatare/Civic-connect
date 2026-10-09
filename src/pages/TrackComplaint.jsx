import React, { useState, useEffect } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth, USER_ROLES } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { TimelineTracker } from '../components/tracking/TimelineTracker';
import { LocationViewer } from '../components/map/LocationViewer';
import { AccessDenied } from '../components/common/AccessDenied';
import { 
  Search, MapPin, Calendar, Clock, User, Phone, 
  CheckCircle, AlertTriangle, Printer, MessageSquare, 
  Send, ThumbsUp, ThumbsDown, Lock, Shield, Eye
} from 'lucide-react';

export function TrackComplaint({ initialId, onSelectComplaint, onBackToDashboard }) {
  const { getAuthorizedComplaintById, citizenVerifyResolution, addComplaintNote, complaints } = useComplaints();
  const { currentUser } = useAuth();

  // Pick initial ID: if provided, use it; otherwise use the first authorized complaint of the user, or default
  const [searchId, setSearchId] = useState(() => {
    if (initialId) return initialId;
    if (complaints && complaints.length > 0) return complaints[0].id;
    return 'CMP-2026-001245';
  });

  const [complaintState, setComplaintState] = useState(() => {
    const idToLookup = initialId || (complaints && complaints.length > 0 ? complaints[0].id : 'CMP-2026-001245');
    return getAuthorizedComplaintById(idToLookup);
  });

  const [newUpdateNote, setNewUpdateNote] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (initialId) {
      setSearchId(initialId);
      const res = getAuthorizedComplaintById(initialId);
      setComplaintState(res);
    }
  }, [initialId, currentUser]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) return;
    const res = getAuthorizedComplaintById(searchId.trim());
    setComplaintState(res);
  };

  const handlePickTicket = (id) => {
    setSearchId(id);
    const res = getAuthorizedComplaintById(id);
    setComplaintState(res);
  };

  const handleVerifyYes = () => {
    if (!complaintState?.complaint) return;
    citizenVerifyResolution(complaintState.complaint.id, {
      satisfied: true,
      rating,
      feedback: verificationFeedback || 'Citizen inspected and confirmed complete satisfaction with municipal remediation.'
    });
    setTimeout(() => {
      setComplaintState(getAuthorizedComplaintById(complaintState.complaint.id));
    }, 100);
  };

  const handleVerifyNo = () => {
    if (!complaintState?.complaint) return;
    if (!verificationFeedback.trim()) {
      alert('Please provide a brief explanation of why the issue still persists.');
      return;
    }
    citizenVerifyResolution(complaintState.complaint.id, {
      satisfied: false,
      feedback: verificationFeedback
    });
    setShowRejectForm(false);
    setTimeout(() => {
      setComplaintState(getAuthorizedComplaintById(complaintState.complaint.id));
    }, 100);
  };

  const handleAddUpdate = (e) => {
    e.preventDefault();
    if (!newUpdateNote.trim() || !complaintState?.complaint) return;

    addComplaintNote(complaintState.complaint.id, {
      message: `${currentUser.name} (${currentUser.role}): ${newUpdateNote.trim()}`,
      isInternal: false
    });
    setNewUpdateNote('');
    setTimeout(() => {
      setComplaintState(getAuthorizedComplaintById(complaintState.complaint.id));
    }, 100);
  };

  // CHECK 1: IF ACCESS DENIED (403 FORBIDDEN - e.g. Citizen A trying to track Citizen B's complaint)
  if (complaintState?.error && complaintState.error.status === 403) {
    return (
      <AccessDenied
        title={complaintState.error.title}
        message={complaintState.error.message}
        attemptedResource={searchId}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  // CHECK 2: IF NOT FOUND (404)
  if (complaintState?.error && complaintState.error.status === 404) {
    return (
      <div className="container-narrow" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <AlertTriangle size={42} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            {complaintState.error.title}
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{complaintState.error.message}</p>
          <button className="btn btn-secondary" onClick={() => { setSearchId(complaints[0]?.id || 'CMP-2026-001245'); handleSearch(); }}>
            Reset to My Grievances
          </button>
        </div>
      </div>
    );
  }

  const selectedComplaint = complaintState?.complaint;
  const isResolvedPendingVerification = selectedComplaint?.status === 'RESOLVED' && !selectedComplaint?.verification;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Search Header */}
      <div style={{ maxWidth: '780px', margin: '0 auto 2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '0.4rem' }}>
          <Shield size={16} color="#2563eb" />
          <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Secure Municipal Grievance Tracking
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Track Grievance Resolution
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Real-time lifecycle inspection. Access restricted strictly to the grievance owner and assigned municipal authorities.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.75rem', height: '48px', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}
              placeholder="e.g. CMP-2026-001245"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
            <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
            Track Ticket
          </button>
        </form>

        {/* Quick Pick Ticket Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <span style={{ color: '#64748b' }}>Authorized Tickets for {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}:</span>
          {complaints.map(c => (
            <button
              key={c.id}
              onClick={() => handlePickTicket(c.id)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                padding: '3px 8px',
                borderRadius: '6px',
                background: selectedComplaint?.id === c.id ? '#2563eb' : '#f1f5f9',
                color: selectedComplaint?.id === c.id ? '#ffffff' : '#334155',
                border: '1px solid #cbd5e1',
                cursor: 'pointer'
              }}
            >
              {c.id} ({c.status})
            </button>
          ))}

          {/* Special Test Case Button for evaluating 403 Forbidden */}
          {currentUser?.role === USER_ROLES.CITIZEN && currentUser?.id === 'usr-cit-1' && (
            <button
              onClick={() => handlePickTicket('CMP-2026-001246')}
              style={{
                fontSize: '0.72rem',
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px dashed #ef4444',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Test Test Case 2: Citizen A attempts to open Citizen B's complaint"
            >
              🔒 Test 403 Denied: CMP-2026-001246
            </button>
          )}

          {currentUser?.role === USER_ROLES.CITIZEN && currentUser?.id === 'usr-cit-2' && (
            <button
              onClick={() => handlePickTicket('CMP-2026-001245')}
              style={{
                fontSize: '0.72rem',
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px dashed #ef4444',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Test Test Case 2: Citizen B attempts to open Citizen A's complaint"
            >
              🔒 Test 403 Denied: CMP-2026-001245
            </button>
          )}
        </div>
      </div>

      {selectedComplaint ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Complaint Details & Verification */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* CITIZEN VERIFICATION BANNER IF RESOLVED */}
            {isResolvedPendingVerification && (
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                border: '2px solid #86efac',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065f46' }}>
                      Work Verified by Municipal Department!
                    </h3>
                    <p style={{ color: '#047857', fontSize: '0.9rem', marginTop: '2px' }}>
                      Field supervisor completed repairs and the Executive Engineer approved photographic evidence. Please verify on site.
                    </p>
                  </div>
                </div>

                {/* Resolution Before / After preview */}
                {selectedComplaint.resolutionDetails && (
                  <div style={{ background: 'white', borderRadius: '10px', padding: '1rem', border: '1px solid #bbf7d0', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#065f46', marginBottom: '0.4rem' }}>
                      Resolution Summary:
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.75rem' }}>
                      "{selectedComplaint.resolutionDetails.description}"
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444' }}>ORIGINAL DEFECT (BEFORE)</span>
                        <img src={selectedComplaint.images[0]} alt="Before" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px', marginTop: '3px' }} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981' }}>REPAIRED SITE (AFTER PROOF)</span>
                        <img src={selectedComplaint.resolutionDetails.afterImages[0]} alt="After" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px', marginTop: '3px' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Citizen Verification Buttons */}
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', textAlign: 'center' }}>
                    Was your issue actually resolved to your satisfaction?
                  </div>

                  {!showRejectForm ? (
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                      <button
                        onClick={handleVerifyYes}
                        className="btn btn-success"
                        style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
                      >
                        <ThumbsUp size={18} />
                        <span>Yes, Issue Resolved! (Close Ticket)</span>
                      </button>

                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="btn btn-secondary"
                        style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      >
                        <ThumbsDown size={18} />
                        <span>No, Issue Still Exists</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                          Please tell the Municipal Officer what is still defective:
                        </label>
                        <textarea
                          rows={3}
                          className="form-textarea"
                          placeholder="e.g. Debris was partially left behind or road surface is still uneven..."
                          value={verificationFeedback}
                          onChange={(e) => setVerificationFeedback(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowRejectForm(false)}>
                          Cancel
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={handleVerifyNo}>
                          Reopen & Return to Officer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main Grievance Details Card */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="code-badge" style={{ fontSize: '1.05rem', padding: '0.3rem 0.75rem' }}>
                      {selectedComplaint.id}
                    </span>
                    <StatusBadge status={selectedComplaint.status} />
                    <PriorityBadge priority={selectedComplaint.priority} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '0.6rem' }}>
                    {selectedComplaint.title}
                  </h2>
                </div>

                <button 
                  onClick={() => window.print()}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Printer size={15} />
                  <span>Print Receipt</span>
                </button>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                  Grievance Description
                </h4>
                <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Location Map Preview */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
                  Reported Location Map
                </h4>
                <LocationViewer
                  lat={selectedComplaint.location?.lat || selectedComplaint.lat}
                  lng={selectedComplaint.location?.lng || selectedComplaint.lng}
                  address={selectedComplaint.location?.address || selectedComplaint.address}
                  title={selectedComplaint.title}
                  showNavigate={currentUser?.role === USER_ROLES.WORKER || currentUser?.role === USER_ROLES.OFFICER}
                />
              </div>

              {/* Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Location & Ward</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{selectedComplaint.location?.address || selectedComplaint.address}</div>
                  <div style={{ fontSize: '0.78rem', color: '#2563eb' }}>{selectedComplaint.location?.ward || selectedComplaint.ward}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Assigned Department</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{selectedComplaint.departmentName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Supervising Officer: {selectedComplaint.assignedOfficer}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Submitted Date</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                    {new Date(selectedComplaint.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    SLA: {new Date(selectedComplaint.slaDeadline).toLocaleDateString('en-GB')}
                  </div>
                </div>
              </div>

              {/* Photos Gallery */}
              {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
                    Photographic Proof
                  </h4>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {selectedComplaint.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                        <img src={img} alt="Evidence" style={{ width: '120px', height: '90px', objectFit: 'cover' }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Official Updates Thread */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="#2563eb" />
                <span>Citizen Communications & Status Updates</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {selectedComplaint.publicUpdates && selectedComplaint.publicUpdates.map(u => (
                  <div key={u.id} style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontSize: '0.72rem', color: '#64748b' }}>
                      <strong>Official Municipal Notice</strong>
                      <span>{u.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#334155' }}>{u.message}</p>
                  </div>
                ))}
              </div>

              {/* Internal Notes are shown ONLY if the viewer is an Officer or Admin! */}
              {selectedComplaint.internalNotes && selectedComplaint.internalNotes.length > 0 && (
                <div style={{ borderTop: '2px dashed #f59e0b', paddingTop: '1.25rem', marginTop: '1rem', background: '#fffbeb', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <Lock size={14} />
                    <span>Internal Municipal Notes (Strictly Confidential — Officers/Admin Only)</span>
                  </div>
                  {selectedComplaint.internalNotes.map(n => (
                    <div key={n.id} style={{ fontSize: '0.82rem', color: '#78350f', marginBottom: '4px' }}>
                      <strong>{n.author} ({n.role})</strong> [{n.timestamp}]: {n.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Redressal Lifecycle
                </h3>
                <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                  Single Source of Truth
                </span>
              </div>

              <TimelineTracker timeline={selectedComplaint.timeline} currentStatus={selectedComplaint.status} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
