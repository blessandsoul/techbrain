'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  fallbackClassName?: string;
  fallbackIconSize?: number;
  unoptimized?: boolean;
}

function FallbackPlaceholder({ className, iconSize = 48 }: { className?: string; iconSize?: number }): React.ReactElement {
  return (
    <div className={cn('absolute inset-0 bg-linear-to-br from-primary/10 via-muted to-muted flex items-center justify-center', className)}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" className="text-border" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path d="M3 15l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function SafeImage({
  src,
  alt,
  fill = true,
  width,
  height,
  priority = false,
  className = 'object-cover',
  sizes = '(max-width: 768px) 100vw, 33vw',
  fallbackClassName,
  fallbackIconSize,
  unoptimized,
}: SafeImageProps): React.ReactElement {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <FallbackPlaceholder className={fallbackClassName} iconSize={fallbackIconSize} />;
  }

  const shouldSkipOptimization = unoptimized ?? src.includes('localhost');

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      priority={priority}
      className={className}
      sizes={sizes}
      unoptimized={shouldSkipOptimization}
      onError={() => setFailed(true)}
    />
  );
}
