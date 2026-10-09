/**
 * Google Maps Loader Utility & Diagnostic Engine
 * Handles loading the Google Maps JavaScript API with Places, Geocoding & Marker libraries.
 * Reads environment variable VITE_GOOGLE_MAPS_API_KEY from .env.local / .env.
 * Intercepts auth failures and provides exact diagnostic error reporting.
 */

export function getGoogleMapsApiKey() {
  const rawKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!rawKey || typeof rawKey !== 'string') return '';
  // Strip any accidental leading/trailing whitespace or quotes
  return rawKey.trim().replace(/^["']|["']$/g, '');
}

export const GOOGLE_MAPS_API_KEY = getGoogleMapsApiKey();

// Safe diagnostic logging: logs ONLY configuration existence, never the secret key value
if (typeof window !== 'undefined') {
  console.log(
    'CiviConnect GIS — Google Maps API key present in environment:',
    Boolean(getGoogleMapsApiKey())
  );
}

let googleMapsPromise = null;
let isLoaded = false;
let loadError = null;
let lastGoogleMapsError = null;
const authErrorListeners = new Set();

export function onGoogleMapsAuthError(callback) {
  authErrorListeners.add(callback);
  if (lastGoogleMapsError) {
    try {
      callback(lastGoogleMapsError);
    } catch (e) {
      console.warn('Error in auth listener:', e);
    }
  }
  return () => authErrorListeners.delete(callback);
}

function notifyAuthError(err) {
  lastGoogleMapsError = err;
  authErrorListeners.forEach((cb) => {
    try {
      cb(err);
    } catch (e) {
      console.warn('Error notifying auth listener:', e);
    }
  });
}

// Intercept Google Maps console error signatures for exact diagnosis
if (typeof window !== 'undefined' && !window.__gm_interceptor_installed) {
  window.__gm_interceptor_installed = true;

  const originalConsoleError = console.error;
  console.error = function (...args) {
    const rawMsg = args
      .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
      .join(' ');

    if (
      rawMsg.includes('Google Maps JavaScript API error') ||
      rawMsg.includes('Google Maps JavaScript API warning') ||
      rawMsg.includes('InvalidKeyMapError') ||
      rawMsg.includes('BillingNotEnabledMapError') ||
      rawMsg.includes('ApiNotActivatedMapError') ||
      rawMsg.includes('RefererNotAllowedMapError') ||
      rawMsg.includes('DeletedKeyMapError')
    ) {
      let code = 'InvalidKeyMapError';
      let title = 'Google Maps Authentication Error';
      let details = 'Google rejected the request.';

      if (rawMsg.includes('InvalidKeyMapError') || rawMsg.includes('InvalidKey')) {
        code = 'InvalidKeyMapError';
        title = 'Invalid Google Maps API Key (InvalidKeyMapError)';
        details = 'The API key configured in VITE_GOOGLE_MAPS_API_KEY was not found or is not recognized by Google Cloud Console. Please generate an API key in Google Cloud Console.';
      } else if (rawMsg.includes('BillingNotEnabledMapError')) {
        code = 'BillingNotEnabledMapError';
        title = 'Billing Not Enabled (BillingNotEnabledMapError)';
        details = 'Google Cloud billing is not active for this project. Google requires linking a billing account (with free tier credits) to load live Google Maps tiles.';
      } else if (rawMsg.includes('ApiNotActivatedMapError')) {
        code = 'ApiNotActivatedMapError';
        title = 'API Not Activated (ApiNotActivatedMapError)';
        details = 'Maps JavaScript API, Places API, or Geocoding API has not been enabled in your Google Cloud Console project.';
      } else if (rawMsg.includes('RefererNotAllowedMapError')) {
        code = 'RefererNotAllowedMapError';
        title = 'HTTP Referrer Restriction (RefererNotAllowedMapError)';
        details = 'The API key restriction settings in Google Cloud Console block http://localhost:3000/*. Add "http://localhost:3000/*" and "http://localhost:3000" to Authorized Website URLs under API Key Restrictions.';
      } else if (rawMsg.includes('DeletedKeyMapError')) {
        code = 'DeletedKeyMapError';
        title = 'API Key Deleted or Revoked (DeletedKeyMapError)';
        details = 'This Google Maps API key has been deleted or revoked in Google Cloud Console.';
      }

      notifyAuthError({ code, title, details, raw: rawMsg });
    }

    originalConsoleError.apply(console, args);
  };

  // Google Maps standard auth failure callback
  window.gm_authFailure = () => {
    const code = lastGoogleMapsError?.code || 'InvalidKeyMapError';
    const title = lastGoogleMapsError?.title || 'Google Maps Authentication Failed';
    const details = lastGoogleMapsError?.details || 'The API key in .env.local (VITE_GOOGLE_MAPS_API_KEY) was rejected by Google Cloud. Ensure Maps JavaScript API, Places API, and Geocoding API are enabled with billing active in Google Cloud Console.';

    notifyAuthError({ code, title, details });
  };
}

export function isGoogleMapsConfigured() {
  const key = getGoogleMapsApiKey();
  return Boolean(key && key.length > 0);
}

export function loadGoogleMaps() {
  if (isLoaded && window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (loadError) {
    return Promise.reject(loadError);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const key = getGoogleMapsApiKey();
  if (!key) {
    loadError = new Error('Google Maps API key is not configured. Set VITE_GOOGLE_MAPS_API_KEY in your .env.local file.');
    return Promise.reject(loadError);
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if script already loaded or already present in DOM
    if (window.google?.maps) {
      isLoaded = true;
      resolve(window.google.maps);
      return;
    }

    const existingScript = document.querySelector('script[data-gmaps-loader="true"]') ||
                           document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.setAttribute('data-gmaps-loader', 'true');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      key
    )}&libraries=places,geocoding,marker&v=weekly&loading=async&callback=__initGoogleMaps`;
    script.async = true;
    script.defer = true;

    window.__initGoogleMaps = () => {
      isLoaded = true;
      delete window.__initGoogleMaps;
      resolve(window.google.maps);
    };

    script.onerror = () => {
      loadError = new Error('Network error loading Google Maps script. Check your internet connection.');
      delete window.__initGoogleMaps;
      reject(loadError);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

/**
 * Reverse geocode coordinates to a human-readable address.
 */
export async function reverseGeocode(lat, lng) {
  if (window.google?.maps?.Geocoder) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });

      if (response.results && response.results.length > 0) {
        return response.results[0].formatted_address;
      }
    } catch (err) {
      console.warn('Google reverse geocoding notice:', err);
    }
  }

  // Fallback reverse geocoding via OpenStreetMap Nominatim for accuracy when Google geocoder is unauthenticated
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'User-Agent': 'CiviConnect-Municipal-Portal/1.0' } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.display_name) {
        return data.display_name;
      }
    }
  } catch (err) {
    console.warn('Fallback geocoder warning:', err);
  }

  return `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
}

/**
 * Reset loader state (useful for testing/retry).
 */
export function resetGoogleMapsLoader() {
  googleMapsPromise = null;
  isLoaded = false;
  loadError = null;
  lastGoogleMapsError = null;
}
