import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Filter, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Minyan, MinyanRequest } from '@/lib/api';
import { useGeolocation, calculateDistance } from '@/hooks/useGeolocation';
import { Header } from '@/components/Header';
import { MinyanCard } from '@/components/MinyanCard';
import { CreateMinyanDialog } from '@/components/CreateMinyanDialog';
import { MinyanChat } from '@/components/MinyanChat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock users database
const mockUsers: Record<string, { name: string; avatar: string }> = {
  'user1': { name: 'David Cohen', avatar: 'DC' },
  'user2': { name: 'Moshe Levy', avatar: 'ML' },
  'user3': { name: 'Avraham Ben', avatar: 'AB' },
  'user4': { name: 'Yosef Mizrahi', avatar: 'YM' },
  'user5': { name: 'Chaim Peretz', avatar: 'CP' },
  'user6': { name: 'Shlomo Amar', avatar: 'SA' },
  'user7': { name: 'Yaakov Israel', avatar: 'YI' },
  'user8': { name: 'Isaac Ben', avatar: 'IB' },
  'user9': { name: 'Aaron Cohen', avatar: 'AC' },
  'user10': { name: 'Simon Levy', avatar: 'SL' },
  'current_user': { name: 'Moi', avatar: 'MOI' },
};

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
    notes: 'Minyan de bureau - tous les jours',
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
  const [notificationsEnabled, setNotificationsEnabled] = useState<Set<string>>(new Set());
  const [chatOpen, setChatOpen] = useState<string | null>(null);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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

  // Send notification when minyan reaches 10
  const sendCompletionNotification = useCallback((minyan: Minyan) => {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 Minyan complet !', {
        body: `La minyan à ${minyan.location} a atteint 10 personnes. Le Minyan peut avoir lieu !`,
        icon: '/vite.svg',
      });
    }
    
    // Toast notification
    toast.success('🎉 Minyan complète !', {
      description: `${minyan.location} - 10/10 personnes. Le Minyan est validé !`,
      duration: 5000,
    });
  }, []);

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

    // Sort funerals first, then by completion status
    result = result.sort((a, b) => {
      if (a.prayer_type === 'levaya' && b.prayer_type !== 'levaya') return -1;
      if (b.prayer_type === 'levaya' && a.prayer_type !== 'levaya') return 1;
      if (a.status === 'complete' && b.status !== 'complete') return -1;
      if (b.status === 'complete' && a.status !== 'complete') return 1;
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
    toast.success('Minyan de Minyan créée ! 10 personnes nécessaires.');
  };

  const handleJoin = (minyanId: string) => {
    setMinyans(
      minyans.map((m) => {
        if (m.id === minyanId) {
          const newParticipants = [...m.participants, 'current_user'];
          const newStatus = newParticipants.length >= 10 ? 'complete' : 'open';
          const updatedMinyan: Minyan = { 
            ...m, 
            participants: newParticipants,
            status: newStatus as 'open' | 'complete' | 'cancelled'
          };
          
          // If just reached 10, send notification
          if (newStatus === 'complete' && m.status !== 'complete') {
            sendCompletionNotification(updatedMinyan);
          }
          
          return updatedMinyan;
        }
        return m;
      })
    );
    setUserParticipations(new Set([...userParticipations, minyanId]));
    toast.success('Vous êtes assis au minyan !');
  };

  const handleLeave = (minyanId: string) => {
    setMinyans(
      minyans.map((m) => {
        if (m.id === minyanId) {
          const newParticipants = m.participants.filter((p) => p !== 'current_user');
          const wasComplete = m.status === 'complete';
          const isNowOpen = newParticipants.length < 10;
          
          // Si on passait de 10+ à moins de 10, notifier les gens aux alentours
          if (wasComplete && isNowOpen) {
            toast.warning('⚠️ Minyan incomplète !', {
              description: `${m.location} - Plus que ${newParticipants.length}/10. Le Minyan risque de ne pas avoir lieu.`,
              duration: 5000,
            });
            
            // Notifier les abonnés aux notifications
            if (notificationsEnabled.has(minyanId)) {
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('⚠️ Minyan incomplète', {
                  body: `Il manque des personnes à ${m.location}. Revenez vite !`,
                  icon: '/vite.svg',
                });
              }
            }
            
            // Notifier les gens proches
            if (position) {
              const distance = calculateDistance(position, {
                latitude: m.latitude,
                longitude: m.longitude,
              });
              if (distance <= 500) {
                toast.info('Une minyan proche a besoin de vous !', {
                  description: `${m.location} - ${10 - newParticipants.length} personne(s) manquante(s)`,
                  action: {
                    label: 'Rejoindre',
                    onClick: () => handleJoin(minyanId),
                  },
                });
              }
            }
          }
          
          return {
            ...m,
            participants: newParticipants,
            status: (newParticipants.length >= 10 ? 'complete' : 'open') as 'open' | 'complete' | 'cancelled',
          } as Minyan;
        }
        return m;
      })
    );
    const newParticipations = new Set(userParticipations);
    newParticipations.delete(minyanId);
    setUserParticipations(newParticipations);
    toast.success('Vous avez quitté la minyan');
  };

  const toggleNotification = (minyanId: string) => {
    const newNotifications = new Set(notificationsEnabled);
    if (newNotifications.has(minyanId)) {
      newNotifications.delete(minyanId);
      toast.info('Notifications désactivées pour cette minyan');
    } else {
      newNotifications.add(minyanId);
      toast.success('Vous serez notifié quand la minyan atteindra 10 !');
    }
    setNotificationsEnabled(newNotifications);
  };

  // Stats
  const stats = useMemo(() => {
    const total = minyans.length;
    const complete = minyans.filter(m => m.status === 'complete').length;
    const open = minyans.filter(m => m.status === 'open').length;
    const myMinyans = minyans.filter(m => userParticipations.has(m.id)).length;
    return { total, complete, open, myMinyans };
  }, [minyans, userParticipations]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('app.title')}</h1>
          <p className="text-muted-foreground">{t('app.subtitle')}</p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Badge variant="outline" className="px-3 py-1">
              <Users className="h-3 w-3 mr-1" />
              {stats.total} minyans
            </Badge>
            <Badge variant="default" className="px-3 py-1 bg-green-100 text-green-800">
              {stats.complete} validées
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              {stats.open} en cours
            </Badge>
            {stats.myMinyans > 0 && (
              <Badge variant="outline" className="px-3 py-1 border-primary">
                {stats.myMinyans} mes minyans
              </Badge>
            )}
          </div>

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
              onToggleNotification={() => toggleNotification(minyan.id)}
              onOpenChat={() => setChatOpen(minyan.id)}
              isParticipant={userParticipations.has(minyan.id)}
              isNotificationEnabled={notificationsEnabled.has(minyan.id)}
              users={mockUsers}
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

      {chatOpen && (
        <MinyanChat
          minyan={minyans.find(m => m.id === chatOpen)!}
          isOpen={!!chatOpen}
          onClose={() => setChatOpen(null)}
          users={mockUsers}
          currentUserId="current_user"
        />
      )}
    </div>
  );
}
