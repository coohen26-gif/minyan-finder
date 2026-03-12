import { useState, useEffect, useCallback } from 'react';
import { HDate, HebrewCalendar, Parsha, Holiday } from '@hebcal/core';

export interface ShabbatInfo {
  isShabbat: boolean;
  isHoliday: boolean;
  isForbidden: boolean; // true si on ne peut pas utiliser le téléphone
  holidayName?: string;
  candleLighting?: Date;
  havdalah?: Date;
  parsha?: string;
  minutesUntilShabbat?: number;
}

// Liste des fêtes où l'utilisation du téléphone est interdite
const STRICT_HOLIDAYS = [
  'Rosh Hashana',
  'Yom Kippur',
  'Sukkot I',
  'Sukkot II',
  'Shemini Atzeret',
  'Simchat Torah',
  'Pesach I',
  'Pesach II',
  'Pesach VII',
  'Pesach VIII',
  'Shavuot I',
  'Shavuot II',
];

// Fêtes où l'utilisation est permise (avec restrictions)
const LIGHT_HOLIDAYS = [
  'Chanukah',
  'Purim',
  'Lag BaOmer',
  'Tu B\'Av',
];

export function useShabbatObserver(latitude?: number, longitude?: number): ShabbatInfo {
  const [shabbatInfo, setShabbatInfo] = useState<ShabbatInfo>({
    isShabbat: false,
    isHoliday: false,
    isForbidden: false,
  });

  const checkShabbat = useCallback(() => {
    const now = new Date();
    const hd = new HDate(now);
    
    // Vérifier si c'est Chabbat (vendredi soir à samedi soir)
    const dayOfWeek = now.getDay(); // 0 = dimanche, 6 = samedi
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hour * 60 + minutes;
    
    // Chabbat commence 18 minutes avant le coucher du soleil le vendredi
    // et finit après les 3 étoiles le samedi soir
    // Simplification : Chabbat = vendredi après 17h jusqu'à samedi après 19h
    let isShabbat = false;
    let candleLighting: Date | undefined;
    let havdalah: Date | undefined;
    
    if (dayOfWeek === 5) { // Vendredi
      const shabbatStart = 17 * 60; // 17:00 (à ajuster selon la localisation)
      if (currentTime >= shabbatStart - 18) { // 18 min avant
        isShabbat = true;
        candleLighting = new Date(now);
        candleLighting.setHours(17, 0, 0, 0);
      }
    } else if (dayOfWeek === 6) { // Samedi
      isShabbat = true;
      const shabbatEnd = 19 * 60; // 19:00 (à ajuster)
      if (currentTime >= shabbatEnd + 42) { // 42 min après pour les 3 étoiles
        isShabbat = false;
      }
      havdalah = new Date(now);
      havdalah.setHours(19, 42, 0, 0);
    }
    
    // Vérifier les fêtes
    const holidays = HebrewCalendar.getHolidaysForYear(hd.getFullYear());
    let isHoliday = false;
    let holidayName: string | undefined;
    let isStrictHoliday = false;
    
    // Chercher si aujourd'hui est une fête
    const todayEvents = HebrewCalendar.getHolidaysOnDate(hd);
    if (todayEvents && todayEvents.length > 0) {
      todayEvents.forEach((event: any) => {
        const desc = event.render('en');
        holidayName = desc;
        isHoliday = true;
        
        if (STRICT_HOLIDAYS.some(h => desc.includes(h))) {
          isStrictHoliday = true;
        }
      });
    }
    
    // Yom Tov (fêtes bibliques) = même règles que Chabbat
    const isYomTov = isHoliday && isStrictHoliday;
    
    setShabbatInfo({
      isShabbat,
      isHoliday: isHoliday && !isStrictHoliday, // fêtes légères uniquement
      isForbidden: isShabbat || isYomTov, // Chabbat ou Yom Tov strict
      holidayName,
      candleLighting,
      havdalah,
      parsha: undefined, // À implémenter si besoin
      minutesUntilShabbat: dayOfWeek === 5 && !isShabbat 
        ? (17 * 60 - 18) - currentTime 
        : undefined,
    });
  }, [latitude, longitude]);

  useEffect(() => {
    checkShabbat();
    // Vérifier toutes les minutes
    const interval = setInterval(checkShabbat, 60000);
    return () => clearInterval(interval);
  }, [checkShabbat]);

  return shabbatInfo;
}

// Hook pour obtenir le prochain Chabbat
export function useNextShabbat(): { date: Date; parsha: string } | null {
  const [nextShabbat, setNextShabbat] = useState<{ date: Date; parsha: string } | null>(null);

  useEffect(() => {
    const now = new Date();
    const hd = new HDate(now);
    
    // Trouver le prochain samedi
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7));
    nextSaturday.setHours(10, 0, 0, 0);
    
    // Obtenir la parasha
    const saturdayHDate = new HDate(nextSaturday);
    const parsha = Parsha.get(saturdayHDate);
    
    setNextShabbat({
      date: nextSaturday,
      parsha: parsha ? parsha.render('he') : '',
    });
  }, []);

  return nextShabbat;
}

export default useShabbatObserver;
