export type OrderStatus = 'NEW' | 'CONTACTED' | 'COMPLETED';

export interface IOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface IOrderNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface IOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  locale: string;
  total: number;
  status: OrderStatus;
  items: IOrderItem[];
  notes: IOrderNote[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  locale: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number }>;
  total: number;
}
