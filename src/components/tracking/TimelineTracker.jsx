import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Circle, HardHat, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

export function TimelineTracker({ timeline, currentStatus }) {
  if (!timeline || !timeline.length) {
    return <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Timeline details being generated...</div>;
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '1.5rem', marginTop: '1rem' }}>
      {/* Vertical Track Line */}
      <div 
        style={{
          position: 'absolute',
          left: '27px',
          top: '16px',
          bottom: '24px',
          width: '2px',
          background: '#e2e8f0'
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {timeline.map((item, index) => {
          const isDone = item.completed;
          const isCurrent = item.current;

          let icon = <Circle size={14} color="#cbd5e1" />;
          let iconBg = '#f1f5f9';
          let borderColor = '#cbd5e1';

          if (isDone) {
            icon = <CheckCircle2 size={16} color="#ffffff" />;
            iconBg = '#10b981';
            borderColor = '#10b981';
          } else if (isCurrent) {
            icon = <Clock size={16} color="#ffffff" />;
            iconBg = '#2563eb';
            borderColor = '#2563eb';
          }

          return (
            <div 
              key={index} 
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.25rem',
                position: 'relative'
              }}
            >
              {/* Step Marker Circle */}
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${borderColor}`,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : 'none',
                  flexShrink: 0,
                  zIndex: 2,
                  marginTop: '2px',
                  transition: 'all 0.2s ease'
                }}
              >
                {icon}
              </div>

              {/* Step Content */}
              <div style={{
                flex: 1,
                background: isCurrent ? '#f8fafc' : 'transparent',
                padding: isCurrent ? '0.75rem 1rem' : '0',
                borderRadius: '8px',
                border: isCurrent ? '1px solid #e2e8f0' : 'none'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h4 style={{
                    fontSize: '0.95rem',
                    fontWeight: isCurrent || isDone ? 700 : 500,
                    color: isDone ? '#0f172a' : isCurrent ? '#1d4ed8' : '#94a3b8'
                  }}>
                    {item.title}
                  </h4>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: isCurrent ? '#2563eb' : '#64748b',
                    background: isCurrent ? '#eff6ff' : '#f1f5f9',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {item.timestamp}
                  </span>
                </div>

                {item.author && (
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    By: <strong style={{ color: '#334155' }}>{item.author}</strong>
                  </div>
                )}

                {item.note && (
                  <p style={{ fontSize: '0.85rem', color: isDone || isCurrent ? '#475569' : '#94a3b8', lineHeight: 1.5 }}>
                    {item.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
