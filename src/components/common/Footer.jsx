import React from 'react';
import { Building2, PhoneCall, Shield, FileText, MapPin, Mail, ExternalLink, Heart } from 'lucide-react';

export function Footer({ setActivePage }) {
  return (
    <footer style={{ background: '#0b1120', color: '#94a3b8', borderTop: '1px solid #1e293b', paddingTop: '4rem', paddingBottom: '2.5rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3rem', marginBottom: '3.5rem' }}>
          
          {/* Col 1: Branding & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: '#ffffff' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={22} color="#ffffff" />
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>CiviConnect</span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1.25rem' }}>
              Empowering urban citizens with a transparent, time-bound, and verifiable municipal grievance redressal mechanism. Ensuring accountability across all civic wards.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748b' }}>
              <Shield size={14} color="#10b981" />
              <span>Certified ISO 9001:2015 Civic Grievance Process</span>
            </div>
          </div>

          {/* Col 2: Emergency Civic Helplines */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Emergency Helplines (24x7)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PhoneCall size={16} color="#38bdf8" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Municipal Grievance Toll-Free</div>
                  <strong style={{ color: '#f8fafc', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>1916</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PhoneCall size={16} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Disaster & Monsoon Control Room</div>
                  <strong style={{ color: '#f8fafc', fontSize: '0.95rem', fontFamily: 'var(--font-mono)' }}>080-2222-1188</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PhoneCall size={16} color="#ef4444" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Emergency Medical / Fire</div>
                  <strong style={{ color: '#f8fafc', fontSize: '0.95rem', fontFamily: 'var(--font-mono)' }}>112 / 101</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Citizen Portals
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <li>
                <button onClick={() => setActivePage('report')} style={{ color: '#cbd5e1', hover: { color: '#ffffff' } }}>
                  → Lodge New Complaint
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('track')} style={{ color: '#cbd5e1' }}>
                  → Live Complaint Tracking
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('complaint-map')} style={{ color: '#cbd5e1' }}>
                  → Complaint Location Map
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('analytics')} style={{ color: '#cbd5e1' }}>
                  → Open Civic Transparency Data
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('citizen-dashboard')} style={{ color: '#cbd5e1' }}>
                  → Citizen Service Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Ward Offices & Timings */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Central Municipal HQ
            </h4>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              <MapPin size={16} color="#94a3b8" style={{ flexShrink: 0, marginTop: '3px' }} />
              <span>Corporation Building, Hudson Circle, Ward 01, City Centre - 560001</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <Mail size={16} color="#94a3b8" />
              <span>grievances@municipal.gov.in</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.75rem' }}>
              Office Hours: Monday – Saturday (09:30 AM to 06:00 PM)<br/>
              Online Grievance Filing: 24 Hours / 365 Days
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: '#64748b',
          gap: '1rem'
        }}>
          <div>
            © 2026 Municipal Corporation. All Citizen Services Protected under Right to Public Services Act.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Redressal</span>
            <span>Citizen Charter SLA</span>
            <span style={{ color: '#38bdf8' }}>Smart Cities Mission</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
