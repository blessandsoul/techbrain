import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

import { useUpdateProduct, useCreateProduct, useToggleProduct, adminProductKeys } from '../useAdminProducts';
import { catalogKeys } from '@/features/catalog/hooks/useCatalog';

const { updateProduct, createProduct, toggleActive } = vi.hoisted(() => ({
  updateProduct: vi.fn(),
  createProduct: vi.fn(),
  toggleActive: vi.fn(),
}));

vi.mock('../../services/admin-product.service', () => ({
  adminProductService: { updateProduct, createProduct, toggleActive },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function setup(): { client: QueryClient; invalidate: ReturnType<typeof vi.spyOn>; wrapper: React.FC<{ children: React.ReactNode }> } {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, invalidate, wrapper };
}

// The shop caches its data for minutes. If an admin save does not refresh that cache, going back to the shop in the
// same tab shows the old data (for example a bundle that was just emptied) and the edit looks like it failed.
describe('admin product mutations refresh the shop cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['update', () => useUpdateProduct(), updateProduct, { id: 'p1', data: { price: 10 } }],
    ['create', () => useCreateProduct(), createProduct, { categoryIds: [], price: 10 }],
    ['toggle', () => useToggleProduct(), toggleActive, 'p1'],
  ] as const)('should invalidate both admin and shop queries after %s', async (_name, useHook, service, variables) => {
    service.mockResolvedValue({ id: 'p1' });
    const { invalidate, wrapper } = setup();
    const { result } = renderHook(() => useHook(), { wrapper });

    result.current.mutate(variables as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const keys = (invalidate.mock.calls as Array<[{ queryKey: unknown }]>).map((call) => call[0].queryKey);
    expect(keys).toContainEqual(adminProductKeys.all);
    expect(keys).toContainEqual(catalogKeys.all);
  });
});
