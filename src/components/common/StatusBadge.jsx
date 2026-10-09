import React from 'react';

export function StatusBadge({ status }) {
  const getNormalized = (s) => {
    if (!s) return 'submitted';
    return s.toLowerCase().replace(/\s+/g, '_');
  };

  const getLabel = (s) => {
    if (!s) return 'Submitted';
    switch (s.toUpperCase()) {
      case 'SUBMITTED': return 'Submitted';
      case 'UNDER REVIEW': return 'Under Review';
      case 'ASSIGNED': return 'Assigned to Crew';
      case 'ACCEPTED': return 'Work Accepted by Crew';
      case 'IN PROGRESS': return 'In Progress';
      case 'RESOLUTION SUBMITTED': return 'Resolution Submitted';
      case 'RESOLVED': return 'Resolved (Needs Citizen Verification)';
      case 'CLOSED': return 'Closed & Verified';
      case 'REOPENED': return 'Reopened by Citizen';
      case 'REJECTED': return 'Rejected';
      case 'ESCALATED': return 'Escalated to Commissioner';
      default: return s;
    }
  };

  const norm = getNormalized(status);

  return (
    <span className={`badge badge-${norm}`} title={`Status: ${status}`}>
      <span className="badge-dot" />
      <span>{getLabel(status)}</span>
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const p = (priority || 'Medium').toLowerCase();
  
  return (
    <span className={`badge priority-${p}`} style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {priority || 'Medium'}
    </span>
  );
}
