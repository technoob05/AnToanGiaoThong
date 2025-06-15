/**
 * Geolocation hook for the Traffic Agent feature
 */

import { useState, useEffect, useCallback } from 'react';
import { Location } from '../types';
import { 
  getCurrentPosition, 
  watchPosition, 
  clearWatch, 
  isGeolocationSupported,
  type GeolocationError,
  type GeolocationOptions
} from '../utils/geolocation';

interface UseGeolocationReturn {
  location: Location | null;
  error: GeolocationError | null;
  loading: boolean;
  accuracy: number | null;
  lastUpdated: Date | null;
  isSupported: boolean;
  requestLocation: () => Promise<void>;
  startWatching: () => void;
  stopWatching: () => void;
  isWatching: boolean;
}

export const useGeolocation = (
  options: GeolocationOptions = {},
  autoStart = false
): UseGeolocationReturn => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isSupported] = useState(isGeolocationSupported());

  const handleSuccess = useCallback((newLocation: Location, newAccuracy?: number) => {
    setLocation(newLocation);
    setError(null);
    setLoading(false);
    setAccuracy(newAccuracy || null);
    setLastUpdated(new Date());
  }, []);

  const handleError = useCallback((newError: GeolocationError) => {
    setError(newError);
    setLoading(false);
    setLocation(null);
    setAccuracy(null);
  }, []);

  const requestLocation = useCallback(async () => {
    if (!isSupported) {
      handleError({
        code: 0,
        message: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await getCurrentPosition(options);
      handleSuccess(position);
    } catch (err) {
      handleError(err as GeolocationError);
    }
  }, [isSupported, options, handleSuccess, handleError]);

  const startWatching = useCallback(() => {
    if (!isSupported || watchId !== null) return;

    setLoading(true);
    setError(null);

    const id = watchPosition(
      (position) => handleSuccess(position),
      (err) => handleError(err),
      options
    );

    if (id !== -1) {
      setWatchId(id);
    }
  }, [isSupported, watchId, options, handleSuccess, handleError]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      clearWatch(watchId);
      setWatchId(null);
      setLoading(false);
    }
  }, [watchId]);

  // Auto-start watching if enabled
  useEffect(() => {
    if (autoStart && isSupported) {
      startWatching();
    }

    return () => {
      if (watchId !== null) {
        clearWatch(watchId);
      }
    };
  }, [autoStart, isSupported, startWatching, watchId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    error,
    loading,
    accuracy,
    lastUpdated,
    isSupported,
    requestLocation,
    startWatching,
    stopWatching,
    isWatching: watchId !== null
  };
}; 