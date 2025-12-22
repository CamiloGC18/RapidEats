/**
 * Componente optimizado de imagen con lazy loading y blur placeholder
 */

import { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { generateSrcSet } from '../../utils/performance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  placeholder?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  aspectRatio,
  placeholder,
  sizes = '100vw',
  priority = false,
  onLoad
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Generar srcset para imágenes responsive
  const srcSet = src.includes('cloudinary.com')
    ? generateSrcSet(src, [320, 640, 768, 1024, 1280, 1536])
    : undefined;

  useEffect(() => {
    if (priority) {
      // Si es prioritaria, cargar inmediatamente (nada que hacer aquí, se maneja en el render)
    }
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  if (priority) {
    // Para imágenes prioritarias (above the fold), no usar lazy loading
    return (
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
        style={{ aspectRatio }}
        onLoad={handleLoad}
        loading="eager"
      />
    );
  }

  return (
    <LazyLoadImage
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ aspectRatio }}
      effect="blur"
      placeholderSrc={placeholder}
      afterLoad={handleLoad}
      threshold={100}
    />
  );
};
