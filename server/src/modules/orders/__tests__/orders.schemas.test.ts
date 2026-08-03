import { describe, expect, it } from 'vitest';

import { CreateOrderSchema } from '../orders.schemas.js';

const validOrder = {
  customerName: 'თორნიკე გვარი',
  customerPhone: '597470518',
  customerAddress: 'თბილისი, რუსთაველის გამზირი 1',
  locale: 'ka' as const,
  items: [
    {
      productName: 'კამერა',
      quantity: 1,
      unitPrice: 450,
    },
  ],
};

describe('CreateOrderSchema', () => {
  it('accepts and trims the required customer details', () => {
    const result = CreateOrderSchema.parse({
      ...validOrder,
      customerName: '  თორნიკე გვარი  ',
      customerAddress: '  თბილისი, რუსთაველის გამზირი 1  ',
    });

    expect(result.customerName).toBe('თორნიკე გვარი');
    expect(result.customerPhone).toBe('597470518');
    expect(result.customerAddress).toBe('თბილისი, რუსთაველის გამზირი 1');
  });

  it('rejects a name without a surname', () => {
    expect(() => CreateOrderSchema.parse({ ...validOrder, customerName: 'თორნიკე' })).toThrow();
  });

  it('rejects a non-mobile phone number', () => {
    expect(() => CreateOrderSchema.parse({ ...validOrder, customerPhone: '12345' })).toThrow();
  });

  it('requires an address', () => {
    expect(() => CreateOrderSchema.parse({
      customerName: validOrder.customerName,
      customerPhone: validOrder.customerPhone,
      locale: validOrder.locale,
      items: validOrder.items,
    })).toThrow();
  });
});
