import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-9' }: LogoProps): React.ReactElement {
  return (
    <div
      className={`shrink-0 select-none ${className}`}
      aria-label="TechBrain"
    >
      <Image
        src="/logo-full.png"
        alt="TechBrain"
        width={478}
        height={128}
        className="object-contain w-auto h-full"
        priority
      />
    </div>
  );
}
