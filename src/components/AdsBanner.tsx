import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plane, ShoppingBag, BookOpen, Users, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getActiveAds, AdConfig } from '@/data/adsConfig';
import { useGeolocation } from '@/hooks/useGeolocation';

interface AdsBannerProps {
  position: 'top' | 'bottom' | 'sidebar';
  maxAds?: number;
}

const typeIcons: Record<AdConfig['type'], typeof Plane> = {
  travel: Plane,
  grocery: ShoppingBag,
  learning: BookOpen,
  services: Users,
  events: Star,
};

const typeColors: Record<AdConfig['type'], string> = {
  travel: 'bg-blue-100 text-blue-800',
  grocery: 'bg-green-100 text-green-800',
  learning: 'bg-purple-100 text-purple-800',
  services: 'bg-orange-100 text-orange-800',
  events: 'bg-pink-100 text-pink-800',
};

export function AdsBanner({ position, maxAds = 3 }: AdsBannerProps) {
  const { t, i18n } = useTranslation();
  const { position: userPos } = useGeolocation();
  const [dismissedAds, setDismissedAds] = useState<Set<string>>(new Set());
  const [showAds, setShowAds] = useState(true);

  // Pour l'instant, pas de publicités actives (mode non lucratif)
  const activeAds: AdConfig[] = [];
  
  // Quand on activera les pubs:
  // const activeAds = getActiveAds(userCity, userCommunity).slice(0, maxAds);

  if (activeAds.length === 0 || !showAds) return null;

  const visibleAds = activeAds.filter(ad => !dismissedAds.has(ad.title));

  if (visibleAds.length === 0) return null;

  return (
    <div className={`
      ${position === 'top' ? 'w-full mb-4' : ''}
      ${position === 'bottom' ? 'w-full mt-4' : ''}
      ${position === 'sidebar' ? 'w-64' : ''}
    `}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">
          {i18n.language === 'he' ? 'מומלץ עבורך' : i18n.language === 'en' ? 'Recommended for you' : 'Recommandé pour vous'}
        </p>
        <button
          onClick={() => setShowAds(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {i18n.language === 'he' ? 'הסתר' : i18n.language === 'en' ? 'Hide' : 'Masquer'}
        </button>
      </div>

      <div className={`space-y-2 ${position === 'sidebar' ? '' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'}`}>
        {visibleAds.map((ad) => {
          const Icon = typeIcons[ad.type];
          return (
            <Card key={ad.title} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${typeColors[ad.type]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">
                        {i18n.language === 'he' ? ad.title_he : ad.title}
                      </h4>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {i18n.language === 'he' ? 'מומלץ' : i18n.language === 'en' ? 'Ad' : 'Pub'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {i18n.language === 'he' ? ad.description_he : ad.description}
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto mt-2 text-xs"
                      onClick={() => window.open(ad.link, '_blank')}
                    >
                      {i18n.language === 'he' ? 'לפרטים נוספים' : i18n.language === 'en' ? 'Learn more' : 'En savoir plus'} →
                    </Button>
                  </div>
                  <button
                    onClick={() => setDismissedAds(prev => new Set([...prev, ad.title]))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default AdsBanner;
