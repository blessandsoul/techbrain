import type { FaqResponse } from '@/features/tags/types/tag.types';

interface FaqJsonLdProps {
  faqs: FaqResponse[];
  locale: 'ka' | 'ru' | 'en';
}

export function FaqJsonLd({ faqs, locale }: FaqJsonLdProps): React.ReactElement | null {
  if (faqs.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question[locale] || faq.question.ka,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer[locale] || faq.answer.ka,
      },
    })),
  };

  // JSON.stringify on typed data is safe — no raw HTML injection possible
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
