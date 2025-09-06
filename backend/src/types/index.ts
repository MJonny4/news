import { z } from 'zod';

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

// Request/Response Types
export const CreateFetchJobSchema = z.object({
  keyword: z.string().min(1).max(255),
  newsType: z.nativeEnum(NewsType).default(NewsType.GENERAL),
  articlesPerSource: z.number().int().min(1).max(20).default(5),
  sourceIds: z.array(z.number().int()).min(1)
});

export const ArticleQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  source: z.string().optional(),
  category: z.string().optional(),
  keyword: z.string().optional(),
  newsType: z.nativeEnum(NewsType).optional(),
  sortBy: z.enum(['createdAt', 'publishedAt', 'title']).default('publishedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional()
});

export const UpdateSourceSchema = z.object({
  isActive: z.boolean()
});

export type CreateFetchJobRequest = z.infer<typeof CreateFetchJobSchema>;
export type ArticleQuery = z.infer<typeof ArticleQuerySchema>;
export type UpdateSourceRequest = z.infer<typeof UpdateSourceSchema>;

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

// News API Types
export interface NewsAPIArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
  };
  author: string;
}

export interface GuardianArticle {
  id: string;
  webTitle: string;
  webUrl: string;
  apiUrl: string;
  webPublicationDate: string;
  fields?: {
    headline?: string;
    bodyText?: string;
    thumbnail?: string;
    byline?: string;
  };
}

export interface AlphaVantageArticle {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  topics: Array<{
    topic: string;
    relevance_score: string;
  }>;
}

// Database Types (extending Prisma types)
export interface ArticleWithRelations {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  publishedAt: Date | null;
  author: string | null;
  keyword: string | null;
  newsType: NewsType;
  imageUrl: string | null;
  isEnhanced: boolean;
  createdAt: Date;
  updatedAt: Date;
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