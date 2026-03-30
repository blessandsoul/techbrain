import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FaqAccordion } from '../FaqAccordion';

import type { FaqResponse } from '@/features/tags/types/tag.types';

const mockFaqs: FaqResponse[] = [
  {
    id: 'faq-1',
    question: { ka: 'რა არის IP კამერა?', ru: 'Что такое IP камера?', en: 'What is an IP camera?' },
    answer: { ka: 'IP კამერა არის...', ru: 'IP камера это...', en: 'An IP camera is...' },
    sortOrder: 0,
  },
  {
    id: 'faq-2',
    question: { ka: 'რამდენ ხანს ინახება ჩანაწერი?', ru: 'Как долго хранятся записи?', en: 'How long are recordings stored?' },
    answer: { ka: 'ჩანაწერი ინახება 30 დღე', ru: '30 дней', en: '30 days' },
    sortOrder: 1,
  },
];

describe('FaqAccordion', () => {
  it('should return null when faqs array is empty', () => {
    const { container } = render(<FaqAccordion faqs={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('should render FAQ heading', () => {
    render(<FaqAccordion faqs={mockFaqs} />);
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('should render all FAQ questions', () => {
    render(<FaqAccordion faqs={mockFaqs} />);
    // useLocale mock returns ka locale, so localized() returns .ka
    expect(screen.getByText('რა არის IP კამერა?')).toBeInTheDocument();
    expect(screen.getByText('რამდენ ხანს ინახება ჩანაწერი?')).toBeInTheDocument();
  });

  it('should hide answers by default', () => {
    render(<FaqAccordion faqs={mockFaqs} />);
    const answer = screen.getByText('IP კამერა არის...');
    // Answer exists in DOM but is hidden via grid-template-rows: 0fr
    expect(answer.closest('[style]')).toHaveStyle({ gridTemplateRows: '0fr' });
  });

  it('should expand answer on click', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion faqs={mockFaqs} />);

    const questionButton = screen.getByText('რა არის IP კამერა?').closest('button')!;
    await user.click(questionButton);

    const answer = screen.getByText('IP კამერა არის...');
    expect(answer.closest('[style]')).toHaveStyle({ gridTemplateRows: '1fr' });
  });

  it('should collapse answer on second click', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion faqs={mockFaqs} />);

    const questionButton = screen.getByText('რა არის IP კამერა?').closest('button')!;
    await user.click(questionButton); // open
    await user.click(questionButton); // close

    const answer = screen.getByText('IP კამერა არის...');
    expect(answer.closest('[style]')).toHaveStyle({ gridTemplateRows: '0fr' });
  });

  it('should have aria-expanded attribute on buttons', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion faqs={mockFaqs} />);

    const questionButton = screen.getByText('რა არის IP კამერა?').closest('button')!;
    expect(questionButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(questionButton);
    expect(questionButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should allow multiple FAQs to be expanded independently', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion faqs={mockFaqs} />);

    const q1Button = screen.getByText('რა არის IP კამერა?').closest('button')!;
    const q2Button = screen.getByText('რამდენ ხანს ინახება ჩანაწერი?').closest('button')!;

    await user.click(q1Button);
    await user.click(q2Button);

    // Both should be expanded
    expect(q1Button).toHaveAttribute('aria-expanded', 'true');
    expect(q2Button).toHaveAttribute('aria-expanded', 'true');
  });
});
