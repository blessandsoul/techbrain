import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { FaqJsonLd } from '../FaqJsonLd';

import type { FaqResponse } from '@/features/tags/types/tag.types';

const mockFaqs: FaqResponse[] = [
  {
    id: 'faq-1',
    question: { ka: 'კითხვა 1?', ru: 'Вопрос 1?', en: 'Question 1?' },
    answer: { ka: 'პასუხი 1', ru: 'Ответ 1', en: 'Answer 1' },
    sortOrder: 0,
  },
  {
    id: 'faq-2',
    question: { ka: 'კითხვა 2?', ru: 'Вопрос 2?', en: 'Question 2?' },
    answer: { ka: 'პასუხი 2', ru: 'Ответ 2', en: 'Answer 2' },
    sortOrder: 1,
  },
];

describe('FaqJsonLd', () => {
  it('should return null when faqs array is empty', () => {
    const { container } = render(<FaqJsonLd faqs={[]} locale="ka" />);
    expect(container.querySelector('script')).toBeNull();
  });

  it('should render a script tag with type application/ld+json', () => {
    const { container } = render(<FaqJsonLd faqs={mockFaqs} locale="ka" />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
  });

  it('should produce valid FAQPage structured data', () => {
    const { container } = render(<FaqJsonLd faqs={mockFaqs} locale="ka" />);
    const script = container.querySelector('script[type="application/ld+json"]')!;
    const jsonLd = JSON.parse(script.textContent!);

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('FAQPage');
    expect(jsonLd.mainEntity).toHaveLength(2);
  });

  it('should use the specified locale for questions and answers', () => {
    const { container } = render(<FaqJsonLd faqs={mockFaqs} locale="en" />);
    const script = container.querySelector('script[type="application/ld+json"]')!;
    const jsonLd = JSON.parse(script.textContent!);

    expect(jsonLd.mainEntity[0].name).toBe('Question 1?');
    expect(jsonLd.mainEntity[0].acceptedAnswer.text).toBe('Answer 1');
    expect(jsonLd.mainEntity[1].name).toBe('Question 2?');
    expect(jsonLd.mainEntity[1].acceptedAnswer.text).toBe('Answer 2');
  });

  it('should use ka locale correctly', () => {
    const { container } = render(<FaqJsonLd faqs={mockFaqs} locale="ka" />);
    const script = container.querySelector('script[type="application/ld+json"]')!;
    const jsonLd = JSON.parse(script.textContent!);

    expect(jsonLd.mainEntity[0].name).toBe('კითხვა 1?');
    expect(jsonLd.mainEntity[0].acceptedAnswer.text).toBe('პასუხი 1');
  });

  it('should use ru locale correctly', () => {
    const { container } = render(<FaqJsonLd faqs={mockFaqs} locale="ru" />);
    const script = container.querySelector('script[type="application/ld+json"]')!;
    const jsonLd = JSON.parse(script.textContent!);

    expect(jsonLd.mainEntity[0].name).toBe('Вопрос 1?');
  });

  it('should fallback to ka when locale value is empty', () => {
    const faqsWithEmpty: FaqResponse[] = [{
      id: 'faq-1',
      question: { ka: 'კითხვა?', ru: '', en: '' },
      answer: { ka: 'პასუხი', ru: '', en: '' },
      sortOrder: 0,
    }];

    const { container } = render(<FaqJsonLd faqs={faqsWithEmpty} locale="en" />);
    const script = container.querySelector('script[type="application/ld+json"]')!;
    const jsonLd = JSON.parse(script.textContent!);

    // Empty string is falsy, so should fallback to ka
    expect(jsonLd.mainEntity[0].name).toBe('კითხვა?');
    expect(jsonLd.mainEntity[0].acceptedAnswer.text).toBe('პასუხი');
  });

  it('should have correct Question/@type for each entry', () => {
    const { container } = render(<FaqJsonLd faqs={mockFaqs} locale="ka" />);
    const script = container.querySelector('script[type="application/ld+json"]')!;
    const jsonLd = JSON.parse(script.textContent!);

    jsonLd.mainEntity.forEach((entry: { '@type': string; acceptedAnswer: { '@type': string } }) => {
      expect(entry['@type']).toBe('Question');
      expect(entry.acceptedAnswer['@type']).toBe('Answer');
    });
  });
});
