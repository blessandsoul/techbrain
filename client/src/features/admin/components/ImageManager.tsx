'use client';

import { useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getProductImageUrl } from '@/features/catalog/hooks/useCatalog';
import { useUploadProductImage, useDeleteProductImage } from '../hooks/useAdminProducts';

interface ImageManagerProps {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ImageManager({ images, setImages }: ImageManagerProps): React.ReactElement {
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadProductImage();
  const deleteMutation = useDeleteProductImage();

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const result = await uploadMutation.mutateAsync(file);
        setImages((imgs) => [...imgs, result.url]);
      } catch {
        // Error toast handled by the mutation hook
      }
    }

    if (fileRef.current) fileRef.current.value = '';
  }, [uploadMutation, setImages]);

  const handleRemove = useCallback((imageUrl: string): void => {
    setImages((imgs) => imgs.filter((i) => i !== imageUrl));
    deleteMutation.mutate(imageUrl);
  }, [setImages, deleteMutation]);

  const moveImage = useCallback((index: number, direction: -1 | 1): void => {
    setImages((imgs) => {
      const next = [...imgs];
      const target = index + direction;
      if (target < 0 || target >= next.length) return imgs;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, [setImages]);

  function resolveImageSrc(img: string): string {
    return getProductImageUrl(img);
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-foreground uppercase tracking-wider">სურათები</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {images.map((img, idx) => (
          <div key={img} className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted group">
            <Image src={resolveImageSrc(img)} alt="" fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center gap-0.5 pb-0.5 opacity-0 group-hover:opacity-100">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => moveImage(idx, -1)}
                  className="w-4 h-4 bg-white/90 rounded flex items-center justify-center text-foreground cursor-pointer hover:bg-white transition-colors"
                  aria-label="სურათის მარცხნივ გადატანა"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
              )}
              {idx < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(idx, 1)}
                  className="w-4 h-4 bg-white/90 rounded flex items-center justify-center text-foreground cursor-pointer hover:bg-white transition-colors"
                  aria-label="სურათის მარჯვნივ გადატანა"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleRemove(img)}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black/80 transition-colors"
              aria-label="სურათის წაშლა"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="w-16 h-16 rounded-lg border-2 border-dashed"
          aria-label="სურათის ატვირთვა"
        >
          {uploadMutation.isPending ? (
            <span className="text-[10px]">...</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
        </Button>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleUpload} />
    </div>
  );
}
