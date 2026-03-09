import Image from 'next/image';

// Original PNG dimensions: 478 × 128 px
const LOGO_ASPECT = 478 / 128; // ≈ 3.734

interface LogoProps {
  height?: number; // logo height in px, default 36
}

export function Logo({ height = 36 }: LogoProps): React.ReactElement {
  const width = Math.round(height * LOGO_ASPECT);

  return (
    <div
      className="shrink-0 select-none"
      aria-label="TechBrain"
      style={{ width, height }}
    >
      <Image
        src="/logo-full.png"
        alt="TechBrain"
        width={width}
        height={height}
        className="object-contain w-full h-full"
        priority
      />
    </div>
  );
}
