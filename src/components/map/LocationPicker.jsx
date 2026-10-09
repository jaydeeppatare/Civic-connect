import React, { useEffect, useRef, useState, useCallback } from 'react';
import { reverseGeocode } from '../../utils/googleMaps';
import { MapPin, Navigation, Search, CheckCircle2, Crosshair, Layers, RefreshCw } from 'lucide-react';
import L from 'leaflet';

/**
 * High-Precision Interactive Location Picker for Citizen Grievance Redressal
 * Features:
 * - Real-time crisp GIS map tiles with roads, buildings, and landmarks
 * - Draggable high-visibility complaint pin
 * - Click anywhere on map to reposition pin
 * - Place search with live autocomplete results
 * - "Use My Current Location" via browser geolocation API on demand
 * - Live synchronized Latitude, Longitude, and Formatted Address display
 */
export function LocationPicker({ location, onChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchInputRef = useRef(null);

  const [detecting, setDetecting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchValue, setSearchValue] = useState(location?.address || '');
  const [confirmed, setConfirmed] = useState(false);
  const [activeTileLayer, setActiveTileLayer] = useState('streets'); // 'streets' | 'satellite'

  const currentLat = location?.lat || 18.527457;
  const currentLng = location?.lng || 73.848439;

  // Custom SVG Map Pin Icon
  const createMarkerIcon = () => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; cursor:grab; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="36" height="52">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24C24 5.37 18.63 0 12 0z" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
            <circle cx="12" cy="12" r="5" fill="#ffffff"/>
          </svg>
        </div>
      `,
      iconSize: [36, 52],
      iconAnchor: [18, 52]
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up if already initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }
    mapContainerRef.current.innerHTML = '';

    // Create Leaflet Map Instance
    const map = L.map(mapContainerRef.current, {
      center: [currentLat, currentLng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // High-resolution crisp standard map tiles (CartoDB Voyager + OSM roads & places)
    const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | CiviConnect GIS',
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // Draggable Pin
    const marker = L.marker([currentLat, currentLng], {
      icon: createMarkerIcon(),
      draggable: true,
      title: 'Drag to pinpoint complaint location'
    }).addTo(map);

    // Marker Drag End Handler
    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      const latVal = Number(pos.lat.toFixed(6));
      const lngVal = Number(pos.lng.toFixed(6));
      setConfirmed(false);

      const address = await reverseGeocode(latVal, lngVal);
      setSearchValue(address);
      onChange({ lat: latVal, lng: lngVal, address });
    });

    // Map Click Handler
    map.on('click', async (e) => {
      const latVal = Number(e.latlng.lat.toFixed(6));
      const lngVal = Number(e.latlng.lng.toFixed(6));
      marker.setLatLng(e.latlng);
      setConfirmed(false);

      const address = await reverseGeocode(latVal, lngVal);
      setSearchValue(address);
      onChange({ lat: latVal, lng: lngVal, address });
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Trigger size calculation to ensure tiles load without white/blank space
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view if incoming coordinates change externally
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && location?.lat && location?.lng) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - location.lat) > 0.0001 || Math.abs(currentPos.lng - location.lng) > 0.0001) {
        markerRef.current.setLatLng([location.lat, location.lng]);
        mapInstanceRef.current.setView([location.lat, location.lng], 16, { animate: true });
      }
    }
  }, [location?.lat, location?.lng]);

  // "Use My Current Location" Handler
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
          markerRef.current.setLatLng([lat, lng]);
          setTimeout(() => {
            if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
          }, 200);
        }

        const address = await reverseGeocode(lat, lng);
        onChange({ lat, lng, address });
        setSearchValue(address);
        setDetecting(false);
        setConfirmed(false);
      },
      (err) => {
        setDetecting(false);
        console.warn('Geolocation error:', err);
        alert('Could not detect your location. Please check browser location permissions or use the search bar.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [onChange]);

  // Live Location Search (Nominatim / GIS Autocomplete)
  const handleSearchInput = async (query) => {
    setSearchValue(query);
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`,
        { headers: { 'User-Agent': 'CiviConnect-Municipal-Portal/1.0' } }
      );
      if (res.ok) {
        const results = await res.json();
        setSearchResults(results);
      }
    } catch (e) {
      console.warn('Search query error:', e);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = Number(parseFloat(result.lat).toFixed(6));
    const lng = Number(parseFloat(result.lon).toFixed(6));
    const address = result.display_name;

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
      markerRef.current.setLatLng([lat, lng]);
      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 200);
    }

    setSearchValue(address);
    setSearchResults([]);
    setConfirmed(false);
    onChange({ lat, lng, address });
  };

  // Confirm Location Handler
  const handleConfirmLocation = () => {
    setConfirmed(true);
  };

  return (
    <div>
      {/* Search Bar + Use My Current Location */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '0.85rem',
        flexWrap: 'wrap',
        position: 'relative'
      }}>
        {/* Search Input */}
        <div style={{ flex: 1, position: 'relative', minWidth: '220px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px', pointerEvents: 'none', zIndex: 2 }} />
          <input
            ref={searchInputRef}
            type="text"
            className="form-input"
            placeholder="Search complaint location (e.g. Shivajinagar Pune, MG Road, Ward 82)..."
            value={searchValue}
            onChange={(e) => handleSearchInput(e.target.value)}
            style={{
              paddingLeft: '2.2rem',
              height: '42px',
              fontSize: '0.88rem',
              borderRadius: '10px'
            }}
          />

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '46px',
              left: 0,
              right: 0,
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
              border: '1px solid #e2e8f0',
              zIndex: 1000,
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectSearchResult(r)}
                  style={{
                    padding: '0.7rem 0.9rem',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    borderBottom: i < searchResults.length - 1 ? '1px solid #f1f5f9' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                >
                  <MapPin size={15} color="#2563eb" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#0f172a', lineHeight: 1.35 }}>{r.display_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Use My Current Location Button */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="btn btn-secondary btn-sm"
          disabled={detecting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            height: '42px',
            borderColor: '#bfdbfe',
            color: '#2563eb',
            fontWeight: 600,
            padding: '0 1rem'
          }}
        >
          <Crosshair size={16} className={detecting ? 'animate-spin' : ''} />
          {detecting ? 'Locating GPS...' : 'Use My Current Location'}
        </button>
      </div>

      {/* Map Display Container */}
      <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: confirmed ? '2px solid #10b981' : '1.5px solid #cbd5e1' }}>
        <div
          ref={mapContainerRef}
          id="location-picker-map"
          style={{
            width: '100%',
            height: '380px',
            minHeight: '380px',
            background: '#e2e8f0',
            zIndex: 1
          }}
        />

        {/* Floating Instruction Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 500,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(6px)',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.72rem',
          color: '#475569',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span>📍 Drag red pin to adjust</span>
        </div>
      </div>

      {/* Coordinate & Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginTop: '0.85rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: '#64748b' }}>
          <span>
            Latitude: <strong style={{ color: '#0369a1', fontFamily: 'var(--font-mono)' }}>{location?.lat?.toFixed(6) || currentLat.toFixed(6)}</strong>
          </span>
          <span>
            Longitude: <strong style={{ color: '#0369a1', fontFamily: 'var(--font-mono)' }}>{location?.lng?.toFixed(6) || currentLng.toFixed(6)}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={handleConfirmLocation}
          className={confirmed ? 'btn btn-success btn-sm' : 'btn btn-primary btn-sm'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '150px', justifyContent: 'center' }}
        >
          <CheckCircle2 size={15} />
          {confirmed ? 'Location Confirmed ✓' : 'Confirm Location'}
        </button>
      </div>

      {/* Selected Address Card */}
      {location?.address && (
        <div style={{
          marginTop: '0.65rem',
          padding: '0.75rem 1rem',
          background: confirmed ? '#f0fdf4' : '#f8fafc',
          border: `1px solid ${confirmed ? '#86efac' : '#e2e8f0'}`,
          borderRadius: '10px',
          fontSize: '0.85rem',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          transition: 'all 0.3s ease'
        }}>
          <MapPin size={16} color={confirmed ? '#16a34a' : '#2563eb'} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Pinned Location Address
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', marginTop: '1px', lineHeight: 1.4 }}>
              {location.address}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


