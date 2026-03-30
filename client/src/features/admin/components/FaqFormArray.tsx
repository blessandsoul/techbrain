'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import type { FaqInput } from '@/features/tags/types/tag.types';

interface FaqFormArrayProps {
  faqs: FaqInput[];
  onChange: (faqs: FaqInput[]) => void;
}

function emptyFaq(): FaqInput {
  return {
    question: { ka: '', ru: '', en: '' },
    answer: { ka: '', ru: '', en: '' },
  };
}

export function FaqFormArray({ faqs, onChange }: FaqFormArrayProps): React.ReactElement {
  function handleAdd(): void {
    onChange([...faqs, emptyFaq()]);
  }

  function handleRemove(index: number): void {
    onChange(faqs.filter((_, i) => i !== index));
  }

  function handleMove(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= faqs.length) return;
    const updated = [...faqs];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange(updated);
  }

  function handleChange(index: number, field: 'question' | 'answer', lang: 'ka' | 'ru' | 'en', value: string): void {
    const updated = faqs.map((faq, i) => {
      if (i !== index) return faq;
      return {
        ...faq,
        [field]: { ...faq[field], [lang]: value },
      };
    });
    onChange(updated);
  }

  const labelClass = 'text-xs text-muted-foreground';

  return (
    <div>
      {faqs.map((faq, index) => (
        <div key={index} className="rounded-lg border border-border/50 bg-muted/30 p-3 mb-3">
          {/* Header with index + controls */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">FAQ #{index + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleMove(index, -1)}
                disabled={index === 0}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                aria-label="ზემოთ"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleMove(index, 1)}
                disabled={index === faqs.length - 1}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                aria-label="ქვემოთ"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="წაშლა"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Question */}
          <div className="mb-2">
            <span className="block text-xs font-medium text-foreground mb-1">კითხვა</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <Label className={labelClass}>KA *</Label>
                <Input
                  value={faq.question.ka}
                  onChange={(e) => handleChange(index, 'question', 'ka', e.target.value)}
                  placeholder="კითხვა ქართულად"
                />
              </div>
              <div>
                <Label className={labelClass}>RU</Label>
                <Input
                  value={faq.question.ru ?? ''}
                  onChange={(e) => handleChange(index, 'question', 'ru', e.target.value)}
                  placeholder="Вопрос"
                />
              </div>
              <div>
                <Label className={labelClass}>EN</Label>
                <Input
                  value={faq.question.en ?? ''}
                  onChange={(e) => handleChange(index, 'question', 'en', e.target.value)}
                  placeholder="Question"
                />
              </div>
            </div>
          </div>

          {/* Answer */}
          <div>
            <span className="block text-xs font-medium text-foreground mb-1">პასუხი</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <Label className={labelClass}>KA *</Label>
                <Textarea
                  value={faq.answer.ka}
                  onChange={(e) => handleChange(index, 'answer', 'ka', e.target.value)}
                  placeholder="პასუხი ქართულად"
                  rows={2}
                  className="resize-y"
                />
              </div>
              <div>
                <Label className={labelClass}>RU</Label>
                <Textarea
                  value={faq.answer.ru ?? ''}
                  onChange={(e) => handleChange(index, 'answer', 'ru', e.target.value)}
                  placeholder="Ответ"
                  rows={2}
                  className="resize-y"
                />
              </div>
              <div>
                <Label className={labelClass}>EN</Label>
                <Textarea
                  value={faq.answer.en ?? ''}
                  onChange={(e) => handleChange(index, 'answer', 'en', e.target.value)}
                  placeholder="Answer"
                  rows={2}
                  className="resize-y"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        FAQ დამატება
      </Button>
    </div>
  );
}
