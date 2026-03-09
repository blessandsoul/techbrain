'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useDebounce } from '@/hooks/useDebounce';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

import { InfoTooltip } from './InfoTooltip';
import { DeleteProductButton } from './DeleteProductButton';
import {
  useAdminProducts,
  useToggleProduct,
  useBatchToggle,
  useBatchDelete,
} from '../hooks/useAdminProducts';

import { getProductImageUrl } from '@/features/catalog/hooks/useCatalog';

import type { IProduct } from '@/features/catalog/types/catalog.types';

// ── URL Param Helpers ────────────────────────────────

function useUrlFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? 'all';
  const status = searchParams.get('status') ?? 'all';
  const page = Number(searchParams.get('page') ?? '1');

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all' || (key === 'page' && value === '1')) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reset page when changing filters
    if (key !== 'page') {
      params.delete('page');
    }
    const qs = params.toString();
    router.push(qs ? `?${qs}` : '/admin/dashboard', { scroll: false });
  }, [router, searchParams]);

  return { search, category, status, page, setParam };
}

// ── Main Component ───────────────────────────────────

export function ProductTable(): React.ReactElement {
  const { search, category, status, page, setParam } = useUrlFilters();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);
  const isUserTyping = useRef(false);

  // Sync searchInput when URL changes (e.g. back/forward navigation)
  useEffect(() => {
    if (!isUserTyping.current) {
      setSearchInput(search);
    }
  }, [search]);

  // Push debounced search value to URL
  useEffect(() => {
    if (isUserTyping.current) {
      setParam('search', debouncedSearch);
      isUserTyping.current = false;
    }
  }, [debouncedSearch, setParam]);

  const filters = {
    search: search || undefined,
    category: category !== 'all' ? category : undefined,
    isActive: status === 'active' ? 'true' : status === 'hidden' ? 'false' : undefined,
    page,
    limit: 50,
  };

  const { data, isLoading } = useAdminProducts(filters);
  const toggleMutation = useToggleProduct();
  const batchToggleMutation = useBatchToggle();
  const batchDeleteMutation = useBatchDelete();

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const batchPending = batchToggleMutation.isPending || batchDeleteMutation.isPending;

  // ── Selection Logic ─────────────────────────────

  const allIds = items.map((p: IProduct) => p.id);
  const allSelected = allIds.length > 0 && allIds.every((id: string) => selected.has(id));
  const someSelected = allIds.some((id: string) => selected.has(id));
  const selectedCount = allIds.filter((id: string) => selected.has(id)).length;

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allIds.forEach((id: string) => next.delete(id));
      } else {
        allIds.forEach((id: string) => next.add(id));
      }
      return next;
    });
  }, [allSelected, allIds]);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // ── Batch Actions ───────────────────────────────

  function handleBatchDelete(): void {
    const ids = allIds.filter((id: string) => selected.has(id));
    if (!confirm(`წაიშალოს ${ids.length} პროდუქტი? ეს მოქმედება შეუქცევადია.`)) return;
    batchDeleteMutation.mutate(ids, {
      onSuccess: () => setSelected(new Set()),
    });
  }

  function handleBatchActivate(isActive: boolean): void {
    const ids = allIds.filter((id: string) => selected.has(id));
    batchToggleMutation.mutate({ ids, isActive }, {
      onSuccess: () => setSelected(new Set()),
    });
  }

  // ── Search Handler ─────────────────────────────

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>): void {
    isUserTyping.current = true;
    setSearchInput(e.target.value);
  }

  // ── Table Skeleton ─────────────────────────────

  const tableSkeleton = (
    <div className="rounded-xl border border-border bg-card">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Filters — always visible */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Input
          type="text"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="სახელით ძებნა..."
          className="w-full sm:w-64"
        />
        <Select value={category} onValueChange={(v) => setParam('category', v)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ყველა კატეგორია</SelectItem>
            <SelectItem value="cameras">კამერები</SelectItem>
            <SelectItem value="nvr-kits">NVR კომპლექტები</SelectItem>
            <SelectItem value="accessories">აქსესუარები</SelectItem>
            <SelectItem value="storage">მეხსიერება</SelectItem>
            <SelectItem value="services">სერვისები</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setParam('status', v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ყველა სტატუსი</SelectItem>
            <SelectItem value="active">აქტიური</SelectItem>
            <SelectItem value="hidden">დამალული</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">
          {isLoading ? '...' : `${pagination?.totalItems ?? 0} შედეგი`}
        </span>
      </div>

      {/* Batch action toolbar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 mb-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium text-primary">{selectedCount} არჩეული</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={batchPending}
              onClick={() => handleBatchActivate(true)}
              className="text-xs h-7"
            >
              გააქტიურება
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={batchPending}
              onClick={() => handleBatchActivate(false)}
              className="text-xs h-7"
            >
              დამალვა
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={batchPending}
              onClick={handleBatchDelete}
              className="text-xs h-7"
            >
              წაშლა
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={batchPending}
              onClick={() => setSelected(new Set())}
              className="text-xs h-7 text-muted-foreground"
            >
              გაუქმება
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? tableSkeleton : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">ფილტრებს პროდუქტები არ შეესაბამება.</div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10 px-3">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleAll}
                    aria-label="ყველას არჩევა"
                  />
                </TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">სურათი <InfoTooltip text="პროდუქტის მთავარი სურათი" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">სახელი <InfoTooltip text="პროდუქტის სახელი (ქართულად)" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">კატეგორია <InfoTooltip text="პროდუქტის კატეგორია კატალოგში" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">ფასი <InfoTooltip text="ფასი ლარებში. '—' ნიშნავს ფასი არ არის მითითებული" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">სტატუსი <InfoTooltip text="აქტიური = ხილულია საიტზე, დამალული = დამალულია" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((product: IProduct) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  isSelected={selected.has(product.id)}
                  onToggleSelect={() => toggleOne(product.id)}
                  onToggleActive={() => toggleMutation.mutate(product.id)}
                  isToggling={toggleMutation.isPending && toggleMutation.variables === product.id}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPreviousPage}
            onClick={() => setParam('page', String(page - 1))}
          >
            წინა
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage}
            onClick={() => setParam('page', String(page + 1))}
          >
            შემდეგი
          </Button>
        </div>
      )}
    </>
  );
}

// ── Product Row ──────────────────────────────────────

interface ProductRowProps {
  product: IProduct;
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleActive: () => void;
  isToggling: boolean;
}

function ProductRow({ product, isSelected, onToggleSelect, onToggleActive, isToggling }: ProductRowProps): React.ReactElement {
  return (
    <TableRow className={isSelected ? 'bg-primary/5' : ''}>
      <TableCell className="w-10 px-3 py-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          aria-label={`${product.name.ka}-ის არჩევა`}
        />
      </TableCell>
      <TableCell className="px-3 py-2">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
          {product.images[0] ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={getProductImageUrl(product.images[0])}
              alt={product.name.ka}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5 text-muted-foreground/50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="px-3 py-2">
        <a
          href={`/catalog/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-foreground font-medium hover:text-primary hover:underline transition-colors"
        >
          {product.name.ka}
        </a>
      </TableCell>
      <TableCell className="px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {product.categories.map((cat) => (
            <span key={cat} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{cat}</span>
          ))}
        </div>
      </TableCell>
      <TableCell className="px-3 py-2">
        <span className="text-sm text-foreground tabular-nums">{product.price > 0 ? `${product.price} ₾` : '—'}</span>
      </TableCell>
      <TableCell className="px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleActive}
          disabled={isToggling}
          className={`rounded-full text-xs h-7 ${
            product.isActive ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {product.isActive ? 'აქტიური' : 'დამალული'}
        </Button>
      </TableCell>
      <TableCell className="px-3 py-2">
        <div className="flex items-center gap-1">
          <a
            href={`/catalog/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            aria-label="პროდუქტის გვერდის ნახვა"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="პროდუქტის რედაქტირება"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </Link>
          <DeleteProductButton productId={product.id} productName={product.name.ka} />
        </div>
      </TableCell>
    </TableRow>
  );
}
