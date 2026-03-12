import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MapPin } from 'lucide-react';
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
          <h2 className="text-lg font-semibold">{t('minyan.create')}</h2>
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
            <label className="block text-sm font-medium mb-2">
              {t('form.location')}
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
                placeholder="123 Rue de Paris, Paris"
              />
            </div>
            {position && (
              <p className="text-xs text-muted-foreground mt-1">
                📍 {t('minyan.nearby')} — Utilisation de votre position actuelle
              </p>
            )}
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
              placeholder="Informations complémentaires..."
            />
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              {t('form.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
