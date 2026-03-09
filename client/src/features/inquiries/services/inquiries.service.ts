import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';

import type { ApiResponse, PaginatedApiResponse } from '@/lib/api/api.types';
import type { CreateInquiryRequest, IInquiry, InquiryFilters } from '../types/inquiries.types';

class InquiriesService {
  async getInquiries(params?: InquiryFilters): Promise<PaginatedApiResponse<IInquiry>['data']> {
    const query: Record<string, string> = {};
    if (params?.page) query.page = String(params.page);
    if (params?.limit) query.limit = String(params.limit);
    if (params?.search) query.search = params.search;

    const response = await apiClient.get<PaginatedApiResponse<IInquiry>>(
      API_ENDPOINTS.INQUIRIES.ADMIN_LIST,
      { params: query },
    );
    return response.data.data;
  }

  async createInquiry(data: CreateInquiryRequest): Promise<IInquiry> {
    const response = await apiClient.post<ApiResponse<IInquiry>>(
      API_ENDPOINTS.INQUIRIES.CREATE,
      data,
    );
    return response.data.data;
  }

  async deleteInquiry(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.INQUIRIES.ADMIN_DELETE(id));
  }
}

export const inquiriesService = new InquiriesService();
