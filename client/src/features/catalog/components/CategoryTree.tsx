'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CaretRight } from '@phosphor-icons/react';
import { useLocale } from '@/lib/i18n';
import type { CategoryNode } from '../types/catalog.types';

interface CategoryTreeProps {
  categoryTree: CategoryNode[];
  categoryCounts: Record<string, number>;
}

export function CategoryTree({ categoryTree, categoryCounts }: CategoryTreeProps): React.ReactElement {
  const { t, localized } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') ?? undefined;

  // Root nodes are always expanded by default; also expand any ancestor of the active category.
  // The tree arrives asynchronously, so we re-seed expansion once when it becomes available.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current || categoryTree.length === 0) return;
    seededRef.current = true;
    setExpandedIds((prev) => {
      const next = new Set(prev);
      for (const root of categoryTree) next.add(root.id);
      if (activeCategory) {
        const path = findPath(categoryTree, activeCategory);
        for (const id of path) next.add(id);
      }
      return next;
    });
  }, [categoryTree, activeCategory]);

  // Default-select the first root category if none is active, so filters for that
  // category load immediately on a fresh visit to /catalog.
  useEffect(() => {
    if (activeCategory || categoryTree.length === 0) return;
    const firstRoot = categoryTree[0];
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', firstRoot.id);
    router.replace(`${pathname}?${params.toString()}`);
  }, [activeCategory, categoryTree, pathname, router, searchParams]);

  function toggleExpand(id: string): void {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectCategory(node: CategoryNode): void {
    const params = new URLSearchParams();
    params.set('category', node.id);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <nav className="space-y-0.5" aria-label="Categories">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
        {t('catalog.categories')}
      </p>
      {categoryTree.map((node) => (
        <CategoryItem
          key={node.id}
          node={node}
          depth={0}
          counts={categoryCounts}
          expanded={expandedIds}
          active={activeCategory}
          onToggle={toggleExpand}
          onSelect={selectCategory}
          localize={(label) => localized(label)}
        />
      ))}
    </nav>
  );
}

// ── Recursive item ────────────────────────────────────

interface CategoryItemProps {
  node: CategoryNode;
  depth: number;
  counts: Record<string, number>;
  expanded: Set<string>;
  active: string | undefined;
  onToggle: (id: string) => void;
  onSelect: (node: CategoryNode) => void;
  localize: (label: CategoryNode['label']) => string;
}

function CategoryItem({ node, depth, counts, expanded, active, onToggle, onSelect, localize }: CategoryItemProps): React.ReactElement {
  const hasChildren = !!node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isActive = active === node.id;
  const count = counts[node.id] ?? 0;

  function handleRowClick(): void {
    onSelect(node);
    if (hasChildren) onToggle(node.id);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleRowClick}
        aria-expanded={hasChildren ? isExpanded : undefined}
        className={`w-full flex items-center gap-2 pr-3 py-2 rounded-lg text-sm text-left transition-colors duration-150 cursor-pointer ${
          isActive ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
        }`}
        style={{ paddingLeft: `${depth * 12}px` }}
      >
        {hasChildren ? (
          <CaretRight
            size={14}
            weight="bold"
            className={`shrink-0 mx-2 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            aria-hidden="true"
          />
        ) : (
          <span className="w-7 shrink-0" />
        )}
        <span className="flex-1">{localize(node.label)}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
      </button>

      {hasChildren && (
        <div
          className={`grid motion-safe:transition-[grid-template-rows,opacity] duration-200 ease-out ${
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-0.5 mt-0.5">
              {node.children!.map((child) => (
                <CategoryItem
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  counts={counts}
                  expanded={expanded}
                  active={active}
                  onToggle={onToggle}
                  onSelect={onSelect}
                  localize={localize}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper: find the path of IDs from root → target ───

function findPath(tree: CategoryNode[], targetId: string): string[] {
  for (const node of tree) {
    if (node.id === targetId) return [node.id];
    if (node.children) {
      const childPath = findPath(node.children, targetId);
      if (childPath.length > 0) return [node.id, ...childPath];
    }
  }
  return [];
}
