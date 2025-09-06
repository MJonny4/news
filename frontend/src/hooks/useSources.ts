import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sourceApi } from '@/services/api';
import { UpdateSourceRequest } from '@/types';
import toast from 'react-hot-toast';

export const useSources = () => {
  return useQuery({
    queryKey: ['sources'],
    queryFn: () => sourceApi.getSources(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useSource = (id: number) => {
  return useQuery({
    queryKey: ['source', id],
    queryFn: () => sourceApi.getSourceById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => sourceApi.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

export const useUpdateSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSourceRequest }) =>
      sourceApi.updateSource(id, data),
    onSuccess: (updatedSource) => {
      toast.success(`${updatedSource.name} ${updatedSource.isActive ? 'activated' : 'deactivated'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['source', updatedSource.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update source');
    },
  });
};

export const useTestSourceConnection = () => {
  return useMutation({
    mutationFn: (sourceId: number) => sourceApi.testConnection(sourceId),
    onSuccess: (result) => {
      if (result.connected) {
        toast.success(`${result.source} API connection successful`);
      } else {
        toast.error(`${result.source} API connection failed: ${result.error}`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to test API connection');
    },
  });
};