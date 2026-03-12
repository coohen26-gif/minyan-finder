import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Users, Clock, AlertCircle, CheckCircle, Repeat, Building2, Bell, BellOff, ChevronDown, ChevronUp, User, MessageCircle } from 'lucide-react';
import { Minyan } from '@/lib/api';
import { calculateDistance, formatDistance } from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MinyanCardProps {
  minyan: Minyan;
  userPosition?: { latitude: number; longitude: number } | null;
  onJoin: (minyanId: string) => void;
  onLeave: (minyanId: string) => void;
  onToggleNotification: () => void;
  onOpenChat: () => void;
  isParticipant: boolean;
  isNotificationEnabled: boolean;
  users: Record<string, { name: string; avatar: string }>;
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
  onToggleNotification,
  onOpenChat,
  isParticipant,
  isNotificationEnabled,
  users,
}: MinyanCardProps) {
  const { t } = useTranslation();
  const [showParticipants, setShowParticipants] = useState(false);

  const distance = userPosition
    ? calculateDistance(userPosition, {
        latitude: minyan.latitude,
        longitude: minyan.longitude,
      })
    : null;

  const isNearby = distance !== null && distance <= 300;
  const isFuneral = minyan.prayer_type === 'levaya';
  const isComplete = minyan.status === 'complete';
  const participantCount = minyan.participants.length;
  const minRequired = minyan.min_required;
  const progressPercent = Math.min((participantCount / minRequired) * 100, 100);

  // Get participant names
  const participantList = minyan.participants.map(id => ({
    id,
    ...users[id] || { name: `Utilisateur ${id.slice(-4)}`, avatar: '??' }
  }));

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all',
        isFuneral && 'border-gray-800 shadow-lg',
        isNearby && 'ring-2 ring-green-500 ring-offset-2',
        isComplete && 'border-green-500 shadow-md'
      )}
    >
      {/* Header badges */}
      <div className="absolute top-0 right-0 flex flex-col gap-1">
        {isComplete && (
          <div className="bg-green-500 text-white px-3 py-1 text-xs font-bold flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {participantCount}/{minRequired} ✅
          </div>
        )}
        {isFuneral && !isComplete && (
          <div className="bg-gray-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
            {t('minyan.urgent')}
          </div>
        )}
      </div>

      {/* Nearby indicator */}
      {isNearby && (
        <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 text-xs font-bold flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {t('minyan.nearby')}
        </div>
      )}

      <CardHeader className={cn('pb-2', (isFuneral || isNearby || isComplete) && 'pt-8')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                'text-sm font-semibold capitalize',
                prayerTypeColors[minyan.prayer_type] || 'bg-gray-100'
              )}
            >
              {t(`prayer.${minyan.prayer_type}`)}
            </Badge>
            {minyan.is_permanent && (
              <Badge variant="secondary" className="text-xs">
                <Repeat className="h-3 w-3 mr-1" />
                Quotidien
              </Badge>
            )}
          </div>
          {distance !== null && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {t('minyan.distance', { distance: formatDistance(distance) })}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Location */}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{minyan.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(minyan.time).toLocaleString()}</span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              Minyan : {participantCount}/{minRequired}
            </span>
            <span className={cn(
              'text-xs font-bold',
              isComplete ? 'text-green-600' : 'text-amber-600'
            )}>
              {isComplete ? 'Minyan validé !' : `${minRequired - participantCount} manquants`}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500',
                isComplete ? 'bg-green-500' : progressPercent < 30 ? 'bg-red-500' : progressPercent < 70 ? 'bg-amber-500' : 'bg-yellow-400'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Participants list (collapsible) */}
        <div className="border rounded-md overflow-hidden">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="w-full px-3 py-2 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              {participantCount} personne{participantCount > 1 ? 's' : ''} au minyan
            </span>
            {showParticipants ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
          {showParticipants && (
            <div className="p-3 space-y-2 max-h-40 overflow-y-auto">
              {participantList.map((participant, index) => (
                <div key={participant.id} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/10">
                      {participant.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{participant.name}</span>
                  {index === 0 && (
                    <Badge variant="outline" className="text-xs">Créateur</Badge>
                  )}
                  {participant.id === 'current_user' && (
                    <Badge variant="secondary" className="text-xs">Vous</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {minyan.notes && (
          <p className="text-sm text-muted-foreground italic">
            {minyan.notes}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant={isParticipant ? 'outline' : isComplete ? 'secondary' : 'default'}
            className={cn(
              'flex-1',
              isComplete && !isParticipant && 'bg-green-100 text-green-800 hover:bg-green-200'
            )}
            onClick={() => isParticipant ? onLeave(minyan.id) : onJoin(minyan.id)}
          >
            {isParticipant 
              ? 'Quitter la minyan' 
              : isComplete 
                ? `Rejoindre (+${participantCount - minRequired + 1})` 
                : 'S\'asseoir au minyan'}
          </Button>
          
          {isParticipant && (
            <Button
              variant="outline"
              size="icon"
              onClick={onOpenChat}
              title="Chat du Minyan"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
          
          {!isParticipant && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleNotification}
              className={isNotificationEnabled ? 'text-primary' : ''}
              title={isNotificationEnabled ? 'Notifications activées' : 'Me notifier à 10'}
            >
              {isNotificationEnabled ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
