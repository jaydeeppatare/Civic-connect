import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, USER_ROLES } from './AuthContext';

const NotificationContext = createContext();

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    recipientUserId: 'usr-cit-2', // Pooja Sharma
    recipientRole: USER_ROLES.CITIZEN,
    title: 'Resolution Submitted for Verification',
    message: 'Work completed and verified on your complaint CMP-2026-001246 (Garbage Overflow). Please inspect and confirm resolution.',
    type: 'success',
    timestamp: '10 mins ago',
    read: false,
    complaintId: 'CMP-2026-001246'
  },
  {
    id: 'notif-2',
    recipientUserId: 'usr-cit-1', // Aarav Patel
    recipientRole: USER_ROLES.CITIZEN,
    title: 'Road Crew Dispatched',
    message: 'Paving crew lead Ramesh Kumar has been dispatched for CMP-2026-001245 (Road Pothole).',
    type: 'info',
    timestamp: '2 hours ago',
    read: false,
    complaintId: 'CMP-2026-001245'
  },
  {
    id: 'notif-3',
    recipientUserId: 'usr-off-1', // Eng. Rajesh Sharma (Roads)
    recipientRole: USER_ROLES.OFFICER,
    recipientDeptId: 'dept-roads',
    title: 'Work Order In Progress',
    message: 'Worker #W101 started on-site hot-mix compaction for CMP-2026-001245.',
    type: 'info',
    timestamp: '2 hours ago',
    read: false,
    complaintId: 'CMP-2026-001245'
  },
  {
    id: 'notif-4',
    recipientUserId: 'usr-off-2', // Dr. Anita Roy (Sanitation)
    recipientRole: USER_ROLES.OFFICER,
    recipientDeptId: 'dept-sanitation',
    title: 'Resolution Proof Ready for Review',
    message: 'Supervisor Santosh Yadav submitted after-photos for CMP-2026-001246 requiring officer sign-off.',
    type: 'success',
    timestamp: '3 hours ago',
    read: true,
    complaintId: 'CMP-2026-001246'
  },
  {
    id: 'notif-5',
    recipientUserId: 'usr-wrk-1', // Ramesh Kumar (Roads Worker)
    recipientRole: USER_ROLES.WORKER,
    title: 'New Emergency Dispatch Order',
    message: 'Assigned task CMP-2026-001245: 4th Main Indiranagar crater pothole patching.',
    type: 'warning',
    timestamp: '4 hours ago',
    read: false,
    complaintId: 'CMP-2026-001245'
  },
  {
    id: 'notif-6',
    recipientUserId: 'usr-adm-1',
    recipientRole: USER_ROLES.ADMIN,
    title: 'Municipal SLA Breach Alert',
    message: 'CMP-2026-001249 (Stormwater Backflow) exceeded 48h SLA threshold and escalated to Commissioner Cell.',
    type: 'error',
    timestamp: '5 hours ago',
    read: false,
    complaintId: 'CMP-2026-001249'
  }
];

export function NotificationProvider({ children }) {
  const { currentUser } = useAuth();

  const [allNotifications, setAllNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_notifications_v2');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem('civic_notifications_v2', JSON.stringify(allNotifications));
  }, [allNotifications]);

  // Floating Toast Alert
  const addToast = (message, type = 'info', duration = 4000) => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Add Notification with strict recipient targeting
  const addNotification = ({ 
    title, 
    message, 
    type = 'info', 
    complaintId = null,
    recipientUserId = null,
    recipientRole = null,
    recipientDeptId = null
  }) => {
    const newNotif = {
      id: 'notif-' + Date.now(),
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
      complaintId,
      recipientUserId,
      recipientRole,
      recipientDeptId
    };
    setAllNotifications(prev => [newNotif, ...prev]);

    // Show toast if this notification is for the current active user
    const isTargetedToCurrent = 
      (!recipientUserId || recipientUserId === currentUser?.id) &&
      (!recipientRole || recipientRole === currentUser?.role);

    if (isTargetedToCurrent) {
      addToast(`${title}: ${message}`, type, 5000);
    }
  };

  // Filter notifications strictly for the active authenticated user
  const userNotifications = allNotifications.filter(n => {
    if (!currentUser) return false;

    // Direct recipient match
    if (n.recipientUserId && n.recipientUserId === currentUser.id) return true;

    // Role broadcast match
    if (n.recipientRole && n.recipientRole === currentUser.role) {
      // If officer, check department match
      if (currentUser.role === USER_ROLES.OFFICER && n.recipientDeptId) {
        return n.recipientDeptId === currentUser.departmentId;
      }
      // If not user-specific, allow role broadcast
      if (!n.recipientUserId) return true;
    }

    // Admin can see admin notifications
    if (currentUser.role === USER_ROLES.ADMIN && n.recipientRole === USER_ROLES.ADMIN) return true;

    return false;
  });

  const markAsRead = (id) => {
    setAllNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    const userNotifIds = new Set(userNotifications.map(n => n.id));
    setAllNotifications(prev => prev.map(n => userNotifIds.has(n.id) ? { ...n, read: true } : n));
  };

  const clearNotification = (id) => {
    setAllNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: userNotifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
