'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { inquiriesService } from '../services/inquiries.service';
import { getErrorMessage } from '@/lib/utils/error';

import type { CreateInquiryRequest, InquiryFilters } from '../types/inquiries.types';

export const inquiryKeys = {
  all: ['inquiries'] as const,
  lists: () => [...inquiryKeys.all, 'list'] as const,
  list: (filters: InquiryFilters) => [...inquiryKeys.lists(), filters] as const,
};

export function useAdminInquiries(filters: InquiryFilters) {
  return useQuery({
    queryKey: inquiryKeys.list(filters),
    queryFn: () => inquiriesService.getInquiries(filters),
  });
}

export function useCreateInquiry() {
  return useMutation({
    mutationFn: (data: CreateInquiryRequest) => inquiriesService.createInquiry(data),
  });
}

export function useDeleteInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inquiriesService.deleteInquiry(id),
    onSuccess: () => {
      toast.success('მოთხოვნა წარმატებით წაიშალა');
      queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
