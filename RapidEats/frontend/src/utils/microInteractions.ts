/**
 * Micro-interacciones Premium
 * Colección de funciones para crear experiencias interactivas delightful
 */

// Haptic Feedback (Web Vibration API)
export const haptics = {
  /**
   * Vibración ligera para interacciones sutiles
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Vibración media para acciones importantes
   */
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  /**
   * Vibración fuerte para éxitos o alertas
   */
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },

  /**
   * Patrón de vibración para selección
   */
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([5, 10, 5]);
    }
  },

  /**
   * Patrón de vibración para éxito
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10, 50, 10]);
    }
  },

  /**
   * Patrón de vibración para error
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
  },

  /**
   * Patrón de vibración para notificación
   */
  notification: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }
};

// Confetti Animation Helper
export const triggerConfetti = () => {
  // Esta función se puede extender con canvas-confetti library
  console.log('🎉 Confetti triggered!');
};

// Sound Effects Helper
export const soundEffects = {
  play: (soundName: string, volume = 0.5) => {
    try {
      const audio = new Audio(`/sounds/${soundName}.mp3`);
      audio.volume = volume;
      audio.play().catch(error => {
        console.warn('Sound effect failed to play:', error);
      });
    } catch (error) {
      console.warn('Sound effect error:', error);
    }
  },

  success: () => soundEffects.play('success', 0.3),
  error: () => soundEffects.play('error', 0.3),
  notification: () => soundEffects.play('notification', 0.2),
  click: () => soundEffects.play('click', 0.1),
  swipe: () => soundEffects.play('swipe', 0.2)
};

// Scroll Animation Observer
export const createScrollObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
};

// Smooth Scroll Helper
export const smoothScrollTo = (
  element: HTMLElement | string,
  options?: ScrollIntoViewOptions
) => {
  const target = typeof element === 'string' 
    ? document.querySelector(element) 
    : element;

  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options
    });
  }
};

// Copy to Clipboard with Feedback
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    haptics.light();
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    haptics.error();
    return false;
  }
};

// Share with Web Share API
export const shareContent = async (data: ShareData): Promise<boolean> => {
  if (!navigator.share) {
    console.warn('Web Share API not supported');
    return false;
  }

  try {
    await navigator.share(data);
    haptics.success();
    return true;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Share failed:', error);
      haptics.error();
    }
    return false;
  }
};

// Request Animation Frame Helper
export const rafThrottle = <T extends (...args: any[]) => any>(
  callback: T
): ((...args: Parameters<T>) => void) => {
  let rafId: number | null = null;

  return (...args: Parameters<T>) => {
    if (rafId !== null) {
      return;
    }

    rafId = requestAnimationFrame(() => {
      callback(...args);
      rafId = null;
    });
  };
};

// Debounce Helper
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// Format Currency
export const formatCurrency = (
  amount: number,
  currency = 'COP',
  locale = 'es-CO'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format Date Relative
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Ahora mismo';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `Hace ${diffInWeeks} ${diffInWeeks === 1 ? 'semana' : 'semanas'}`;
  }

  return past.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Generate Unique ID
export const generateId = (prefix = ''): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`;
};

// Image Lazy Load Helper
export const lazyLoadImage = (
  img: HTMLImageElement,
  src: string,
  placeholder?: string
) => {
  if (placeholder) {
    img.src = placeholder;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        img.src = src;
        img.classList.add('loaded');
        observer.disconnect();
      }
    });
  });

  observer.observe(img);
};

// Preload Images
export const preloadImages = (urls: string[]): Promise<void[]> => {
  const promises = urls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  });

  return Promise.all(promises);
};
