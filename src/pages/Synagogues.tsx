import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Phone, Globe } from 'lucide-react';
import { Header } from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Synagogue } from '@/lib/api';
import { useGeolocation, calculateDistance, formatDistance } from '@/hooks/useGeolocation';
import { LocationSelector } from '@/components/LocationSelector';
import synagoguesIsrael from '@/data/synagogues_israel.json';
import synagoguesMore from '@/data/synagogues_more.json';

// Sample synagogue data
const synagoguesData: Synagogue[] = [
  {
    id: '1',
    name: 'Synagogue Nazareth',
    address: '15 Rue Nazareth',
    city: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
    phone: '+33 1 42 72 08 88',
    website: 'https://synagogue-nazareth.org',
    denomination: 'ashkenazi',
  },
  {
    id: '2',
    name: 'Synagogue des Tournelles',
    address: '21 bis Rue des Tournelles',
    city: 'Paris',
    country: 'France',
    latitude: 48.8555,
    longitude: 2.3678,
    phone: '+33 1 42 72 08 88',
    denomination: 'sephardi',
  },
  {
    id: '3',
    name: 'Great Synagogue of Jerusalem',
    address: '56 King George Street',
    city: 'Jerusalem',
    country: 'Israel',
    latitude: 31.7767,
    longitude: 35.2345,
    denomination: 'mixed',
  },
  {
    id: '4',
    name: 'Park East Synagogue',
    address: '163 East 67th Street',
    city: 'New York',
    country: 'USA',
    latitude: 40.7678,
    longitude: -73.9645,
    phone: '+1 212-737-2700',
    website: 'https://parkeastsynagogue.org',
    denomination: 'ashkenazi',
  },
  {
    id: '5',
    name: 'Congregation Shearith Israel',
    address: '8 West 70th Street',
    city: 'New York',
    country: 'USA',
    latitude: 40.7734,
    longitude: -73.9778,
    phone: '+1 212-873-0300',
    denomination: 'sephardi',
  },
];

// Merge all synagogues
const allSynagogues: Synagogue[] = [
  ...synagoguesData, 
  ...(synagoguesIsrael as Synagogue[]),
  ...(synagoguesMore as Synagogue[])
];

export default function Synagogues() {
  const { t } = useTranslation();
  const { position } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const filteredSynagogues = useMemo(() => {
    let result = allSynagogues;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.address.toLowerCase().includes(query) ||
          s.city.toLowerCase().includes(query)
      );
    }

    // Country filter
    if (selectedCountry !== 'all') {
      result = result.filter((s) => s.country === selectedCountry);
    }

    // City filter
    if (selectedCity !== 'all') {
      result = result.filter((s) => s.city === selectedCity);
    }

    // Sort by distance if position available
    if (position) {
      result = [...result].sort((a, b) => {
        const distA = calculateDistance(position, {
          latitude: a.latitude,
          longitude: a.longitude,
        });
        const distB = calculateDistance(position, {
          latitude: b.latitude,
          longitude: b.longitude,
        });
        return distA - distB;
      });
    }

    return result;
  }, [searchQuery, selectedCountry, selectedCity, position]);

  const getDistance = (synagogue: Synagogue) => {
    if (!position) return null;
    return calculateDistance(position, {
      latitude: synagogue.latitude,
      longitude: synagogue.longitude,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('synagogue.title')}</h1>
          <p className="text-muted-foreground">
            {allSynagogues.length} synagogues référencées
          </p>
        </div>

        {/* Location Selector */}
        <LocationSelector
          selectedCountry={selectedCountry}
          selectedCity={selectedCity}
          onCountryChange={setSelectedCountry}
          onCityChange={setSelectedCity}
          userLocation={position}
        />

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('synagogue.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>


        </div>

        {/* Synagogue List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSynagogues.map((synagogue) => {
            const distance = getDistance(synagogue);
            
            return (
              <Card key={synagogue.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{synagogue.name}</h3>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {synagogue.denomination}
                      </Badge>
                    </div>
                    {distance && (
                      <Badge className="bg-green-100 text-green-800">
                        <MapPin className="h-3 w-3 mr-1" />
                        {formatDistance(distance)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{synagogue.address}</p>
                      <p className="text-muted-foreground">
                        {synagogue.city}, {synagogue.country}
                      </p>
                    </div>
                  </div>

                  {synagogue.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${synagogue.phone}`}
                        className="text-primary hover:underline"
                      >
                        {synagogue.phone}
                      </a>
                    </div>
                  )}

                  {synagogue.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={synagogue.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {synagogue.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredSynagogues.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucune synagogue trouvée avec ces critères
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
