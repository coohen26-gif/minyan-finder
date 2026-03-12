import { useState, useEffect, useCallback } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationState {
  position: Coordinates | null;
  error: string | null;
  loading: boolean;
  permission: 'granted' | 'denied' | 'prompt';
}

// Haversine formula to calculate distance between two coordinates
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: true,
    permission: 'prompt',
  });

  const requestPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    try {
      // Check permission status
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setState((prev) => ({ ...prev, permission: result.state as any }));
        
        result.addEventListener('change', () => {
          setState((prev) => ({ ...prev, permission: result.state as any }));
        });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            position: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            error: null,
            loading: false,
            permission: 'granted',
          });
        },
        (error) => {
          setState({
            position: null,
            error: error.message,
            loading: false,
            permission: error.code === 1 ? 'denied' : 'prompt',
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } catch (err) {
      setState({
        position: null,
        error: 'Failed to request geolocation permission',
        loading: false,
        permission: 'denied',
      });
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return { ...state, requestPermission };
}

export default useGeolocation;
