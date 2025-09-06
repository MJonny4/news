import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { NewsService } from '@/services/newsService';
import { ApiResponse, UpdateSourceRequest } from '@/types';
import { AppError } from '@/middleware/errorHandler';

export class SourceController {
  private newsService: NewsService;

  constructor() {
    this.newsService = new NewsService();
  }

  async getSources(req: Request, res: Response) {
    try {
      const sources = await this.newsService.getSourceStats();

      const response: ApiResponse = {
        success: true,
        data: sources
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting sources:', error);
      throw new AppError('Failed to fetch sources', 500);
    }
  }

  async getSourceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sourceId = parseInt(id);

      if (isNaN(sourceId)) {
        throw new AppError('Invalid source ID', 400);
      }

      const source = await prisma.newsSource.findUnique({
        where: { id: sourceId },
        include: {
          _count: {
            select: { articles: true }
          }
        }
      });

      if (!source) {
        throw new AppError('Source not found', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: {
          ...source,
          articleCount: source._count.articles
        }
      };

      res.json(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error getting source:', error);
      throw new AppError('Failed to fetch source', 500);
    }
  }

  async updateSource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sourceId = parseInt(id);
      const { isActive } = req.body as UpdateSourceRequest;

      if (isNaN(sourceId)) {
        throw new AppError('Invalid source ID', 400);
      }

      const source = await prisma.newsSource.findUnique({
        where: { id: sourceId }
      });

      if (!source) {
        throw new AppError('Source not found', 404);
      }

      const updatedSource = await prisma.newsSource.update({
        where: { id: sourceId },
        data: { isActive }
      });

      const response: ApiResponse = {
        success: true,
        data: updatedSource,
        message: `Source ${isActive ? 'activated' : 'deactivated'} successfully`
      };

      res.json(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error updating source:', error);
      throw new AppError('Failed to update source', 500);
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { articles: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      const response: ApiResponse = {
        success: true,
        data: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          articleCount: cat._count.articles
        }))
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new AppError('Failed to fetch categories', 500);
    }
  }

  async testApiConnection(req: Request, res: Response) {
    try {
      const { sourceId } = req.params;
      const id = parseInt(sourceId);

      if (isNaN(id)) {
        throw new AppError('Invalid source ID', 400);
      }

      const source = await prisma.newsSource.findUnique({
        where: { id }
      });

      if (!source) {
        throw new AppError('Source not found', 404);
      }

      // Test API connection with a simple fetch
      try {
        const result = await this.newsService.fetchArticles(
          [id], 
          'test', 
          'general' as any, 
          1
        );

        const response: ApiResponse = {
          success: true,
          data: {
            source: source.name,
            connected: result.success,
            error: result.errors.length > 0 ? result.errors[0] : null
          },
          message: result.success 
            ? 'API connection successful' 
            : 'API connection failed'
        };

        res.json(response);
      } catch (apiError) {
        const response: ApiResponse = {
          success: false,
          data: {
            source: source.name,
            connected: false,
            error: apiError instanceof Error ? apiError.message : 'Unknown error'
          },
          message: 'API connection test failed'
        };

        res.json(response);
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error testing API connection:', error);
      throw new AppError('Failed to test API connection', 500);
    }
  }
}