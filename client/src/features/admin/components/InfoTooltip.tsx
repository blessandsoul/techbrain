'use client';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps): React.ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors ml-1 shrink-0 cursor-help"
          aria-label={text}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-2.5 h-2.5"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 .75.75 0 011.06 1.06zM10 8.75a.75.75 0 01.75.75v5a.75.75 0 01-1.5 0v-5a.75.75 0 01.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={4} className="max-w-64">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
