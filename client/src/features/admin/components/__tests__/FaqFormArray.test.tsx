import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FaqFormArray } from '../FaqFormArray';

import type { FaqInput } from '@/features/tags/types/tag.types';

const emptyFaq: FaqInput = {
  question: { ka: '', ru: '', en: '' },
  answer: { ka: '', ru: '', en: '' },
};

const filledFaqs: FaqInput[] = [
  {
    question: { ka: 'კითხვა 1?', ru: 'Вопрос 1?', en: 'Question 1?' },
    answer: { ka: 'პასუხი 1', ru: 'Ответ 1', en: 'Answer 1' },
  },
  {
    question: { ka: 'კითხვა 2?', ru: '', en: '' },
    answer: { ka: 'პასუხი 2', ru: '', en: '' },
  },
];

describe('FaqFormArray', () => {
  it('should render add button when empty', () => {
    render(<FaqFormArray faqs={[]} onChange={vi.fn()} />);
    expect(screen.getByText('FAQ დამატება')).toBeInTheDocument();
  });

  it('should call onChange with new empty FAQ on add', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FaqFormArray faqs={[]} onChange={onChange} />);

    await user.click(screen.getByText('FAQ დამატება'));

    expect(onChange).toHaveBeenCalledOnce();
    const newFaqs = onChange.mock.calls[0][0];
    expect(newFaqs).toHaveLength(1);
    expect(newFaqs[0].question.ka).toBe('');
    expect(newFaqs[0].answer.ka).toBe('');
  });

  it('should render existing FAQs with labels', () => {
    render(<FaqFormArray faqs={filledFaqs} onChange={vi.fn()} />);

    expect(screen.getByText('FAQ #1')).toBeInTheDocument();
    expect(screen.getByText('FAQ #2')).toBeInTheDocument();
  });

  it('should render input fields with correct values', () => {
    render(<FaqFormArray faqs={filledFaqs} onChange={vi.fn()} />);

    const inputs = screen.getAllByDisplayValue('კითხვა 1?');
    expect(inputs).toHaveLength(1);

    const answerInputs = screen.getAllByDisplayValue('პასუხი 1');
    expect(answerInputs).toHaveLength(1);
  });

  it('should call onChange when removing a FAQ', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FaqFormArray faqs={filledFaqs} onChange={onChange} />);

    // Click the first remove button (X icon)
    const removeButtons = screen.getAllByLabelText('წაშლა');
    await user.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledOnce();
    const result = onChange.mock.calls[0][0];
    expect(result).toHaveLength(1);
    expect(result[0].question.ka).toBe('კითხვა 2?');
  });

  it('should call onChange when moving FAQ up', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FaqFormArray faqs={filledFaqs} onChange={onChange} />);

    // Second item's up button
    const upButtons = screen.getAllByLabelText('ზემოთ');
    await user.click(upButtons[1]); // second FAQ's up button

    expect(onChange).toHaveBeenCalledOnce();
    const result = onChange.mock.calls[0][0];
    expect(result[0].question.ka).toBe('კითხვა 2?');
    expect(result[1].question.ka).toBe('კითხვა 1?');
  });

  it('should call onChange when moving FAQ down', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FaqFormArray faqs={filledFaqs} onChange={onChange} />);

    // First item's down button
    const downButtons = screen.getAllByLabelText('ქვემოთ');
    await user.click(downButtons[0]);

    expect(onChange).toHaveBeenCalledOnce();
    const result = onChange.mock.calls[0][0];
    expect(result[0].question.ka).toBe('კითხვა 2?');
    expect(result[1].question.ka).toBe('კითხვა 1?');
  });

  it('should disable up button on first item', () => {
    render(<FaqFormArray faqs={filledFaqs} onChange={vi.fn()} />);
    const upButtons = screen.getAllByLabelText('ზემოთ');
    expect(upButtons[0]).toBeDisabled();
  });

  it('should disable down button on last item', () => {
    render(<FaqFormArray faqs={filledFaqs} onChange={vi.fn()} />);
    const downButtons = screen.getAllByLabelText('ქვემოთ');
    expect(downButtons[downButtons.length - 1]).toBeDisabled();
  });

  it('should call onChange when typing in question ka field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FaqFormArray faqs={[emptyFaq]} onChange={onChange} />);

    const kaInput = screen.getByPlaceholderText('კითხვა ქართულად');
    await user.type(kaInput, 'ა');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall[0].question.ka).toBe('ა');
  });

  it('should call onChange when typing in answer field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FaqFormArray faqs={[emptyFaq]} onChange={onChange} />);

    const kaAnswer = screen.getByPlaceholderText('პასუხი ქართულად');
    await user.type(kaAnswer, 'ტ');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall[0].answer.ka).toBe('ტ');
  });

  it('should render language labels for question and answer', () => {
    render(<FaqFormArray faqs={[emptyFaq]} onChange={vi.fn()} />);

    // Each FAQ has question (KA, RU, EN) and answer (KA, RU, EN) labels
    const kaLabels = screen.getAllByText('KA *');
    expect(kaLabels).toHaveLength(2); // question + answer

    const ruLabels = screen.getAllByText('RU');
    expect(ruLabels).toHaveLength(2);

    const enLabels = screen.getAllByText('EN');
    expect(enLabels).toHaveLength(2);
  });
});
