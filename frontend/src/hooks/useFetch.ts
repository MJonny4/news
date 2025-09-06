import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/services/api';
import { CreateFetchJobRequest } from '@/types';
import toast from 'react-hot-toast';

export const useFetchJobs = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ['fetchJobs', params],
    queryFn: () => fetchApi.getFetchJobs(params),
    staleTime: 30 * 1000, // 30 seconds (refresh frequently for status updates)
    refetchInterval: 5 * 1000, // Auto refresh every 5 seconds
    refetchOnWindowFocus: true,
  });
};

export const useFetchJob = (id: number) => {
  return useQuery({
    queryKey: ['fetchJob', id],
    queryFn: () => fetchApi.getFetchJobById(id),
    enabled: !!id,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 3 * 1000, // Auto refresh every 3 seconds for active jobs
  });
};

export const useCreateFetchJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFetchJobRequest) => fetchApi.createFetchJob(data),
    onSuccess: () => {
      toast.success('Fetch job created successfully! Articles are being fetched in the background.');
      queryClient.invalidateQueries({ queryKey: ['fetchJobs'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create fetch job');
    },
  });
};

export const useRetryFetchJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => fetchApi.retryFetchJob(id),
    onSuccess: () => {
      toast.success('Fetch job restarted successfully');
      queryClient.invalidateQueries({ queryKey: ['fetchJobs'] });
      queryClient.invalidateQueries({ queryKey: ['fetchJob'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to retry fetch job');
    },
  });
};

export const useDeleteFetchJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => fetchApi.deleteFetchJob(id),
    onSuccess: () => {
      toast.success('Fetch job deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['fetchJobs'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete fetch job');
    },
  });
};