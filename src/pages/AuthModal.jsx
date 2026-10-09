import React, { useState } from 'react';
import { useAuth, USER_ROLES } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Modal } from '../components/common/Modal';
import { User, Lock, Mail, Phone, MapPin, Building, ShieldCheck, HardHat, Check } from 'lucide-react';

export function AuthModal({ isOpen, onClose, onSuccess }) {
  const { login, register, switchRole } = useAuth();
  const { addToast } = useNotifications();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    address: '',
    ward: 'Ward 82 - East Zone'
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrors({ email: 'Please enter registered email or mobile number' });
      return;
    }
    const res = login(formData.email, formData.password, USER_ROLES.CITIZEN);
    addToast(`Welcome back, ${res.user.name}!`, 'success');
    onClose();
    if (onSuccess) onSuccess('citizen-dashboard');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) newErrors.email = 'Valid Email is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const res = register(formData);
    addToast(`Registration successful! Welcome to CiviConnect, ${res.user.name}.`, 'success');
    onClose();
    if (onSuccess) onSuccess('citizen-dashboard');
  };

  const handleQuickDemoRole = (roleKey, pageTarget) => {
    switchRole(roleKey);
    addToast(`Switched session to ${roleKey.toUpperCase()}`, 'info');
    onClose();
    if (onSuccess) onSuccess(pageTarget);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Citizen & Staff Portal Access' : 'Create New Citizen Account'}
      maxWidth="540px"
    >
      {/* Tab Switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          onClick={() => { setMode('login'); setErrors({}); }}
          style={{
            flex: 1,
            padding: '0.75rem',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: mode === 'login' ? '#2563eb' : '#64748b',
            borderBottom: mode === 'login' ? '2px solid #2563eb' : 'none'
          }}
        >
          Sign In
        </button>
        <button
          onClick={() => { setMode('register'); setErrors({}); }}
          style={{
            flex: 1,
            padding: '0.75rem',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: mode === 'register' ? '#2563eb' : '#64748b',
            borderBottom: mode === 'register' ? '2px solid #2563eb' : 'none'
          }}
        >
          Register Citizen
        </button>
      </div>

      {/* Quick Demo Switcher Section */}
      <div style={{
        background: '#f8fafc',
        border: '1px dashed #cbd5e1',
        borderRadius: '10px',
        padding: '0.85rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          ⚡ 1-Click Demo Evaluation Profiles:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleQuickDemoRole('citizen', 'citizen-dashboard')}
            style={{ fontSize: '0.78rem', justifyContent: 'flex-start', padding: '0.4rem 0.6rem' }}
          >
            <User size={14} color="#0284c7" />
            <span>Citizen (Aarav)</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleQuickDemoRole('officer', 'officer-dashboard')}
            style={{ fontSize: '0.78rem', justifyContent: 'flex-start', padding: '0.4rem 0.6rem' }}
          >
            <ShieldCheck size={14} color="#f59e0b" />
            <span>Officer (Eng. Rajesh)</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleQuickDemoRole('worker', 'worker-dashboard')}
            style={{ fontSize: '0.78rem', justifyContent: 'flex-start', padding: '0.4rem 0.6rem' }}
          >
            <HardHat size={14} color="#10b981" />
            <span>Worker (Santosh)</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleQuickDemoRole('admin', 'admin-panel')}
            style={{ fontSize: '0.78rem', justifyContent: 'flex-start', padding: '0.4rem 0.6rem' }}
          >
            <Building size={14} color="#6366f1" />
            <span>Commissioner Admin</span>
          </button>
        </div>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label className="form-label">Email or Mobile Number <span className="req">*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="email"
                className="form-input"
                placeholder="e.g. aarav.patel@example.com"
                value={formData.email}
                onChange={handleInputChange}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password <span className="req">*</span></label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); addToast('OTP sent to registered mobile number for reset.', 'info'); }} style={{ fontSize: '0.78rem', color: '#2563eb' }}>
                Forgot Password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Sign In to Portal
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name <span className="req">*</span></label>
            <input
              type="text"
              name="fullName"
              className="form-input"
              placeholder="e.g. Ramesh Chandra"
              value={formData.fullName}
              onChange={handleInputChange}
            />
            {errors.fullName && <p className="form-error">{errors.fullName}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address <span className="req">*</span></label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="you@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number <span className="req">*</span></label>
              <input
                type="tel"
                name="mobile"
                className="form-input"
                placeholder="+91 98765 00000"
                value={formData.mobile}
                onChange={handleInputChange}
              />
              {errors.mobile && <p className="form-error">{errors.mobile}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <input
              type="text"
              name="address"
              className="form-input"
              placeholder="House/Apartment #, Street, Area"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password <span className="req">*</span></label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleInputChange}
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password <span className="req">*</span></label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Complete Citizen Registration
          </button>
        </form>
      )}
    </Modal>
  );
}
