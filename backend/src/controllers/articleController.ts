import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { ApiResponse, PaginatedResponse, ArticleQuery, ArticleWithRelations } from '@/types';
import { AppError } from '@/middleware/errorHandler';

export class ArticleController {
  async getArticles(req: Request, res: Response) {
    try {
      const query = req.query as ArticleQuery;
      const { page, limit, source, category, keyword, newsType, sortBy, sortOrder, search } = query;

      // Build where clause
      const where: any = {};
      
      if (source) {
        where.source = { name: { contains: source } };
      }
      
      if (category) {
        where.category = { slug: category };
      }
      
      if (keyword) {
        where.keyword = { contains: keyword };
      }
      
      if (newsType) {
        where.newsType = newsType;
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
          { author: { contains: search } }
        ];
      }

      // Get total count
      const total = await prisma.article.count({ where });
      
      // Get paginated articles
      const articles = await prisma.article.findMany({
        where,
        include: {
          source: {
            select: { id: true, name: true }
          },
          category: {
            select: { id: true, name: true, slug: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      const response: ApiResponse<PaginatedResponse<ArticleWithRelations>> = {
        success: true,
        data: {
          data: articles as ArticleWithRelations[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting articles:', error);
      throw new AppError('Failed to fetch articles', 500);
    }
  }

  async getArticleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);

      if (isNaN(articleId)) {
        throw new AppError('Invalid article ID', 400);
      }

      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: {
          source: {
            select: { id: true, name: true }
          },
          category: {
            select: { id: true, name: true, slug: true }
          }
        },
      });

      if (!article) {
        throw new AppError('Article not found', 404);
      }

      const response: ApiResponse<ArticleWithRelations> = {
        success: true,
        data: article as ArticleWithRelations,
      };

      res.json(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error getting article:', error);
      throw new AppError('Failed to fetch article', 500);
    }
  }

  async deleteArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const articleId = parseInt(id);

      if (isNaN(articleId)) {
        throw new AppError('Invalid article ID', 400);
      }

      const article = await prisma.article.findUnique({
        where: { id: articleId }
      });

      if (!article) {
        throw new AppError('Article not found', 404);
      }

      await prisma.article.delete({
        where: { id: articleId }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Article deleted successfully',
      };

      res.json(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error deleting article:', error);
      throw new AppError('Failed to delete article', 500);
    }
  }

  async getArticleStats(req: Request, res: Response) {
    try {
      const [
        totalArticles,
        articlesThisWeek,
        sourceStats,
        categoryStats,
        newsTypeStats
      ] = await Promise.all([
        // Total articles
        prisma.article.count(),
        
        // Articles this week
        prisma.article.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Articles by source
        prisma.newsSource.findMany({
          select: {
            name: true,
            _count: {
              select: { articles: true }
            }
          }
        }),
        
        // Articles by category
        prisma.category.findMany({
          select: {
            name: true,
            _count: {
              select: { articles: true }
            }
          }
        }),
        
        // Articles by news type
        prisma.article.groupBy({
          by: ['newsType'],
          _count: {
            _all: true
          }
        })
      ]);

      const stats = {
        total: totalArticles,
        thisWeek: articlesThisWeek,
        bySource: sourceStats.map(s => ({
          name: s.name,
          count: s._count.articles
        })),
        byCategory: categoryStats.map(c => ({
          name: c.name,
          count: c._count.articles
        })),
        byNewsType: newsTypeStats.map(nt => ({
          type: nt.newsType,
          count: nt._count._all
        }))
      };

      const response: ApiResponse = {
        success: true,
        data: stats,
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting article stats:', error);
      throw new AppError('Failed to fetch article statistics', 500);
    }
  }

  async searchArticles(req: Request, res: Response) {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        throw new AppError('Search query is required', 400);
      }

      const articles = await prisma.article.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { content: { contains: q } },
            { author: { contains: q } },
            { keyword: { contains: q } }
          ]
        },
        include: {
          source: {
            select: { id: true, name: true }
          },
          category: {
            select: { id: true, name: true, slug: true }
          }
        },
        orderBy: { publishedAt: 'desc' },
        take: 20,
      });

      const response: ApiResponse<ArticleWithRelations[]> = {
        success: true,
        data: articles as ArticleWithRelations[],
      };

      res.json(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error searching articles:', error);
      throw new AppError('Failed to search articles', 500);
    }
  }
}