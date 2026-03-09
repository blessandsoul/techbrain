'use client';

import { useState, useCallback, useEffect } from 'react';
import { SafeImage } from '@/components/common/SafeImage';
import { getProductImageUrl } from '../hooks/useCatalog';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps): React.ReactElement {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const hasMultiple = images.length > 1;
  const currentImage = images[selected] ?? images[0];

  const prev = useCallback((): void => {
    setSelected((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const next = useCallback((): void => {
    setSelected((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, prev, next]);

  if (!currentImage) {
    return (
      <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-muted-foreground/30">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
      </div>
    );
  }

  const imgSrc = getProductImageUrl(currentImage);

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <div
          className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border cursor-zoom-in group"
          onClick={() => setLightbox(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setLightbox(true); }}
          aria-label="Open fullscreen image"
        >
          <SafeImage
            src={imgSrc}
            alt={productName}
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />

          {/* Prev/Next overlays */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-background"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-background"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              {/* Counter badge */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-background/80 backdrop-blur-sm border border-border/60 text-xs font-medium text-muted-foreground tabular-nums">
                {selected + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {hasMultiple && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => {
              const thumbSrc = getProductImageUrl(img);
              return (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-150 cursor-pointer ${
                    i === selected
                      ? 'border-primary ring-1 ring-primary/30'
                      : 'border-border hover:border-muted-foreground/40'
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <SafeImage
                    src={thumbSrc}
                    alt=""
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen image viewer"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          <div className="relative w-full h-full max-w-5xl max-h-[90dvh] mx-4" onClick={(e) => e.stopPropagation()}>
            <SafeImage
              src={imgSrc}
              alt={productName}
              className="object-contain"
              sizes="100vw"
              />
          </div>

          {/* Lightbox prev/next */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          {/* Counter */}
          {hasMultiple && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium tabular-nums">
              {selected + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
