import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ordersRepository } from '../orders.repo.js';
import { ordersService } from '../orders.service.js';

vi.mock('../orders.repo.js');

// Guard against restoring the paused order-notification integration.
vi.mock('@libs/telegram.js', () => {
  throw new Error('The orders service must not load Telegram notifications');
});

describe('Orders Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('persists and returns the created order without loading Telegram notifications', async () => {
      const input = {
        customerName: 'Test Customer',
        customerPhone: '597470518',
        customerAddress: 'Test address 1',
        locale: 'ka' as const,
        items: [
          {
            productId: 'product-1',
            productName: 'Camera',
            quantity: 2,
            unitPrice: 125.125,
          },
        ],
      };
      const createdOrder = {
        id: 'order-1',
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress,
        locale: input.locale,
        total: 250.25,
        status: 'NEW',
        items: [
          {
            id: 'item-1',
            productName: 'Camera',
            productImage: null,
            productSlug: null,
            quantity: 2,
            unitPrice: 125.125,
          },
        ],
        notes: [],
        createdAt: '2026-08-16T00:00:00.000Z',
        updatedAt: '2026-08-16T00:00:00.000Z',
      };
      vi.mocked(ordersRepository.create).mockResolvedValue(createdOrder);

      const result = await ordersService.createOrder(input);

      expect(ordersRepository.create).toHaveBeenCalledOnce();
      expect(ordersRepository.create).toHaveBeenCalledWith({
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress,
        locale: input.locale,
        total: 250.25,
        items: input.items,
      });
      expect(result).toBe(createdOrder);
    });
  });
});
