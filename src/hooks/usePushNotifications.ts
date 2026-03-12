import { useEffect } from 'react';

export function usePushNotifications() {
  useEffect(() => {
    // Demander permission pour les notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notifications activées');
        }
      });
    }
  }, []);

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/minyan/vite.svg',
        badge: '/minyan/vite.svg',
        tag: 'minyan-notification',
        requireInteraction: true
      });
    }
  };

  return { sendNotification };
}

export default usePushNotifications;
