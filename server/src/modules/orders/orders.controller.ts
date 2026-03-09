/**
 * Orders Module — Controller
 *
 * Request handlers for order endpoints.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { ordersService } from './orders.service.js';
import { successResponse } from '@shared/responses/successResponse.js';
import { paginatedResponse } from '@shared/responses/paginatedResponse.js';
import {
  OrderIdParamSchema,
  CreateOrderSchema,
  UpdateOrderStatusSchema,
  AdminOrdersQuerySchema,
  BulkUpdateOrderStatusSchema,
  CreateOrderNoteSchema,
} from './orders.schemas.js';

class OrdersController {
  async getAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page, limit, status, search } = AdminOrdersQuerySchema.parse(request.query);
    const result = await ordersService.getAllOrders(page, limit, { status, search });
    return reply.send(paginatedResponse(
      'Orders retrieved successfully',
      result.items,
      page,
      limit,
      result.totalItems,
    ));
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = OrderIdParamSchema.parse(request.params);
    const order = await ordersService.getOrderById(id);
    return reply.send(successResponse('Order retrieved successfully', order));
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CreateOrderSchema.parse(request.body);
    const order = await ordersService.createOrder(input);
    return reply.status(201).send(successResponse('Order created successfully', order));
  }

  async updateStatus(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = OrderIdParamSchema.parse(request.params);
    const { status } = UpdateOrderStatusSchema.parse(request.body);
    const order = await ordersService.updateOrderStatus(id, status);
    return reply.send(successResponse('Order status updated successfully', order));
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = OrderIdParamSchema.parse(request.params);
    await ordersService.deleteOrder(id);
    return reply.send(successResponse('Order deleted successfully', null));
  }

  async addNote(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = OrderIdParamSchema.parse(request.params);
    const { content } = CreateOrderNoteSchema.parse(request.body);
    const note = await ordersService.addNote(id, content);
    return reply.status(201).send(successResponse('Note added successfully', note));
  }

  async bulkUpdateStatus(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { ids, status } = BulkUpdateOrderStatusSchema.parse(request.body);
    const count = await ordersService.bulkUpdateOrderStatus(ids, status);
    return reply.send(successResponse(`${count} orders updated successfully`, { count }));
  }
}

export const ordersController = new OrdersController();
