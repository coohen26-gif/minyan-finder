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
    participants: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7'],
    is_permanent: true,
    status: 'open',
    min_required: 10,
  },
  {
    id: '2',
    prayer_type: 'mincha',
    location: 'Bureau - 45 Avenue Victor Hugo, Paris',
    latitude: 48.8589,
    longitude: 2.3544,
    time: new Date(Date.now() + 7200000).toISOString(),
    created_by: 'user3',
    created_at: new Date().toISOString(),
    participants: ['user3', 'user8', 'user9', 'user10', 'user11'],
    is_permanent: false,
    status: 'open',
    min_required: 10,
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
    participants: ['user4', 'user5', 'user6', 'user12', 'user13', 'user14', 'user15', 'user16', 'user17', 'user18'],
    is_permanent: false,
    status: 'complete',
    min_required: 10,
  },
  {
    id: '4',
    prayer_type: 'maariv',
    location: 'Salle de réunion - WeWork La Fayette',
    latitude: 48.875,
    longitude: 2.35,
    time: new Date(Date.now() + 10800000).toISOString(),
    notes: 'Table de bureau - tous les jours',
    created_by: 'user19',
    created_at: new Date().toISOString(),
    participants: ['user19', 'user20', 'user21', 'user22', 'user23', 'user24', 'user25', 'user26', 'user27', 'user28', 'user29', 'user30'],
    is_permanent: true,
    status: 'complete',
    min_required: 10,
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
      is_permanent: data.is_permanent,
      status: 'open',
      min_required: 10,
    };
    setMinyans([newMinyan, ...minyans]);
    setUserParticipations(new Set([...userParticipations, newMinyan.id]));
    toast.success('Table de Minyan créée ! 10 personnes nécessaires.');
  };

  const handleJoin = (minyanId: string) => {
    setMinyans(
      minyans.map((m) => {
        if (m.id === minyanId) {
          const newParticipants = [...m.participants, 'current_user'];
          // Si on atteint 10, la table est complète
          const newStatus = newParticipants.length >= 10 ? 'complete' : 'open';
          if (newStatus === 'complete' && m.status !== 'complete') {
            toast.success('🎉 Table complète ! 10/10 - Le Minyan peut avoir lieu !');
          }
          return { 
            ...m, 
            participants: newParticipants,
            status: newStatus
          };
        }
        return m;
      })
    );
    setUserParticipations(new Set([...userParticipations, minyanId]));
    toast.success('Vous êtes à la table !');
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
