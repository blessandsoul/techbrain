/**
 * Orders Module — Repository
 *
 * Prisma queries for orders.
 */

import { prisma } from '@libs/prisma.js';
import type { Prisma, OrderStatus } from '@prisma/client';
import type { OrderResponse } from './orders.types.js';

// ── Prisma include for relations ────────────────────────

const orderInclude = {
  items: true,
  notes: {
    orderBy: { createdAt: 'desc' as const },
  },
} satisfies Prisma.OrderInclude;

type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

// ── DB → Response Mapper ────────────────────────────────

function toOrderResponse(row: OrderWithItems): OrderResponse {
  return {
    id: row.id,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    locale: row.locale,
    total: row.total,
    status: row.status,
    items: row.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    notes: row.notes.map((note) => ({
      id: note.id,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ── Repository ──────────────────────────────────────────

class OrdersRepository {
  async findAllPaginated(
    page: number,
    limit: number,
    filters?: { status?: OrderStatus; search?: string },
  ): Promise<{ items: OrderResponse[]; totalItems: number }> {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { customerName: { contains: filters.search } },
        { customerPhone: { contains: filters.search } },
        { items: { some: { productName: { contains: filters.search } } } },
      ];
    }

    const [rows, totalItems] = await Promise.all([
      prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      items: rows.map(toOrderResponse),
      totalItems,
    };
  }

  async findById(id: string): Promise<OrderResponse | null> {
    const row = await prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
    return row ? toOrderResponse(row) : null;
  }

  async create(data: {
    customerName: string;
    customerPhone: string;
    locale: string;
    total: number;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
  }): Promise<OrderResponse> {
    const row = await prisma.order.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        locale: data.locale,
        total: data.total,
        items: {
          create: data.items,
        },
      },
      include: orderInclude,
    });
    return toOrderResponse(row);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderResponse> {
    const row = await prisma.order.update({
      where: { id },
      data: { status },
      include: orderInclude,
    });
    return toOrderResponse(row);
  }

  async countByStatus(status: OrderStatus): Promise<number> {
    return prisma.order.count({ where: { status } });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await prisma.order.count({ where: { id } });
    return count > 0;
  }

  async deleteById(id: string): Promise<void> {
    await prisma.order.delete({ where: { id } });
  }

  async createNote(orderId: string, content: string): Promise<{ id: string; content: string; createdAt: string }> {
    const note = await prisma.orderNote.create({
      data: { orderId, content },
    });
    return {
      id: note.id,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
    };
  }

  async bulkUpdateStatus(ids: string[], status: OrderStatus): Promise<number> {
    const result = await prisma.order.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
    return result.count;
  }
}

export const ordersRepository = new OrdersRepository();
