import { describe, expect, it } from 'vitest';

import { formatOrderMessage } from '../telegram.js';
import type { OrderResponse } from '@modules/orders/orders.types.js';

describe('formatOrderMessage', () => {
  it('includes the full customer contact and delivery details', () => {
    const order: OrderResponse = {
      id: 'order-1',
      customerName: 'თორნიკე გვარი',
      customerPhone: '597470518',
      customerAddress: 'თბილისი, A&B <1>',
      locale: 'ka',
      total: 450,
      status: 'NEW',
      items: [
        {
          id: 'item-1',
          productName: 'კამერა',
          productImage: null,
          productSlug: null,
          quantity: 1,
          unitPrice: 450,
        },
      ],
      notes: [],
      createdAt: '2026-08-03T00:00:00.000Z',
      updatedAt: '2026-08-03T00:00:00.000Z',
    };

    const message = formatOrderMessage(order);

    expect(message).toContain('👤 Name: თორნიკე გვარი');
    expect(message).toContain('📞 Phone: 597470518');
    expect(message).toContain('📍 Address: თბილისი, A&amp;B &lt;1&gt;');
  });
});
