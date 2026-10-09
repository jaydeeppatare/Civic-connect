import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../data/categories';
import { LocationPicker } from '../components/map/LocationPicker';
import { 
  Check, ArrowRight, ArrowLeft, Upload, Image as ImageIcon, 
  MapPin, AlertCircle, Sparkles, CheckCircle2, Copy, FileText, Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_CIVIC_PHOTOS = [
  { label: 'Pothole on Asphalt', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80' },
  { label: 'Garbage Dump Overflow', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80' },
  { label: 'Water Pipe Rupture', url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80' },
  { label: 'Broken Street Light', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80' }
];

export function ReportComplaint({ initialCategory, initialLocation, onComplaintSubmitted, onTrackComplaint }) {
  const { createComplaint } = useComplaints();
  const { currentUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    category: initialCategory || 'roads',
    title: '',
    description: '',
    priority: 'Medium',
    address: initialLocation?.address || '4th Main Road, Indiranagar',
    landmark: 'Opposite Metro Pillar #42',
    ward: initialLocation?.ward || 'Ward 82 - East Zone',
    lat: initialLocation?.lat || 12.9784,
    lng: initialLocation?.lng || 77.6408,
    images: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'],
    videoNote: '',
    citizenName: currentUser?.name || 'Aarav Patel',
    citizenEmail: currentUser?.email || 'aarav.patel@example.com',
    citizenPhone: currentUser?.phone || '+91 98765 43210',
    citizenAddress: currentUser?.address || 'Flat 402, Green Meadows'
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleLocationChange = (newLoc) => {
    setFormData(prev => ({
      ...prev,
      lat: newLoc.lat,
      lng: newLoc.lng,
      address: newLoc.address || prev.address
    }));
  };

  const handleAddSampleImage = (url) => {
    if (!formData.images.includes(url)) {
      setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
  };

  const handleCustomFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Use FileReader for preview
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, uploadEvent.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Step Validation
  const validateStep1 = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Please enter a clear title describing the grievance.';
    if (!formData.description.trim()) errs.description = 'Please provide detailed description of the issue.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.address.trim()) errs.address = 'Please specify the road name or locality.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newComp = createComplaint(formData);
    setSubmittedComplaint(newComp);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {}
  };

  const copyComplaintId = () => {
    if (submittedComplaint) {
      navigator.clipboard.writeText(submittedComplaint.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If already successfully submitted, show success card
  if (submittedComplaint) {
    return (
      <div className="container-narrow" style={{ padding: '3rem 1.5rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', border: '1px solid #86efac', background: '#ffffff', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#16a34a' }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Grievance Registered Successfully!
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '520px', margin: '0 auto 1.75rem' }}>
            Your municipal grievance has been officially queued in the central registry and assigned to the Ward Executive Engineer.
          </p>

          {/* Ticket ID Box */}
          <div style={{
            background: '#f8fafc',
            border: '2px dashed #93c5fd',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Unique Ticket ID
              </div>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', color: '#1d4ed8' }}>
                {submittedComplaint.id}
              </strong>
            </div>

            <button
              onClick={copyComplaintId}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Copy size={14} />
              <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxWidth: '580px', margin: '0 auto 2.5rem', textAlign: 'left', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Assigned Dept</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{submittedComplaint.departmentName}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Target SLA</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0284c7' }}>48 Hours</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Initial Status</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#d97706' }}>Pending Review</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => {
                if (onTrackComplaint) onTrackComplaint(submittedComplaint.id);
              }}
              style={{ gap: '0.5rem' }}
            >
              <span>Track Complaint Status Now</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="btn btn-secondary btn-lg"
              onClick={() => {
                setSubmittedComplaint(null);
                setCurrentStep(1);
                setFormData({
                  ...formData,
                  title: '',
                  description: ''
                });
              }}
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedCategoryObj = CATEGORIES.find(c => c.id === formData.category) || CATEGORIES[0];

  return (
    <div className="container-narrow" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Lodge Municipal Grievance
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Report infrastructure defects, sanitation failures, or municipal violations directly to the ward engineers.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="stepper-header">
        <div className={`stepper-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
          <div className="stepper-circle">{currentStep > 1 ? <Check size={18} /> : 1}</div>
          <span className="stepper-label">Issue Details</span>
        </div>

        <div style={{ flex: 1, height: '2px', background: currentStep > 1 ? '#10b981' : '#e2e8f0', margin: '0 10px', transform: 'translateY(-12px)' }} />

        <div className={`stepper-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
          <div className="stepper-circle">{currentStep > 2 ? <Check size={18} /> : 2}</div>
          <span className="stepper-label">Location & Ward</span>
        </div>

        <div style={{ flex: 1, height: '2px', background: currentStep > 2 ? '#10b981' : '#e2e8f0', margin: '0 10px', transform: 'translateY(-12px)' }} />

        <div className={`stepper-item ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}>
          <div className="stepper-circle">{currentStep > 3 ? <Check size={18} /> : 3}</div>
          <span className="stepper-label">Upload Evidence</span>
        </div>

        <div style={{ flex: 1, height: '2px', background: currentStep > 3 ? '#10b981' : '#e2e8f0', margin: '0 10px', transform: 'translateY(-12px)' }} />

        <div className={`stepper-item ${currentStep === 4 ? 'active' : ''}`}>
          <div className="stepper-circle">4</div>
          <span className="stepper-label">Review & Submit</span>
        </div>
      </div>

      {/* STEP 1: COMPLAINT DETAILS */}
      {currentStep === 1 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Step 1: Grievance Category & Description</span>
          </h3>

          <div className="form-group">
            <label className="form-label">Category of Issue <span className="req">*</span></label>
            <select
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleInputChange}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} — (Target SLA: {cat.slaHours} Hours)
                </option>
              ))}
            </select>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
              ℹ️ Automatically routes to: <strong>{selectedCategoryObj.departmentName}</strong>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Complaint Title / Summary <span className="req">*</span></label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Deep crater pothole causing accidents near Metro Pillar 42"
              value={formData.title}
              onChange={handleInputChange}
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description <span className="req">*</span></label>
            <textarea
              name="description"
              className="form-textarea"
              rows={4}
              placeholder="Describe the nature of the defect, severity, hazard to pedestrians or traffic, and how long the issue has persisted..."
              value={formData.description}
              onChange={handleInputChange}
            />
            {errors.description && <p className="form-error">{errors.description}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Urgency / Priority Level</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setFormData({ ...formData, priority: p })}
                  style={{
                    padding: '0.65rem 0.5rem',
                    borderRadius: '8px',
                    border: formData.priority === p ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: formData.priority === p ? '#eff6ff' : '#ffffff',
                    color: formData.priority === p ? '#1d4ed8' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button className="btn btn-primary" onClick={nextStep}>
              <span>Continue to Location</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LOCATION & MAP */}
      {currentStep === 2 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="#2563eb" />
            <span>Step 2: Pin Location on Interactive Map</span>
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <LocationPicker location={formData} onChange={handleLocationChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Street Address / Locality <span className="req">*</span></label>
            <input
              type="text"
              name="address"
              className="form-input"
              placeholder="e.g. 4th Main Road, Opposite Metro Pillar #42, Indiranagar"
              value={formData.address}
              onChange={handleInputChange}
            />
            {errors.address && <p className="form-error">{errors.address}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nearest Landmark</label>
              <input
                type="text"
                name="landmark"
                className="form-input"
                placeholder="e.g. Opposite City Central Bakery"
                value={formData.landmark}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Municipal Ward</label>
              <select
                name="ward"
                className="form-select"
                value={formData.ward}
                onChange={handleInputChange}
              >
                <option value="Ward 82 - East Zone">Ward 82 - East Zone (Indiranagar)</option>
                <option value="Ward 54 - South Zone">Ward 54 - South Zone (Jayanagar)</option>
                <option value="Ward 35 - West Zone">Ward 35 - West Zone (Malleshwaram)</option>
                <option value="Ward 68 - South-East Zone">Ward 68 - South-East Zone (Koramangala)</option>
                <option value="Ward 150 - Outer Zone">Ward 150 - Outer Zone (Bellandur)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button className="btn btn-secondary" onClick={prevStep}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button className="btn btn-primary" onClick={nextStep}>
              <span>Continue to Evidence</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: UPLOAD EVIDENCE */}
      {currentStep === 3 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={20} color="#2563eb" />
            <span>Step 3: Upload Photographic Proof</span>
          </h3>

          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
            High-quality photographic evidence accelerates municipal site inspection and prevents ticket rejection.
          </p>

          {/* Quick Civic Sample Gallery for Testing */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px dashed #cbd5e1' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              💡 Quick-Pick Realistic Civic Proof Photos:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
              {SAMPLE_CIVIC_PHOTOS.map((sample, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleAddSampleImage(sample.url)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', justifyContent: 'flex-start' }}
                >
                  + {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Dropzone */}
          <div style={{
            border: '2px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            background: '#ffffff',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'border-color 0.2s ease'
          }}>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleCustomFileUpload} 
              id="file-upload" 
              style={{ display: 'none' }} 
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Upload size={22} />
              </div>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Click to upload photos</strong>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>PNG, JPG or WEBP up to 10MB each</p>
            </label>
          </div>

          {/* Preview Thumbnails */}
          {formData.images.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                Attached Photographic Evidence ({formData.images.length})
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {formData.images.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={img} alt={`Evidence ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        border: 'none',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button className="btn btn-secondary" onClick={prevStep}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button className="btn btn-primary" onClick={nextStep}>
              <span>Review Grievance</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {currentStep === 4 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#2563eb" />
            <span>Step 4: Confirm Grievance Details</span>
          </h3>

          <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{selectedCategoryObj.name}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Priority</span>
                <div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: formData.priority === 'Urgent' ? '#fee2e2' : '#e0f2fe',
                    color: formData.priority === 'Urgent' ? '#b91c1c' : '#0369a1'
                  }}>
                    {formData.priority} Priority
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Grievance Summary</span>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{formData.title}</div>
              <p style={{ fontSize: '0.88rem', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>{formData.description}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Reported Location</span>
                <div style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 600 }}>{formData.address}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Landmark: {formData.landmark || 'N/A'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ward & Department</span>
                <div style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 600 }}>{formData.ward}</div>
                <div style={{ fontSize: '0.78rem', color: '#2563eb' }}>{selectedCategoryObj.departmentName}</div>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
                  Attached Photos ({formData.images.length})
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {formData.images.map((img, i) => (
                    <img key={i} src={img} alt="preview" style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={prevStep}>
              <ArrowLeft size={16} />
              <span>Back to Edit</span>
            </button>
            <button className="btn btn-success btn-lg" onClick={handleSubmit}>
              <Send size={18} />
              <span>Submit to Municipal Corporation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
