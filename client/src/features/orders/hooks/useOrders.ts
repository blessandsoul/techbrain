'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ordersService } from '../services/orders.service';
import { getErrorMessage } from '@/lib/utils/error';

import type { CreateOrderRequest, OrderFilters, OrderStatus } from '../types/orders.types';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

export function useAdminOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => ordersService.getOrders(filters),
    refetchInterval: 30000,
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersService.getOrderById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersService.createOrder(data),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersService.updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success('სტატუსი წარმატებით განახლდა');
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersService.deleteOrder(id),
    onSuccess: () => {
      toast.success('შეკვეთა წარმატებით წაიშალა');
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAddOrderNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, content }: { orderId: string; content: string }) =>
      ordersService.addNote(orderId, content),
    onSuccess: (_data, variables) => {
      toast.success('შენიშვნა წარმატებით დაემატა');
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useBulkUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: OrderStatus }) =>
      ordersService.bulkUpdateStatus(ids, status),
    onSuccess: (_data, variables) => {
      toast.success(`${variables.ids.length} შეკვეთა წარმატებით განახლდა`);
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
