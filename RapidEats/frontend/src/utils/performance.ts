/**
 * Utilidades de Optimización de Performance
 */

import { useEffect, useRef, useCallback } from 'react';
import React from 'react';

/**
 * Hook para intersection observer (lazy loading, scroll animations)
 */
export const useIntersectionObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) => {
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry);
        }
      });
    }, defaultOptions);

    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return elementRef;
};

/**
 * Hook para lazy load de imágenes con placeholder
 */
export const useLazyImage = (src: string, placeholder?: string) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const isLoadedRef = useRef(false);
  const currentSrcRef = useRef(placeholder || '');

  const observerCallback = useCallback(() => {
    if (!imgRef.current || isLoadedRef.current) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      currentSrcRef.current = src;
      isLoadedRef.current = true;
      if (imgRef.current) {
        imgRef.current.src = src;
        imgRef.current.classList.add('loaded');
      }
    };
  }, [src]);

  const elementRef = useIntersectionObserver(observerCallback, {
    rootMargin: '200px'
  });

  return { imgRef: elementRef, currentSrc: currentSrcRef.current, isLoaded: isLoadedRef.current };
};

/**
 * Preload de imágenes críticas
 */
export const preloadImages = (urls: string[]): Promise<void[]> => {
  return Promise.all(
    urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
    })
  );
};

/**
 * Genera URLs responsive de Cloudinary
 */
export const getResponsiveImageUrl = (
  baseUrl: string,
  width: number,
  quality = 'auto',
  format = 'auto'
): string => {
  // Si la URL ya es de Cloudinary
  if (baseUrl.includes('cloudinary.com')) {
    const parts = baseUrl.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_${width},q_${quality},f_${format}/${parts[1]}`;
    }
  }
  return baseUrl;
};

/**
 * Genera srcset para imágenes responsive
 */
export const generateSrcSet = (baseUrl: string, widths: number[]): string => {
  return widths
    .map(width => `${getResponsiveImageUrl(baseUrl, width)} ${width}w`)
    .join(', ');
};

/**
 * Hook para debounce (optimizar búsquedas, etc)
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const debouncedValueRef = useRef<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedValueRef.current = value;
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValueRef.current;
};

/**
 * Hook para throttle (scroll events, resize, etc)
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, delay]);
};

/**
 * Request Idle Callback wrapper
 */
export const scheduleIdleTask = (task: () => void, options?: IdleRequestOptions) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(task, options);
  } else {
    // Fallback para navegadores que no soportan requestIdleCallback
    setTimeout(task, 1);
  }
};

/**
 * Memoización simple para funciones costosas
 */
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * Code splitting helper - lazy load components
 */
export const lazyLoadComponent = (importFunc: () => Promise<any>) => {
  return React.lazy(() => {
    return importFunc().catch(error => {
      console.error('Failed to load component:', error);
      // Return a fallback component
      return {
        default: () => React.createElement('div', {
          className: 'p-8 text-center text-red-600'
        }, 'Error al cargar el componente. Por favor, recarga la página.')
      };
    });
  });
};

/**
 * Detecta conexión lenta del usuario
 */
export const isSlowConnection = (): boolean => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g' ||
           connection.saveData === true;
  }
  return false;
};

/**
 * Genera blur hash placeholder
 */
export const generateBlurDataURL = (width = 8, height = 8): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL();
};

/**
 * Web Vitals - Measure performance metrics
 */
export const measureWebVitals = () => {
  // LCP - Largest Contentful Paint
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.startTime);
  });
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

  // FID - First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      const processingStart = entry.processingStart || 0;
      console.log('FID:', processingStart - entry.startTime);
    });
  });
  fidObserver.observe({ entryTypes: ['first-input'] });

  // CLS - Cumulative Layout Shift
  let clsScore = 0;
  const clsObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsScore += entry.value;
        console.log('CLS:', clsScore);
      }
    });
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });
};

/**
 * Service Worker registration helper
 */
export const registerServiceWorker = async (swPath = '/sw.js') => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(swPath);
      console.log('Service Worker registered:', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nueva versión disponible
              console.log('New version available');
              // Puedes mostrar un toast aquí
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

/**
 * Optimiza bundle size - dynamic imports por ruta
 */
export const prefetchRoute = (route: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
};

/**
 * Resource hints
 */
export const addResourceHint = (url: string, rel: 'preconnect' | 'dns-prefetch' | 'preload') => {
  const link = document.createElement('link');
  link.rel = rel;
  link.href = url;
  
  if (rel === 'preload') {
    link.as = 'fetch';
    link.setAttribute('crossorigin', 'anonymous');
  }
  
  document.head.appendChild(link);
};

// Agregar al inicio de la app
export const initPerformanceOptimizations = () => {
  // Preconnect a dominios importantes
  addResourceHint('https://fonts.googleapis.com', 'preconnect');
  addResourceHint('https://res.cloudinary.com', 'preconnect');
  
  // Medir web vitals
  if (process.env.NODE_ENV === 'production') {
    measureWebVitals();
  }
  
  // Registrar service worker
  if (process.env.NODE_ENV === 'production') {
    registerServiceWorker();
  }
};
