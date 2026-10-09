import React from 'react';
import { useAuth, USER_ROLES } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock, UserCheck, AlertTriangle } from 'lucide-react';

export function AccessDenied({ 
  title = '403 — Access Denied', 
  message = 'You do not have permission to view or manage this municipal record.',
  attemptedResource = null,
  onBackToDashboard
}) {
  const { currentUser, switchRole } = useAuth();

  const getDashboardName = () => {
    switch (currentUser.role) {
      case USER_ROLES.OFFICER: return 'Officer Command Deck';
      case USER_ROLES.WORKER: return 'Worker Task Board';
      case USER_ROLES.ADMIN: return 'Admin Control Panel';
      default: return 'Citizen Dashboard';
    }
  };

  return (
    <div className="container-narrow" style={{ padding: '3.5rem 1.5rem 5rem' }}>
      <div className="card" style={{ 
        textAlign: 'center', 
        padding: '3.5rem 2rem', 
        border: '1.5px solid #fecdd3', 
        background: '#ffffff',
        boxShadow: '0 20px 25px -5px rgba(225, 29, 72, 0.08)' 
      }}>
        {/* Animated Shield Badge */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: '#ffe4e6',
          color: '#e11d48',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 0 0 8px #fff1f2'
        }}>
          <ShieldAlert size={38} />
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#fee2e2',
          color: '#b91c1c',
          padding: '3px 10px',
          borderRadius: '20px',
          fontSize: '0.78rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '1rem'
        }}>
          <Lock size={12} />
          Role-Based Access Control (RBAC) Enforcement
        </div>

        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
          {title}
        </h2>

        <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto 1.75rem' }}>
          {message}
        </p>

        {attemptedResource && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.75rem 1.25rem',
            display: 'inline-block',
            marginBottom: '2rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: '#64748b'
          }}>
            Attempted Resource: <strong style={{ color: '#0f172a' }}>{attemptedResource}</strong>
          </div>
        )}

        {/* Current Active Persona Info */}
        <div style={{
          background: '#f1f5f9',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          maxWidth: '480px',
          margin: '0 auto 2.5rem',
          textAlign: 'left',
          fontSize: '0.85rem'
        }}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            Current Authenticated Session:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{currentUser.name}</span>
            <span style={{ 
              textTransform: 'uppercase', 
              fontSize: '0.7rem', 
              padding: '2px 8px', 
              borderRadius: '4px',
              fontWeight: 700,
              background: '#e2e8f0',
              color: '#334155'
            }}>
              Role: {currentUser.role}
            </span>
          </div>
          {currentUser.departmentName && (
            <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '2px' }}>
              Department: {currentUser.departmentName}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={onBackToDashboard}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} />
            <span>Return to {getDashboardName()}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
