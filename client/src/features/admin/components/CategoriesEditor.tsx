'use client';

import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { InfoTooltip } from './InfoTooltip';

import type { CatalogConfigResponse, CategoryNode } from '@/features/catalog/types/catalog.types';

interface CategoriesEditorProps {
  config: CatalogConfigResponse;
  setConfig: React.Dispatch<React.SetStateAction<CatalogConfigResponse>>;
}

export function CategoriesEditor({ config, setConfig }: CategoriesEditorProps): React.ReactElement {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category'; index: number } | { type: 'subcategory'; parentIndex: number; childIndex: number } | null>(null);

  function toggleExpanded(id: string): void {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateCategory(index: number, updated: CategoryNode): void {
    setConfig((prev) => ({
      ...prev,
      categories: prev.categories.map((c, i) => (i === index ? updated : c)),
    }));
  }

  function updateCategoryId(index: number, newId: string): void {
    const oldId = config.categories[index].id;
    if (oldId === newId) return;
    setConfig((prev) => {
      const newFilters = { ...prev.filters };
      if (oldId in newFilters) {
        newFilters[newId] = newFilters[oldId];
        delete newFilters[oldId];
      }
      return {
        ...prev,
        categories: prev.categories.map((c, i) =>
          i === index ? { ...c, id: newId, parentCategory: newId } : c,
        ),
        filters: newFilters,
      };
    });
  }

  function addCategory(): void {
    const id = `category-${Date.now()}`;
    setConfig((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { id, parentCategory: id, label: { ka: '', ru: '', en: '' } },
      ],
      filters: { ...prev.filters, [id]: [] },
    }));
    setExpandedCats((prev) => new Set(prev).add(id));
  }

  function removeCategory(index: number): void {
    const cat = config.categories[index];
    if (cat.id === 'all') return;
    setConfig((prev) => {
      const newFilters = { ...prev.filters };
      delete newFilters[cat.id];
      return {
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index),
        filters: newFilters,
      };
    });
  }

  function moveCategory(index: number, direction: -1 | 1): void {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= config.categories.length) return;
    setConfig((prev) => {
      const cats = [...prev.categories];
      [cats[index], cats[newIndex]] = [cats[newIndex], cats[index]];
      return { ...prev, categories: cats };
    });
  }

  function addSubcategory(parentIndex: number): void {
    const parent = config.categories[parentIndex];
    const childId = `${parent.id}-sub-${Date.now()}`;
    const child: CategoryNode = {
      id: childId,
      parentCategory: parent.parentCategory,
      label: { ka: '', ru: '', en: '' },
      specFilter: { kaKey: '', value: '' },
    };
    updateCategory(parentIndex, {
      ...parent,
      children: [...(parent.children ?? []), child],
    });
    setExpandedCats((prev) => new Set(prev).add(parent.id));
  }

  function updateSubcategory(parentIndex: number, childIndex: number, updated: CategoryNode): void {
    const parent = config.categories[parentIndex];
    const newChildren = (parent.children ?? []).map((c, i) => (i === childIndex ? updated : c));
    updateCategory(parentIndex, { ...parent, children: newChildren });
  }

  function removeSubcategory(parentIndex: number, childIndex: number): void {
    const parent = config.categories[parentIndex];
    updateCategory(parentIndex, {
      ...parent,
      children: (parent.children ?? []).filter((_, i) => i !== childIndex),
    });
  }

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-xs font-medium text-foreground uppercase tracking-wider">კატეგორიები <InfoTooltip text="კატალოგის კატეგორიები — განსაზღვრავს პროდუქტების დაჯგუფებას საიტზე" /></span>
        <Button type="button" variant="ghost" size="sm" onClick={addCategory}>
          + დამატება
        </Button>
      </div>

      <div className="divide-y divide-border">
        {config.categories.map((cat, catIdx) => {
          const isExpanded = expandedCats.has(cat.id);
          const childCount = cat.children?.length ?? 0;

          return (
            <div key={cat.id}>
              <div className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col shrink-0">
                  <Button type="button" variant="ghost" size="icon-xs" onClick={() => moveCategory(catIdx, -1)} aria-label="ზემოთ" className="text-muted-foreground hover:text-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                  </Button>
                  <Button type="button" variant="ghost" size="icon-xs" onClick={() => moveCategory(catIdx, 1)} aria-label="ქვემოთ" className="text-muted-foreground hover:text-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </Button>
                </div>

                <Button type="button" variant="ghost" size="icon-xs" onClick={() => toggleExpanded(cat.id)} aria-label="დეტალების გახსნა" className="text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Button>

                <span className="text-xs text-muted-foreground w-20 shrink-0 font-mono">{cat.id}</span>
                <span className="text-sm text-foreground font-medium flex-1 truncate">{cat.label.ka || cat.label.en || '(უსახელო)'}</span>
                {childCount > 0 && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{childCount} ქვეკატ.</span>
                )}

                {cat.id !== 'all' && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button type="button" variant="ghost" size="icon-xs" onClick={() => addSubcategory(catIdx)} aria-label="ქვეკატეგორიის დამატება" title="ქვეკატ. დამატება" className="text-muted-foreground hover:text-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </Button>
                    <Button type="button" variant="ghost" size="icon-xs" onClick={() => setDeleteTarget({ type: 'category', index: catIdx })} aria-label="კატეგორიის წაშლა" className="text-muted-foreground hover:text-destructive">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </Button>
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="px-4 pb-3 pt-1 bg-muted/30">
                  {cat.id !== 'all' && (
                    <div className="mb-2">
                      <span className="text-[10px] text-muted-foreground">ID (slug) <InfoTooltip text="კატეგორიის უნიკალური იდენტიფიკატორი — გამოიყენება URL-ში" /></span>
                      <Input value={cat.id} onChange={(e) => updateCategoryId(catIdx, e.target.value)} className="max-w-xs font-mono text-xs" />
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground">KA</span>
                      <Input value={cat.label.ka} onChange={(e) => updateCategory(catIdx, { ...cat, label: { ...cat.label, ka: e.target.value } })} />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">RU</span>
                      <Input value={cat.label.ru} onChange={(e) => updateCategory(catIdx, { ...cat, label: { ...cat.label, ru: e.target.value } })} />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">EN</span>
                      <Input value={cat.label.en} onChange={(e) => updateCategory(catIdx, { ...cat, label: { ...cat.label, en: e.target.value } })} />
                    </div>
                  </div>

                  {cat.children && cat.children.length > 0 && (
                    <div className="space-y-1 mt-2">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ქვეკატეგორიები <InfoTooltip text="ქვეკატეგორიები — Spec key და Value განსაზღვრავს რომელი პროდუქტები მოხვდება ამ ქვეკატეგორიაში" /></span>
                      {cat.children.map((child, childIdx) => (
                        <div key={child.id} className="grid grid-cols-6 gap-1.5 items-center py-1">
                          <Input value={child.label.ka} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, label: { ...child.label, ka: e.target.value } })} placeholder="KA" />
                          <Input value={child.label.ru} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, label: { ...child.label, ru: e.target.value } })} placeholder="RU" />
                          <Input value={child.label.en} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, label: { ...child.label, en: e.target.value } })} placeholder="EN" />
                          <Input value={child.specFilter?.kaKey ?? ''} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, specFilter: { kaKey: e.target.value, value: child.specFilter?.value ?? '' } })} placeholder="სპეც. გასაღები" />
                          <Input value={child.specFilter?.value ?? ''} onChange={(e) => updateSubcategory(catIdx, childIdx, { ...child, specFilter: { kaKey: child.specFilter?.kaKey ?? '', value: e.target.value } })} placeholder="მნიშვნელობა" />
                          <Button type="button" variant="ghost" size="icon-xs" onClick={() => setDeleteTarget({ type: 'subcategory', parentIndex: catIdx, childIndex: childIdx })} className="text-muted-foreground hover:text-destructive justify-self-start" aria-label="წაშლა">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.type === 'category') {
            removeCategory(deleteTarget.index);
          } else {
            removeSubcategory(deleteTarget.parentIndex, deleteTarget.childIndex);
          }
          setDeleteTarget(null);
        }}
        title="წაშლის დადასტურება"
        description={
          deleteTarget?.type === 'category'
            ? `კატეგორია "${config.categories[deleteTarget.index]?.label.ka || config.categories[deleteTarget.index]?.id}" და მისი ფილტრები წაიშლება.`
            : 'ქვეკატეგორია წაიშლება.'
        }
        confirmLabel="წაშლა"
        isDestructive
      />
    </section>
  );
}
