import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articleApi } from '@/services/api';
import { ArticleQuery, Article, ArticleStats } from '@/types';
import toast from 'react-hot-toast';

export const useArticles = (params?: ArticleQuery) => {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => articleApi.getArticles(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useArticle = (id: number) => {
  return useQuery({
    queryKey: ['article', id],
    queryFn: () => articleApi.getArticleById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSearchArticles = (query: string) => {
  return useQuery({
    queryKey: ['articles', 'search', query],
    queryFn: () => articleApi.searchArticles(query),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useArticleStats = () => {
  return useQuery({
    queryKey: ['articles', 'stats'],
    queryFn: () => articleApi.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => articleApi.deleteArticle(id),
    onSuccess: () => {
      toast.success('Article deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles', 'stats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete article');
    },
  });
};