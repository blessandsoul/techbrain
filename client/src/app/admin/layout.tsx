import type { Metadata } from 'next';

import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'TechBrain ადმინი',
};

export default function AdminLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <TooltipProvider>
      <div className="min-h-dvh bg-muted/50 text-foreground">
        {children}
      </div>
    </TooltipProvider>
  );
}
