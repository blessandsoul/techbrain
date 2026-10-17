import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RelatedProductsPicker } from '../RelatedProductsPicker';

// The picker reads three kinds of lists through one hook; the fake answers by the query it receives.
const { SELECTED, CATEGORY } = vi.hoisted(() => {
  const make = (id: string, name: string): unknown => ({
    id, slug: id, name: { ka: name, ru: '', en: '' }, price: 100, images: [], categories: ['ip-cameras'],
  });
  return {
    SELECTED: [make('a', 'Alpha camera'), make('b', 'Beta camera')],
    CATEGORY: [make('c', 'Gamma camera')],
  };
});

vi.mock('../../hooks/useAdminProducts', () => ({
  useAdminProducts: (params: { ids?: string[]; category?: string }) => ({
    data: {
      items: params.ids
        ? (SELECTED as Array<{ id: string }>).filter((p) => params.ids?.includes(p.id))
        : params.category
          ? CATEGORY
          : [],
    },
    isLoading: false,
  }),
}));

describe('RelatedProductsPicker', () => {
  const onChange = vi.fn();
  const onUseAutomatic = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderPicker(selectedIds: string[], auto: boolean): void {
    render(
      <RelatedProductsPicker
        selectedCategorySlugs={['ip-cameras']}
        selectedIds={selectedIds}
        currentProductId="current"
        auto={auto}
        onChange={onChange}
        onUseAutomatic={onUseAutomatic}
      />,
    );
  }

  it('should report an empty list when the last product is removed, so the removal can be saved', async () => {
    const user = userEvent.setup();
    renderPicker(['a'], false);

    await user.click(screen.getByRole('button', { name: 'წაშლა: Alpha camera' }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('should keep the other products when one of two is removed', async () => {
    const user = userEvent.setup();
    renderPicker(['a', 'b'], false);

    await user.click(screen.getByRole('button', { name: 'წაშლა: Alpha camera' }));

    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('should add a product picked from the search results', async () => {
    const user = userEvent.setup();
    renderPicker(['a'], false);

    await user.click(screen.getByPlaceholderText('პროდუქტის ძებნა დასამატებლად…'));
    await user.click(await screen.findByText('Gamma camera'));

    expect(onChange).toHaveBeenCalledWith(['a', 'c']);
  });

  it('should give the remove buttons and the reset button a 44px touch target', async () => {
    renderPicker(['a'], false);
    expect(screen.getByRole('button', { name: 'წაშლა: Alpha camera' })).toHaveClass('w-11', 'h-11');
  });

  it('should give the reset button a 44px touch target', () => {
    renderPicker([], false);
    expect(screen.getByRole('button', { name: 'ავტომატური შერჩევის დაბრუნება' })).toHaveClass('h-11');
  });

  it('should explain the automatic suggestions, with no reset button, for an untouched empty list', () => {
    renderPicker([], true);

    expect(screen.getByText(/ავტომატურად შეირჩევა მსგავსი კატეგორიიდან/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ავტომატური შერჩევის დაბრუნება' })).not.toBeInTheDocument();
  });

  it('should say no bundle is shown and offer a way back to automatic once the list was emptied on purpose', async () => {
    const user = userEvent.setup();
    renderPicker([], false);

    expect(screen.getByText(/არ გამოჩნდება/)).toBeInTheDocument();
    expect(screen.queryByText(/ავტომატურად შეირჩევა მსგავსი კატეგორიიდან/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ავტომატური შერჩევის დაბრუნება' }));

    expect(onUseAutomatic).toHaveBeenCalledTimes(1);
  });
});
