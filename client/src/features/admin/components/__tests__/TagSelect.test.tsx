import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

import { TagSelect } from '../TagSelect';

import type { TagResponse } from '@/features/tags/types/tag.types';

// Mock the useTags hook and useCreateTag
const mockTags = [
  { id: 'tag-1', slug: 'cameras', name: { ka: 'კამერები', ru: 'Камеры', en: 'Cameras' } },
  { id: 'tag-2', slug: 'security', name: { ka: 'უსაფრთხოება', ru: 'Безопасность', en: 'Security' } },
  { id: 'tag-3', slug: 'nvr', name: { ka: 'NVR', ru: 'NVR', en: 'NVR' } },
];

const mockCreateMutateAsync = vi.fn();

vi.mock('@/features/tags/hooks/useTags', () => ({
  useTags: vi.fn(() => ({
    data: mockTags,
    isLoading: false,
  })),
  useCreateTag: vi.fn(() => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  })),
}));

function createWrapper(): React.FC<{ children: React.ReactNode }> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('TagSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(<TagSelect selected={[]} onChange={vi.fn()} />, { wrapper: createWrapper() });
    expect(screen.getByPlaceholderText('თეგის ძიება ან შექმნა...')).toBeInTheDocument();
  });

  it('should show dropdown with tags on focus', async () => {
    const user = userEvent.setup();
    render(<TagSelect selected={[]} onChange={vi.fn()} />, { wrapper: createWrapper() });

    await user.click(screen.getByPlaceholderText('თეგის ძიება ან შექმნა...'));

    expect(screen.getByText('კამერები')).toBeInTheDocument();
    expect(screen.getByText('უსაფრთხოება')).toBeInTheDocument();
    expect(screen.getByText('NVR')).toBeInTheDocument();
  });

  it('should filter tags by search text', async () => {
    const user = userEvent.setup();
    render(<TagSelect selected={[]} onChange={vi.fn()} />, { wrapper: createWrapper() });

    await user.type(screen.getByPlaceholderText('თეგის ძიება ან შექმნა...'), 'Cam');

    expect(screen.getByText('კამერები')).toBeInTheDocument();
    expect(screen.queryByText('უსაფრთხოება')).not.toBeInTheDocument();
  });

  it('should call onChange when selecting a tag', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagSelect selected={[]} onChange={onChange} />, { wrapper: createWrapper() });

    await user.click(screen.getByPlaceholderText('თეგის ძიება ან შექმნა...'));
    await user.click(screen.getByText('კამერები'));

    expect(onChange).toHaveBeenCalledWith([mockTags[0]]);
  });

  it('should render selected tags as badges', () => {
    const selected: TagResponse[] = [mockTags[0], mockTags[1]];
    render(<TagSelect selected={selected} onChange={vi.fn()} />, { wrapper: createWrapper() });

    expect(screen.getByText('კამერები')).toBeInTheDocument();
    expect(screen.getByText('უსაფრთხოება')).toBeInTheDocument();
  });

  it('should remove tag when clicking X on badge', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const selected: TagResponse[] = [mockTags[0], mockTags[1]];
    render(<TagSelect selected={selected} onChange={onChange} />, { wrapper: createWrapper() });

    const removeButton = screen.getByLabelText('კამერები წაშლა');
    await user.click(removeButton);

    expect(onChange).toHaveBeenCalledWith([mockTags[1]]);
  });

  it('should not show already-selected tags in dropdown', async () => {
    const user = userEvent.setup();
    const selected: TagResponse[] = [mockTags[0]];
    render(<TagSelect selected={selected} onChange={vi.fn()} />, { wrapper: createWrapper() });

    await user.click(screen.getByPlaceholderText('თეგის ძიება ან შექმნა...'));

    // კამერები should NOT appear in dropdown since it's already selected
    // It appears as a badge, but the dropdown items are buttons
    const dropdownButtons = screen.getAllByRole('button');
    const dropdownTagButtons = dropdownButtons.filter((btn) => btn.textContent?.includes('კამერები') && btn.closest('[class*="absolute"]'));
    expect(dropdownTagButtons).toHaveLength(0);
  });

  it('should show create option when search has no matches', async () => {
    const user = userEvent.setup();
    render(<TagSelect selected={[]} onChange={vi.fn()} />, { wrapper: createWrapper() });

    await user.type(screen.getByPlaceholderText('თეგის ძიება ან შექმნა...'), 'ახალი');

    await waitFor(() => {
      expect(screen.getByText(/შექმნა/)).toBeInTheDocument();
    });
  });

  it('should create a new tag inline and add to selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const createdTag = { id: 'tag-new', slug: 'new-tag', name: { ka: 'ახალი', ru: '', en: '' } };
    mockCreateMutateAsync.mockResolvedValue(createdTag);

    render(<TagSelect selected={[]} onChange={onChange} />, { wrapper: createWrapper() });

    await user.type(screen.getByPlaceholderText('თეგის ძიება ან შექმნა...'), 'ახალი');

    await waitFor(() => {
      expect(screen.getByText(/შექმნა/)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/შექმნა/));

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({ name: { ka: 'ახალი' } });
    });

    expect(onChange).toHaveBeenCalledWith([
      { id: 'tag-new', slug: 'new-tag', name: { ka: 'ახალი', ru: '', en: '' } },
    ]);
  });
});
