/**
 * Hook personalizado para manejar accesibilidad de teclado
 */

import { useEffect, useRef, useCallback } from 'react';
import { FocusTrap, ensureElementVisible } from '../utils/accessibility';

/**
 * Hook para manejar focus trap en modales
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      focusTrapRef.current = new FocusTrap(containerRef.current);
      focusTrapRef.current.activate();

      return () => {
        focusTrapRef.current?.deactivate();
      };
    }
  }, [isActive]);

  return containerRef;
};

/**
 * Hook para manejar escape key
 */
export const useEscapeKey = (callback: () => void, isActive = true) => {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [callback, isActive]);
};

/**
 * Hook para manejar navegación por teclado en listas
 */
export const useListKeyboardNavigation = <T extends HTMLElement>(
  itemsCount: number,
  onSelect?: (index: number) => void
) => {
  const currentIndexRef = useRef(0);
  const itemsRef = useRef<T[]>([]);

  const setItemRef = useCallback((index: number) => (el: T | null) => {
    if (el) {
      itemsRef.current[index] = el;
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const { key } = e;
    let newIndex = currentIndexRef.current;

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(currentIndexRef.current + 1, itemsCount - 1);
        break;
      
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(currentIndexRef.current - 1, 0);
        break;
      
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      
      case 'End':
        e.preventDefault();
        newIndex = itemsCount - 1;
        break;
      
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onSelect) {
          onSelect(currentIndexRef.current);
        }
        return;
      
      default:
        return;
    }

    currentIndexRef.current = newIndex;
    const element = itemsRef.current[newIndex];
    
    if (element) {
      element.focus();
      ensureElementVisible(element);
    }
  }, [itemsCount, onSelect]);

  return {
    setItemRef,
    handleKeyDown,
    currentIndex: currentIndexRef.current
  };
};

/**
 * Hook para anuncios a screen readers
 */
export const useScreenReaderAnnouncement = () => {
  const announce = useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return announce;
};

/**
 * Hook para detectar preferencias de usuario
 */
export const useUserPreferences = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

  return {
    prefersReducedMotion,
    prefersColorScheme,
    prefersHighContrast
  };
};

/**
 * Hook para auto-focus al montar
 */
export const useAutoFocus = (shouldFocus = true) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      elementRef.current.focus();
    }
  }, [shouldFocus]);

  return elementRef;
};

/**
 * Hook para ID único (útil para asociar labels con inputs)
 */
export const useId = (prefix?: string) => {
  const idRef = useRef<string>();

  if (!idRef.current) {
    idRef.current = prefix 
      ? `${prefix}-${Math.random().toString(36).substr(2, 9)}`
      : `id-${Math.random().toString(36).substr(2, 9)}`;
  }

  return idRef.current;
};
