/**
 * Geolocation utilities for the Traffic Agent system
 */

import { Location } from '../types';

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

const defaultOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 300000, // 5 minutes
};

/**
 * Get the user's current position
 */
export const getCurrentPosition = (
  options: GeolocationOptions = {}
): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    const finalOptions = { ...defaultOptions, ...options };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        const errorMessages = {
          1: 'Location access denied by user.',
          2: 'Location information is unavailable.',
          3: 'Location request timed out.'
        };
        
        reject({
          code: error.code,
          message: errorMessages[error.code as keyof typeof errorMessages] || 'Unknown error occurred.'
        });
      },
      finalOptions
    );
  });
};

/**
 * Watch the user's position changes
 */
export const watchPosition = (
  onSuccess: (location: Location) => void,
  onError: (error: GeolocationError) => void,
  options: GeolocationOptions = {}
): number => {
  if (!navigator.geolocation) {
    onError({
      code: 0,
      message: 'Geolocation is not supported by this browser.'
    });
    return -1;
  }

  const finalOptions = { ...defaultOptions, ...options };

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    },
    (error) => {
      const errorMessages = {
        1: 'Location access denied by user.',
        2: 'Location information is unavailable.',
        3: 'Location request timed out.'
      };
      
      onError({
        code: error.code,
        message: errorMessages[error.code as keyof typeof errorMessages] || 'Unknown error occurred.'
      });
    },
    finalOptions
  );
};

/**
 * Clear position watching
 */
export const clearWatch = (watchId: number): void => {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Check if geolocation is supported
 */
export const isGeolocationSupported = (): boolean => {
  return 'geolocation' in navigator;
};

/**
 * Request location permission
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (!navigator.permissions) {
    // Fallback: try to get position to trigger permission prompt
    try {
      await getCurrentPosition();
      return true;
    } catch {
      return false;
    }
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state === 'granted';
  } catch {
    return false;
  }
};

/**
 * Calculate distance between two points using Haversine formula
 */
export const calculateDistance = (
  point1: Location,
  point2: Location
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * 
    Math.cos(toRadians(point2.lat)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
}; 