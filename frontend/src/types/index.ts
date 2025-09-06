// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Enums
export enum NewsType {
  FINANCIAL = 'financial',
  GENERAL = 'general',
  KEYWORD = 'keyword'
}

export enum FetchStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Core Data Types
export interface NewsSource {
  id: number;
  name: string;
  apiKeyName: string;
  baseUrl: string;
  isActive: boolean;
  articleCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  articleCount?: number;
  createdAt: string;
}

export interface Article {
  id: number;
  externalId: string | null;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  publishedAt: string | null;
  author: string | null;
  keyword: string | null;
  newsType: NewsType;
  imageUrl: string | null;
  isEnhanced: boolean;
  createdAt: string;
  updatedAt: string;
  source: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

export interface FetchJob {
  id: number;
  keyword: string;
  newsType: NewsType;
  articlesPerSource: number;
  sourceIds: number[];
  status: FetchStatus;
  articlesFetched: number;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

// Request Types
export interface CreateFetchJobRequest {
  keyword: string;
  newsType: NewsType;
  articlesPerSource: number;
  sourceIds: number[];
}

export interface ArticleQuery {
  page?: number;
  limit?: number;
  source?: string;
  category?: string;
  keyword?: string;
  newsType?: NewsType;
  sortBy?: 'createdAt' | 'publishedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface UpdateSourceRequest {
  isActive: boolean;
}

// UI Types
export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FilterOptions {
  sources: SelectOption[];
  categories: SelectOption[];
  newsTypes: SelectOption[];
}

// Statistics
export interface ArticleStats {
  total: number;
  thisWeek: number;
  bySource: Array<{ name: string; count: number }>;
  byCategory: Array<{ name: string; count: number }>;
  byNewsType: Array<{ type: NewsType; count: number }>;
}

export interface SourceTestResult {
  source: string;
  connected: boolean;
  error: string | null;
}