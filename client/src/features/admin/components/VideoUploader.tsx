'use client';

import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const MAX_VIDEO_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_FILE_SIZE_MB) || 50;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const ACCEPTED_VIDEO_TYPES = 'video/mp4,video/webm,video/quicktime';

interface VideoUploaderProps {
  videoUrl: string | null;
  resolveUrl: (url: string) => string;
  onUpload: (file: File, onProgress: (percent: number) => void) => Promise<void>;
  onRemove: () => void;
  isPending: boolean;
}

export function VideoUploader({ videoUrl, resolveUrl, onUpload, onRemove, isPending }: VideoUploaderProps): React.ReactElement {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const isUploading = isPending || progress !== null;

  // Blob URLs play instantly; server paths go through resolveUrl for cache-busting
  const resolvedSrc = videoUrl
    ? (videoUrl.startsWith('blob:') ? videoUrl : resolveUrl(videoUrl))
    : '';

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      toast.error(`ვიდეო ზომა არ უნდა აღემატებოდეს ${MAX_VIDEO_SIZE_MB}MB-ს`);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setProgress(0);
    try {
      await onUpload(file, (percent) => setProgress(percent));
    } catch {
      // Error handled by caller
    } finally {
      setProgress(null);
    }

    if (fileRef.current) fileRef.current.value = '';
  }, [onUpload]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-foreground uppercase tracking-wider">ვიდეო</span>
      </div>

      {videoUrl && !isUploading ? (
        <div className="space-y-2">
          <div className="relative rounded-lg overflow-hidden bg-black max-w-xs h-48">
            <video
              ref={videoRef}
              key={resolvedSrc}
              src={resolvedSrc}
              controls
              preload="metadata"
              playsInline
              onLoadedData={() => videoRef.current?.play().catch(() => {})}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            disabled={isUploading}
            className="text-destructive hover:text-destructive"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            წაშლა
          </Button>
        </div>
      ) : isUploading ? (
        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center gap-3 h-16 px-4 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
            <svg className="w-5 h-5 text-primary animate-spin shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">იტვირთება...</p>
              <p className="text-xs text-muted-foreground">{progress !== null ? `${progress}%` : 'მზადდება...'}</p>
            </div>
          </div>
          {progress !== null && (
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          className="h-16 w-full max-w-xs rounded-lg border-2 border-dashed"
        >
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            ვიდეოს ატვირთვა
          </span>
        </Button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_VIDEO_TYPES}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
