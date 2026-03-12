import { useState } from 'react';

export interface LocationInfo {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Base de données des villes avec communautés juives importantes
export const jewishCommunities: LocationInfo[] = [
  { city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { city: 'Lyon', country: 'France', latitude: 45.7640, longitude: 4.8357 },
  { city: 'Marseille', country: 'France', latitude: 43.2965, longitude: 5.3698 },
  { city: 'Nice', country: 'France', latitude: 43.7102, longitude: 7.2620 },
  { city: 'Strasbourg', country: 'France', latitude: 48.5734, longitude: 7.7521 },
  { city: 'Tel Aviv', country: 'Israel', latitude: 32.0853, longitude: 34.7818 },
  { city: 'Jerusalem', country: 'Israel', latitude: 31.7683, longitude: 35.2137 },
  { city: 'Haifa', country: 'Israel', latitude: 32.7940, longitude: 34.9896 },
  { city: 'Bat Yam', country: 'Israel', latitude: 32.0232, longitude: 34.7505 },
  { city: 'New York', country: 'USA', latitude: 40.7128, longitude: -74.0060 },
  { city: 'Los Angeles', country: 'USA', latitude: 34.0522, longitude: -118.2437 },
  { city: 'Miami', country: 'USA', latitude: 25.7617, longitude: -80.1918 },
  { city: 'London', country: 'UK', latitude: 51.5074, longitude: -0.1278 },
  { city: 'Manchester', country: 'UK', latitude: 53.4808, longitude: -2.2426 },
  { city: 'Antwerp', country: 'Belgium', latitude: 51.2194, longitude: 4.4025 },
  { city: 'Brussels', country: 'Belgium', latitude: 50.8503, longitude: 4.3517 },
  { city: 'Geneva', country: 'Switzerland', latitude: 46.2044, longitude: 6.1432 },
  { city: 'Zurich', country: 'Switzerland', latitude: 47.3769, longitude: 8.5417 },
  { city: 'Montreal', country: 'Canada', latitude: 45.5017, longitude: -73.5673 },
  { city: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
  { city: 'Buenos Aires', country: 'Argentina', latitude: -34.6037, longitude: -58.3816 },
  { city: 'Sao Paulo', country: 'Brazil', latitude: -23.5505, longitude: -46.6333 },
  { city: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631 },
  { city: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
  { city: 'Johannesburg', country: 'South Africa', latitude: -26.2041, longitude: 28.0473 },
  { city: 'Cape Town', country: 'South Africa', latitude: -33.9249, longitude: 18.4241 },
  { city: 'Moscow', country: 'Russia', latitude: 55.7558, longitude: 37.6173 },
  { city: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050 },
  { city: 'Vienna', country: 'Austria', latitude: 48.2082, longitude: 16.3738 },
  { city: 'Rome', country: 'Italy', latitude: 41.9028, longitude: 12.4964 },
  { city: 'Milan', country: 'Italy', latitude: 45.4642, longitude: 9.1900 },
  { city: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041 },
  { city: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784 },
];

export function useLocationFilter() {
  const [userLocation, setUserLocation] = useState<LocationInfo | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  // Get unique countries
  const countries = Array.from(new Set(jewishCommunities.map(c => c.country))).sort();
  
  // Get cities for selected country
  const cities = selectedCountry === 'all' 
    ? jewishCommunities.map(c => c.city).sort()
    : jewishCommunities.filter(c => c.country === selectedCountry).map(c => c.city).sort();

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Find nearest city to coordinates
  const findNearestCity = (latitude: number, longitude: number): LocationInfo => {
    let nearest = jewishCommunities[0];
    let minDistance = Infinity;

    for (const city of jewishCommunities) {
      const distance = calculateDistance(latitude, longitude, city.latitude, city.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = city;
      }
    }

    return nearest;
  };

  // Filter items by location
  const filterByLocation = <T extends { latitude: number; longitude: number }>(
    items: T[],
    maxDistance: number = 50000 // 50km default
  ): T[] => {
    if (selectedCity !== 'all') {
      const city = jewishCommunities.find(c => c.city === selectedCity);
      if (city) {
        return items.filter(item => {
          const distance = calculateDistance(
            city.latitude, city.longitude,
            item.latitude, item.longitude
          );
          return distance <= maxDistance;
        });
      }
    }

    if (selectedCountry !== 'all') {
      // If country selected but no city, filter by country (would need country data on items)
      // For now, return all items in that country
      return items;
    }

    // If user location available, filter by distance
    if (userLocation) {
      return items.filter(item => {
        const distance = calculateDistance(
          userLocation.latitude, userLocation.longitude,
          item.latitude, item.longitude
        );
        return distance <= maxDistance;
      });
    }

    return items;
  };

  return {
    userLocation,
    setUserLocation,
    selectedCity,
    setSelectedCity,
    selectedCountry,
    setSelectedCountry,
    countries,
    cities,
    jewishCommunities,
    findNearestCity,
    filterByLocation,
    calculateDistance,
  };
}

export default useLocationFilter;
