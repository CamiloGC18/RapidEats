/// <reference types="vite/client" />

interface ImportMetaEnv {
  // App
  readonly VITE_APP_URL: string;
  
  // Analytics
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_FB_PIXEL_ID?: string;
  readonly VITE_GTM_CONTAINER_ID?: string;
  readonly VITE_HOTJAR_SITE_ID?: string;
  
  // API
  readonly VITE_API_URL: string;
  
  // Firebase
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  
  // Google OAuth
  readonly VITE_GOOGLE_CLIENT_ID: string;
  
  // Stripe
  readonly VITE_STRIPE_PUBLIC_KEY?: string;
  
  // Mode
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
