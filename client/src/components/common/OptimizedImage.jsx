import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  placeholder = null,
  fallback = null,
  loading = 'lazy',
  quality = 80,
  sizes = '100vw',
  onLoad,
  onError,
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '50px'
  });

  useEffect(() => {
    setIsInView(inView);
  }, [inView]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setImageError(true);
    onError?.();
  }, [onError]);

  // Generate optimized image URL (if using a service like Cloudinary)
  const getOptimizedSrc = useCallback((originalSrc) => {
    if (!originalSrc) return '';
    
    // If it's already an optimized URL, return as is
    if (originalSrc.includes('cloudinary.com') || originalSrc.includes('optimized')) {
      return originalSrc;
    }
    
    // For local images, return as is
    if (originalSrc.startsWith('/') || originalSrc.startsWith('./')) {
      return originalSrc;
    }
    
    // For external images, you could add optimization here
    return originalSrc;
  }, []);

  // Preload image
  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = getOptimizedSrc(src);
  }, [isInView, src, handleLoad, handleError, getOptimizedSrc]);

  // Render placeholder while loading
  if (!isInView) {
    return (
      <div
        ref={ref}
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ aspectRatio: '16/9' }}
        {...props}
      >
        {placeholder || (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  }

  // Render error state
  if (imageError) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ aspectRatio: '16/9' }}
        {...props}
      >
        {fallback || (
          <div className="text-gray-400 text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Image failed to load</p>
          </div>
        )}
      </div>
    );
  }

  // Render loading state
  if (!imageLoaded) {
    return (
      <div
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ aspectRatio: '16/9' }}
        {...props}
      >
        {placeholder || (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  }

  // Render optimized image
  return (
    <img
      ref={imgRef}
      src={getOptimizedSrc(src)}
      alt={alt}
      className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      loading={loading}
      sizes={sizes}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

// Image gallery component with optimized loading
export const OptimizedImageGallery = ({ images, className = '', ...props }) => {
  const [loadedImages, setLoadedImages] = useState(new Set());

  const handleImageLoad = useCallback((index) => {
    setLoadedImages(prev => new Set([...prev, index]));
  }, []);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`} {...props}>
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.src}
          alt={image.alt}
          className="w-full h-48 object-cover rounded-lg"
          onLoad={() => handleImageLoad(index)}
        />
      ))}
    </div>
  );
};

// Progressive image loading component
export const ProgressiveImage = ({ 
  lowQualitySrc, 
  highQualitySrc, 
  alt, 
  className = '',
  ...props 
}) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  useEffect(() => {
    if (!highQualitySrc) return;

    const img = new Image();
    img.onload = () => {
      setCurrentSrc(highQualitySrc);
      setIsHighQualityLoaded(true);
    };
    img.src = highQualitySrc;
  }, [highQualitySrc]);

  return (
    <OptimizedImage
      src={currentSrc}
      alt={alt}
      className={`${isHighQualityLoaded ? 'blur-0' : 'blur-sm'} transition-all duration-500 ${className}`}
      {...props}
    />
  );
};

export default OptimizedImage;
