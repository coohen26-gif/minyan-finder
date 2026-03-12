import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Filter, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Minyan, MinyanRequest } from '@/lib/api';
import { useGeolocation, calculateDistance } from '@/hooks/useGeolocation';
import { Header } from '@/components/Header';
import { MinyanCard } from '@/components/MinyanCard';
import { CreateMinyanDialog } from '@/components/CreateMinyanDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration
const mockMinyans: Minyan[] = [
  {
    id: '1',
    prayer_type: 'shacharit',
    location: '12 Rue des Rosiers, Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    time: new Date(Date.now() + 3600000).toISOString(),
    notes: 'Synagogue Nazareth',
    created_by: 'user1',
    created_at: new Date().toISOString(),
    participants: ['user1', 'user2'],
  },
  {
    id: '2',
    prayer_type: 'mincha',
    location: '45 Avenue Victor Hugo, Paris',
    latitude: 48.8589,
    longitude: 2.3544,
    time: new Date(Date.now() + 7200000).toISOString(),
    created_by: 'user3',
    created_at: new Date().toISOString(),
    participants: ['user3'],
  },
  {
    id: '3',
    prayer_type: 'levaya',
    location: 'Cimetière de Pantin',
    latitude: 48.9056,
    longitude: 2.4123,
    time: new Date(Date.now() + 1800000).toISOString(),
    notes: 'Urgent - Besoin de 10 hommes',
    created_by: 'user4',
    created_at: new Date().toISOString(),
    participants: ['user4', 'user5', 'user6'],
  },
];

const prayerFilters = ['all', 'shacharit', 'mincha', 'maariv', 'levaya'] as const;

export default function Index() {
  const { t } = useTranslation();
  const { position, permission } = useGeolocation();
  const [minyans, setMinyans] = useState<Minyan[]>(mockMinyans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<typeof prayerFilters[number]>('all');
  const [userParticipations, setUserParticipations] = useState<Set<string>>(new Set());

  // Check for nearby minyans and show alerts
  useEffect(() => {
    if (!position) return;

    minyans.forEach((minyan) => {
      const distance = calculateDistance(position, {
        latitude: minyan.latitude,
        longitude: minyan.longitude,
      });

      if (distance <= 300 && !userParticipations.has(minyan.id)) {
        toast.success(t('alerts.nearbyTitle'), {
          description: t('alerts.nearbyMessage', {
            distance: distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`,
          }),
          action: {
            label: t('minyan.join'),
            onClick: () => handleJoin(minyan.id),
          },
        });
      }
    });
  }, [position, minyans, userParticipations, t]);

  const filteredMinyans = useMemo(() => {
    let result = minyans;

    // Filter by prayer type
    if (filter !== 'all') {
      result = result.filter((m) => m.prayer_type === filter);
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

    // Sort funerals first
    result = result.sort((a, b) => {
      if (a.prayer_type === 'levaya' && b.prayer_type !== 'levaya') return -1;
      if (b.prayer_type === 'levaya' && a.prayer_type !== 'levaya') return 1;
      return 0;
    });

    return result;
  }, [minyans, filter, position]);

  const handleCreateMinyan = (data: MinyanRequest) => {
    const newMinyan: Minyan = {
      id: Date.now().toString(),
      ...data,
      created_by: 'current_user',
      created_at: new Date().toISOString(),
      participants: ['current_user'],
    };
    setMinyans([newMinyan, ...minyans]);
    setUserParticipations(new Set([...userParticipations, newMinyan.id]));
    toast.success('Minyan créé avec succès !');
  };

  const handleJoin = (minyanId: string) => {
    setMinyans(
      minyans.map((m) =>
        m.id === minyanId
          ? { ...m, participants: [...m.participants, 'current_user'] }
          : m
      )
    );
    setUserParticipations(new Set([...userParticipations, minyanId]));
    toast.success('Vous avez rejoint le Minyan !');
  };

  const handleLeave = (minyanId: string) => {
    setMinyans(
      minyans.map((m) =>
        m.id === minyanId
          ? { ...m, participants: m.participants.filter((p) => p !== 'current_user') }
          : m
      )
    );
    const newParticipations = new Set(userParticipations);
    newParticipations.delete(minyanId);
    setUserParticipations(newParticipations);
    toast.success('Vous avez quitté le Minyan');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('app.title')}</h1>
          <p className="text-muted-foreground">{t('app.subtitle')}</p>
          {position && (
            <Badge variant="outline" className="mt-2">
              <MapPin className="h-3 w-3 mr-1" />
              {t('minyan.nearby')}
            </Badge>
          )}
          {permission === 'denied' && (
            <p className="text-sm text-amber-600 mt-2">
              Activez la géolocalisation pour voir les Minyanim proches de vous
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {prayerFilters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {f === 'all' ? 'Tous' : t(`prayer.${f}`)}
              </button>
            ))}
          </div>

          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('minyan.create')}
          </Button>
        </div>

        {/* Minyan List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMinyans.map((minyan) => (
            <MinyanCard
              key={minyan.id}
              minyan={minyan}
              userPosition={position}
              onJoin={handleJoin}
              onLeave={handleLeave}
              isParticipant={userParticipations.has(minyan.id)}
            />
          ))}
        </div>

        {filteredMinyans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucun Minyan trouvé. Créez le premier !
            </p>
          </div>
        )}
      </main>

      <CreateMinyanDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateMinyan}
      />
    </div>
  );
}
