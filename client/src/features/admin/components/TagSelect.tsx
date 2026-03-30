'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTags, useCreateTag } from '@/features/tags/hooks/useTags';
import { getErrorMessage } from '@/lib/utils/error';

import type { TagResponse } from '@/features/tags/types/tag.types';

interface TagSelectProps {
  selected: TagResponse[];
  onChange: (tags: TagResponse[]) => void;
}

export function TagSelect({ selected, onChange }: TagSelectProps): React.ReactElement {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const { data: allTags } = useTags();
  const createMutation = useCreateTag();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(selected.map((t) => t.id));

  const filtered = (allTags ?? []).filter(
    (tag) =>
      !selectedIds.has(tag.id) &&
      (tag.name.ka.toLowerCase().includes(search.toLowerCase()) ||
        tag.name.ru.toLowerCase().includes(search.toLowerCase()) ||
        tag.name.en.toLowerCase().includes(search.toLowerCase())),
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent): void {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = useCallback(
    (tag: TagResponse): void => {
      onChange([...selected, tag]);
      setSearch('');
      setOpen(false);
    },
    [selected, onChange],
  );

  const handleRemove = useCallback(
    (id: string): void => {
      onChange(selected.filter((t) => t.id !== id));
    },
    [selected, onChange],
  );

  async function handleCreateInline(): Promise<void> {
    const name = search.trim();
    if (!name) return;
    try {
      const created = await createMutation.mutateAsync({ name: { ka: name } });
      onChange([...selected, { id: created.id, slug: created.slug, name: created.name }]);
      setSearch('');
      setOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
              {tag.name.ka}
              <button
                type="button"
                onClick={() => handleRemove(tag.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                aria-label={`${tag.name.ka} წაშლა`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <Input
        placeholder="თეგის ძიება ან შექმნა..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {/* Dropdown */}
      {open && (search || filtered.length > 0) && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleSelect(tag)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <span className="text-foreground">{tag.name.ka}</span>
              {tag.name.en && <span className="text-xs text-muted-foreground">({tag.name.en})</span>}
            </button>
          ))}
          {search.trim() && filtered.length === 0 && !selectedIds.has(search) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-primary"
              onClick={handleCreateInline}
              disabled={createMutation.isPending}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              &ldquo;{search.trim()}&rdquo; შექმნა
            </Button>
          )}
          {!search.trim() && filtered.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">ყველა თეგი უკვე არჩეულია</p>
          )}
        </div>
      )}
    </div>
  );
}
