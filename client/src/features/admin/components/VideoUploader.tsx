'use client';

import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const MAX_VIDEO_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_FILE_SIZE_MB) || 50;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const ACCEPTED_VIDEO_TYPES = 'video/mp4,video/webm,video/quicktime';

interface VideoUploaderProps {
  videoUrl: string | null;
  resolveUrl: (url: string) => string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  isPending: boolean;
}

export function VideoUploader({ videoUrl, resolveUrl, onUpload, onRemove, isPending }: VideoUploaderProps): React.ReactElement {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      toast.error(`ვიდეო ზომა არ უნდა აღემატებოდეს ${MAX_VIDEO_SIZE_MB}MB-ს`);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    try {
      await onUpload(file);
    } catch {
      // Error handled by mutation hook
    }

    if (fileRef.current) fileRef.current.value = '';
  }, [onUpload]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-foreground uppercase tracking-wider">ვიდეო</span>
      </div>

      {videoUrl ? (
        <div className="space-y-2">
          <div className="relative rounded-lg overflow-hidden bg-black max-w-xs h-48">
            <video
              key={videoUrl}
              controls
              preload="metadata"
              playsInline
              className="w-full h-full object-contain rounded-lg"
            >
              <source src={resolveUrl(videoUrl)} />
            </video>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            disabled={isPending}
            className="text-destructive hover:text-destructive"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            წაშლა
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={isPending}
          className="h-16 w-full max-w-xs rounded-lg border-2 border-dashed"
        >
          {isPending ? (
            <span className="text-sm text-muted-foreground">იტვირთება...</span>
          ) : (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              ვიდეოს ატვირთვა
            </span>
          )}
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
