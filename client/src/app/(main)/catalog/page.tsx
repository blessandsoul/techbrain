'use client';

import { Suspense } from 'react';
import { CatalogSidebar } from '@/features/catalog/components/CatalogSidebar';
import { CatalogToolbar } from '@/features/catalog/components/CatalogToolbar';
import { MobileFilterDrawer } from '@/features/catalog/components/MobileFilterDrawer';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { Pagination } from '@/components/common/Pagination';
import { useCatalogPageData } from '@/features/catalog/hooks/useCatalog';
import { useLocale } from '@/lib/i18n';

function ProductGridSkeleton(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card overflow-hidden animate-pulse">
          <div className="aspect-4/3 bg-muted" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded w-1/3 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CatalogContent(): React.ReactElement {
  const { t } = useLocale();
  const {
    categoryTree,
    filterConfigs,
    products,
    pagination,
    specValues,
    priceRange,
    categoryCounts,
    isLoading,
    isProductsLoading,
  } = useCatalogPageData();

  const sidebarContent = (
    <CatalogSidebar
      categoryTree={categoryTree}
      categoryCounts={categoryCounts}
      filterConfigs={filterConfigs}
      availableValues={specValues}
      priceRange={priceRange}
    />
  );

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12">
      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto space-y-6 pb-8">
            {sidebarContent}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar with integrated mobile filter button */}
          <div className="mb-6">
            <CatalogToolbar
              totalProducts={pagination.totalItems}
              filterConfigs={filterConfigs}
              filterSlot={
                <MobileFilterDrawer filterConfigs={filterConfigs}>
                  {sidebarContent}
                </MobileFilterDrawer>
              }
            />
          </div>

          {/* Product grid */}
          {isLoading || isProductsLoading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium text-foreground mb-2">
                {t('catalog.noProducts')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('catalog.noProductsHint')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination page={pagination.page} totalPages={pagination.totalPages} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage(): React.ReactElement {
  return (
    <Suspense>
      <CatalogContent />
    </Suspense>
  );
}
