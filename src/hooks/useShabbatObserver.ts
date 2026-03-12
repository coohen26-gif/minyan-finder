import { useState, useEffect, useCallback } from 'react';
import { HDate, HebrewCalendar, Parsha, Location, Zmanim } from '@hebcal/core';

// Source fiable : Hebcal - utilisé par Chabad.org, OU.org, et la plupart des sites juifs majeurs
// Documentation : https://github.com/hebcal/hebcal-js

export interface ShabbatInfo {
  isShabbat: boolean;
  isHoliday: boolean;
  isForbidden: boolean;
  holidayName?: string;
  candleLighting?: Date;
  havdalah?: Date;
  parsha?: string;
  minutesUntilShabbat?: number;
  source: string;
  lastUpdated: Date;
}

// Fêtes bibliques (Yom Tov) - même statut que Chabbat
// Source : Choulhan Aroukh, Orach Haim 495
const YOM_TOV_HOLIDAYS = [
  'Rosh Hashana',      // 1-2 Tishrei
  'Yom Kippur',        // 10 Tishrei
  'Sukkot I',          // 15 Tishrei
  'Sukkot II',         // 16 Tishrei (Diaspora)
  'Shemini Atzeret',   // 22 Tishrei
  'Simchat Torah',     // 23 Tishrei (Diaspora)
  'Pesach I',          // 15 Nisan
  'Pesach II',         // 16 Nisan (Diaspora)
  'Pesach VII',        // 21 Nisan
  'Pesach VIII',       // 22 Nisan (Diaspora)
  'Shavuot I',         // 6 Sivan
  'Shavuot II',        // 7 Sivan (Diaspora)
];

// Chol Hamoed - utilisation permise mais avec restrictions
const CHOL_HAMOED = [
  'Chol HaMoed Sukkot',
  'Chol HaMoed Pesach',
];

// Fêtes mineures - utilisation permise
const MINOR_HOLIDAYS = [
  'Chanukah',
  'Purim',
  'Purim Katan',
  'Lag BaOmer',
  'Tu B\'Av',
  'Tu B\'Shvat',
  'Yom HaAtzmaut',
  'Yom Yerushalayim',
];

