import axios, { AxiosResponse } from 'axios';
import {
    ApiResponse,
    PaginatedResponse,
    Article,
    ArticleQuery,
    ArticleStats,
    NewsSource,
    Category,
    FetchJob,
    CreateFetchJobRequest,
    UpdateSourceRequest,
    SourceTestResult
} from '@/types';

// Create axios instance
const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Article API
export const articleApi = {
    getArticles: async (params?: ArticleQuery): Promise<PaginatedResponse<Article>> => {
        const response = await api.get<ApiResponse<PaginatedResponse<Article>>>('/articles', { params });
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch articles');
        }
        return response.data.data!;
    },

    getArticleById: async (id: number): Promise<Article> => {
        const response = await api.get<ApiResponse<Article>>(`/articles/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch article');
        }
        return response.data.data!;
    },

    searchArticles: async (query: string): Promise<Article[]> => {
        const response = await api.get<ApiResponse<Article[]>>('/articles/search', { params: { q: query } });
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to search articles');
        }
        return response.data.data!;
    },

    getStats: async (): Promise<ArticleStats> => {
        const response = await api.get<ApiResponse<ArticleStats>>('/articles/stats');
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch stats');
        }
        return response.data.data!;
    },

    deleteArticle: async (id: number): Promise<void> => {
        const response = await api.delete<ApiResponse>(`/articles/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete article');
        }
    },
};

// Source API
export const sourceApi = {
    getSources: async (): Promise<NewsSource[]> => {
        const response = await api.get<ApiResponse<NewsSource[]>>('/sources');
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch sources');
        }
        return response.data.data!;
    },

    getSourceById: async (id: number): Promise<NewsSource> => {
        const response = await api.get<ApiResponse<NewsSource>>(`/sources/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch source');
        }
        return response.data.data!;
    },

    updateSource: async (id: number, data: UpdateSourceRequest): Promise<NewsSource> => {
        const response = await api.patch<ApiResponse<NewsSource>>(`/sources/${id}`, data);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to update source');
        }
        return response.data.data!;
    },

    getCategories: async (): Promise<Category[]> => {
        const response = await api.get<ApiResponse<Category[]>>('/sources/categories');
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch categories');
        }
        return response.data.data!;
    },

    testConnection: async (sourceId: number): Promise<SourceTestResult> => {
        const response = await api.post<ApiResponse<SourceTestResult>>(`/sources/${sourceId}/test`);
        return response.data.data!;
    },
};

// Fetch Job API
export const fetchApi = {
    createFetchJob: async (data: CreateFetchJobRequest): Promise<FetchJob> => {
        const response = await api.post<ApiResponse<FetchJob>>('/fetch', data);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to create fetch job');
        }
        return response.data.data!;
    },

    getFetchJobs: async (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<FetchJob>> => {
        const response = await api.get<ApiResponse<PaginatedResponse<FetchJob>>>('/fetch', { params });
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch jobs');
        }
        return response.data.data!;
    },

    getFetchJobById: async (id: number): Promise<FetchJob> => {
        const response = await api.get<ApiResponse<FetchJob>>(`/fetch/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch job');
        }
        return response.data.data!;
    },

    retryFetchJob: async (id: number): Promise<void> => {
        const response = await api.post<ApiResponse>(`/fetch/${id}/retry`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to retry fetch job');
        }
    },

    deleteFetchJob: async (id: number): Promise<void> => {
        const response = await api.delete<ApiResponse>(`/fetch/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete fetch job');
        }
    },
};

export default api;