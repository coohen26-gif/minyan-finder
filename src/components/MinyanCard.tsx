import { useTranslation } from 'react-i18next';
import { MapPin, Users, Clock, AlertCircle } from 'lucide-react';
import { Minyan } from '@/lib/api';
import { calculateDistance, formatDistance } from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MinyanCardProps {
  minyan: Minyan;
  userPosition?: { latitude: number; longitude: number } | null;
  onJoin: (minyanId: string) => void;
  onLeave: (minyanId: string) => void;
  isParticipant: boolean;
}

const prayerTypeColors: Record<string, string> = {
  shacharit: 'bg-blue-100 text-blue-800 border-blue-200',
  mincha: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  maariv: 'bg-purple-100 text-purple-800 border-purple-200',
  levaya: 'bg-gray-900 text-gray-100 border-gray-800',
};

export function MinyanCard({
  minyan,
  userPosition,
  onJoin,
  onLeave,
  isParticipant,
}: MinyanCardProps) {
  const { t } = useTranslation();

  const distance = userPosition
    ? calculateDistance(userPosition, {
        latitude: minyan.latitude,
        longitude: minyan.longitude,
      })
    : null;

  const isNearby = distance !== null && distance <= 300;
  const isFuneral = minyan.prayer_type === 'levaya';

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all',
        isFuneral && 'border-gray-800 shadow-lg',
        isNearby && 'ring-2 ring-green-500 ring-offset-2'
      )}
    >
      {/* Urgent badge for funerals */}
      {isFuneral && (
        <div className="absolute top-0 right-0 bg-gray-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
          {t('minyan.urgent')}
        </div>
      )}

      {/* Nearby indicator */}
      {isNearby && (
        <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 text-xs font-bold flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {t('minyan.nearby')}
        </div>
      )}

      <CardHeader className={cn('pb-2', (isFuneral || isNearby) && 'pt-8')}>
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(
              'text-sm font-semibold capitalize',
              prayerTypeColors[minyan.prayer_type] || 'bg-gray-100'
            )}
          >
            {t(`prayer.${minyan.prayer_type}`)}
          </Badge>
          {distance !== null && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {t('minyan.distance', { distance: formatDistance(distance) })}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{minyan.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(minyan.time).toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>
            {minyan.participants.length} {t('minyan.participants')}
          </span>
        </div>

        {minyan.notes && (
          <p className="text-sm text-muted-foreground italic">
            {minyan.notes}
          </p>
        )}

        <Button
          variant={isParticipant ? 'outline' : 'default'}
          className="w-full"
          onClick={() =>
            isParticipant ? onLeave(minyan.id) : onJoin(minyan.id)
          }
        >
          {isParticipant ? t('minyan.leave') : t('minyan.join')}
        </Button>
      </CardContent>
    </Card>
  );
}