// Villes avec coordonnées précises pour calcul des zmanim
// Source : Hebcal Locations database
const CITIES: Record<string, { lat: number; lng: number; tz: string }> = {
  'Paris': { lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris' },
  'Jerusalem': { lat: 31.7683, lng: 35.2137, tz: 'Asia/Jerusalem' },
  'New York': { lat: 40.7128, lng: -74.0060, tz: 'America/New_York' },
  'London': { lat: 51.5074, lng: -0.1278, tz: 'Europe/London' },
  'Tel Aviv': { lat: 32.0853, lng: 34.7818, tz: 'Asia/Jerusalem' },
  'Miami': { lat: 25.7617, lng: -80.1918, tz: 'America/New_York' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, tz: 'America/Los_Angeles' },
  'Toronto': { lat: 43.6532, lng: -79.3832, tz: 'America/Toronto' },
  'Montreal': { lat: 45.5017, lng: -73.5673, tz: 'America/Toronto' },
  'Brussels': { lat: 50.8503, lng: 4.3517, tz: 'Europe/Brussels' },
  'Antwerp': { lat: 51.2194, lng: 4.4025, tz: 'Europe/Brussels' },
  'Sydney': { lat: -33.8688, lng: 151.2093, tz: 'Australia/Sydney' },
};

export function useShabbatObserver(
  latitude?: number, 
  longitude?: number,
  cityName?: string
): ShabbatInfo {
  const [shabbatInfo, setShabbatInfo] = useState<ShabbatInfo>({
    isShabbat: false,
    isHoliday: false,
    isForbidden: false,
    source: 'Initializing...',
    lastUpdated: new Date(),
  });

  const checkShabbat = useCallback(async () => {
    try {
      const now = new Date();
      const hd = new HDate(now);
      
      // Déterminer la localisation
      let lat = latitude || 48.8566; // Paris par défaut
      let lng = longitude || 2.3522;
      let tz = 'Europe/Paris';
      
      if (cityName && CITIES[cityName]) {
        lat = CITIES[cityName].lat;
        lng = CITIES[cityName].lng;
        tz = CITIES[cityName].tz;
      } else if (latitude && longitude) {
        // Détection approximative du fuseau horaire
        // Note : en production, utiliser une API comme timezone-db
        tz = lng > -30 && lng < 40 ? 'Europe/Paris' : 'America/New_York';
      }
      
      // Créer l'objet Location pour Hebcal
      const location = new Location(lat, lng, tz, 'User Location');
      
      // Calculer les zmanim (heures halakhiques)
      // Source : Hebcal utilise les algorithmes de NOAA pour le coucher du soleil
      const zmanim = new Zmanim(location, now);
      
      // Heure du coucher du soleil
      const sunset = zmanim.sunset();
      
      // Chabbat commence 18 minutes avant le coucher du soleil (tosefet Chabbat)
      // Source : Choulhan Aroukh, Orach Haim 261:2
      const candleLighting = sunset ? new Date(sunset.getTime() - 18 * 60000) : null;
      
      // Chabbat finit après les 3 étoiles (tzeit hakochavim)
      // Approximation : 42 minutes après le coucher du soleil à la latitude de Paris
      // Source : Choulhan Aroukh, Orach Haim 293:1
      const havdalah = sunset ? new Date(sunset.getTime() + 42 * 60000) : null;
      
      // Vérifier si on est pendant Chabbat
      const dayOfWeek = now.getDay();
      let isShabbat = false;
      let minutesUntilShabbat: number | undefined;
      
      if (dayOfWeek === 5 && candleLighting) { // Vendredi
        const timeUntil = candleLighting.getTime() - now.getTime();
        if (timeUntil <= 0) {
          isShabbat = true;
        } else {
          minutesUntilShabbat = Math.floor(timeUntil / 60000);
        }
      } else if (dayOfWeek === 6) { // Samedi
        if (havdalah && now < havdalah) {
          isShabbat = true;
        }
      }
      
      // Vérifier les fêtes
      // Source : Hebcal utilise le calendrier hébraïque traditionnel
      const events = HebrewCalendar.getHolidaysOnDate(hd);
      let isHoliday = false;
      let holidayName: string | undefined;
      let isYomTov = false;
      let isCholHamoed = false;
      
      if (events && events.length > 0) {
        events.forEach((event: any) => {
          const desc = event.render('en');
          holidayName = desc;
          
          if (YOM_TOV_HOLIDAYS.some(h => desc.includes(h))) {
            isYomTov = true;
            isHoliday = true;
          } else if (CHOL_HAMOED.some(h => desc.includes(h))) {
            isCholHamoed = true;
            isHoliday = true;
          } else if (MINOR_HOLIDAYS.some(h => desc.includes(h))) {
            isHoliday = true;
          }
        });
      }
      
      // Déterminer si l'utilisation est interdite
      // Chabbat + Yom Tov = interdit
      // Chol Hamoed + fêtes mineures = permis avec restrictions
      const isForbidden = isShabbat || isYomTov;
      
      setShabbatInfo({
        isShabbat,
        isHoliday: isHoliday && !isYomTov, // Fêtes non-bibliques
        isForbidden,
        holidayName,
        candleLighting: candleLighting || undefined,
        havdalah: havdalah || undefined,
        minutesUntilShabbat,
        source: 'Hebcal API (Chabad.org, OU.org)',
        lastUpdated: new Date(),
      });
      
    } catch (error) {
      console.error('Error checking Shabbat:', error);
      // En cas d'erreur, mode sécurisé : considérer comme interdit
      setShabbatInfo(prev => ({
        ...prev,
        isForbidden: true,
        source: 'Error - Safe mode activated',
        lastUpdated: new Date(),
      }));
    }
  }, [latitude, longitude, cityName]);

  useEffect(() => {
    checkShabbat();
    // Vérifier toutes les minutes
    const interval = setInterval(checkShabbat, 60000);
    return () => clearInterval(interval);
  }, [checkShabbat]);

  return shabbatInfo;
}

// Fonction pour obtenir les zmanim d'une date spécifique
export function getZmanimForDate(date: Date, cityName: string = 'Paris') {
  const city = CITIES[cityName] || CITIES['Paris'];
  const location = new Location(city.lat, city.lng, city.tz, cityName);
  const zmanim = new Zmanim(location, date);
  
  return {
    dawn: zmanim.alotHaShachar(),
    sunrise: zmanim.neitzHaChama(),
    shemaEnd: zmanim.sofZmanShma(),
    tefilahEnd: zmanim.sofZmanTfilla(),
    midday: zmanim.chatzot(),
    sunset: zmanim.sunset(),
    nightfall: zmanim.tzeitHaChochavim(),
  };
}

export default useShabbatObserver;
