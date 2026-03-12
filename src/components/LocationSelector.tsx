import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Globe } from 'lucide-react';
import { jewishCommunities } from '@/hooks/useLocationFilter';
import { Badge } from '@/components/ui/badge';

interface LocationSelectorProps {
  selectedCountry: string;
  selectedCity: string;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
  userLocation: { latitude: number; longitude: number } | null;
}

export function LocationSelector({
  selectedCountry,
  selectedCity,
  onCountryChange,
  onCityChange,
  userLocation,
}: LocationSelectorProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Get unique countries
  const countries = Array.from(new Set(jewishCommunities.map(c => c.country))).sort();
  
  // Get cities for selected country
  const cities = selectedCountry === 'all' 
    ? []
    : jewishCommunities.filter(c => c.country === selectedCountry).map(c => c.city).sort();

  // Auto-detect location from coordinates
  useEffect(() => {
    if (userLocation && !selectedCity && !detectedLocation) {
      setIsDetecting(true);
      
      // Find nearest city
      let nearestCity = jewishCommunities[0];
      let minDistance = Infinity;
      
      for (const city of jewishCommunities) {
        const distance = calculateDistance(
          userLocation.latitude, userLocation.longitude,
          city.latitude, city.longitude
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestCity = city;
        }
      }
      
      // If within 50km, auto-select
      if (minDistance <= 50000) {
        setDetectedLocation(nearestCity.city);
        onCountryChange(nearestCity.country);
        onCityChange(nearestCity.city);
      }
      
      setIsDetecting(false);
    }
  }, [userLocation, selectedCity, detectedLocation, onCountryChange, onCityChange]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {currentLang === 'he' ? 'מיקום:' : currentLang === 'en' ? 'Location:' : 'Lieu :'}
        </span>
        
        {detectedLocation && (
          <Badge variant="secondary" className="text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            {currentLang === 'he' ? 'זוהה אוטומטית' : currentLang === 'en' ? 'Auto-detected' : 'Détecté auto'}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Country selector */}
        <select
          value={selectedCountry}
          onChange={(e) => {
            onCountryChange(e.target.value);
            onCityChange('all');
          }}
          className="px-3 py-2 rounded-md border bg-background text-sm"
        >
          <option value="all">
            {currentLang === 'he' ? 'כל המדינות' : currentLang === 'en' ? 'All countries' : 'Tous les pays'}
          </option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        {/* City selector (only if country selected) */}
        {selectedCountry !== 'all' && (
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="px-3 py-2 rounded-md border bg-background text-sm"
          >
            <option value="all">
              {currentLang === 'he' ? 'כל הערים' : currentLang === 'en' ? 'All cities' : 'Toutes les villes'}
            </option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        )}
      </div>

      {isDetecting && (
        <p className="text-xs text-muted-foreground">
          {currentLang === 'he' ? 'מזהה מיקום...' : currentLang === 'en' ? 'Detecting location...' : 'Détection du lieu...'}
        </p>
      )}
    </div>
  );
}

export default LocationSelector;
