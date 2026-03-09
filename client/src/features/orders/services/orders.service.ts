import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';

import type { ApiResponse, PaginatedApiResponse } from '@/lib/api/api.types';
import type { CreateOrderRequest, IOrder, OrderFilters, OrderStatus } from '../types/orders.types';

class OrdersService {
  async getOrders(params?: OrderFilters): Promise<PaginatedApiResponse<IOrder>['data']> {
    const query: Record<string, string> = {};
    if (params?.page) query.page = String(params.page);
    if (params?.limit) query.limit = String(params.limit);
    if (params?.status) query.status = params.status;
    if (params?.search) query.search = params.search;

    const response = await apiClient.get<PaginatedApiResponse<IOrder>>(
      API_ENDPOINTS.ORDERS.ADMIN_LIST,
      { params: query },
    );
    return response.data.data;
  }

  async getOrderById(id: string): Promise<IOrder> {
    const response = await apiClient.get<ApiResponse<IOrder>>(
      API_ENDPOINTS.ORDERS.ADMIN_GET(id),
    );
    return response.data.data;
  }

  async createOrder(data: CreateOrderRequest): Promise<void> {
    await apiClient.post(API_ENDPOINTS.ORDERS.CREATE, data);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<IOrder> {
    const response = await apiClient.patch<ApiResponse<IOrder>>(
      API_ENDPOINTS.ORDERS.ADMIN_UPDATE_STATUS(id),
      { status },
    );
    return response.data.data;
  }

  async deleteOrder(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ORDERS.ADMIN_DELETE(id));
  }

  async bulkUpdateStatus(ids: string[], status: OrderStatus): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.ORDERS.ADMIN_BULK_STATUS, { ids, status });
  }

  async addNote(orderId: string, content: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.ORDERS.ADMIN_ADD_NOTE(orderId), { content });
  }
}

export const ordersService = new OrdersService();
