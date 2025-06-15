/**
 * Geocoding utilities using Nominatim (OpenStreetMap) API
 */

import { Location, GeocodingResult } from '../types';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Convert coordinates to address (reverse geocoding)
 */
export const reverseGeocode = async (location: Location): Promise<string> => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${location.lat}&lon=${location.lng}&addressdetails=1&accept-language=vi,en`,
      {
        headers: {
          'User-Agent': 'TrafficAgentApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data: GeocodingResult = await response.json();
    return data.display_name || 'Unknown location';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
  }
};

/**
 * Search for locations by query
 */
export const searchLocations = async (query: string): Promise<GeocodingResult[]> => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=10&accept-language=vi,en`,
      {
        headers: {
          'User-Agent': 'TrafficAgentApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Location search failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
};

/**
 * Get detailed address components from geocoding result
 */
export const getAddressComponents = (result: GeocodingResult) => {
  const { address } = result;
  
  if (!address) {
    return {
      street: '',
      district: '',
      city: '',
      state: '',
      country: '',
      formatted: result.display_name
    };
  }

  return {
    street: [address.house_number, address.road].filter(Boolean).join(' '),
    district: address.suburb || address.city_district || '',
    city: address.city || address.town || address.village || '',
    state: address.state || address.province || '',
    country: address.country || '',
    formatted: result.display_name
  };
};

/**
 * Get bounds for a location search
 */
export const getLocationBounds = async (query: string) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=1&polygon_geojson=1&addressdetails=1&accept-language=vi,en`,
      {
        headers: {
          'User-Agent': 'TrafficAgentApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Location bounds request failed');
    }

    const results = await response.json();
    if (results.length === 0) {
      return null;
    }

    const result = results[0];
    if (result.boundingbox) {
      return {
        south: parseFloat(result.boundingbox[0]),
        north: parseFloat(result.boundingbox[1]),
        west: parseFloat(result.boundingbox[2]),
        east: parseFloat(result.boundingbox[3])
      };
    }

    return null;
  } catch (error) {
    console.error('Location bounds error:', error);
    return null;
  }
};

/**
 * Check if a location is within Vietnam (for relevance filtering)
 */
export const isLocationInVietnam = (location: Location): boolean => {
  // Vietnam approximate bounds
  const vietnamBounds = {
    north: 23.393395,
    south: 8.177845,
    east: 109.464638,
    west: 102.144847
  };

  return (
    location.lat >= vietnamBounds.south &&
    location.lat <= vietnamBounds.north &&
    location.lng >= vietnamBounds.west &&
    location.lng <= vietnamBounds.east
  );
};

/**
 * Format location for display
 */
export const formatLocationDisplay = (location: Location): string => {
  if (location.address) {
    return location.address;
  }
  
  return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
};

/**
 * Calculate zoom level based on search result type
 */
export const getAppropriateZoomLevel = (result: GeocodingResult): number => {
  const type = result.type || '';
  const category = result.category || '';

  // Building or POI level
  if (['house', 'building', 'amenity'].includes(category)) {
    return 18;
  }

  // Street level
  if (type.includes('road') || type.includes('street')) {
    return 16;
  }

  // Neighborhood level
  if (['suburb', 'neighbourhood', 'quarter'].includes(type)) {
    return 15;
  }

  // City level
  if (['city', 'town', 'village'].includes(type)) {
    return 13;
  }

  // Default zoom
  return 14;
}; 