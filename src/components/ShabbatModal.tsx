import { useTranslation } from 'react-i18next';
import { Moon, Sun, Clock, AlertTriangle } from 'lucide-react';
import { useShabbatObserver } from '@/hooks/useShabbatObserver';
import { useGeolocation } from '@/hooks/useGeolocation';

export function ShabbatModal() {
  const { t, i18n } = useTranslation();
  const { position } = useGeolocation();
  const { isForbidden, isShabbat, isHoliday, holidayName, candleLighting, havdalah, minutesUntilShabbat } = 
    useShabbatObserver(position?.latitude, position?.longitude);

  if (!isForbidden) {
    // Afficher un avertissement si on approche de Chabbat (moins de 2 heures)
    if (minutesUntilShabbat && minutesUntilShabbat > 0 && minutesUntilShabbat <= 120) {
      return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-amber-100 border-2 border-amber-500 rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-start gap-3">
            <Clock className="h-6 w-6 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-800">
                {i18n.language === 'he' ? 'שבת קרובה' : 'Chabbat approche'}
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                {i18n.language === 'he' 
                  ? `הדלקת נרות בעוד ${Math.floor(minutesUntilShabbat / 60)} שעות ו-${minutesUntilShabbat % 60} דקות`
                  : i18n.language === 'en'
                  ? `Candle lighting in ${Math.floor(minutesUntilShabbat / 60)}h ${minutesUntilShabbat % 60}min`
                  : `Allumage des bougies dans ${Math.floor(minutesUntilShabbat / 60)}h ${minutesUntilShabbat % 60}min`}
              </p>
              <p className="text-xs text-amber-600 mt-2">
                {i18n.language === 'he' 
                  ? 'האפליקציה תיסגר אוטומטית'
                  : i18n.language === 'en'
                  ? 'The app will close automatically'
                  : 'L\'application se fermera automatiquement'}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
            <Moon className="h-10 w-10 text-amber-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">
          {isShabbat 
            ? (i18n.language === 'he' ? 'שבת שלום' : i18n.language === 'en' ? 'Shabbat Shalom' : 'Shabbat Shalom')
            : (i18n.language === 'he' ? 'חג שמח' : i18n.language === 'en' ? 'Chag Sameach' : 'Bonne fête')
          }
        </h2>

        <p className="text-gray-600 mb-4">
          {holidayName || (i18n.language === 'he' 
            ? 'יום טוב / שבת'
            : i18n.language === 'en' 
            ? 'Holy day / Shabbat'
            : 'Jour saint / Chabbat')}
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 justify-center mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="font-semibold text-amber-800">
              {i18n.language === 'he' 
                ? 'האפליקציה מושבתת'
                : i18n.language === 'en'
                ? 'App is disabled'
                : 'Application désactivée'}
            </span>
          </div>
          <p className="text-sm text-amber-700">
            {i18n.language === 'he'
              ? 'לפי ההלכה, אסור להשתמש בטלפון בשבת וביום טוב'
              : i18n.language === 'en'
              ? 'According to Jewish law, phone use is forbidden on Shabbat and Yom Tov'
              : 'Selon la loi juive, l\'utilisation du téléphone est interdite pendant le Chabbat et les jours de fête'}
          </p>
        </div>

        {candleLighting && (
          <div className="text-sm text-gray-500 mb-2">
            <span className="font-medium">
              {i18n.language === 'he' ? 'הדלקת נרות:' : i18n.language === 'en' ? 'Candle lighting:' : 'Allumage des bougies :'}{' '}
            </span>
            {candleLighting.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}

        {havdalah && (
          <div className="text-sm text-gray-500 mb-4">
            <span className="font-medium">
              {i18n.language === 'he' ? 'הבדלה:' : i18n.language === 'en' ? 'Havdalah:' : 'Havdala :'}{' '}
            </span>
            {havdalah.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Sun className="h-4 w-4" />
          <span>
            {i18n.language === 'he'
              ? 'האפליקציה תיפתח מחדש במוצאי שבת'
              : i18n.language === 'en'
              ? 'App will reopen after Shabbat'
              : 'L\'application rouvrira après le Chabbat'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ShabbatModal;
