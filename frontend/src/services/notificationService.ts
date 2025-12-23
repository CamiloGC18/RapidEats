// Firebase configuration for push notifications
// Note: Firebase is optional. If not configured, notifications won't work but app will function normally

let messaging: any = null;
let isFirebaseAvailable = false;

// Check if Firebase is available
const checkFirebaseAvailability = () => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    import.meta.env.VITE_FIREBASE_API_KEY
  );
};

// Initialize Firebase
export const initializeFirebase = async () => {
  if (!checkFirebaseAvailability()) {
    console.log('⚠️ Firebase push notifications not available');
    return false;
  }

  try {
    // Dynamically import Firebase to avoid errors if not configured
    const { initializeApp } = await import('firebase/app');
    const { getMessaging, isSupported } = await import('firebase/messaging');

    const supported = await isSupported();
    if (!supported) {
      console.log('⚠️ Push notifications not supported in this browser');
      return false;
    }

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    isFirebaseAvailable = true;

    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    return false;
  }
};

// Request permission and get FCM token
export const requestNotificationPermission = async () => {
  if (!isFirebaseAvailable || !messaging) {
    console.log('Firebase not available');
    return null;
  }

  try {
    const { getToken } = await import('firebase/messaging');
    
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  if (!isFirebaseAvailable || !messaging) {
    return Promise.reject('Firebase not available');
  }

  return new Promise(async (resolve) => {
    const { onMessage } = await import('firebase/messaging');
    
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });
};

// Register push token with backend
export const registerPushToken = async (token: string) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const authToken = localStorage.getItem('token');

    if (!authToken) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${apiUrl}/notifications/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        token,
        device: navigator.userAgent,
        platform: 'web',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to register push token');
    }

    const data = await response.json();
    console.log('Push token registered:', data);
    return data;
  } catch (error) {
    console.error('Error registering push token:', error);
    throw error;
  }
};

// Unregister push token
export const unregisterPushToken = async (token: string) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const authToken = localStorage.getItem('token');

    if (!authToken) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${apiUrl}/notifications/token`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error('Failed to unregister push token');
    }

    const data = await response.json();
    console.log('Push token unregistered:', data);
    return data;
  } catch (error) {
    console.error('Error unregistering push token:', error);
    throw error;
  }
};

// Check if notifications are supported and enabled
export const isNotificationSupported = () => {
  return checkFirebaseAvailability();
};

// Get current notification permission
export const getNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};
