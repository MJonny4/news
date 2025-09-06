import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/services/api';
import { CreateFetchJobRequest, FetchJob } from '@/types';
import toast from 'react-hot-toast';

export const useFetchJobs = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: ['fetchJobs', params],
    queryFn: () => fetchApi.getFetchJobs(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds for real-time updates
  });
};

export const useFetchJob = (id: number) => {
  return useQuery({
    queryKey: ['fetchJob', id],
    queryFn: () => fetchApi.getFetchJobById(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds for real-time updates
  });
};

export const useCreateFetchJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFetchJobRequest) => fetchApi.createFetchJob(data),
    onSuccess: (newJob: FetchJob) => {
      toast.success(`Fetch job created successfully! Searching for "${newJob.keyword}"...`);
      queryClient.invalidateQueries({ queryKey: ['fetchJobs'] });
      
      // Optional: Navigate to fetch jobs page to see progress
      // This could be implemented by the caller
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
      toast.success('Fetch job retry initiated');
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