import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Book, ChevronRight, Languages, Scroll } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import sidourData from '@/data/sidour.json';

interface Prayer {
  id: string;
  title_he: string;
  title_fr: string;
  title_en: string;
  category: string;
  text_he: string;
  text_phonetic: string;
  translation_fr: string;
  translation_en: string;
}

type DisplayMode = 'hebrew' | 'phonetic' | 'both';
type TextSize = 'small' | 'medium' | 'large';

const categories: Record<string, { label_fr: string; label_en: string; icon: string }> = {
  morning: { label_fr: 'Prière du matin', label_en: 'Morning Prayer', icon: '🌅' },
  amida: { label_fr: 'Amida (18 bénédictions)', label_en: 'Amida (18 Blessings)', icon: '🙏' },
  shabbat: { label_fr: 'Chabbat', label_en: 'Shabbat', icon: '🕯️' },
  meals: { label_fr: 'Repas', label_en: 'Meals', icon: '🍞' },
  mourning: { label_fr: 'Deuil', label_en: 'Mourning', icon: '⚫' },
  closing: { label_fr: 'Clôture', label_en: 'Closing', icon: '✨' },
};

export default function Sidour() {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('both');
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);

  const prayers: Prayer[] = sidourData;

  const filteredPrayers = useMemo(() => {
    if (selectedCategory === 'all') return prayers;
    return prayers.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, prayers]);

  const getTitle = (prayer: Prayer) => {
    if (i18n.language === 'he') return prayer.title_he;
    if (i18n.language === 'en') return prayer.title_en;
    return prayer.title_fr;
  };

  const getTranslation = (prayer: Prayer) => {
    return i18n.language === 'en' ? prayer.translation_en : prayer.translation_fr;
  };

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const hebrewSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Book className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {i18n.language === 'he' ? 'סידור פתח אליהו' : 'Sidour Patah Eliyahou'}
          </h1>
          <p className="text-muted-foreground">
            {i18n.language === 'he' 
              ? 'תפילות יומיות עם ניקוד פונטי' 
              : i18n.language === 'en'
              ? 'Daily prayers with phonetic transliteration'
              : 'Prières quotidiennes avec translittération phonétique'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          {/* Display Mode */}
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Languages className="h-4 w-4 text-muted-foreground ml-2" />
            {(['hebrew', 'phonetic', 'both'] as DisplayMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setDisplayMode(mode)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  displayMode === mode
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'hebrew' && (i18n.language === 'he' ? 'עברית' : 'Hébreu')}
                {mode === 'phonetic' && (i18n.language === 'he' ? 'פונטי' : 'Phonétique')}
                {mode === 'both' && (i18n.language === 'he' ? 'שניהם' : 'Les deux')}
              </button>
            ))}
          </div>

          {/* Text Size */}
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Scroll className="h-4 w-4 text-muted-foreground ml-2" />
            {(['small', 'medium', 'large'] as TextSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setTextSize(size)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  textSize === size
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {size === 'small' && 'A-'}
                {size === 'medium' && 'A'}
                {size === 'large' && 'A+'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {i18n.language === 'he' ? 'הכל' : i18n.language === 'en' ? 'All' : 'Toutes'}
          </button>
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                selectedCategory === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{i18n.language === 'en' ? cat.label_en : cat.label_fr}</span>
            </button>
          ))}
        </div>

        {/* Prayers List */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {filteredPrayers.map((prayer) => {
            const isExpanded = expandedPrayer === prayer.id;
            
            return (
              <Card 
                key={prayer.id} 
                className={`overflow-hidden transition-all ${isExpanded ? 'ring-2 ring-primary' : ''}`}
              >
                <CardHeader 
                  className="pb-2 cursor-pointer"
                  onClick={() => setExpandedPrayer(isExpanded ? null : prayer.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {categories[prayer.category]?.icon || '📖'}
                      </span>
                      <div>
                        <h3 className="font-semibold text-lg">{getTitle(prayer)}</h3>
                        <Badge variant="outline" className="mt-1">
                          {i18n.language === 'he' 
                            ? categories[prayer.category]?.label_fr 
                            : i18n.language === 'en'
                            ? categories[prayer.category]?.label_en
                            : categories[prayer.category]?.label_fr}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight 
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`} 
                    />
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-6">
                    {/* Hebrew Text */}
                    {(displayMode === 'hebrew' || displayMode === 'both') && (
                      <div className="text-center">
                        <p className={`${hebrewSizeClasses[textSize]} font-serif leading-relaxed text-right`} dir="rtl">
                          {prayer.text_he}
                        </p>
                      </div>
                    )}

                    {/* Phonetic */}
                    {(displayMode === 'phonetic' || displayMode === 'both') && (
                      <div className={`${displayMode === 'both' ? 'border-t pt-4' : ''}`}>
                        {displayMode === 'both' && (
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            {i18n.language === 'he' ? 'תעתיק פונטי' : i18n.language === 'en' ? 'Phonetic' : 'Phonétique'}
                          </p>
                        )}
                        <p className={`${sizeClasses[textSize]} leading-relaxed italic text-muted-foreground`}>
                          {prayer.text_phonetic}
                        </p>
                      </div>
                    )}

                    {/* Translation */}
                    <div className="border-t pt-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        {i18n.language === 'he' ? 'תרגום' : i18n.language === 'en' ? 'Translation' : 'Traduction'}
                      </p>
                      <p className={`${sizeClasses[textSize]} leading-relaxed`}>
                        {getTranslation(prayer)}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {filteredPrayers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {i18n.language === 'he' 
                ? 'לא נמצאו תפילות' 
                : i18n.language === 'en'
                ? 'No prayers found'
                : 'Aucune prière trouvée'}
            </p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            {i18n.language === 'he'
              ? 'סידור זה נועד לעזור בתפילה. לגרסה המלאה, אנא פנו לסידור מודפס או לרב.'
              : i18n.language === 'en'
              ? 'This prayer book is intended to assist in prayer. For the complete version, please refer to a printed siddur or consult a rabbi.'
              : 'Ce sidour est destiné à faciliter la prière. Pour la version complète, veuillez consulter un sidour imprimé ou un rabbin.'}
          </p>
        </div>
      </main>
    </div>
  );
}
