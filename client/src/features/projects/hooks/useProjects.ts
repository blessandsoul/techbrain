'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getErrorMessage } from '@/lib/utils/error';
import { projectsService } from '../services/projects.service';

import type { IProject, AdminProjectFilters, CreateProjectRequest, UpdateProjectRequest } from '../types/projects.types';

// ── Query Key Factory ────────────────────────────────

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  active: (params?: { type?: string }) => [...projectKeys.lists(), 'active', params] as const,
  adminLists: () => [...projectKeys.all, 'admin-list'] as const,
  adminList: (filters: AdminProjectFilters) => [...projectKeys.adminLists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  slugs: () => [...projectKeys.all, 'slug'] as const,
  slug: (slug: string) => [...projectKeys.slugs(), slug] as const,
};

// ── Public Queries ───────────────────────────────────

export function useActiveProjects(params?: { type?: string; limit?: number }): ReturnType<typeof useQuery<IProject[]>> {
  return useQuery({
    queryKey: projectKeys.active(params),
    queryFn: () => projectsService.getActiveProjects(params),
  });
}

export function useProjectBySlug(slug: string): ReturnType<typeof useQuery<IProject>> {
  return useQuery({
    queryKey: projectKeys.slug(slug),
    queryFn: () => projectsService.getProjectBySlug(slug),
    enabled: !!slug,
  });
}

export function useProject(id: string): ReturnType<typeof useQuery<IProject>> {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsService.getProject(id),
    enabled: !!id,
  });
}

// ── Admin Queries ────────────────────────────────────

export function useAdminProjects(filters: AdminProjectFilters) {
  return useQuery({
    queryKey: projectKeys.adminList(filters),
    queryFn: () => projectsService.getAdminProjects(filters),
  });
}

// ── Admin Mutations ──────────────────────────────────

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsService.createProject(data),
    onSuccess: () => {
      toast.success('პროექტი შეიქმნა');
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      projectsService.updateProject(id, data),
    onSuccess: () => {
      toast.success('პროექტი განახლდა');
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: () => {
      toast.success('პროექტი წაიშალა');
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUploadProjectImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      projectsService.uploadProjectImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useToggleProjectActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, currentIsActive }: { id: string; currentIsActive: boolean }) =>
      projectsService.updateProject(id, { isActive: !currentIsActive }),
    onSuccess: (_data, variables) => {
      toast.success(variables.currentIsActive ? 'პროექტი გაუქმდა' : 'პროექტი გააქტიურდა');
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUploadProjectContentImage() {
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      projectsService.uploadContentImage(id, file),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ── Helpers ──────────────────────────────────────────

export function getProjectImageUrl(relativePath: string): string {
  if (relativePath.startsWith('http')) return relativePath;
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') ??
    'http://localhost:8000';
  return `${base}${relativePath}`;
}
