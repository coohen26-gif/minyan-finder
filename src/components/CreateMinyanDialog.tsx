import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MapPin, Building2, Repeat, Calendar } from 'lucide-react';
import { MinyanRequest } from '@/lib/api';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CreateMinyanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (minyan: MinyanRequest) => void;
}

const prayerTypes = [
  { value: 'shacharit', label: 'prayer.shacharit' },
  { value: 'mincha', label: 'prayer.mincha' },
  { value: 'maariv', label: 'prayer.maariv' },
  { value: 'levaya', label: 'prayer.levaya' },
] as const;

export function CreateMinyanDialog({
  isOpen,
  onClose,
  onSubmit,
}: CreateMinyanDialogProps) {
  const { t } = useTranslation();
  const { position } = useGeolocation();
  
  const [formData, setFormData] = useState<MinyanRequest>({
    prayer_type: 'shacharit',
    location: '',
    latitude: position?.latitude || 48.8566,
    longitude: position?.longitude || 2.3522,
    time: new Date().toISOString().slice(0, 16),
    notes: '',
    is_permanent: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      latitude: position?.latitude || formData.latitude,
      longitude: position?.longitude || formData.longitude,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Créer une table de Minyan (10 requis)</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Prayer Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('form.prayerType')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {prayerTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, prayer_type: type.value })
                  }
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium border transition-colors',
                    formData.prayer_type === type.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted'
                  )}
                >
                  {t(type.label)}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              Lieu (Bureau, Synagogue, Salle...)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full pl-10 pr-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ex: Bureau - 45 Avenue Victor Hugo, Paris"
              />
            </div>
            {position && (
              <p className="text-xs text-muted-foreground mt-1">
                📍 Position GPS détectée
              </p>
            )}
          </div>

          {/* Permanent or One-time */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-1">
              <Repeat className="h-4 w-4" />
              Type de table
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_permanent: false })}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium border transition-colors flex items-center justify-center gap-1',
                  !formData.is_permanent
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted'
                )}
              >
                <Calendar className="h-4 w-4" />
                Une seule fois
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_permanent: true })}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium border transition-colors flex items-center justify-center gap-1',
                  formData.is_permanent
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted'
                )}
              >
                <Repeat className="h-4 w-4" />
                Tous les jours
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.is_permanent 
                ? 'Cette table sera disponible chaque jour à la même heure' 
                : 'Table pour aujourd\'hui uniquement'}
            </p>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('form.time')}
            </label>
            <input
              type="datetime-local"
              required
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('form.notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-y"
              placeholder="Instructions d'accès, étage, code porte..."
            />
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
            <p className="font-medium text-blue-800">💡 Comment ça marche :</p>
            <ul className="text-blue-700 mt-1 space-y-1 text-xs">
              <li>• Il faut exactement 10 personnes pour valider le Minyan</li>
              <li>• Les participants cliquent "Rejoindre la table"</li>
              <li>• À 10 personnes, la table devient verte ✅</li>
              <li>• Au-delà de 10, c'est bonus (11/10, 12/10...)</li>
            </ul>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              Créer la table (0/10)
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
