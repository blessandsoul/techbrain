import { apiClient } from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';

import type { ApiResponse, PaginatedApiResponse } from '@/lib/api/api.types';
import type { IProject, CreateProjectRequest, UpdateProjectRequest, AdminProjectFilters } from '../types/projects.types';

class ProjectsService {
  async getActiveProjects(params?: { type?: string; limit?: number }): Promise<IProject[]> {
    const { data } = await apiClient.get<ApiResponse<IProject[]>>(
      API_ENDPOINTS.PROJECTS.ACTIVE,
      { params },
    );
    return data.data;
  }

  async getProjectBySlug(slug: string): Promise<IProject> {
    const { data } = await apiClient.get<ApiResponse<IProject>>(
      API_ENDPOINTS.PROJECTS.BY_SLUG(slug),
    );
    return data.data;
  }

  async getProject(id: string): Promise<IProject> {
    const { data } = await apiClient.get<ApiResponse<IProject>>(
      API_ENDPOINTS.PROJECTS.GET(id),
    );
    return data.data;
  }

  async getAdminProjects(params?: AdminProjectFilters): Promise<PaginatedApiResponse<IProject>['data']> {
    const query: Record<string, string> = {};
    if (params?.page) query.page = String(params.page);
    if (params?.limit) query.limit = String(params.limit);
    if (params?.isActive) query.isActive = params.isActive;
    const { data } = await apiClient.get<PaginatedApiResponse<IProject>>(
      API_ENDPOINTS.PROJECTS.ADMIN_LIST,
      { params: query },
    );
    return data.data;
  }

  async createProject(payload: CreateProjectRequest): Promise<IProject> {
    const { data } = await apiClient.post<ApiResponse<IProject>>(
      API_ENDPOINTS.PROJECTS.CREATE,
      payload,
    );
    return data.data;
  }

  async updateProject(id: string, payload: UpdateProjectRequest): Promise<IProject> {
    const { data } = await apiClient.patch<ApiResponse<IProject>>(
      API_ENDPOINTS.PROJECTS.UPDATE(id),
      payload,
    );
    return data.data;
  }

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROJECTS.DELETE(id));
  }

  async uploadProjectImage(id: string, file: File): Promise<IProject> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ApiResponse<IProject>>(
      API_ENDPOINTS.PROJECTS.UPLOAD_IMAGE(id),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  }

  async uploadContentImage(id: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ApiResponse<{ url: string }>>(
      API_ENDPOINTS.PROJECTS.UPLOAD_CONTENT_IMAGE(id),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  }
}

export const projectsService = new ProjectsService();
