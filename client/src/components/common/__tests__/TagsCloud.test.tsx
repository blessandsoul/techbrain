import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { TagsCloud } from '../TagsCloud';

import type { TagResponse } from '@/features/tags/types/tag.types';

const mockTags: TagResponse[] = [
  { id: 'tag-1', slug: 'cameras', name: { ka: 'კამერები', ru: 'Камеры', en: 'Cameras' } },
  { id: 'tag-2', slug: 'security', name: { ka: 'უსაფრთხოება', ru: 'Безопасность', en: 'Security' } },
  { id: 'tag-3', slug: 'nvr', name: { ka: 'NVR', ru: 'NVR', en: 'NVR' } },
];

describe('TagsCloud', () => {
  it('should return null when tags array is empty', () => {
    const { container } = render(<TagsCloud tags={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('should render all tag names in ka locale', () => {
    render(<TagsCloud tags={mockTags} />);
    // useLocale mock returns localized() that picks .ka
    expect(screen.getByText('კამერები')).toBeInTheDocument();
    expect(screen.getByText('უსაფრთხოება')).toBeInTheDocument();
    expect(screen.getByText('NVR')).toBeInTheDocument();
  });

  it('should render tags as non-clickable badges', () => {
    render(<TagsCloud tags={mockTags} />);
    const badges = screen.getAllByText(/კამერები|უსაფრთხოება|NVR/);
    badges.forEach((badge) => {
      // pointer-events-none class makes them non-clickable
      expect(badge.className).toContain('pointer-events-none');
    });
  });

  it('should render correct number of badges', () => {
    render(<TagsCloud tags={mockTags} />);
    const badges = screen.getAllByText(/კამერები|უსაფრთხოება|NVR/);
    expect(badges).toHaveLength(3);
  });

  it('should render single tag', () => {
    render(<TagsCloud tags={[mockTags[0]]} />);
    expect(screen.getByText('კამერები')).toBeInTheDocument();
  });
});
