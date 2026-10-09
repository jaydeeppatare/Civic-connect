import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps, isGoogleMapsConfigured, onGoogleMapsAuthError } from '../../utils/googleMaps';
import { MapPin, ExternalLink, Navigation2, AlertCircle } from 'lucide-react';
import L from 'leaflet';

/**
 * Google Maps Location Viewer — Read-only map display for viewing complaint locations.
 * Used in Citizen complaint details, Officer review, and Worker task view.
 */
export function LocationViewer({ lat, lng, address, title, showNavigate = false }) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const [mapStatus, setMapStatus] = useState('loading');

  const displayLat = lat || 12.9784;
  const displayLng = lng || 77.6408;

  const initLeaflet = (latVal, lngVal) => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
    mapContainerRef.current.innerHTML = '';

    const map = L.map(mapContainerRef.current, {
      center: [latVal, lngVal],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap | CiviConnect GIS',
      maxZoom: 19
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="45">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24C24 5.37 18.63 0 12 0z" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
            <circle cx="12" cy="12" r="5" fill="#ffffff"/>
          </svg>
        </div>
      `,
      iconSize: [30, 45],
      iconAnchor: [15, 45]
    });

    L.marker([latVal, lngVal], { icon: pinIcon }).addTo(map);
    leafletMapRef.current = map;
    setMapStatus('ready');
  };

  useEffect(() => {
    const unsub = onGoogleMapsAuthError(() => {
      initLeaflet(displayLat, displayLng);
    });
    return () => unsub();
  }, [displayLat, displayLng]);

  useEffect(() => {
    if (!isGoogleMapsConfigured()) {
      initLeaflet(displayLat, displayLng);
      return;
    }

    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapContainerRef.current) return;

        const position = { lat: displayLat, lng: displayLng };

        const map = new maps.Map(mapContainerRef.current, {
          center: position,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: true,
          gestureHandling: 'cooperative',
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
          ]
        });

        new maps.Marker({
          position,
          map,
          title: title || 'Complaint Location',
          icon: {
            url: 'data:image/svg+xml,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24C24 5.37 18.63 0 12 0z" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
                <circle cx="12" cy="12" r="5" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new maps.Size(32, 48),
            anchor: new maps.Point(16, 48)
          },
          animation: maps.Animation.DROP
        });

        setMapStatus('ready');
      })
      .catch(() => {
        if (!cancelled) initLeaflet(displayLat, displayLng);
      });

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [displayLat, displayLng]);


  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${displayLat},${displayLng}`;
    window.open(url, '_blank');
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps?q=${displayLat},${displayLng}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      {/* Map */}
      {mapStatus === 'fallback' ? (
        <div style={{
          height: '200px',
          background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '8px',
          color: '#64748b',
          fontSize: '0.85rem'
        }}>
          <AlertCircle size={24} color="#94a3b8" />
          <span>Map preview unavailable</span>
          <button
            type="button"
            onClick={openInMaps}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem',
              color: '#2563eb',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontWeight: 600
            }}
          >
            <ExternalLink size={12} /> View on Google Maps
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {mapStatus === 'loading' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              gap: '8px',
              color: '#64748b',
              fontSize: '0.85rem'
            }}>
              <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%' }} />
              Loading map...
            </div>
          )}
          <div ref={mapContainerRef} style={{ width: '100%', height: '200px' }} />
        </div>
      )}

      {/* Location Info Footer */}
      <div style={{
        padding: '0.75rem 1rem',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
          <MapPin size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.3 }}>
              {address || `GPS: ${displayLat}, ${displayLng}`}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {displayLat.toFixed(6)}, {displayLng.toFixed(6)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={openInMaps}
            title="View on Google Maps"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={12} /> View
          </button>

          {showNavigate && (
            <button
              type="button"
              onClick={openInGoogleMaps}
              title="Get Directions in Google Maps"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid #bfdbfe',
                background: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Navigation2 size={12} /> Navigate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
