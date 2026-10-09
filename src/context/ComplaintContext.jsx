import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_COMPLAINTS } from '../data/initialComplaints';
import { CATEGORIES } from '../data/categories';
import { DEPARTMENTS } from '../data/departments';
import { WORKERS } from '../data/workers';
import { useAuth, USER_ROLES } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { complaintService } from '../services/complaintService';
import confetti from 'canvas-confetti';

const ComplaintContext = createContext();

const INITIAL_AUDIT_LOGS = [
  {
    id: 'aud-001',
    timestamp: '2026-09-28 09:15 AM',
    userId: 'usr-cit-1',
    userName: 'Aarav Patel',
    userRole: 'CITIZEN',
    action: 'LODGE_COMPLAINT',
    complaintId: 'CMP-2026-001245',
    previousStatus: 'NONE',
    newStatus: 'SUBMITTED',
    details: 'Citizen lodged grievance for deep potholes on 4th Main Junction.'
  },
  {
    id: 'aud-002',
    timestamp: '2026-09-28 10:30 AM',
    userId: 'usr-off-1',
    userName: 'Eng. Rajesh Sharma',
    userRole: 'OFFICER',
    action: 'OFFICER_REVIEW_APPROVE',
    complaintId: 'CMP-2026-001245',
    previousStatus: 'SUBMITTED',
    newStatus: 'UNDER REVIEW',
    details: 'Validated site severity. Priority elevated to High.'
  },
  {
    id: 'aud-003',
    timestamp: '2026-09-28 11:45 AM',
    userId: 'usr-off-1',
    userName: 'Eng. Rajesh Sharma',
    userRole: 'OFFICER',
    action: 'ASSIGN_WORKER',
    complaintId: 'CMP-2026-001245',
    previousStatus: 'UNDER REVIEW',
    newStatus: 'ASSIGNED',
    details: 'Assigned to Worker #W101 (Ramesh Kumar - Paving Lead).'
  },
  {
    id: 'aud-004',
    timestamp: '2026-09-29 02:00 PM',
    userId: 'usr-wrk-1',
    userName: 'Ramesh Kumar',
    userRole: 'WORKER',
    action: 'START_WORK',
    complaintId: 'CMP-2026-001245',
    previousStatus: 'ASSIGNED',
    newStatus: 'IN PROGRESS',
    details: 'Field crew arrived with asphalt truck #KA-03-9081.'
  },
  {
    id: 'aud-005',
    timestamp: '2026-09-29 11:30 AM',
    userId: 'usr-wrk-2',
    userName: 'Santosh Yadav',
    userRole: 'WORKER',
    action: 'SUBMIT_RESOLUTION',
    complaintId: 'CMP-2026-001246',
    previousStatus: 'IN PROGRESS',
    newStatus: 'RESOLUTION SUBMITTED',
    details: 'Supervisor uploaded 2.4-ton garbage cleared photos.'
  },
  {
    id: 'aud-006',
    timestamp: '2026-09-29 12:00 PM',
    userId: 'usr-off-2',
    userName: 'Dr. Anita Roy',
    userRole: 'OFFICER',
    action: 'APPROVE_RESOLUTION',
    complaintId: 'CMP-2026-001246',
    previousStatus: 'RESOLUTION SUBMITTED',
    newStatus: 'RESOLVED',
    details: 'Officer approved remediation evidence. Routed to citizen Pooja Sharma for sign-off.'
  }
];

