import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../data/departments';
import { WORKERS } from '../data/workers';
import { CATEGORIES } from '../data/categories';
import { 
  Building, Users, Shield, HardHat, Settings, Plus, 
  Trash2, Edit3, CheckCircle, Database, RefreshCw, Key, BarChart3
} from 'lucide-react';

export function AdminPanel({ setActivePage }) {
  const { complaints, resetDemoData, auditLogs } = useComplaints();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('departments');
  const [workersList, setWorkersList] = useState(WORKERS);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    phone: '',
    role: 'Paving & Drainage Crew',
    assignedZone: 'Zone 1 - Central Ward',
    departmentId: 'dept-roads'
  });

  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!newWorker.name || !newWorker.phone) {
      alert('Please enter worker name and mobile number.');
      return;
    }
    const created = {
      id: 'wrk-' + (workersList.length + 1),
      ...newWorker,
      status: 'Available',
      activeTasksCount: 0,
      completedTasksCount: 0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    setWorkersList([...workersList, created]);
    setShowAddWorkerModal(false);
    setNewWorker({
      name: '',
      phone: '',
      role: 'Paving & Drainage Crew',
      assignedZone: 'Zone 1 - Central Ward',
      departmentId: 'dept-roads'
    });
  };

  const handleDeleteWorker = (id) => {
    if (confirm('Are you sure you want to de-register this municipal worker?')) {
      setWorkersList(workersList.filter(w => w.id !== id));
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', background: '#f5f3ff', color: '#6d28d9', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Master Admin Control
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Municipal Corporation Governance</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            System Administration & Rosters
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Configure departments, manage field worker rosters, adjust SLA hours, and inspect security audit trails.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setActivePage('analytics')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0f172a', borderColor: '#0f172a' }}
          >
            <BarChart3 size={14} />
            <span>Civic Analytics Dashboard</span>
          </button>
          
          <button 
            className="btn btn-secondary btn-sm"
            onClick={resetDemoData}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        {[
          { id: 'departments', label: 'Municipal Departments', icon: Building },
          { id: 'workers', label: `Field Workers (${workersList.length})`, icon: HardHat },
          { id: 'categories', label: 'Categories & SLAs', icon: Settings },
          { id: 'audit', label: 'System Audit Logs', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 1.1rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                borderRadius: '8px',
                background: activeTab === tab.id ? '#2563eb' : '#f1f5f9',
                color: activeTab === tab.id ? '#ffffff' : '#64748b',
                cursor: 'pointer'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
            Active Municipal Corporation Departments
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {DEPARTMENTS.map(d => (
              <div key={d.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="code-badge">{d.code}</span>
                  <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    SLA: {d.slaCompliance}
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {d.name}
                </h4>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem' }}>
                  Lead: <strong>{d.headOfficer}</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Helpline: {d.contact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: WORKERS ROSTER */}
      {activeTab === 'workers' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Field Operations Personnel Roster
            </h3>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddWorkerModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} />
              <span>Register Field Worker</span>
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Mobile Phone</th>
                  <th>Designation / Specialization</th>
                  <th>Assigned Zone</th>
                  <th>Status</th>
                  <th>Tasks Completed</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workersList.map(w => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={w.avatar} alt={w.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                        <strong style={{ color: '#0f172a' }}>{w.name}</strong>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{w.phone}</td>
                    <td style={{ fontSize: '0.82rem', color: '#334155' }}>{w.role}</td>
                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{w.assignedZone}</td>
                    <td>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        background: w.status === 'Available' ? '#ecfdf5' : '#fffbeb',
                        color: w.status === 'Available' ? '#047857' : '#b45309'
                      }}>
                        {w.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{w.completedTasksCount}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteWorker(w.id)}
                        style={{ color: '#ef4444', padding: '4px', cursor: 'pointer' }}
                        title="Remove Worker"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Worker Modal */}
          {showAddWorkerModal && (
            <div className="modal-overlay" onClick={() => setShowAddWorkerModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                  <h3>Register New Municipal Field Worker</h3>
                  <button onClick={() => setShowAddWorkerModal(false)}>✕</button>
                </div>
                <form onSubmit={handleAddWorker} style={{ padding: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Anand Murthy"
                      value={newWorker.name}
                      onChange={e => setNewWorker({ ...newWorker, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="+91 98000 11223"
                      value={newWorker.phone}
                      onChange={e => setNewWorker({ ...newWorker, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role / Trade</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Electrical Lineman / Asphalt Paver"
                      value={newWorker.role}
                      onChange={e => setNewWorker({ ...newWorker, role: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assigned Ward Zone</label>
                    <select
                      className="form-select"
                      value={newWorker.assignedZone}
                      onChange={e => setNewWorker({ ...newWorker, assignedZone: e.target.value })}
                    >
                      <option value="Zone 1 - Central Ward">Zone 1 - Central Ward</option>
                      <option value="Zone 2 - North Ward">Zone 2 - North Ward</option>
                      <option value="Zone 3 - West Ward">Zone 3 - West Ward</option>
                      <option value="Zone 4 - South Ward">Zone 4 - South Ward</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                    Save Worker to Database
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CATEGORIES & SLA CONFIG */}
      {activeTab === 'categories' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
            Grievance Categories & SLA Citizen Charter
          </h3>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Target SLA Limit</th>
                  <th>Responsible Department</th>
                  <th>Citizen Charter Escalation Rule</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map(cat => (
                  <tr key={cat.id}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{cat.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cat.description}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#2563eb', fontFamily: 'var(--font-mono)' }}>
                        {cat.slaHours} Hours
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{cat.departmentName}</td>
                    <td style={{ fontSize: '0.78rem', color: '#475569' }}>
                      Auto-escalate to Commissioner Cell if unresolved in {cat.slaHours * 1.5}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                Municipal Grievance Audit Trail ({auditLogs?.length || 0} Events)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Immutable security log recording all state transitions, user roles, timestamps, and action descriptions.
              </p>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Live System Logging Active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
            {(!auditLogs || auditLogs.length === 0) ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No audit records logged yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="code-badge" style={{ fontSize: '0.75rem' }}>{log.complaintId}</span>
                      <strong style={{ color: '#0f172a' }}>{log.userName}</strong>
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        background: log.userRole === 'CITIZEN' ? '#e0f2fe' : log.userRole === 'OFFICER' ? '#fef3c7' : log.userRole === 'WORKER' ? '#dcfce7' : '#f5f3ff',
                        color: log.userRole === 'CITIZEN' ? '#0369a1' : log.userRole === 'OFFICER' ? '#b45309' : log.userRole === 'WORKER' ? '#166534' : '#6d28d9'
                      }}>
                        {log.userRole}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{log.timestamp}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>Action: {log.action}</span>
                    <span style={{ color: '#94a3b8' }}>•</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Status: <strong style={{ color: '#64748b' }}>{log.previousStatus}</strong> → <strong style={{ color: '#2563eb' }}>{log.newStatus}</strong>
                    </span>
                  </div>
                  {log.details && (
                    <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', background: '#ffffff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                      "{log.details}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
