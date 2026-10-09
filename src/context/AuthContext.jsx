import React, { createContext, useContext, useState, useEffect } from 'react';

export const USER_ROLES = {
  CITIZEN: 'citizen',
  OFFICER: 'officer',
  WORKER: 'worker',
  ADMIN: 'admin'
};

export const DEMO_USERS = {
  citizen_a: {
    id: 'usr-cit-1',
    name: 'Aarav Patel',
    email: 'aarav.patel@example.com',
    role: USER_ROLES.CITIZEN,
    phone: '+91 98765 43210',
    address: 'Flat 402, Green Meadows, Indiranagar, Bengaluru',
    ward: 'Ward 82 - East Zone',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    note: 'Owns CMP-2026-001245 & CMP-2026-001248'
  },
  citizen_b: {
    id: 'usr-cit-2',
    name: 'Pooja Sharma',
    email: 'pooja.sharma@example.com',
    role: USER_ROLES.CITIZEN,
    phone: '+91 99887 66554',
    address: 'House #12, 7th Cross, Jayanagar',
    ward: 'Ward 54 - South Zone',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    note: 'Owns CMP-2026-001246 (Resolved - ready to verify!) & CMP-2026-001247'
  },
  officer_roads: {
    id: 'usr-off-1',
    name: 'Eng. Rajesh Sharma',
    email: 'rajesh.sharma@municipal.gov.in',
    role: USER_ROLES.OFFICER,
    designation: 'Executive Engineer (East Zone & Roads)',
    departmentId: 'dept-roads',
    departmentName: 'Road Infrastructure & Maintenance',
    phone: '+91 98201 55667',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    note: 'Manages Roads Department complaints'
  },
  officer_sanitation: {
    id: 'usr-off-2',
    name: 'Dr. Anita Roy',
    email: 'anita.roy@municipal.gov.in',
    role: USER_ROLES.OFFICER,
    designation: 'Chief Sanitation Officer',
    departmentId: 'dept-sanitation',
    departmentName: 'Public Health & Solid Waste Management',
    phone: '+91 98310 99881',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    note: 'Manages Public Health & Sanitation complaints'
  },
  worker_roads: {
    id: 'usr-wrk-1',
    name: 'Ramesh Kumar',
    email: 'ramesh.worker@municipal.gov.in',
    role: USER_ROLES.WORKER,
    workerId: 'wrk-01',
    designation: 'Paving & Asphalt Crew Lead (Worker #W101)',
    departmentId: 'dept-roads',
    phone: '+91 98201 34120',
    zone: 'Zone 3 - West Ward',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    note: 'Assigned to Road Pothole CMP-2026-001245'
  },
  worker_sanitation: {
    id: 'usr-wrk-2',
    name: 'Santosh Yadav',
    email: 'santosh.worker@municipal.gov.in',
    role: USER_ROLES.WORKER,
    workerId: 'wrk-02',
    designation: 'Field Sanitation Supervisor (Worker #W104)',
    departmentId: 'dept-sanitation',
    phone: '+91 98450 78219',
    zone: 'Zone 1 - Central Ward',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    note: 'Assigned to Garbage Overflow CMP-2026-001246'
  },
  admin: {
    id: 'usr-adm-1',
    name: 'Municipal Commissioner Grievance Admin',
    email: 'admin.portal@municipal.gov.in',
    role: USER_ROLES.ADMIN,
    designation: 'Chief Information Officer (Municipal Corp)',
    phone: '+91 80 2222 0000',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    note: 'Full system audit & administration'
  }
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('civic_active_user');
      return saved ? JSON.parse(saved) : DEMO_USERS.citizen_a;
    } catch {
      return DEMO_USERS.citizen_a;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    localStorage.setItem('civic_active_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Quick switch role for testing separate personas
  const switchRole = (roleKey) => {
    if (DEMO_USERS[roleKey]) {
      setCurrentUser(DEMO_USERS[roleKey]);
      setIsAuthenticated(true);
    }
  };

  const login = (email, password, role = USER_ROLES.CITIZEN) => {
    // If matches any demo user
    const matched = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      setIsAuthenticated(true);
      return { success: true, user: matched };
    }
    
    // Otherwise create session with requested role
    const newUser = {
      id: 'usr-cit-' + Date.now(),
      name: email.split('@')[0].replace('.', ' ').replace(/(^|\s)\S/g, l => l.toUpperCase()),
      email,
      role,
      phone: '+91 98000 00000',
      address: 'Municipal Ward Residence',
      ward: 'Ward 82 - East Zone',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    return { success: true, user: newUser };
  };

  const register = (data) => {
    const newUser = {
      id: 'usr-cit-' + Date.now(),
      name: data.fullName,
      email: data.email,
      phone: data.mobile,
      address: data.address,
      ward: data.ward || 'Ward 82 - East Zone',
      role: USER_ROLES.CITIZEN,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        switchRole,
        login,
        register,
        logout,
        isCitizen: currentUser?.role === USER_ROLES.CITIZEN,
        isOfficer: currentUser?.role === USER_ROLES.OFFICER,
        isWorker: currentUser?.role === USER_ROLES.WORKER,
        isAdmin: currentUser?.role === USER_ROLES.ADMIN
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
