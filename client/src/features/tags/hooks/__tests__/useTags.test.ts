import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

import { tagKeys } from '../useTags';

// Mock tag service
vi.mock('../../services/tag.service', () => ({
  tagService: {
    getTags: vi.fn(),
    createTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn(),
  },
}));

import { tagService } from '../../services/tag.service';

const mockTags = [
  {
    id: 'tag-1',
    slug: 'cameras',
    name: { ka: 'კამერები', ru: 'Камеры', en: 'Cameras' },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'tag-2',
    slug: 'security',
    name: { ka: 'უსაფრთხოება', ru: 'Безопасность', en: 'Security' },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

function createWrapper(): React.FC<{ children: React.ReactNode }> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('Tag Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('tagKeys', () => {
    it('should generate correct key for all', () => {
      expect(tagKeys.all).toEqual(['tags']);
    });

    it('should generate correct key for lists', () => {
      expect(tagKeys.lists()).toEqual(['tags', 'list']);
    });

    it('should generate correct key for list with search', () => {
      expect(tagKeys.list('test')).toEqual(['tags', 'list', 'test']);
    });

    it('should generate correct key for list without search', () => {
      expect(tagKeys.list()).toEqual(['tags', 'list', undefined]);
    });
  });

  describe('useTags', () => {
    it('should fetch tags successfully', async () => {
      vi.mocked(tagService.getTags).mockResolvedValue(mockTags);

      // Dynamic import to get the hook after mocks are set up
      const { useTags } = await import('../useTags');

      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTags);
      expect(tagService.getTags).toHaveBeenCalledWith(undefined);
    });

    it('should pass search parameter', async () => {
      vi.mocked(tagService.getTags).mockResolvedValue([mockTags[0]]);

      const { useTags } = await import('../useTags');

      const { result } = renderHook(() => useTags('კამერ'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(tagService.getTags).toHaveBeenCalledWith('კამერ');
    });
  });

  describe('useCreateTag', () => {
    it('should create a tag and show success toast', async () => {
      const newTag = mockTags[0];
      vi.mocked(tagService.createTag).mockResolvedValue(newTag);

      const { useCreateTag } = await import('../useTags');
      const { toast } = await import('sonner');

      const { result } = renderHook(() => useCreateTag(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ name: { ka: 'კამერები' } });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(tagService.createTag).toHaveBeenCalledWith({ name: { ka: 'კამერები' } });
      expect(toast.success).toHaveBeenCalledWith('თეგი შეიქმნა');
    });

    it('should show error toast on failure', async () => {
      vi.mocked(tagService.createTag).mockRejectedValue(new Error('Server error'));

      const { useCreateTag } = await import('../useTags');
      const { toast } = await import('sonner');

      const { result } = renderHook(() => useCreateTag(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ name: { ka: 'test' } });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('useUpdateTag', () => {
    it('should update a tag and show success toast', async () => {
      const updatedTag = { ...mockTags[0], name: { ...mockTags[0].name, en: 'Updated' } };
      vi.mocked(tagService.updateTag).mockResolvedValue(updatedTag);

      const { useUpdateTag } = await import('../useTags');
      const { toast } = await import('sonner');

      const { result } = renderHook(() => useUpdateTag(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: 'tag-1', data: { name: { en: 'Updated' } } });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(tagService.updateTag).toHaveBeenCalledWith('tag-1', { name: { en: 'Updated' } });
      expect(toast.success).toHaveBeenCalledWith('თეგი განახლდა');
    });
  });

  describe('useDeleteTag', () => {
    it('should delete a tag and show success toast', async () => {
      vi.mocked(tagService.deleteTag).mockResolvedValue(undefined);

      const { useDeleteTag } = await import('../useTags');
      const { toast } = await import('sonner');

      const { result } = renderHook(() => useDeleteTag(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('tag-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(tagService.deleteTag).toHaveBeenCalledWith('tag-1');
      expect(toast.success).toHaveBeenCalledWith('თეგი წაიშალა');
    });
  });
});
