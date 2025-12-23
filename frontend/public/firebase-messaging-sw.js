// Firebase messaging service worker
// This file handles background notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration will be injected at runtime
// For now, we'll use a placeholder that should be replaced during build

firebase.initializeApp({
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'FIREBASE_AUTH_DOMAIN',
  projectId: 'FIREBASE_PROJECT_ID',
  storageBucket: 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID',
  appId: 'FIREBASE_APP_ID',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'RapidEats';
  const notificationOptions = {
    body: payload.notification?.body || 'Nueva notificación',
    icon: '/logo.png',
    badge: '/badge.png',
    tag: payload.data?.orderId || 'default',
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'Ver',
      },
      {
        action: 'close',
        title: 'Cerrar',
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked', event);

  event.notification.close();

  const action = event.notification.data?.action;
  const orderId = event.notification.data?.orderId;

  let url = '/';

  // Determine URL based on action
  switch (action) {
    case 'ORDER_TRACKING':
      url = orderId ? `/orders/${orderId}/tracking` : '/orders';
      break;
    case 'REVIEW_ORDER':
      url = '/orders';
      break;
    case 'ORDER_DETAILS':
      url = orderId ? `/orders/${orderId}` : '/orders';
      break;
    case 'PROMOTION':
      url = '/restaurants';
      break;
    default:
      if (orderId) {
        url = `/orders/${orderId}`;
      }
  }

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if not found
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
