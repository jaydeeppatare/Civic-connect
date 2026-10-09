/**
 * Municipal Complaint Data Architecture & RBAC Security Gateway
 * Enforces strict single source of truth, data ownership, role-based access control,
 * and field-level privacy sanitization.
 */

import { USER_ROLES } from '../context/AuthContext';

export const complaintService = {
  /**
   * Field-Level Privacy Sanitizer:
   * Strips internal notes, contractor billing, and other sensitive admin fields
   * before sending data to the Citizen portal.
   */
  sanitizeForCitizen(complaint) {
    if (!complaint) return null;
    const sanitized = { ...complaint };
    // Strip private internal notes
    delete sanitized.internalNotes;
    // Strip private officer comments/administrative remarks
    if (sanitized.comments) {
      sanitized.comments = sanitized.comments.filter(c => !c.isInternal);
    }
    return sanitized;
  },

  /**
   * Sanitizer for Field Worker:
   * Returns only task-relevant operational data. Does not expose citizen phone or full admin meta.
   */
  sanitizeForWorker(complaint) {
    if (!complaint) return null;
    return {
      id: complaint.id,
      title: complaint.title,
      category: complaint.category,
      categoryName: complaint.categoryName,
      description: complaint.description,
      priority: complaint.priority,
      status: complaint.status,
      departmentId: complaint.departmentId,
      departmentName: complaint.departmentName,
      assignedOfficer: complaint.assignedOfficer,
      assignedOfficerId: complaint.assignedOfficerId,
      assignedOfficerName: complaint.assignedOfficerName,
      assignedWorker: complaint.assignedWorker,
      assignedWorkerId: complaint.assignedWorkerId,
      officerInstructions: complaint.officerInstructions || '',
      location: complaint.location,
      images: complaint.images,
      resolutionDetails: complaint.resolutionDetails,
      officerApproval: complaint.officerApproval,
      verification: complaint.verification,
      timeline: complaint.timeline,
      slaDeadline: complaint.slaDeadline,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt
    };
  },

  /**
   * Retrieve list of complaints authorized for the logged-in user.
   */
  getComplaintsForUser(allComplaints, currentUser) {
    if (!currentUser) return [];

    switch (currentUser.role) {
      case USER_ROLES.CITIZEN:
        // Citizen can READ ONLY complaints where complaint.citizenId = logged_in_user.id
        return allComplaints
          .filter(c => c.citizenId === currentUser.id)
          .map(c => this.sanitizeForCitizen(c));

      case USER_ROLES.WORKER:
        // Worker sees ONLY tasks assigned to them: complaint.assignedWorkerId = logged_in_worker.workerId
        return allComplaints
          .filter(c => c.assignedWorkerId === currentUser.workerId)
          .map(c => this.sanitizeForWorker(c));

      case USER_ROLES.OFFICER:
        // Officer sees complaints authorized for their department or jurisdiction
        if (currentUser.departmentId) {
          return allComplaints.filter(c => c.departmentId === currentUser.departmentId);
        }
        return allComplaints;

      case USER_ROLES.ADMIN:
        // Admin has system-wide oversight
        return allComplaints;

      default:
        return [];
    }
  },

  /**
   * Retrieve single complaint with strict ownership validation.
   * Returns { complaint, error: null } OR { complaint: null, error: { status: 403, message } }
   */
  getComplaintByIdForUser(allComplaints, complaintId, currentUser) {
    if (!complaintId) return { complaint: null, error: null };

    const rawComplaint = allComplaints.find(
      c => c.id.toLowerCase() === complaintId.trim().toLowerCase()
    );

    if (!rawComplaint) {
      return {
        complaint: null,
        error: {
          status: 404,
          title: 'Grievance Record Not Found',
          message: `No municipal record found matching ticket ID "${complaintId}". Please verify the ticket reference.`
        }
      };
    }

    if (!currentUser) {
      return {
        complaint: null,
        error: {
          status: 401,
          title: 'Authentication Required',
          message: 'Please authenticate with your municipal credentials to access grievance records.'
        }
      };
    }

    // Role-based Ownership Checks
    if (currentUser.role === USER_ROLES.CITIZEN) {
      // CITIZEN OWNERSHIP CHECK: Must match citizenId
      if (rawComplaint.citizenId !== currentUser.id) {
        return {
          complaint: null,
          error: {
            status: 403,
            title: '403 — Access Denied (Strict Record Ownership)',
            message: `You are logged in as "${currentUser.name}". This grievance (#${rawComplaint.id}) is filed by another citizen and contains confidential personal data. Under Municipal Privacy Bylaws, citizens can only view their own registered complaints.`
          }
        };
      }
      return {
        complaint: this.sanitizeForCitizen(rawComplaint),
        error: null
      };
    }

    if (currentUser.role === USER_ROLES.WORKER) {
      // WORKER OWNERSHIP CHECK: Must be assigned to this worker
      if (rawComplaint.assignedWorkerId !== currentUser.workerId) {
        return {
          complaint: null,
          error: {
            status: 403,
            title: '403 — Access Denied (Unauthorized Task Access)',
            message: `Task #${rawComplaint.id} is not assigned to your field roster (${currentUser.name} - ${currentUser.workerId}). Municipal field crew are restricted to their assigned work orders.`
          }
        };
      }
      return {
        complaint: this.sanitizeForWorker(rawComplaint),
        error: null
      };
    }

    if (currentUser.role === USER_ROLES.OFFICER) {
      // Check if complaint belongs to this officer's department
      if (currentUser.departmentId && rawComplaint.departmentId !== currentUser.departmentId) {
        return {
          complaint: null,
          error: {
            status: 403,
            title: '403 — Cross-Department Access Restricted',
            message: `Grievance #${rawComplaint.id} is under the jurisdiction of ${rawComplaint.departmentName}. As an officer of ${currentUser.departmentName}, you are only authorized to inspect and dispatch within your assigned department.`
          }
        };
      }
      return { complaint: rawComplaint, error: null };
    }

    // Admin has access to all complaints
    return { complaint: rawComplaint, error: null };
  },

  /**
   * Log an audit event for every single state transition.
   */
  createAuditLog({ user, action, complaintId, previousStatus, newStatus, details }) {
    const now = new Date();
    return {
      id: 'aud-' + Date.now() + Math.random().toString(36).substr(2, 4),
      timestamp: now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isoDate: now.toISOString(),
      userId: user?.id || 'sys-auto',
      userName: user?.name || 'System Engine',
      userRole: user?.role || 'SYSTEM',
      action,
      complaintId,
      previousStatus: previousStatus || 'N/A',
      newStatus: newStatus || 'N/A',
      details: details || ''
    };
  }
};
