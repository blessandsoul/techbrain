'use client';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, className }: VideoPlayerProps): React.ReactElement {
  return (
    <div className={`relative w-full rounded-xl md:rounded-2xl overflow-hidden bg-muted ${className ?? ''}`}>
      <video
        key={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        controls
        preload="metadata"
        className="w-full"
      >
        <source src={src} />
      </video>
    </div>
  );
}
