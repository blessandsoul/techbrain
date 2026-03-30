'use client';

import { useState, useCallback } from 'react';
import { useLocale } from '@/lib/i18n';

import type { FaqResponse } from '@/features/tags/types/tag.types';

interface FaqAccordionProps {
  faqs: FaqResponse[];
}

function FaqItem({ faq, localized }: { faq: FaqResponse; localized: (obj: { ka: string; ru: string; en: string }) => string }): React.ReactElement {
  const [open, setOpen] = useState(false);
  const question = localized(faq.question);
  const answer = localized(faq.answer);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between gap-4 py-4 px-1 text-left transition-colors active:opacity-70 md:hover:text-primary"
        aria-expanded={open}
      >
        <span className="text-sm md:text-base font-medium text-foreground">{question}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="px-1 pb-4 text-sm text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion({ faqs }: FaqAccordionProps): React.ReactElement | null {
  const { localized } = useLocale();

  if (faqs.length === 0) return null;

  return (
    <section className="max-w-[680px] mx-auto mt-12 md:mt-16">
      <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">FAQ</h2>
      <div className="rounded-xl border border-border bg-card px-4">
        {faqs.map((faq) => (
          <FaqItem key={faq.id} faq={faq} localized={localized} />
        ))}
      </div>
    </section>
  );
}
