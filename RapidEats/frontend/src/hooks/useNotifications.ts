import { useEffect, useState } from 'react';
import { useAppSelector } from './redux';
import {
  initializeFirebase,
  requestNotificationPermission,
  registerPushToken,
  onMessageListener,
  isNotificationSupported,
  getNotificationPermission,
} from '../services/notificationService';
import { toast } from 'react-toastify';

export const useNotifications = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Initialize Firebase
  useEffect(() => {
    const init = async () => {
      const supported = isNotificationSupported();
      setIsSupported(supported);

      if (supported) {
        const initialized = await initializeFirebase();
        if (initialized) {
          const currentPermission = getNotificationPermission();
          setPermission(currentPermission as NotificationPermission);
        }
      }
    };

    init();
  }, []);

  // Request permission and register token when user logs in
  useEffect(() => {
    if (isAuthenticated && user && isSupported && permission === 'default') {
      // Don't auto-request, wait for user action
      console.log('Push notifications available. User can enable from settings.');
    }
  }, [isAuthenticated, user, isSupported, permission]);

  // Listen for foreground messages
  useEffect(() => {
    if (!isSupported || !isAuthenticated) return;

    const unsubscribe = onMessageListener()
      .then((payload: any) => {
        console.log('Foreground message:', payload);

        const { notification, data } = payload;

        if (notification) {
          // Show toast notification
          toast.info(
            `${notification.title}: ${notification.body}`,
            {
              autoClose: 5000,
              onClick: () => {
                // Handle notification click
                if (data?.action === 'ORDER_TRACKING' && data?.orderId) {
                  window.location.href = `/orders/${data.orderId}/tracking`;
                } else if (data?.action === 'REVIEW_ORDER') {
                  window.location.href = '/orders';
                }
              },
            }
          );

          // Also show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.body,
              icon: '/logo.png',
              tag: data?.orderId || 'default',
            });
          }
        }
      })
      .catch((err) => {
        console.error('Error listening for messages:', err);
      });

    return () => {
      // Cleanup if needed
    };
  }, [isSupported, isAuthenticated]);

  // Request notification permission
  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Las notificaciones no están soportadas en este navegador');
      return false;
    }

    try {
      const token = await requestNotificationPermission();

      if (token) {
        setFcmToken(token);
        setPermission('granted');

        // Register token with backend
        await registerPushToken(token);

        toast.success('¡Notificaciones activadas!');
        return true;
      } else {
        setPermission('denied');
        toast.warning('Permiso de notificaciones denegado');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Error al activar notificaciones');
      return false;
    }
  };

  return {
    isSupported,
    permission,
    fcmToken,
    requestPermission,
  };
};
