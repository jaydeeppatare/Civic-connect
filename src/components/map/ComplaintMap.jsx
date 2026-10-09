import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { reverseGeocode } from '../../utils/googleMaps';
import { CATEGORIES } from '../../data/categories';
import L from 'leaflet';
import 'leaflet.markercluster';
import {
  MapPin, Search, Filter, RotateCcw, Maximize2,
  Layers, Compass, AlertTriangle, Eye, Calendar,
  CheckCircle2, Clock, Shield, ChevronRight, Info,
  Crosshair, AlertCircle, RefreshCw, ExternalLink
} from 'lucide-react';

/**
 * Status Color System aligned with CiviConnect municipal theme
 */
const STATUS_COLORS = {
  'SUBMITTED': '#ef4444',            // Red (Pending review)
  'PENDING': '#ef4444',              // Red
  'UNDER REVIEW': '#f97316',         // Orange
  'ASSIGNED': '#f59e0b',             // Amber / Yellow
  'ACCEPTED': '#3b82f6',             // Blue
  'IN PROGRESS': '#2563eb',          // Blue
  'RESOLUTION SUBMITTED': '#8b5cf6', // Purple
  'RESOLVED': '#10b981',             // Green
  'CITIZEN VERIFIED': '#16a34a',     // Dark Green
  'CLOSED': '#64748b',               // Slate / Neutral
  'ESCALATED': '#e11d48',            // Crimson / Danger
  'REOPENED': '#dc2626',             // Bright Red
  'REJECTED': '#64748b'              // Neutral Gray
};

const getMarkerColor = (status) => {
  const norm = (status || '').toUpperCase().trim();
  return STATUS_COLORS[norm] || '#f59e0b';
};

/**
 * Create a Leaflet DivIcon with complaint pin SVG colored by status
 */
