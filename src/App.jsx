import React, { useState } from 'react';
import { useAuth, USER_ROLES } from './context/AuthContext';
import { RoleSwitcher } from './components/common/RoleSwitcher';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './pages/AuthModal';
import { AccessDenied } from './components/common/AccessDenied';

// Pages
import { LandingPage } from './pages/LandingPage';
import { ReportComplaint } from './pages/ReportComplaint';
import { TrackComplaint } from './pages/TrackComplaint';

import { CitizenDashboard } from './pages/CitizenDashboard';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { CivicAnalytics } from './pages/CivicAnalytics';
import { MapViewPage } from './pages/MapViewPage';
import { AdminPanel } from './pages/AdminPanel';

export function App() {
  const { currentUser } = useAuth();

  const [activePage, setActivePage] = useState('home');
  const [selectedComplaintId, setSelectedComplaintId] = useState('CMP-2026-001245');
  const [selectedCategory, setSelectedCategory] = useState('roads');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Quick navigation helper to jump straight to tracking a complaint
  const handleSelectComplaint = (complaintId) => {
    setSelectedComplaintId(complaintId);
    setActivePage('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplaintSubmitted = (newComplaint) => {
    setSelectedComplaintId(newComplaint.id);
  };

  const getAuthorizedHomeDashboard = () => {
    if (currentUser?.role === USER_ROLES.OFFICER) return 'officer-dashboard';
    if (currentUser?.role === USER_ROLES.WORKER) return 'worker-dashboard';
    if (currentUser?.role === USER_ROLES.ADMIN) return 'admin-panel';
    return 'citizen-dashboard';
  };

  return (
    <div className="app-container">
      {/* 1. Perspective Switcher for Testing Demo Personas */}
      <RoleSwitcher />

      {/* 2. Sticky Civic Navbar */}
      <Navbar 
        activePage={activePage} 
        setActivePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
        openAuthModal={() => setAuthModalOpen(true)} 
      />

      {/* 3. Main Content Router with RBAC Route Guards */}
      <main className="main-content">
        {activePage === 'home' && (
          <LandingPage 
            setActivePage={setActivePage} 
            setSelectedCategory={setSelectedCategory} 
          />
        )}

        {activePage === 'report' && (
          <ReportComplaint 
            initialCategory={selectedCategory}
            initialLocation={selectedLocation}
            onComplaintSubmitted={handleComplaintSubmitted}
            onTrackComplaint={handleSelectComplaint}
          />
        )}



        {activePage === 'track' && (
          <TrackComplaint 
            initialId={selectedComplaintId}
            onSelectComplaint={handleSelectComplaint}
            onBackToDashboard={() => setActivePage(getAuthorizedHomeDashboard())}
          />
        )}

        {/* CITIZEN DASHBOARD */}
        {activePage === 'citizen-dashboard' && (
          <CitizenDashboard 
            setActivePage={setActivePage}
            onSelectComplaint={handleSelectComplaint}
          />
        )}

        {/* OFFICER DASHBOARD (RBAC GUARD: Authorized ONLY for Officers & Admins) */}
        {activePage === 'officer-dashboard' && (
          currentUser?.role === USER_ROLES.OFFICER || currentUser?.role === USER_ROLES.ADMIN ? (
            <OfficerDashboard 
              onSelectComplaint={handleSelectComplaint}
            />
          ) : (
            <AccessDenied
              title="403 — Access Denied (Officer Portal Restricted)"
              message={`You are authenticated as "${currentUser?.name || 'Guest'}" with role [${currentUser?.role || 'None'}]. The Municipal Officer Command Deck is strictly restricted to authorized Municipal Officers & Ward Engineers.`}
              attemptedResource="/officer-dashboard"
              onBackToDashboard={() => setActivePage(getAuthorizedHomeDashboard())}
            />
          )
        )}

        {/* WORKER DASHBOARD (RBAC GUARD: Authorized ONLY for Workers & Admins) */}
        {activePage === 'worker-dashboard' && (
          currentUser?.role === USER_ROLES.WORKER || currentUser?.role === USER_ROLES.ADMIN ? (
            <WorkerDashboard 
              onSelectComplaint={handleSelectComplaint}
            />
          ) : (
            <AccessDenied
              title="403 — Access Denied (Field Worker Board Restricted)"
              message={`You are authenticated as "${currentUser?.name || 'Guest'}" with role [${currentUser?.role || 'None'}]. The Municipal Field Crew Task Board is strictly restricted to assigned field technicians.`}
              attemptedResource="/worker-dashboard"
              onBackToDashboard={() => setActivePage(getAuthorizedHomeDashboard())}
            />
          )
        )}

        {/* COMPLAINT MAP (Dedicated GIS Visualization Map) */}
        {(activePage === 'complaint-map' || activePage === 'map') && (
          <MapViewPage onSelectComplaint={handleSelectComplaint} />
        )}

        {/* CIVIC ANALYTICS (Admin Only) */}
        {activePage === 'analytics' && (
          <CivicAnalytics onBackToDashboard={() => setActivePage(getAuthorizedHomeDashboard())} />
        )}



        {/* ADMIN PANEL (RBAC GUARD: Authorized ONLY for Admins) */}
        {activePage === 'admin-panel' && (
          currentUser?.role === USER_ROLES.ADMIN ? (
            <AdminPanel setActivePage={setActivePage} />
          ) : (
            <AccessDenied
              title="403 — Access Denied (Administrative Clearance Required)"
              message={`You are authenticated as "${currentUser?.name || 'Guest'}" with role [${currentUser?.role || 'None'}]. Access to the Municipal Commissioner Administrative Console and System Rosters requires Master Admin authorization. This unauthorized access attempt has been logged.`}
              attemptedResource="/admin-panel"
              onBackToDashboard={() => setActivePage(getAuthorizedHomeDashboard())}
            />
          )
        )}
      </main>

      {/* 4. Municipal Corporation Footer */}
      <Footer setActivePage={setActivePage} />

      {/* 5. Floating Toast Notifications System */}
      <ToastContainer />

      {/* 6. Authentication Modal (Citizen Login / Registration) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(targetPage) => {
          if (targetPage) setActivePage(targetPage);
        }}
      />
    </div>
  );
}

export default App;
