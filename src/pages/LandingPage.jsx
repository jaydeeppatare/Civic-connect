import React from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { CATEGORIES } from '../data/categories';
import { DEPARTMENTS } from '../data/departments';
import { 
  Building2, PlusCircle, Search, CheckCircle2, Clock, 
  ShieldCheck, ArrowRight, MapPin, Users, Activity, 
  Hammer, Lightbulb, Trash2, Droplets, Waves, Trees, 
  Compass, AlertTriangle, HelpCircle, Check, Sparkles
} from 'lucide-react';

export function LandingPage({ setActivePage, setSelectedCategory }) {
  const { stats, allComplaintsRaw: complaints } = useComplaints();

  // Helper for category icon
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Hammer': return <Hammer size={24} color="#f59e0b" />;
      case 'Lightbulb': return <Lightbulb size={24} color="#eab308" />;
      case 'Trash2': return <Trash2 size={24} color="#10b981" />;
      case 'Droplets': return <Droplets size={24} color="#0284c7" />;
      case 'Waves': return <Waves size={24} color="#0d9488" />;
      case 'Trees': return <Trees size={24} color="#16a34a" />;
      case 'Compass': return <Compass size={24} color="#dc2626" />;
      case 'AlertTriangle': return <AlertTriangle size={24} color="#ea580c" />;
      case 'Building2': return <Building2 size={24} color="#6366f1" />;
      default: return <HelpCircle size={24} color="#64748b" />;
    }
  };

  const recentResolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').slice(0, 3);

  return (
    <div className="landing-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-pattern" />
        <div className="container">
          <div className="hero-grid">
            {/* Left Content */}
            <div>
              <div className="hero-badge">
                <Sparkles size={14} color="#60a5fa" />
                <span>Municipal Corporation Citizen Grievance Portal</span>
              </div>

              <h1 className="hero-title">
                Report. Track.<br />
                <span>Resolve.</span>
              </h1>

              <p className="hero-subtitle">
                A transparent, real-time civic portal connecting citizens directly with municipal engineers, field sanitation crews, and ward corporators. Report civic problems in 60 seconds with geocoded photos and track every step of rectification.
              </p>

              <div className="hero-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setActivePage('report')}
                  style={{ gap: '0.6rem' }}
                >
                  <PlusCircle size={20} />
                  <span>Report an Issue</span>
                </button>

                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => setActivePage('track')}
                  style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                >
                  <Search size={18} />
                  <span>Track Complaint</span>
                </button>
              </div>

              {/* Dynamic Stats Row */}
              <div className="hero-stats-row">
                <div className="hero-stat-item">
                  <h3>{stats.resolved + stats.closed}</h3>
                  <p>Resolved</p>
                </div>
                <div className="hero-stat-item">
                  <h3>{stats.activeComplaints}</h3>
                  <p>Active Work</p>
                </div>
                <div className="hero-stat-item">
                  <h3>{stats.total > 0 ? ((stats.resolved + stats.closed) / stats.total * 100).toFixed(1) : '0'}%</h3>
                  <p>Resolution Rate</p>
                </div>
                <div className="hero-stat-item">
                  <h3>{DEPARTMENTS?.length || 7}</h3>
                  <p>Departments</p>
                </div>
              </div>
            </div>

            {/* Right Preview Card */}
            <div>
              <div className="hero-card-preview">
                <div className="hero-live-badge">
                  <Activity size={13} className="animate-spin" />
                  <span>LIVE CIVIC DISPATCH</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#93c5fd', fontWeight: 700 }}>
                      CMP-2026-001245
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                      Severe Pothole Repaving
                    </h4>
                  </div>
                  <span style={{ background: '#2563eb', color: '#ffffff', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '20px', fontWeight: 700 }}>
                    In Progress
                  </span>
                </div>

                <div style={{ borderRadius: '10px', overflow: 'hidden', height: '140px', marginBottom: '1.25rem', position: 'relative' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80" 
                    alt="Road repair live" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
                    📍 Indiranagar Metro Pillar #42
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Dispatched Crew:</span>
                    <strong style={{ color: '#ffffff' }}>Ramesh Kumar (Paving Lead)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Target Resolution:</span>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>Within SLA (24 hrs)</span>
                  </div>
                </div>

                <button 
                  onClick={() => setActivePage('track')}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '1rem', background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: 'none' }}
                >
                  Inspect Live Timeline →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section style={{ padding: '5rem 0 3.5rem', background: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Municipal Services
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.35rem' }}>
              Select a Grievance Category
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '0.5rem' }}>
              Directly routed to the designated municipal department with guaranteed SLA response times.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {CATEGORIES.map((cat) => (
              <div 
                key={cat.id} 
                className="category-card"
                onClick={() => {
                  if (setSelectedCategory) setSelectedCategory(cat.id);
                  setActivePage('report');
                }}
              >
                <div className="category-icon-box" style={{ background: cat.bg }}>
                  {getCategoryIcon(cat.icon)}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, flex: 1, marginBottom: '0.85rem' }}>
                  {cat.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>
                    SLA: {cat.slaHours}h Target
                  </span>
                  <ArrowRight size={14} color="#94a3b8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS TIMELINE */}
      <section id="how-it-works-section" style={{ padding: '5rem 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Transparent Redressal
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.35rem' }}>
              How Civic Complaints Get Resolved
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '0.5rem' }}>
              No lost paperwork. Every grievance follows a transparent, time-tracked 5-stage lifecycle until you sign off.
            </p>
          </div>

          <div className="steps-container">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number-circle">1</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Citizen Reports</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Pin location on GPS map, snap photo evidence, and receive an instant unique Complaint ID.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number-circle">2</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Officer Reviews</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Ward Executive Engineer validates severity, sets priority, and assigns the correct municipal team.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number-circle">3</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Crew Dispatched</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Specialized field crew arrives on location with equipment to begin physical remediation.
              </p>
            </div>

            {/* Step 4 */}
            <div className="step-card">
              <div className="step-number-circle">4</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Work Completed</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Worker uploads compulsory "After-Repair" photographs and resolution report for validation.
              </p>
            </div>

            {/* Step 5 */}
            <div className="step-card" style={{ borderColor: '#86efac', background: '#f0fdf4' }}>
              <div className="step-number-circle" style={{ background: '#22c55e', color: '#ffffff', borderColor: '#22c55e' }}>5</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#14532d', marginBottom: '0.4rem' }}>Citizen Verifies</h4>
              <p style={{ fontSize: '0.85rem', color: '#166534', lineHeight: 1.5 }}>
                You inspect the result. If satisfied, ticket is closed. If not, reopen with 1 click to escalate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BEFORE & AFTER PROOF SHOWCASE */}
      <section style={{ padding: '5rem 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Accountability in Action
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
                Recent Verified Resolutions
              </h2>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => setActivePage('analytics')}
            >
              Explore Transparency Data →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {recentResolved.map(item => (
              <div key={item.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="code-badge">{item.id}</span>
                  <span style={{ fontSize: '0.75rem', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    ✓ Citizen Confirmed
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  {item.title}
                </h4>

                {/* Before / After Images */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ position: 'relative', height: '110px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={item.images[0]} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                      BEFORE
                    </span>
                  </div>
                  <div style={{ position: 'relative', height: '110px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img 
                      src={item.resolutionDetails?.afterImages?.[0] || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'} 
                      alt="After" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(16, 185, 129, 0.9)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                      AFTER REPAIR
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  📍 {item.location.address}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section style={{ padding: '4.5rem 0', background: 'linear-gradient(135deg, #1e3a8a, #0f172a)', color: '#ffffff', textAlign: 'center' }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Notice an issue in your neighbourhood?
          </h2>
          <p style={{ fontSize: '1.15rem', color: '#cbd5e1', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Do not let potholes, leaking pipes, or garbage piles persist. Lodge a grievance now and hold your local municipal corporation accountable.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => setActivePage('report')}
              style={{ background: '#2563eb', color: 'white', padding: '0.85rem 2rem' }}
            >
              <PlusCircle size={20} />
              Submit Grievance Now
            </button>

          </div>
        </div>
      </section>
    </div>
  );
}