export function ComplaintProvider({ children }) {
  const { currentUser } = useAuth();
  const { addNotification, addToast } = useNotifications();

  // Single Source of Truth
  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_complaints_v2');
      return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
    } catch {
      return INITIAL_COMPLAINTS;
    }
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  useEffect(() => {
    localStorage.setItem('civic_complaints_v2', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('civic_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Record Audit Event
  const logAudit = (eventData) => {
    const entry = complaintService.createAuditLog(eventData);
    setAuditLogs(prev => [entry, ...prev]);
  };

  // Reset Demo Data
  const resetDemoData = () => {
    setComplaints(INITIAL_COMPLAINTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.setItem('civic_complaints_v2', JSON.stringify(INITIAL_COMPLAINTS));
    localStorage.setItem('civic_audit_logs', JSON.stringify(INITIAL_AUDIT_LOGS));
    addToast('Database reset to clean demo state.', 'info');
  };

  // Generate Unique Incremental ID
  const generateComplaintId = () => {
    const numbers = complaints.map(c => {
      const parts = c.id.split('-');
      return parseInt(parts[parts.length - 1], 10) || 0;
    });
    const maxNum = Math.max(...numbers, 1251);
    return `CMP-2026-${String(maxNum + 1).padStart(6, '0')}`;
  };

  // 1. Citizen Lodges Complaint
  const citizenSubmitComplaint = (formData) => {
    const newId = generateComplaintId();
    const categoryObj = CATEGORIES.find(c => c.id === formData.category) || CATEGORIES[0];
    const deptObj = DEPARTMENTS.find(d => d.id === categoryObj.departmentId) || DEPARTMENTS[0];

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const slaDeadline = new Date(now.getTime() + (categoryObj.slaHours || 48) * 60 * 60 * 1000).toISOString();

    const newComplaint = {
      id: newId,
      title: formData.title,
      category: categoryObj.id,
      categoryName: categoryObj.name,
      description: formData.description,
      priority: formData.priority || 'Medium',
      status: 'SUBMITTED', // Step 1: SUBMITTED
      citizenId: currentUser?.id || 'usr-cit-1',
      submittedBy: {
        id: currentUser?.id || 'usr-cit-1',
        name: currentUser?.name || formData.citizenName || 'Aarav Patel',
        email: currentUser?.email || formData.citizenEmail || 'aarav.patel@example.com',
        phone: currentUser?.phone || formData.citizenPhone || '+91 98765 43210',
        address: currentUser?.address || formData.citizenAddress || 'Indiranagar'
      },
      departmentId: deptObj.id,
      departmentName: deptObj.name,
      assignedOfficer: deptObj.headOfficer || 'Assigned Officer',
      assignedWorkerId: null,
      assignedWorker: null,
      officerInstructions: '',
      location: {
        address: formData.address || 'Reported Location',
        landmark: formData.landmark || '',
        ward: formData.ward || 'Ward 82 - East Zone',
        lat: formData.lat || 12.9784,
        lng: formData.lng || 77.6408
      },
      images: formData.images && formData.images.length > 0 ? formData.images : [
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'
      ],
      resolutionDetails: null,
      officerApproval: null,
      verification: null,
      internalNotes: [],
      publicUpdates: [
        {
          id: 'pu-' + Date.now(),
          timestamp: formattedDate,
          message: `Grievance registered under ${categoryObj.name}. Target SLA: ${categoryObj.slaHours} hours.`
        }
      ],
      timeline: [
        {
          step: 1,
          title: 'Complaint Submitted',
          timestamp: formattedDate,
          author: `${currentUser?.name || 'Citizen'} (Citizen)`,
          note: `Grievance logged via portal. Assigned ticket ${newId}.`,
          completed: true,
          current: true
        },
        {
          step: 2,
          title: 'Under Review',
          timestamp: 'Pending Review',
          author: deptObj.name,
          note: 'Awaiting ward engineer review and worker dispatch.',
          completed: false
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      slaDeadline
    };

    setComplaints(prev => [newComplaint, ...prev]);

    // Audit log
    logAudit({
      user: currentUser,
      action: 'CITIZEN_SUBMIT_COMPLAINT',
      complaintId: newId,
      previousStatus: 'NONE',
      newStatus: 'SUBMITTED',
      details: `Citizen submitted complaint for ${categoryObj.name}.`
    });

    // Targeted notification for Citizen
    addNotification({
      title: 'Complaint Submitted Successfully',
      message: `Your ticket #${newId} has been registered. Tracking is now active.`,
      type: 'success',
      complaintId: newId,
      recipientUserId: currentUser?.id,
      recipientRole: USER_ROLES.CITIZEN
    });

    // Targeted notification for Department Officers
    addNotification({
      title: 'New Complaint Requiring Review',
      message: `New ticket #${newId} (${categoryObj.name}) registered in your department.`,
      type: 'info',
      complaintId: newId,
      recipientRole: USER_ROLES.OFFICER,
      recipientDeptId: deptObj.id
    });

    return newComplaint;
  };

  // 2. Officer Reviews Complaint
  const officerReviewComplaint = (id, { accepted, priority, departmentId, internalNote, rejectionReason }) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;

      const previousStatus = c.status;
      const newStatus = accepted ? 'UNDER REVIEW' : 'REJECTED';

      // Log Audit
      logAudit({
        user: currentUser,
        action: accepted ? 'OFFICER_APPROVE_COMPLAINT' : 'OFFICER_REJECT_COMPLAINT',
        complaintId: id,
        previousStatus,
        newStatus,
        details: accepted 
          ? `Officer approved review. Priority: ${priority || c.priority}.` 
          : `Officer rejected complaint. Reason: ${rejectionReason}`
      });

      // Internal Note (strictly for officers)
      const updatedInternalNotes = internalNote ? [
        ...c.internalNotes,
        {
          id: 'in-' + Date.now(),
          author: currentUser.name,
          role: 'Officer',
          timestamp: formattedDate,
          message: internalNote
        }
      ] : c.internalNotes;

      // Public Update (citizen visible)
      const updatedPublicUpdates = [
        ...c.publicUpdates,
        {
          id: 'pu-' + Date.now(),
          timestamp: formattedDate,
          message: accepted 
            ? `Your complaint was reviewed by ${currentUser.name} and approved for dispatch.`
            : `Grievance rejected: ${rejectionReason || 'Does not fall within municipal jurisdiction.'}`
        }
      ];

      return {
        ...c,
        status: newStatus,
        priority: priority || c.priority,
        rejectionReason: accepted ? null : rejectionReason,
        internalNotes: updatedInternalNotes,
        publicUpdates: updatedPublicUpdates,
        updatedAt: now.toISOString(),
        timeline: [
          ...c.timeline.map(t => ({ ...t, current: false })),
          {
            step: c.timeline.length + 1,
            title: accepted ? 'Under Review' : 'Complaint Rejected',
            timestamp: formattedDate,
            author: `${currentUser.name} (Officer)`,
            note: accepted ? `Grievance validated by engineer. Priority: ${priority || c.priority}.` : rejectionReason,
            completed: true,
            current: true
          }
        ]
      };
    }));

    const complaint = complaints.find(c => c.id === id);

    // Notify Citizen of status update
    addNotification({
      title: accepted ? 'Complaint Under Review' : 'Complaint Rejected',
      message: accepted ? `Complaint #${id} was reviewed and approved for crew assignment.` : `Complaint #${id} was rejected: ${rejectionReason}`,
      type: accepted ? 'info' : 'warning',
      complaintId: id,
      recipientUserId: complaint?.citizenId,
      recipientRole: USER_ROLES.CITIZEN
    });
  };

  // 3. Officer Assigns Worker
  const officerAssignWorker = (id, { workerId, instructions, internalNote }) => {
    const worker = WORKERS.find(w => w.id === workerId);
    if (!worker) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;

      const previousStatus = c.status;
      const newStatus = 'ASSIGNED';

      logAudit({
        user: currentUser,
        action: 'OFFICER_ASSIGN_WORKER',
        complaintId: id,
        previousStatus,
        newStatus,
        details: `Assigned to worker ${worker.name} (${worker.role}). Instructions: ${instructions || 'Proceed to site.'}`
      });

      const updatedInternalNotes = internalNote ? [
        ...c.internalNotes,
        {
          id: 'in-' + Date.now(),
          author: currentUser.name,
          role: 'Officer',
          timestamp: formattedDate,
          message: internalNote
        }
      ] : c.internalNotes;

      const updatedPublicUpdates = [
        ...c.publicUpdates,
        {
          id: 'pu-' + Date.now(),
          timestamp: formattedDate,
          message: `Municipal field crew (${worker.role}) assigned to investigate and execute repairs.`
        }
      ];

      return {
        ...c,
        status: newStatus,
        assignedWorkerId: worker.id,
        assignedWorker: {
          id: worker.id,
          name: worker.name,
          phone: worker.phone,
          role: worker.role
        },
        assignedOfficerId: currentUser.id,
        assignedOfficerName: currentUser.name,
        officerInstructions: instructions || 'Inspect site defect and carry out rectification.',
        internalNotes: updatedInternalNotes,
        publicUpdates: updatedPublicUpdates,
        updatedAt: now.toISOString(),
        timeline: [
          ...c.timeline.map(t => ({ ...t, current: false })),
          {
            step: c.timeline.length + 1,
            title: 'Department & Worker Assigned',
            timestamp: formattedDate,
            author: `${currentUser.name} (Officer)`,
            note: `Assigned to ${worker.name} (${worker.role}). Dispatch order issued.`,
            completed: true,
            current: true
          }
        ]
      };
    }));

    const complaint = complaints.find(c => c.id === id);

    // Notify Assigned Worker
    addNotification({
      title: 'New Field Task Assigned',
      message: `You have been assigned to task #${id}: ${complaint?.title}. Instructions: ${instructions || 'Resolve ASAP.'}`,
      type: 'warning',
      complaintId: id,
      recipientUserId: worker.id === 'wrk-01' ? 'usr-wrk-1' : worker.id === 'wrk-02' ? 'usr-wrk-2' : null,
      recipientRole: USER_ROLES.WORKER
    });

    // Notify Citizen
    addNotification({
      title: 'Field Crew Dispatched',
      message: `Task crew assigned for #${id}. Remediation is scheduled.`,
      type: 'info',
      complaintId: id,
      recipientUserId: complaint?.citizenId,
      recipientRole: USER_ROLES.CITIZEN
    });
  };

  // 3b. Worker Accepts Assigned Work (ASSIGNED → ACCEPTED)
  const workerAcceptWork = (id) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;

      const previousStatus = c.status;
      const newStatus = 'ACCEPTED';

      logAudit({
        user: currentUser,
        action: 'WORKER_ACCEPT_WORK',
        complaintId: id,
        previousStatus,
        newStatus,
        details: `Worker ${currentUser.name} accepted the assigned task and will proceed to site.`
      });

      return {
        ...c,
        status: newStatus,
        updatedAt: now.toISOString(),
        publicUpdates: [
          ...c.publicUpdates,
          {
            id: 'pu-' + Date.now(),
            timestamp: formattedDate,
            message: 'Field crew has acknowledged the assignment and is preparing to proceed to the site.'
          }
        ],
        timeline: [
          ...c.timeline.map(t => ({ ...t, current: false })),
          {
            step: c.timeline.length + 1,
            title: 'Work Accepted by Crew',
            timestamp: formattedDate,
            author: `${currentUser.name} (Worker)`,
            note: `Worker ${currentUser.name} accepted the task. Preparing for site visit.`,
            completed: true,
            current: true
          }
        ]
      };
    }));

    const complaint = complaints.find(c => c.id === id);

    // Notify Officer
    addNotification({
      title: 'Worker Accepted Task',
      message: `Worker ${currentUser.name} has accepted task #${id}.`,
      type: 'info',
      complaintId: id,
      recipientRole: USER_ROLES.OFFICER,
      recipientDeptId: complaint?.departmentId
    });

    // Notify Citizen
    addNotification({
      title: 'Crew Acknowledged Your Complaint',
      message: `A field worker has accepted your complaint #${id} and will begin work soon.`,
      type: 'info',
      complaintId: id,
      recipientUserId: complaint?.citizenId,
      recipientRole: USER_ROLES.CITIZEN
    });

    addToast(`Task #${id} accepted. Proceed to site when ready.`, 'success');
  };

  // 4. Worker Starts Work
  const workerStartWork = (id, { workerNotes }) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;

      const previousStatus = c.status;
      const newStatus = 'IN PROGRESS';

      logAudit({
        user: currentUser,
        action: 'WORKER_START_WORK',
        complaintId: id,
        previousStatus,
        newStatus,
        details: `Worker ${currentUser.name} arrived on site and commenced repairs.`
      });

      return {
        ...c,
        status: newStatus,
        updatedAt: now.toISOString(),
        publicUpdates: [
          ...c.publicUpdates,
          {
            id: 'pu-' + Date.now(),
            timestamp: formattedDate,
            message: 'Field crew has arrived on site. Physical repair work is actively in progress.'
          }
        ],
        timeline: [
          ...c.timeline.map(t => ({ ...t, current: false })),
          {
            step: c.timeline.length + 1,
            title: 'Work In Progress',
            timestamp: formattedDate,
            author: `${currentUser.name} (Worker)`,
            note: workerNotes || 'Field team arrived with equipment and commenced repairs.',
            completed: true,
            current: true
          }
        ]
      };
    }));

    const complaint = complaints.find(c => c.id === id);

    addNotification({
      title: 'Work In Progress on Site',
      message: `Remediation started on #${id}.`,
      type: 'info',
      complaintId: id,
      recipientUserId: complaint?.citizenId,
      recipientRole: USER_ROLES.CITIZEN
    });
  };

  // 5. Worker Submits Resolution (Uploads After-Photos) -> Status becomes RESOLUTION SUBMITTED
  const workerSubmitResolution = (id, { description, afterImages, workerNotes }) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const resolution = {
      completedAt: formattedDate,
      description: description || 'Field repairs executed to municipal specifications.',
      afterImages: afterImages && afterImages.length > 0 ? afterImages : [
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'
      ],
      workerNotes: workerNotes || 'Site clean and cleared.'
    };

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;

      const previousStatus = c.status;
      const newStatus = 'RESOLUTION SUBMITTED';

      logAudit({
        user: currentUser,
        action: 'WORKER_SUBMIT_RESOLUTION',
        complaintId: id,
        previousStatus,
        newStatus,
        details: `Worker ${currentUser.name} uploaded after-photos and resolution report.`
      });

      return {
        ...c,
        status: newStatus,
        resolutionDetails: resolution,
        updatedAt: now.toISOString(),
        timeline: [
          ...c.timeline.map(t => ({ ...t, current: false })),
          {
            step: c.timeline.length + 1,
            title: 'Resolution Submitted by Crew',
            timestamp: formattedDate,
            author: `${currentUser.name} (Worker)`,
            note: 'Physical work completed and evidence submitted for officer review.',
            completed: true,
            current: true
          }
        ]
      };
    }));

    const complaint = complaints.find(c => c.id === id);

    // Notify Department Officer for approval
    addNotification({
      title: 'Resolution Evidence Submitted',
      message: `Worker ${currentUser.name} finished #${id}. Officer approval required before citizen verification.`,
      type: 'info',
      complaintId: id,
      recipientRole: USER_ROLES.OFFICER,
      recipientDeptId: complaint?.departmentId
    });

    addToast('Work completion evidence submitted to Municipal Officer.', 'success');
  };

  // 5b. Worker Directly Marks Work as Resolved (IN PROGRESS → RESOLVED)
  const workerMarkResolved = (id, { description, afterImages, workerNotes }) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const resolution = {
      completedAt: formattedDate,
      description: description || 'Field repairs completed to municipal specifications.',
      afterImages: afterImages && afterImages.length > 0 ? afterImages : [
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'
      ],
      workerNotes: workerNotes || 'Site cleared and safe for public use.'
    };

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;

      const previousStatus = c.status;
      const newStatus = 'RESOLVED';

      logAudit({
        user: currentUser,
        action: 'WORKER_MARK_RESOLVED',
        complaintId: id,
        previousStatus,
        newStatus,
        details: `Worker ${currentUser.name} completed work and marked complaint as resolved. Resolution: ${description}`
      });

      return {
        ...c,
        status: newStatus,
        resolutionDetails: resolution,
        updatedAt: now.toISOString(),
        publicUpdates: [
          ...c.publicUpdates,
          {
            id: 'pu-' + Date.now(),
            timestamp: formattedDate,
            message: 'Field work has been completed. Your complaint has been marked as resolved. Please review and verify.'
          }
        ],
        timeline: [
          ...c.timeline.map(t => ({ ...t, current: false })),
          {
            step: c.timeline.length + 1,
            title: 'Work Completed & Resolved',
            timestamp: formattedDate,
            author: `${currentUser.name} (Worker)`,
            note: description || 'Physical work completed and site restored.',
            completed: true
          },
          {
            step: c.timeline.length + 2,
            title: 'Citizen Verification Pending',
            timestamp: 'Awaiting Citizen Response',
            author: c.submittedBy?.name || 'Citizen',
            note: 'Citizen please confirm if the issue is completely resolved.',
            completed: false,
            current: true
          }
        ]
      };
    }));

    const complaint = complaints.find(c => c.id === id);

    // Notify Citizen
    addNotification({
      title: 'Your Complaint Has Been Resolved!',
      message: `Complaint #${id} has been resolved by the field crew. Please review and verify.`,
      type: 'success',
      complaintId: id,
      recipientUserId: complaint?.citizenId,
      recipientRole: USER_ROLES.CITIZEN
    });

    // Notify Officer
    addNotification({
      title: 'Complaint Resolved by Worker',
      message: `Worker ${currentUser.name} has resolved complaint #${id}.`,
      type: 'success',
      complaintId: id,
      recipientRole: USER_ROLES.OFFICER,
      recipientDeptId: complaint?.departmentId
    });

    addToast(`Complaint #${id} marked as RESOLVED. Citizen has been notified.`, 'success');
  };

  // 6. Officer Reviews Worker Evidence & Approves -> Status becomes RESOLVED
  const officerApproveResolution = (id, { approved, feedback, internalNote }) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;

      const previousStatus = c.status;
      const newStatus = approved ? 'RESOLVED' : 'IN PROGRESS';

      logAudit({
        user: currentUser,
        action: approved ? 'OFFICER_APPROVE_RESOLUTION' : 'OFFICER_REJECT_RESOLUTION',
        complaintId: id,
        previousStatus,
        newStatus,
        details: approved 
          ? `Officer approved photographic resolution evidence. Forwarded to citizen.` 
          : `Officer requested rework: ${feedback}`
      });

      if (!approved) {
        // Rework needed
        return {
          ...c,
          status: newStatus,
          updatedAt: now.toISOString(),
          internalNotes: [
            ...c.internalNotes,
            { id: 'in-' + Date.now(), author: currentUser.name, role: 'Officer', timestamp: formattedDate, message: `REWORK REQUIRED: ${feedback}` }
          ],
          timeline: [
            ...c.timeline.map(t => ({ ...t, current: false })),
            {
              step: c.timeline.length + 1,
              title: 'Rework Ordered by Officer',
              timestamp: formattedDate,
              author: `${currentUser.name} (Officer)`,
              note: feedback || 'Evidence did not meet quality standards. Rework ordered.',
              completed: true,
              current: true
            }
          ]
        };
      }

      // Approved!
      return {
        ...c,
        status: newStatus,
        officerApproval: {
          approved: true,
          officerName: currentUser.name,
          timestamp: formattedDate,
          note: feedback || 'Remediation verified and signed off by Executive Engineer.'
        },
        publicUpdates: [
          ...c.publicUpdates,
          {
            id: 'pu-' + Date.now(),
            timestamp: formattedDate,
            message: 'Your complaint has been marked as resolved by the municipal department. Please inspect and verify.'
          }
        ],
        updatedAt: now.toISOString(),
        timeline: [
          ...c.timeline.map(t => ({ ...t, current: false })),
          {
            step: c.timeline.length + 1,
            title: 'Officer Resolution Approved',
            timestamp: formattedDate,
            author: `${currentUser.name} (Officer)`,
            note: 'Engineer reviewed evidence and verified standards.',
            completed: true
          },
          {
            step: c.timeline.length + 2,
            title: 'Citizen Verification Pending',
            timestamp: 'Awaiting Citizen Response',
            author: c.submittedBy.name,
            note: 'Citizen please confirm if the issue is completely resolved.',
            completed: false,
            current: true
          }
        ]
      };
    }));

    const complaint = complaints.find(c => c.id === id);

    if (approved) {
      // Notify Citizen to verify!
      addNotification({
        title: 'Complaint Marked Resolved!',
        message: `Your complaint #${id} has been marked as resolved. Please review photos and confirm.`,
        type: 'success',
        complaintId: id,
        recipientUserId: complaint?.citizenId,
        recipientRole: USER_ROLES.CITIZEN
      });
      addToast(`Resolution approved for #${id}. Forwarded to citizen for verification.`, 'success');
    } else {
      // Notify Worker of rework
      addNotification({
        title: 'Rework Ordered on Task',
        message: `Officer rejected resolution for #${id}: "${feedback}". Additional work needed.`,
        type: 'warning',
        complaintId: id,
        recipientUserId: complaint?.assignedWorkerId === 'wrk-01' ? 'usr-wrk-1' : 'usr-wrk-2',
        recipientRole: USER_ROLES.WORKER
      });
      addToast(`Rework order issued to field worker for #${id}.`, 'warning');
    }
  };

  // 7. Citizen Verifies Resolution ("Yes, Issue Resolved" -> CLOSED | "No, Issue Still Exists" -> REOPENED)
  const citizenVerifyResolution = (id, { satisfied, rating = 5, feedback = '' }) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;

      const previousStatus = c.status;
      const newStatus = satisfied ? 'CLOSED' : 'REOPENED';

      logAudit({
        user: currentUser,
        action: satisfied ? 'CITIZEN_CONFIRM_CLOSED' : 'CITIZEN_REOPEN_COMPLAINT',
        complaintId: id,
        previousStatus,
        newStatus,
        details: satisfied 
          ? `Citizen confirmed satisfaction (${rating} Stars): "${feedback || 'Satisfied'}". Ticket closed.`
          : `Citizen reported issue still exists: "${feedback}". Ticket reopened and returned to Officer.`
      });

      if (satisfied) {
        return {
          ...c,
          status: newStatus,
          verification: {
            verified: true,
            rating,
            feedback: feedback || 'Citizen confirmed issue resolved satisfactorily.',
            verifiedAt: formattedDate
          },
          updatedAt: now.toISOString(),
          publicUpdates: [
            ...c.publicUpdates,
            { id: 'pu-' + Date.now(), timestamp: formattedDate, message: `Citizen verified resolution (${rating} Stars). Grievance successfully closed.` }
          ],
          timeline: [
            ...c.timeline.map(t => ({ ...t, current: false })),
            {
              step: c.timeline.length + 1,
              title: `Citizen Verified (${rating}/5 Stars)`,
              timestamp: formattedDate,
              author: `${currentUser.name} (Citizen)`,
              note: feedback || 'Citizen verified complete resolution. Thank you!',
              completed: true
            },
            {
              step: c.timeline.length + 2,
              title: 'Closed & Archived',
              timestamp: formattedDate,
              author: 'Municipal Registry',
              note: 'Ticket formally closed in municipal registry.',
              completed: true,
              current: true
            }
          ]
        };
      }

      // Reopened!
      return {
        ...c,
        status: newStatus,
        priority: 'Urgent',
        verification: {
          verified: false,
          feedback: feedback || 'Citizen verified that issue still exists on site.',
          verifiedAt: formattedDate
        },
        internalNotes: [
          ...c.internalNotes,
          {
            id: 'in-' + Date.now(),
            author: 'Grievance System',
            role: 'System',
            timestamp: formattedDate,
            message: `CITIZEN REOPENED ISSUE: Citizen feedback: "${feedback}". Reopened and escalated to Officer.`
          }
        ],
        publicUpdates: [
          ...c.publicUpdates,
          { id: 'pu-' + Date.now(), timestamp: formattedDate, message: 'You reported that the issue still exists. Complaint reopened and returned to Officer.' }
        ],
        updatedAt: now.toISOString(),
        timeline: [
          ...c.timeline.map(t => ({ ...t, current: false })),
          {
            step: c.timeline.length + 1,
            title: 'Citizen Marked Unresolved (Reopened)',
            timestamp: formattedDate,
            author: `${currentUser.name} (Citizen)`,
            note: `Issue still persists. Citizen feedback: "${feedback}". Returned to Officer.`,
            completed: true,
            current: true
          }
        ]
      };
    }));

    const complaint = complaints.find(c => c.id === id);

    if (satisfied) {
      try {
        confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
      } catch (e) {}

      addToast(`Grievance #${id} verified and officially Closed! Thank you.`, 'success');

      addNotification({
        title: 'Complaint Closed by Citizen',
        message: `Citizen verified #${id} with ${rating} stars. Ticket archived.`,
        type: 'success',
        complaintId: id,
        recipientRole: USER_ROLES.OFFICER,
        recipientDeptId: complaint?.departmentId
      });
    } else {
      addToast(`Grievance #${id} reopened and returned to Officer for urgent re-inspection.`, 'warning');

      addNotification({
        title: 'Grievance Reopened by Citizen!',
        message: `Citizen rejected resolution for #${id}: "${feedback}". Escalated to Officer queue.`,
        type: 'warning',
        complaintId: id,
        recipientRole: USER_ROLES.OFFICER,
        recipientDeptId: complaint?.departmentId
      });
    }
  };

  // Add Comment (Public vs Internal)
  const addComplaintNote = (id, { message, isInternal = false }) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;

      if (isInternal) {
        return {
          ...c,
          internalNotes: [
            ...c.internalNotes,
            { id: 'in-' + Date.now(), author: currentUser.name, role: currentUser.role, timestamp: formattedDate, message }
          ]
        };
      }

      return {
        ...c,
        publicUpdates: [
          ...c.publicUpdates,
          { id: 'pu-' + Date.now(), timestamp: formattedDate, message }
        ]
      };
    }));

    addToast(isInternal ? 'Internal note saved (Officer only).' : 'Public update posted to citizen.', 'info');
  };

  // Escalate Complaint
  const escalateComplaint = (id, reason) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;

      const previousStatus = c.status;
      const newStatus = 'ESCALATED';

      logAudit({
        user: currentUser,
        action: 'ESCALATE_COMPLAINT',
        complaintId: id,
        previousStatus,
        newStatus,
        details: reason || 'Urgent intervention requested.'
      });

      return {
        ...c,
        status: newStatus,
        priority: 'Urgent',
        internalNotes: [
          ...c.internalNotes,
          { id: 'in-' + Date.now(), author: currentUser.name, role: currentUser.role, timestamp: formattedDate, message: `ESCALATED: ${reason}` }
        ],
        publicUpdates: [
          ...c.publicUpdates,
          { id: 'pu-' + Date.now(), timestamp: formattedDate, message: 'Ticket elevated to Urgent priority under Municipal Commissioner supervision.' }
        ],
        updatedAt: now.toISOString(),
        timeline: [
          ...c.timeline.map(t => ({ ...t, current: false })),
          {
            step: c.timeline.length + 1,
            title: 'Escalated to Commissioner Office',
            timestamp: formattedDate,
            author: currentUser.name,
            note: reason || 'Urgent intervention requested.',
            completed: true,
            current: true
          }
        ]
      };
    }));

    addNotification({
      title: 'Complaint Escalated to Commissioner',
      message: `Ticket #${id} escalated to Urgent status: ${reason}`,
      type: 'error',
      complaintId: id,
      recipientRole: USER_ROLES.ADMIN
    });

    addToast(`Ticket #${id} escalated to Commissioner Grievance Cell.`, 'warning');
  };

  // Get Complaints authorized for current user
  const authorizedComplaints = complaintService.getComplaintsForUser(complaints, currentUser);

  // Get Single Complaint with strict record ownership validation
  const getAuthorizedComplaintById = (complaintId) => {
    return complaintService.getComplaintByIdForUser(complaints, complaintId, currentUser);
  };

  // Role-Specific Dynamic Statistics
  const getRoleStats = () => {
    const list = authorizedComplaints;
    
    if (currentUser?.role === USER_ROLES.CITIZEN) {
      // Strictly for THIS logged-in citizen!
      return {
        total: list.length,
        pending: list.filter(c => ['SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'ACCEPTED'].includes(c.status)).length,
        inProgress: list.filter(c => ['IN PROGRESS'].includes(c.status)).length,
        resolved: list.filter(c => c.status === 'RESOLVED').length,
        closed: list.filter(c => c.status === 'CLOSED').length,
        reopened: list.filter(c => c.status === 'REOPENED').length,
        needsVerification: list.filter(c => c.status === 'RESOLVED' && !c.verification)
      };
    }

    if (currentUser?.role === USER_ROLES.WORKER) {
      // Strictly for THIS logged-in worker!
      return {
        totalTasks: list.length,
        assignedNew: list.filter(c => c.status === 'ASSIGNED').length,
        accepted: list.filter(c => c.status === 'ACCEPTED').length,
        inProgress: list.filter(c => c.status === 'IN PROGRESS').length,
        submittedForApproval: list.filter(c => c.status === 'RESOLUTION SUBMITTED').length,
        completed: list.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length
      };
    }

    if (currentUser?.role === USER_ROLES.OFFICER) {
      // Strictly for THIS officer's department workload!
      return {
        total: list.length,
        newSubmitted: list.filter(c => c.status === 'SUBMITTED').length,
        underReview: list.filter(c => c.status === 'UNDER REVIEW').length,
        assigned: list.filter(c => ['ASSIGNED', 'ACCEPTED'].includes(c.status)).length,
        inProgress: list.filter(c => c.status === 'IN PROGRESS').length,
        needsOfficerApproval: list.filter(c => c.status === 'RESOLUTION SUBMITTED').length, // Worker submitted resolution!
        resolved: list.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length,
        reopenedOrEscalated: list.filter(c => ['REOPENED', 'ESCALATED'].includes(c.status)).length
      };
    }

    // Admin (Full municipal scope)
    return {
      total: complaints.length,
      pending: complaints.filter(c => ['SUBMITTED', 'UNDER REVIEW', 'ASSIGNED'].includes(c.status)).length,
      inProgress: complaints.filter(c => c.status === 'IN PROGRESS').length,
      resolved: complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length,
      escalated: complaints.filter(c => ['ESCALATED', 'REOPENED'].includes(c.status)).length,
      resolutionRate: Math.round((complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length / (complaints.length || 1)) * 100)
    };
  };

  const roleStats = getRoleStats();

  // Global public-facing statistics computed from ALL complaints (not role-filtered).
  // Used by LandingPage, MapViewPage, AnalyticsDashboard for aggregate municipal metrics.
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => ['SUBMITTED', 'UNDER REVIEW'].includes(c.status)).length,
    assigned: complaints.filter(c => c.status === 'ASSIGNED').length,
    inProgress: complaints.filter(c => c.status === 'IN PROGRESS').length,
    resolutionSubmitted: complaints.filter(c => c.status === 'RESOLUTION SUBMITTED').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
    closed: complaints.filter(c => c.status === 'CLOSED').length,
    reopened: complaints.filter(c => c.status === 'REOPENED').length,
    escalated: complaints.filter(c => ['ESCALATED', 'REOPENED'].includes(c.status)).length,
    rejected: complaints.filter(c => c.status === 'REJECTED').length,
    activeComplaints: complaints.filter(c => ['SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'ACCEPTED', 'IN PROGRESS', 'RESOLUTION SUBMITTED'].includes(c.status)).length,
    resolutionRate: Math.round((complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length / (complaints.length || 1)) * 100)
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints: authorizedComplaints,
        allComplaintsRaw: complaints, // used by admin/maps
        auditLogs,
        roleStats,
        stats,
        getAuthorizedComplaintById,
        citizenSubmitComplaint,
        createComplaint: citizenSubmitComplaint,
        officerReviewComplaint,
        officerAssignWorker,
        workerAcceptWork,
        workerStartWork,
        workerSubmitResolution,
        workerMarkResolved,
        officerApproveResolution,
        citizenVerifyResolution,
        verifyComplaint: citizenVerifyResolution,
        addComplaintNote,
        escalateComplaint,
        resetDemoData
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (!context) throw new Error('useComplaints must be used within ComplaintProvider');
  return context;
}
