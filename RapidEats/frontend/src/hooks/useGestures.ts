/**
 * Custom Hooks para Gestos Premium
 */

import { useGesture } from '@use-gesture/react';
import { useSpring } from 'framer-motion';
import { haptics } from '../utils/microInteractions';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

/**
 * Hook para swipe gestures con haptic feedback
 */
export const useSwipe = (config: SwipeConfig) => {
  const threshold = config.threshold || 50;

  return useGesture({
    onDrag: ({ movement: [mx, my], last }) => {
      if (!last) return;

      // Swipe horizontal
      if (Math.abs(mx) > Math.abs(my)) {
        if (mx > threshold && config.onSwipeRight) {
          haptics.light();
          config.onSwipeRight();
        } else if (mx < -threshold && config.onSwipeLeft) {
          haptics.light();
          config.onSwipeLeft();
        }
      }
      // Swipe vertical
      else {
        if (my > threshold && config.onSwipeDown) {
          haptics.light();
          config.onSwipeDown();
        } else if (my < -threshold && config.onSwipeUp) {
          haptics.light();
          config.onSwipeUp();
        }
      }
    }
  });
};

interface LongPressConfig {
  onLongPress: () => void;
  delay?: number;
  onStart?: () => void;
  onCancel?: () => void;
}

/**
 * Hook para long press con haptic feedback
 */
export const useLongPress = (config: LongPressConfig) => {
  const delay = config.delay || 500;
  let startTime = 0;

  return useGesture({
    onPointerDown: () => {
      startTime = Date.now();
      config.onStart?.();
    },
    onPointerUp: () => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > delay) {
        haptics.medium();
        config.onLongPress();
      } else {
        config.onCancel?.();
      }
    }
  });
};

/**
 * Hook para pull to refresh
 */
export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const y = useSpring(0, { stiffness: 300, damping: 30 });

  return useGesture({
    onDrag: ({ movement: [, my], velocity: [, vy], last, cancel }) => {
      // Solo permitir drag hacia abajo
      if (my < 0) {
        cancel();
        return;
      }

      // Limitar el drag
      const cappedY = Math.min(my, 120);
      y.set(cappedY);

      // Al soltar
      if (last) {
        if (cappedY > 80 && vy > 0.1) {
          haptics.medium();
          onRefresh().finally(() => {
            y.set(0);
          });
        } else {
          y.set(0);
        }
      }
    }
  });
};

/**
 * Hook para scale on press effect
 */
export const usePressScale = (scale = 0.95) => {
  const scaleValue = useSpring(1, { stiffness: 300, damping: 30 });

  return {
    scale: scaleValue,
    handlers: useGesture({
      onPointerDown: () => {
        haptics.light();
        scaleValue.set(scale);
      },
      onPointerUp: () => {
        scaleValue.set(1);
      },
      onPointerLeave: () => {
        scaleValue.set(1);
      }
    })
  };
};

/**
 * Hook para hover scale effect
 */
export const useHoverScale = (scale = 1.05) => {
  const scaleValue = useSpring(1, { stiffness: 400, damping: 25 });

  return {
    scale: scaleValue,
    handlers: {
      onMouseEnter: () => scaleValue.set(scale),
      onMouseLeave: () => scaleValue.set(1)
    }
  };
};
