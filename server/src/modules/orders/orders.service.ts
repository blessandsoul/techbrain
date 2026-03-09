/**
 * Orders Module — Service
 *
 * Business logic for order management.
 */

import { NotFoundError, BadRequestError } from '@shared/errors/errors.js';
import { sendTelegramMessage, formatOrderMessage } from '@libs/telegram.js';
import { ordersRepository } from './orders.repo.js';
import type { OrderStatus } from '@prisma/client';
import type { OrderResponse, OrderFilters } from './orders.types.js';
import type { CreateOrderInput } from './orders.schemas.js';

const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ['CONTACTED'],
  CONTACTED: ['COMPLETED'],
  COMPLETED: [], // terminal state
};

class OrdersService {
  async getAllOrders(
    page: number,
    limit: number,
    filters?: OrderFilters,
  ): Promise<{ items: OrderResponse[]; totalItems: number }> {
    return ordersRepository.findAllPaginated(page, limit, filters);
  }

  async getOrderById(id: string): Promise<OrderResponse> {
    const order = await ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }
    return order;
  }

  async createOrder(input: CreateOrderInput): Promise<OrderResponse> {
    const calculatedTotal = input.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice, 0
    );
    const total = Math.round(calculatedTotal * 100) / 100;

    const order = await ordersRepository.create({
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      locale: input.locale,
      total,
      items: input.items,
    });

    // Fire-and-forget Telegram notification — never blocks the response
    void sendTelegramMessage(formatOrderMessage(order));

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<OrderResponse> {
    const order = await ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    const currentStatus = order.status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedTransitions.includes(status)) {
      throw new BadRequestError(
        `Invalid status transition from ${currentStatus} to ${status}`,
        'INVALID_STATUS_TRANSITION',
      );
    }

    return ordersRepository.updateStatus(id, status);
  }

  async deleteOrder(id: string): Promise<void> {
    const exists = await ordersRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }
    await ordersRepository.deleteById(id);
  }

  async bulkUpdateOrderStatus(ids: string[], status: OrderStatus): Promise<number> {
    return ordersRepository.bulkUpdateStatus(ids, status);
  }

  async addNote(orderId: string, content: string): Promise<{ id: string; content: string; createdAt: string }> {
    const exists = await ordersRepository.existsById(orderId);
    if (!exists) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }
    return ordersRepository.createNote(orderId, content);
  }

  async getNewOrdersCount(): Promise<number> {
    return ordersRepository.countByStatus('NEW');
  }
}

export const ordersService = new OrdersService();
