import React from 'react';
import { useAuth, USER_ROLES } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { Shield, HardHat, User, UserCheck, RotateCcw } from 'lucide-react';

export function RoleSwitcher() {
  const { currentUser, switchRole } = useAuth();
  const { resetDemoData, roleStats } = useComplaints();

  const isCitizenA = currentUser.id === 'usr-cit-1';
  const isCitizenB = currentUser.id === 'usr-cit-2';
  const isOfficerRoads = currentUser.id === 'usr-off-1';
  const isOfficerSanitation = currentUser.id === 'usr-off-2';
  const isWorkerRoads = currentUser.id === 'usr-wrk-1';
  const isWorkerSanitation = currentUser.id === 'usr-wrk-2';
  const isAdmin = currentUser.id === 'usr-adm-1';

  return (
    <div className="role-quick-bar" style={{ gap: '0.4rem', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center' }}>
      <div className="role-bar-badge" style={{ gap: '0.5rem', whiteSpace: 'nowrap' }}>
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>DEMO PERSONA:</span>
        <strong style={{ color: '#ffffff', fontSize: '0.78rem' }}>
          {currentUser.name}
        </strong>
        <span style={{
          fontSize: '0.68rem',
          textTransform: 'uppercase',
          padding: '1px 6px',
          borderRadius: '4px',
          fontWeight: 700,
          background: currentUser.role === USER_ROLES.CITIZEN ? '#0284c7' : currentUser.role === USER_ROLES.OFFICER ? '#b45309' : currentUser.role === USER_ROLES.WORKER ? '#047857' : '#6d28d9',
          color: '#ffffff'
        }}>
          {currentUser.role} {currentUser.departmentName ? `• ${currentUser.departmentName.split(' ')[0]}` : ''}
        </span>
      </div>

      <div className="role-switcher-btn-group" style={{ gap: '0.35rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Switch Test Account:</span>

        {/* Citizen A */}
        <button
          className={`role-btn ${isCitizenA ? 'active' : ''}`}
          onClick={() => switchRole('citizen_a')}
          title="Citizen A (Aarav Patel) — Owns CMP-2026-001245 & CMP-2026-001248"
        >
          <User size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
          Citizen A (Aarav)
        </button>

        {/* Citizen B */}
        <button
          className={`role-btn ${isCitizenB ? 'active' : ''}`}
          onClick={() => switchRole('citizen_b')}
          title="Citizen B (Pooja Sharma) — Owns CMP-2026-001246 (Needs verification!) & CMP-2026-001247"
        >
          <User size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
          Citizen B (Pooja)
        </button>

        {/* Officer Roads */}
        <button
          className={`role-btn ${isOfficerRoads ? 'active' : ''}`}
          onClick={() => switchRole('officer_roads')}
          title="Officer (Eng. Rajesh Sharma) — Roads & Infrastructure Department"
        >
          <Shield size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
          Officer (Roads)
        </button>

        {/* Officer Sanitation */}
        <button
          className={`role-btn ${isOfficerSanitation ? 'active' : ''}`}
          onClick={() => switchRole('officer_sanitation')}
          title="Officer (Dr. Anita Roy) — Public Health & Sanitation Department"
        >
          <Shield size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
          Officer (Sanitation)
        </button>

        {/* Worker 01 Roads */}
        <button
          className={`role-btn ${isWorkerRoads ? 'active' : ''}`}
          onClick={() => switchRole('worker_roads')}
          title="Worker 01 (Ramesh Kumar) — Assigned to Pothole Task #CMP-2026-001245"
        >
          <HardHat size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
          Worker 01 (Roads)
        </button>

        {/* Worker 02 Sanitation */}
        <button
          className={`role-btn ${isWorkerSanitation ? 'active' : ''}`}
          onClick={() => switchRole('worker_sanitation')}
          title="Worker 02 (Santosh Yadav) — Assigned to Garbage Task #CMP-2026-001246"
        >
          <HardHat size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
          Worker 02 (Sanitation)
        </button>

        {/* Admin */}
        <button
          className={`role-btn ${isAdmin ? 'active' : ''}`}
          onClick={() => switchRole('admin')}
          title="Municipal Commissioner Admin — System overview, audit trails, and rosters"
        >
          <UserCheck size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: '-1px' }} />
          Admin
        </button>

        {/* Reset */}
        <button
          onClick={resetDemoData}
          style={{
            marginLeft: '4px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#94a3b8',
            padding: '2px 7px',
            fontSize: '0.7rem',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
          title="Reset database to original state"
        >
          <RotateCcw size={11} /> Reset Data
        </button>
      </div>
    </div>
  );
}
