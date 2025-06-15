import { useState, useCallback } from 'react';
import { LocationData } from '../types';

export interface UseGeolocationReturn {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  getCurrentLocation: () => Promise<LocationData | null>;
  getAddressFromCoords: (lat: number, lng: number) => Promise<string>;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Lấy địa chỉ từ tọa độ (reverse geocoding với fallback)
  const getAddressFromCoords = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      // Thử API đầu tiên (BigDataCloud)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=vi`,
        { signal: AbortSignal.timeout(5000) } // 5s timeout
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.locality || data.city) {
          return `${data.locality || data.city}, ${data.countryName || 'Việt Nam'}`;
        }
      }
    } catch (err) {
      console.warn('BigDataCloud API failed, trying fallback:', err);
    }

    try {
      // Fallback: Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`,
        { signal: AbortSignal.timeout(5000) }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          // Lấy phần địa chỉ ngắn gọn
          const parts = data.display_name.split(',');
          if (parts.length >= 2) {
            return `${parts[0].trim()}, ${parts[parts.length - 1].trim()}`;
          }
          return data.display_name;
        }
      }
    } catch (err) {
      console.warn('Nominatim API failed:', err);
    }
    
    // Fallback cuối cùng: chỉ hiển thị tọa độ
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }, []);

  // Lấy vị trí hiện tại
  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ Geolocation');
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000, // Cache 5 phút
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const address = await getAddressFromCoords(latitude, longitude);
            
            const locationData: LocationData = {
              latitude,
              longitude,
              address,
              timestamp: Date.now(),
            };

            setLocation(locationData);
            setHasPermission(true);
            setIsLoading(false);
            resolve(locationData);
          } catch (err) {
            console.error('Error processing location:', err);
            setError('Không thể xử lý thông tin vị trí');
            setIsLoading(false);
            resolve(null);
          }
        },
        (error) => {
          let errorMessage = 'Không thể lấy vị trí hiện tại';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Bạn đã từ chối quyền truy cập vị trí';
              setHasPermission(false);
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Thông tin vị trí không khả dụng';
              break;
            case error.TIMEOUT:
              errorMessage = 'Hết thời gian chờ lấy vị trí';
              break;
          }
          
          setError(errorMessage);
          setIsLoading(false);
          resolve(null);
        },
        options
      );
    });
  }, [getAddressFromCoords]);

  return {
    location,
    isLoading,
    error,
    hasPermission,
    getCurrentLocation,
    getAddressFromCoords,
  };
}; 