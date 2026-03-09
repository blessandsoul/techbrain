'use client';

import { useState } from 'react';
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
  const activeSubcategory = searchParams.get('subcategory') ?? undefined;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (activeCategory) initial.add(activeCategory);
    return initial;
  });

  function toggleExpand(id: string): void {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectCategory(node: CategoryNode): void {
    const params = new URLSearchParams();

    if (node.id === 'all') {
      router.push(pathname);
      return;
    }

    const isChild = categoryTree.some((parent) => parent.children?.some((c) => c.id === node.id));
    if (isChild && node.parentCategory) {
      params.set('category', node.parentCategory);
      params.set('subcategory', node.id);
    } else if (node.parentCategory) {
      params.set('category', node.parentCategory);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function isActive(node: CategoryNode): boolean {
    if (node.id === 'all' && !activeCategory) return true;
    if (activeSubcategory) return node.id === activeSubcategory;
    if (!activeSubcategory && node.parentCategory) {
      return node.id === activeCategory && !node.specFilter;
    }
    return false;
  }

  return (
    <nav className="space-y-0.5" aria-label="Categories">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
        {t('catalog.categories')}
      </p>
      {categoryTree.map((node) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedIds.has(node.id);
        const count = categoryCounts[node.id] ?? 0;
        const active = isActive(node);

        return (
          <div key={node.id}>
            <button
              onClick={() => {
                if (hasChildren) {
                  toggleExpand(node.id);
                  selectCategory(node);
                } else {
                  selectCategory(node);
                }
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {hasChildren && (
                <CaretRight
                  size={14}
                  weight="bold"
                  className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                  aria-hidden="true"
                />
              )}
              {!hasChildren && <span className="w-3.5 shrink-0" />}
              <span className="flex-1 text-left">{localized(node.label)}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
            </button>

            {/* Children */}
            {hasChildren && isExpanded && (
              <div className="ml-5 mt-0.5 space-y-0.5">
                {node.children!.map((child) => {
                  const childCount = categoryCounts[child.id] ?? 0;
                  if (childCount === 0) return null;
                  const childActive = isActive(child);

                  return (
                    <button
                      key={child.id}
                      onClick={() => selectCategory(child)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                        childActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="flex-1 text-left">{localized(child.label)}</span>
                      <span className="text-xs tabular-nums">{childCount}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
