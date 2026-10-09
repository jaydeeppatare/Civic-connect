import React, { useState } from 'react';
import { LocationPicker } from '../components/map/LocationPicker';
import { MapPin, ArrowRight, Compass } from 'lucide-react';

export function LiveLocationPage({ onConfirmLocation }) {
  const [location, setLocation] = useState({
    lat: 12.9784,
    lng: 77.6408,
    address: '',
    ward: 'Ward 82 - East Zone'
  });

  const handleLocationChange = (newLoc) => {
    setLocation({
      lat: newLoc.lat,
      lng: newLoc.lng,
      address: newLoc.address || location.address,
      ward: newLoc.ward || location.ward
    });
  };

  const handleConfirm = () => {
    if (onConfirmLocation) {
      onConfirmLocation(location);
    }
  };

  return (
    <div className="container-narrow" style={{ padding: '3rem 1.5rem 5rem' }}>
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1' }}>
            <Compass size={32} />
          </div>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Live Complaint Location
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          Use your current location to report a civic issue accurately. We do not track you continuously.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={20} color="#2563eb" />
          <span>Interactive Location Map</span>
        </h3>

        <div style={{ marginBottom: '1.5rem' }}>
          <LocationPicker location={location} onChange={handleLocationChange} />
        </div>

        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selected Address</span>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{location.address || 'Locating...'}</div>
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latitude</span>
              <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0369a1' }}>{location.lat?.toFixed(6) || '--'}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Longitude</span>
              <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0369a1' }}>{location.lng?.toFixed(6) || '--'}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={handleConfirm}
            style={{ width: '100%', maxWidth: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>Confirm & Report Issue</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
