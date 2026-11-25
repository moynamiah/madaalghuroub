import React, { useState, useEffect, memo } from 'react';
import { Building2 } from 'lucide-react';
import { safeImageSrc } from '../utils/safeImageSrc';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  decoding?: 'sync' | 'async' | 'auto';
}

export const ResilientImage: React.FC<ResilientImageProps> = memo(
  ({
    src,
    alt,
    className = '',
    fallbackTitle,
    loading = 'lazy',
    fetchPriority = 'auto',
    decoding,
  }) => {
    const [hasError, setHasError] = useState(false);
    const sanitizedSrc = safeImageSrc(src);

    useEffect(() => {
      setHasError(false);
    }, [sanitizedSrc]);

    if (hasError || !sanitizedSrc) {
      return (
        <div
          className={`flex flex-col items-center justify-center bg-[#0A1F44] navy-blueprint-grid text-white p-6 text-center ${className}`}
          role="img"
          aria-label={alt}
        >
          <Building2 className="w-10 h-10 text-[#00B8D4] mb-3 opacity-80" />
          <span className="font-display text-sm font-semibold tracking-tight text-white/90 max-w-xs">
            {fallbackTitle || alt}
          </span>
        </div>
      );
    }

    return (
      <img
        src={sanitizedSrc}
        alt={alt}
        loading={loading}
        decoding={decoding ?? (loading === 'eager' ? 'sync' : 'async')}
        fetchPriority={fetchPriority}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={className}
      />
    );
  }
);
ResilientImage.displayName = 'ResilientImage';
