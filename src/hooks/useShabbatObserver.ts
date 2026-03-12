import { useState, useEffect, useCallback } from 'react';

export interface ShabbatInfo {
  isShabbat: boolean;
  isHoliday: boolean;
  isForbidden: boolean;
  holidayName?: string;
  candleLighting?: Date;
  havdalah?: Date;
  minutesUntilShabbat?: number;
}

export function useShabbatObserver(latitude?: number, longitude?: number): ShabbatInfo {
  const [shabbatInfo, setShabbatInfo] = useState<ShabbatInfo>({
    isShabbat: false,
    isHoliday: false,
    isForbidden: false,
  });

  const checkShabbat = useCallback(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hour * 60 + minutes;
    
    let isShabbat = false;
    let candleLighting: Date | undefined;
    let havdalah: Date | undefined;
    
    if (dayOfWeek === 5) {
      const shabbatStart = 17 * 60;
      if (currentTime >= shabbatStart - 18) {
        isShabbat = true;
        candleLighting = new Date(now);
        candleLighting.setHours(17, 0, 0, 0);
      }
    } else if (dayOfWeek === 6) {
      isShabbat = true;
      const shabbatEnd = 19 * 60;
      if (currentTime >= shabbatEnd + 42) {
        isShabbat = false;
      }
      havdalah = new Date(now);
      havdalah.setHours(19, 42, 0, 0);
    }
    
    setShabbatInfo({
      isShabbat,
      isHoliday: false,
      isForbidden: isShabbat,
      candleLighting,
      havdalah,
      minutesUntilShabbat: dayOfWeek === 5 && !isShabbat 
        ? (17 * 60 - 18) - currentTime 
        : undefined,
    });
  }, [latitude, longitude]);

  useEffect(() => {
    checkShabbat();
    const interval = setInterval(checkShabbat, 60000);
    return () => clearInterval(interval);
  }, [checkShabbat]);

  return shabbatInfo;
}

export default useShabbatObserver;
