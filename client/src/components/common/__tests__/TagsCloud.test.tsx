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
    expect(screen.getByText('კამერები')).toBeInTheDocument();
    expect(screen.getByText('უსაფრთხოება')).toBeInTheDocument();
    expect(screen.getByText('NVR')).toBeInTheDocument();
  });

  it('should render tags as clickable links', () => {
    render(<TagsCloud tags={mockTags} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  it('should link to blog by default', () => {
    render(<TagsCloud tags={mockTags} />);
    const link = screen.getAllByRole('link')[0];
    expect(link).toHaveAttribute('href', '/blog?tag=cameras');
  });

  it('should link to projects when context is projects', () => {
    render(<TagsCloud tags={mockTags} context="projects" />);
    const link = screen.getAllByRole('link')[0];
    expect(link).toHaveAttribute('href', '/projects?tag=cameras');
  });

  it('should render correct number of tags', () => {
    render(<TagsCloud tags={mockTags} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  it('should render single tag', () => {
    render(<TagsCloud tags={[mockTags[0]]} />);
    expect(screen.getByText('კამერები')).toBeInTheDocument();
  });

  it('should render heading with tags title', () => {
    render(<TagsCloud tags={mockTags} />);
    expect(screen.getByText('tags.title')).toBeInTheDocument();
  });

  it('should render # prefix on each tag', () => {
    render(<TagsCloud tags={mockTags} />);
    const hashSymbols = screen.getAllByText('#');
    expect(hashSymbols).toHaveLength(3);
  });
});
