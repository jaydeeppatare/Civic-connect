import React, { useState, useEffect, useRef } from 'react';
import { useAuth, USER_ROLES } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Building2, Bell, PlusCircle, Search, MapPin, 
  BarChart3, User, LogOut, CheckCircle, ShieldAlert,
  Menu, X, ExternalLink, ShieldCheck, Lock
} from 'lucide-react';

export function Navbar({ activePage, setActivePage, openAuthModal }) {
  const { currentUser, isAuthenticated, switchRole, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [scrolled, setScrolled] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showSecurityDropdown, setShowSecurityDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const notifRef = useRef(null);
  const securityRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (securityRef.current && !securityRef.current.contains(e.target)) {
        setShowSecurityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDashboardPageForRole = () => {
    if (currentUser.role === USER_ROLES.OFFICER) return 'officer-dashboard';
    if (currentUser.role === USER_ROLES.WORKER) return 'worker-dashboard';
    if (currentUser.role === USER_ROLES.ADMIN) return 'admin-panel';
    return 'citizen-dashboard';
  };

  const getDashboardLabel = () => {
    if (currentUser.role === USER_ROLES.OFFICER) return 'Officer Portal';
    if (currentUser.role === USER_ROLES.WORKER) return 'Worker Board';
    if (currentUser.role === USER_ROLES.ADMIN) return 'Admin Control';
    return 'My Complaints';
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-inner">
          {/* Logo & Civic Branding */}
          <div 
            className="brand-logo" 
            onClick={() => setActivePage('home')} 
            style={{ cursor: 'pointer' }}
          >
            <div className="brand-icon-box">
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>CiviConnect</span>
              </div>
              <span className="brand-tag">MUNICIPAL GRIEVANCE REDRESSAL</span>
            </div>
          </div>

          {/* Navigation Links */}
          <ul className="nav-links">
            {/* CITIZEN NAVIGATION */}
            {(!currentUser || currentUser.role === USER_ROLES.CITIZEN) && (
              <>
                <li>
                  <button className={`nav-link ${activePage === 'home' ? 'active' : ''}`} onClick={() => setActivePage('home')}>Home</button>
                </li>
                <li>
                  <button className={`nav-link ${activePage === 'how-it-works' ? 'active' : ''}`} onClick={() => { setActivePage('home'); setTimeout(() => { document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' }); }, 50); }}>How It Works</button>
                </li>
                <li>
                  <button className={`nav-link ${activePage === 'track' ? 'active' : ''}`} onClick={() => setActivePage('track')}>Track Status</button>
                </li>

                <li>
                  <button className={`nav-link ${activePage === 'complaint-map' || activePage === 'map' ? 'active' : ''}`} onClick={() => setActivePage('complaint-map')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Complaint Map</span>
                  </button>
                </li>
              </>
            )}

            {/* OFFICER NAVIGATION */}
            {currentUser?.role === USER_ROLES.OFFICER && (
              <>
                <li><button className={`nav-link ${activePage === 'officer-dashboard' ? 'active' : ''}`} onClick={() => setActivePage('officer-dashboard')}>Dashboard</button></li>
                <li><button className={`nav-link ${activePage === 'complaint-map' || activePage === 'map' ? 'active' : ''}`} onClick={() => setActivePage('complaint-map')}>Complaint Map</button></li>
                <li><button className="nav-link" onClick={() => setActivePage('officer-dashboard')}>Complaints</button></li>
                <li><button className="nav-link" onClick={() => setActivePage('officer-dashboard')}>Assigned Cases</button></li>
              </>
            )}

            {/* WORKER NAVIGATION */}
            {currentUser?.role === USER_ROLES.WORKER && (
              <>
                <li><button className={`nav-link ${activePage === 'worker-dashboard' ? 'active' : ''}`} onClick={() => setActivePage('worker-dashboard')}>Dashboard</button></li>
                <li><button className="nav-link" onClick={() => setActivePage('worker-dashboard')}>My Assigned Jobs</button></li>
                <li><button className={`nav-link ${activePage === 'complaint-map' || activePage === 'map' ? 'active' : ''}`} onClick={() => setActivePage('complaint-map')}>Job Map</button></li>
                <li><button className="nav-link" onClick={() => setActivePage('worker-dashboard')}>Completed Jobs</button></li>
              </>
            )}

            {/* ADMIN NAVIGATION */}
            {currentUser?.role === USER_ROLES.ADMIN && (
              <>
                <li><button className={`nav-link ${activePage === 'admin-panel' ? 'active' : ''}`} onClick={() => setActivePage('admin-panel')}>Dashboard</button></li>
                <li><button className={`nav-link ${activePage === 'complaint-map' || activePage === 'map' ? 'active' : ''}`} onClick={() => setActivePage('complaint-map')}>Complaint Map</button></li>
                <li><button className="nav-link" onClick={() => setActivePage('admin-panel')}>All Complaints</button></li>
                <li><button className="nav-link" onClick={() => setActivePage('admin-panel')}>Users</button></li>
                <li>
                  <button className={`nav-link ${activePage === 'analytics' ? 'active' : ''}`} onClick={() => setActivePage('analytics')}>
                    Civic Analytics
                  </button>
                </li>
              </>
            )}
          </ul>

          {/* Right Action Items */}
          <div className="nav-actions">
            {/* Primary Action Button - Only for Citizens */}
            {(!currentUser || currentUser.role === USER_ROLES.CITIZEN || currentUser.role === USER_ROLES.ADMIN) && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setActivePage('report')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <PlusCircle size={16} />
                <span>Report Issue</span>
              </button>
            )}

            {/* Notification Bell with Dropdown */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button 
                className="notification-bell-btn"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                aria-label="View notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="bell-badge">{unreadCount}</span>
                )}
              </button>

              {/* Notifications Dropdown Popup */}
              {showNotifDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '340px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  zIndex: 2000,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Role Notifications</strong>
                      {unreadCount > 0 && (
                        <span style={{ fontSize: '0.7rem', background: '#eff6ff', color: '#2563eb', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        style={{ fontSize: '0.75rem', color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                        No notifications for current role ({currentUser.role})
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.complaintId) {
                              setShowNotifDropdown(false);
                              setActivePage('track');
                            }
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid #f1f5f9',
                            background: n.read ? '#ffffff' : '#f0f9ff',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: n.read ? '#334155' : '#0284c7' }}>
                              {n.title}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{n.timestamp}</span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick RBAC Security Test Tool Dropdown */}
            <div style={{ position: 'relative' }} ref={securityRef}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowSecurityDropdown(!showSecurityDropdown)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.65rem',
                  border: '1.5px dashed #f43f5e',
                  color: '#e11d48',
                  background: '#fff1f2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Run Security & 403 Access Denied Tests"
              >
                <Lock size={12} />
                <span>RBAC Tests</span>
              </button>

              {showSecurityDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  width: '320px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  zIndex: 2000,
                  padding: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.4rem' }}>
                    🛡️ Test Security & 403 Restrictions:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <button
                      onClick={() => {
                        setShowSecurityDropdown(false);
                        switchRole('citizen_a');
                        setActivePage('officer-dashboard');
                      }}
                      style={{
                        padding: '6px 8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ color: '#b91c1c' }}>Test 5:</strong> Citizen tries to access Officer Portal
                    </button>

                    <button
                      onClick={() => {
                        setShowSecurityDropdown(false);
                        switchRole('worker_roads');
                        setActivePage('admin-panel');
                      }}
                      style={{
                        padding: '6px 8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ color: '#b91c1c' }}>Test 4:</strong> Worker tries to access Admin Dashboard
                    </button>

                    <button
                      onClick={() => {
                        setShowSecurityDropdown(false);
                        switchRole('citizen_a');
                        setActivePage('track');
                      }}
                      style={{
                        padding: '6px 8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ color: '#b91c1c' }}>Test 2:</strong> Citizen A tries to track Citizen B's complaint
                    </button>

                    <button
                      onClick={() => {
                        setShowSecurityDropdown(false);
                        switchRole('worker_roads');
                        setActivePage('track');
                      }}
                      style={{
                        padding: '6px 8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ color: '#b91c1c' }}>Test 3:</strong> Worker 01 tries to access Worker 02's task
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            {isAuthenticated ? (
              <div 
                className="user-menu-pill"
                onClick={() => setActivePage(getDashboardPageForRole())}
                title={`Logged in as ${currentUser.name} (${currentUser.role})`}
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.name.split(' ')[0]}
                </span>
                <span style={{ 
                  fontSize: '0.65rem', 
                  textTransform: 'uppercase', 
                  padding: '2px 5px', 
                  borderRadius: '4px',
                  background: currentUser.role === USER_ROLES.CITIZEN ? '#e0f2fe' : currentUser.role === USER_ROLES.OFFICER ? '#fef3c7' : currentUser.role === USER_ROLES.WORKER ? '#ecfdf5' : '#f5f3ff',
                  color: currentUser.role === USER_ROLES.CITIZEN ? '#0369a1' : currentUser.role === USER_ROLES.OFFICER ? '#b45309' : currentUser.role === USER_ROLES.WORKER ? '#047857' : '#6d28d9'
                }}>
                  {currentUser.role}
                </span>
              </div>
            ) : (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={openAuthModal}
              >
                Login / Register
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button 
              className="btn-ghost" 
              style={{ display: 'none', padding: '0.4rem' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
