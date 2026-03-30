import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';

import type { ApiResponse } from '@/lib/api/api.types';
import type { ITag, CreateTagRequest, UpdateTagRequest } from '../types/tag.types';

class TagService {
  async getTags(search?: string): Promise<ITag[]> {
    const response = await apiClient.get<ApiResponse<ITag[]>>(
      API_ENDPOINTS.TAGS.LIST,
      { params: search ? { search } : undefined },
    );
    return response.data.data;
  }

  async createTag(data: CreateTagRequest): Promise<ITag> {
    const response = await apiClient.post<ApiResponse<ITag>>(
      API_ENDPOINTS.TAGS.CREATE,
      data,
    );
    return response.data.data;
  }

  async updateTag(id: string, data: UpdateTagRequest): Promise<ITag> {
    const response = await apiClient.patch<ApiResponse<ITag>>(
      API_ENDPOINTS.TAGS.UPDATE(id),
      data,
    );
    return response.data.data;
  }

  async deleteTag(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TAGS.DELETE(id));
  }
}

export const tagService = new TagService();
