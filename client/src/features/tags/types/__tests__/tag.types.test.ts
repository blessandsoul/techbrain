import { describe, it, expect } from 'vitest';

import type {
  ITag,
  CreateTagRequest,
  UpdateTagRequest,
  TagResponse,
  FaqResponse,
  FaqInput,
  LocalizedString,
} from '../tag.types';

describe('Tag Types', () => {
  describe('ITag', () => {
    it('should accept a valid tag object', () => {
      const tag: ITag = {
        id: 'tag-1',
        slug: 'test-tag',
        name: { ka: 'ტესტი', ru: 'Тест', en: 'Test' },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      expect(tag.id).toBe('tag-1');
      expect(tag.slug).toBe('test-tag');
      expect(tag.name.ka).toBe('ტესტი');
    });
  });

  describe('CreateTagRequest', () => {
    it('should accept ka-only name', () => {
      const req: CreateTagRequest = {
        name: { ka: 'ახალი თეგი' },
      };
      expect(req.name.ka).toBe('ახალი თეგი');
      expect(req.name.ru).toBeUndefined();
      expect(req.name.en).toBeUndefined();
    });

    it('should accept all languages', () => {
      const req: CreateTagRequest = {
        name: { ka: 'თეგი', ru: 'Тег', en: 'Tag' },
      };
      expect(req.name.ru).toBe('Тег');
      expect(req.name.en).toBe('Tag');
    });
  });

  describe('UpdateTagRequest', () => {
    it('should accept partial name update', () => {
      const req: UpdateTagRequest = {
        name: { en: 'Updated' },
      };
      expect(req.name?.en).toBe('Updated');
      expect(req.name?.ka).toBeUndefined();
    });

    it('should accept empty object', () => {
      const req: UpdateTagRequest = {};
      expect(req.name).toBeUndefined();
    });
  });

  describe('TagResponse', () => {
    it('should represent tag data in article/project responses', () => {
      const tag: TagResponse = {
        id: 'tag-1',
        slug: 'security',
        name: { ka: 'უსაფრთხოება', ru: 'Безопасность', en: 'Security' },
      };
      expect(tag.id).toBe('tag-1');
      expect(tag.name.en).toBe('Security');
    });
  });

  describe('FaqResponse', () => {
    it('should represent FAQ data with sortOrder', () => {
      const faq: FaqResponse = {
        id: 'faq-1',
        question: { ka: 'კითხვა?', ru: 'Вопрос?', en: 'Question?' },
        answer: { ka: 'პასუხი', ru: 'Ответ', en: 'Answer' },
        sortOrder: 0,
      };
      expect(faq.sortOrder).toBe(0);
      expect(faq.question.ka).toBe('კითხვა?');
    });
  });

  describe('FaqInput', () => {
    it('should accept ka-only with optional ru/en', () => {
      const input: FaqInput = {
        question: { ka: 'კითხვა?' },
        answer: { ka: 'პასუხი' },
      };
      expect(input.question.ka).toBe('კითხვა?');
      expect(input.sortOrder).toBeUndefined();
    });

    it('should accept sortOrder', () => {
      const input: FaqInput = {
        question: { ka: 'კითხვა?', en: 'Q?' },
        answer: { ka: 'პასუხი', en: 'A' },
        sortOrder: 2,
      };
      expect(input.sortOrder).toBe(2);
    });
  });

  describe('LocalizedString', () => {
    it('should require all three languages', () => {
      const str: LocalizedString = { ka: 'ა', ru: 'б', en: 'c' };
      expect(str.ka).toBe('ა');
      expect(str.ru).toBe('б');
      expect(str.en).toBe('c');
    });
  });
});