const createLeafletMarkerIcon = (status, isSelected = false) => {
  const color = getMarkerColor(status);
  const width = isSelected ? 36 : 30;
  const height = isSelected ? 52 : 44;

  return L.divIcon({
    className: 'complaint-map-pin',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35)); transition: transform 0.2s ease; ${isSelected ? 'transform: scale(1.2);' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="${width}" height="${height}">
          <path d="M16 0C7.16 0 0 7.16 0 16c0 11.2 16 28 16 28s16-16.8 16-28C32 7.16 24.84 0 16 0z" fill="${color}" stroke="#ffffff" stroke-width="2.2"/>
          <circle cx="16" cy="15" r="7" fill="#ffffff" />
          <circle cx="16" cy="15" r="4" fill="${color}" />
        </svg>
      </div>
    `,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height + 4]
  });
};

/**
 * Leaflet-based Civic Complaint Map Component
 * Reuses the same Leaflet/OpenStreetMap setup as the working LocationPicker/Live Location page.
 */
export function ComplaintMap({
  complaints = [],
  onSelectComplaint,
  height = '620px',
  showFilters = true,
  initialCategory = 'all',
  initialStatus = 'all',
  initialPriority = 'all',
  title = 'Complaint Map'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Status & Error States
  const [mapReady, setMapReady] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState(initialPriority);
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Search autocomplete
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Sanitize valid coordinates
  const validComplaints = useMemo(() => {
    return complaints.filter(c => {
      const lat = c?.location?.lat;
      const lng = c?.location?.lng;
      return typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng) && lat !== 0 && lng !== 0;
    });
  }, [complaints]);

  const missingCoordsCount = complaints.length - validComplaints.length;

  // Filtered complaints calculation
  const filteredComplaints = useMemo(() => {
    return validComplaints.filter(c => {
      // Category filter
      if (categoryFilter !== 'all' && c.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const cStatus = (c.status || '').toUpperCase();
        const fStatus = statusFilter.toUpperCase();
        if (fStatus === 'PENDING') {
          if (!['SUBMITTED', 'UNDER REVIEW', 'PENDING'].includes(cStatus)) return false;
        } else if (fStatus === 'IN PROGRESS') {
          if (!['IN PROGRESS', 'ACCEPTED'].includes(cStatus)) return false;
        } else if (cStatus !== fStatus) {
          return false;
        }
      }

      // Priority filter
      if (priorityFilter !== 'all') {
        if ((c.priority || '').toLowerCase() !== priorityFilter.toLowerCase()) {
          return false;
        }
      }

      // Date filter
      if (dateFilter !== 'all' && c.createdAt) {
        const itemDate = new Date(c.createdAt);
        const now = new Date();
        if (dateFilter === 'today') {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (itemDate < startOfToday) return false;
        } else if (dateFilter === '7days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (itemDate < sevenDaysAgo) return false;
        } else if (dateFilter === '30days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (itemDate < thirtyDaysAgo) return false;
        }
      }

      // Search term filter
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase().trim();
        const idMatch = (c.id || '').toLowerCase().includes(q);
        const titleMatch = (c.title || '').toLowerCase().includes(q);
        const descMatch = (c.description || '').toLowerCase().includes(q);
        const addressMatch = (c.location?.address || '').toLowerCase().includes(q);
        const wardMatch = (c.location?.ward || '').toLowerCase().includes(q);
        const catMatch = (c.categoryName || '').toLowerCase().includes(q);
        if (!idMatch && !titleMatch && !descMatch && !addressMatch && !wardMatch && !catMatch) {
          return false;
        }
      }

      return true;
    });
  }, [validComplaints, categoryFilter, statusFilter, priorityFilter, dateFilter, searchTerm]);

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDateFilter('all');
  };

  // 1. Initialize Leaflet Map (same setup as LocationPicker)
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

    // Determine initial center
    const defaultCenter = validComplaints.length > 0
      ? [validComplaints[0].location.lat, validComplaints[0].location.lng]
      : [12.9716, 77.5946]; // Default: Bangalore

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // Same OpenStreetMap tiles as LocationPicker
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | CiviConnect GIS',
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // Initialize marker cluster group
    const markersLayer = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 'small';
        let diameter = 36;
        if (count >= 50) { size = 'large'; diameter = 52; }
        else if (count >= 10) { size = 'medium'; diameter = 44; }

        return L.divIcon({
          html: `<div style="
            width: ${diameter}px; height: ${diameter}px; 
            border-radius: 50%; 
            background: linear-gradient(135deg, #2563eb, #1d4ed8); 
            color: #ffffff; 
            display: flex; align-items: center; justify-content: center; 
            font-weight: 800; font-size: ${count >= 100 ? '12px' : '13px'}; 
            border: 3px solid #ffffff; 
            box-shadow: 0 4px 12px rgba(37,99,235,0.4);
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          ">${count}</div>`,
          className: 'complaint-cluster-icon',
          iconSize: [diameter, diameter]
        });
      }
    });

    map.addLayer(markersLayer);
    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;
    setMapReady(true);

    // Trigger size calculation
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

  // 2. Render Complaint Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer || !mapReady) return;

    // Clear previous markers
    markersLayer.clearLayers();

    if (filteredComplaints.length === 0) return;

    const coordOccurrences = new Map();

    filteredComplaints.forEach((complaint) => {
      let lat = complaint.location.lat;
      let lng = complaint.location.lng;

      // Coordinate jitter for overlapping points
      const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
      const count = coordOccurrences.get(key) || 0;
      coordOccurrences.set(key, count + 1);

      if (count > 0) {
        const angle = (count * 2 * Math.PI) / 8;
        const radius = 0.00015 * count;
        lat = lat + Math.sin(angle) * radius;
        lng = lng + Math.cos(angle) * radius;
      }

      const isSelected = selectedComplaintId === complaint.id;
      const icon = createLeafletMarkerIcon(complaint.status, isSelected);
      const markerColor = getMarkerColor(complaint.status);

      const formattedDate = complaint.createdAt
        ? new Date(complaint.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Recent';

      // Build popup content
      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; width: 260px; padding: 4px; box-sizing: border-box;">
          <!-- Top Tag Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-family: monospace; font-weight: 700; font-size: 11px; color: #1e40af; background: #eff6ff; border: 1px solid #bfdbfe; padding: 2px 6px; border-radius: 4px;">
              ${complaint.id}
            </span>
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #ffffff; background: ${markerColor}; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.03em;">
              ${complaint.status}
            </span>
          </div>

          <!-- Category & Priority -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 600; color: #64748b;">
              📁 ${complaint.categoryName || 'Civic Grievance'}
            </span>
            <span style="font-size: 10px; font-weight: 700; color: ${complaint.priority === 'Urgent' || complaint.priority === 'High' ? '#dc2626' : '#475569'}; background: #f1f5f9; padding: 1px 6px; border-radius: 4px;">
              ${(complaint.priority || 'Medium').toUpperCase()}
            </span>
          </div>

          <!-- Title -->
          <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 6px; line-height: 1.35;">
            ${complaint.title}
          </div>

          <!-- Short Description -->
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${complaint.description || ''}
          </div>

          <!-- Address -->
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; line-height: 1.3;">
            <span style="color: #ef4444; font-weight: bold;">📍</span> ${complaint.location.address || 'Municipal Ward Area'}
          </div>

          <!-- Reported Date -->
          <div style="font-size: 10.5px; color: #94a3b8; margin-bottom: 10px;">
            🕒 Reported: <strong style="color: #64748b;">${formattedDate}</strong>
          </div>

          <!-- Photo Thumbnail if available -->
          ${complaint.images && complaint.images[0] ? `
            <div style="width: 100%; height: 95px; border-radius: 6px; overflow: hidden; margin-bottom: 10px; border: 1px solid #e2e8f0;">
              <img src="${complaint.images[0]}" alt="Evidence" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          ` : ''}

          <!-- Action Button -->
          <button
            class="leaflet-popup-view-btn"
            data-complaint-id="${complaint.id}"
            style="width: 100%; background: #2563eb; color: #ffffff; border: none; padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background 0.15s ease;"
            onmouseover="this.style.background='#1d4ed8'"
            onmouseout="this.style.background='#2563eb'"
          >
            <span>View Complaint Details</span>
            <span>→</span>
          </button>
        </div>
      `;

      const marker = L.marker([lat, lng], {
        icon,
        title: `${complaint.id}: ${complaint.title}`
      });

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        offset: [0, -10],
        className: 'complaint-popup'
      });

      marker.on('click', () => {
        setSelectedComplaintId(complaint.id);
      });

      marker.on('popupopen', () => {
        // Attach click handler to popup button after it renders
        setTimeout(() => {
          const btn = document.querySelector(`.leaflet-popup-view-btn[data-complaint-id="${complaint.id}"]`);
          if (btn) {
            btn.onclick = (e) => {
              e.stopPropagation();
              if (onSelectComplaint) {
                onSelectComplaint(complaint.id);
              }
            };
          }
        }, 50);
      });

      markersLayer.addLayer(marker);
    });

    // Auto-fit bounds
    if (filteredComplaints.length > 0) {
      try {
        const bounds = markersLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      } catch (e) {
        // fallback
      }
    }
  }, [filteredComplaints, mapReady, onSelectComplaint, selectedComplaintId]);

  // Fit Bounds Action
  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (map && markersLayer && markersLayer.getLayers().length > 0) {
      try {
        const bounds = markersLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      } catch (e) {
        // noop
      }
    }
  };

  // "Use My Current Location" Handler
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos = [
          Number(pos.coords.latitude.toFixed(6)),
          Number(pos.coords.longitude.toFixed(6))
        ];

        map.setView(userPos, 15, { animate: true });

        // Update/create user location pulse marker
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(userPos);
        } else {
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
              <div style="
                width: 18px; height: 18px; 
                border-radius: 50%; 
                background: #2563eb; 
                border: 3px solid #ffffff; 
                box-shadow: 0 0 0 3px rgba(37,99,235,0.3), 0 2px 8px rgba(0,0,0,0.2);
              "></div>
            `,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });
          userMarkerRef.current = L.marker(userPos, { icon: userIcon, title: 'Your Current Location' }).addTo(map);
        }

        setDetectingLocation(false);
      },
      (err) => {
        setDetectingLocation(false);
        console.warn('Current location detection error:', err);
        alert('Could not detect your current location. Please verify browser location permissions.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  // Location Search (Nominatim — same as LocationPicker)
  const handleSearchInput = async (query) => {
    setSearchTerm(query);
    setSearchResults([]);

    if (!query || query.trim().length < 3) return;

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

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
    }

    setSearchTerm(result.display_name);
    setSearchResults([]);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      {/* ═════════════════════════════════════════════════════ */}
      {/* FLOATING FILTER & SEARCH CONTROLS TOOLBAR */}
      {/* ═════════════════════════════════════════════════════ */}
      {showFilters && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem'
        }}>
          {/* Row 1: Search + Live Geolocation Button + Visible Count Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px', position: 'relative' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search address, ticket ID, or location (e.g. Shivajinagar Pune, MG Road)..."
                  value={searchTerm}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem 0.45rem 2rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    background: '#ffffff'
                  }}
                />

                {/* Search Dropdown Results */}
                {searchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '40px',
                    left: 0,
                    right: 0,
                    background: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
                    border: '1px solid #e2e8f0',
                    zIndex: 2000,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {searchResults.map((r, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelectSearchResult(r)}
                        style={{
                          padding: '0.6rem 0.85rem',
                          fontSize: '0.8rem',
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
                        <MapPin size={14} color="#2563eb" style={{ flexShrink: 0 }} />
                        <span style={{ color: '#0f172a', lineHeight: 1.3 }}>{r.display_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions: Use Current Location, Reset, Fit Map */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={detectingLocation}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: '#2563eb',
                  borderColor: '#bfdbfe'
                }}
                title="Center map on your current GPS location"
              >
                <Crosshair size={13} className={detectingLocation ? 'animate-spin' : ''} />
                <span>{detectingLocation ? 'Locating...' : 'My Location'}</span>
              </button>

              <span style={{
                fontSize: '0.78rem',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                padding: '4px 10px',
                borderRadius: '8px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <MapPin size={13} color="#2563eb" />
                <span>{filteredComplaints.length} of {validComplaints.length} Visible Pins</span>
              </span>

              {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || dateFilter !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Reset all search filters"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleFitBounds}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Fit map to all visible complaints"
              >
                <Maximize2 size={12} />
                <span>Fit Map</span>
              </button>
            </div>
          </div>

          {/* Row 2: Category, Status, Priority, Date Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#ffffff', fontWeight: 600, color: '#334155' }}
            >
              <option value="all">📂 All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#ffffff', fontWeight: 600, color: '#334155' }}
            >
              <option value="all">⚡ All Statuses</option>
              <option value="SUBMITTED">🔴 Submitted / Pending</option>
              <option value="UNDER REVIEW">🟠 Under Review</option>
              <option value="ASSIGNED">🟡 Assigned to Crew</option>
              <option value="IN PROGRESS">🔵 In Progress</option>
              <option value="RESOLUTION SUBMITTED">🟣 Resolution Submitted</option>
              <option value="RESOLVED">🟢 Resolved (Needs Sign-off)</option>
              <option value="CLOSED">⚫ Closed & Verified</option>
              <option value="ESCALATED">🚨 Escalated</option>
              <option value="REOPENED">🔴 Reopened</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#ffffff', fontWeight: 600, color: '#334155' }}
            >
              <option value="all">🎯 All Priorities</option>
              <option value="Urgent">🚨 Urgent</option>
              <option value="High">⚠️ High Priority</option>
              <option value="Medium">⚡ Medium Priority</option>
              <option value="Low">🌱 Low Priority</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#ffffff', fontWeight: 600, color: '#334155' }}
            >
              <option value="all">🕒 All Time</option>
              <option value="today">Today</option>
              <option value="7days">Past 7 Days</option>
              <option value="30days">Past 30 Days</option>
            </select>

            {missingCoordsCount > 0 && (
              <span style={{ fontSize: '0.72rem', color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} />
                <span>{missingCoordsCount} complaint(s) lack coordinates (skipped from map)</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════ */}
      {/* LEAFLET MAP CANVAS CONTAINER */}
      {/* ═════════════════════════════════════════════════════ */}
      <div
        ref={mapContainerRef}
        id="civic-complaint-map"
        style={{
          width: '100%',
          height: '100%',
          flex: 1,
          background: '#e2e8f0',
          zIndex: 1
        }}
      />

      {/* ═════════════════════════════════════════════════════ */}
      {/* EMPTY FILTER RESULTS OVERLAY */}
      {/* ═════════════════════════════════════════════════════ */}
      {mapReady && filteredComplaints.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1500,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          padding: '1.5rem 2rem',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          textAlign: 'center',
          maxWidth: '360px'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
            <MapPin size={24} />
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
            No Complaints Found
          </h4>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.4 }}>
            No grievance records match your current filters and search criteria.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn btn-primary btn-sm"
            style={{ width: '100%' }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════ */}
      {/* MAP STATUS LEGEND (Bottom Left Floating Panel) */}
      {/* ═════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(10px)',
        padding: '0.6rem 0.9rem',
        borderRadius: '10px',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.85rem',
        fontSize: '0.72rem',
        color: '#334155',
        maxWidth: 'calc(100% - 32px)'
      }}>
        <div style={{ fontWeight: 700, color: '#0f172a', marginRight: '2px' }}>
          Status Legend:
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444' }} /> Submitted
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f97316' }} /> Under Review
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b' }} /> Assigned
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#2563eb' }} /> In Progress
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#8b5cf6' }} /> Resolution Sub.
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981' }} /> Resolved
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#64748b' }} /> Closed
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#e11d48' }} /> Escalated
        </span>
      </div>
    </div>
  );
}
