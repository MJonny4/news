import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { NewsService } from '@/services/newsService';
import { ApiResponse, CreateFetchJobRequest, FetchStatus } from '@/types';
import { AppError } from '@/middleware/errorHandler';

export class FetchController {
  private newsService: NewsService;

  constructor() {
    this.newsService = new NewsService();
  }

  async createFetchJob(req: Request, res: Response) {
    try {
      const { keyword, newsType, articlesPerSource, sourceIds } = req.body as CreateFetchJobRequest;

      // Validate sources exist and are active
      const sources = await prisma.newsSource.findMany({
        where: {
          id: { in: sourceIds },
          isActive: true
        }
      });

      if (sources.length === 0) {
        throw new AppError('No active sources found for the provided IDs', 400);
      }

      // Create fetch job
      const fetchJob = await prisma.fetchJob.create({
        data: {
          keyword,
          newsType,
          articlesPerSource,
          sourceIds: sourceIds,
          status: FetchStatus.PENDING
        }
      });

      // Start fetching in background
      this.processFetchJob(fetchJob.id).catch(error => {
        console.error(`Error processing fetch job ${fetchJob.id}:`, error);
      });

      const response: ApiResponse = {
        success: true,
        data: fetchJob,
        message: 'Fetch job created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error creating fetch job:', error);
      throw new AppError('Failed to create fetch job', 500);
    }
  }

  async getFetchJobs(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const [jobs, total] = await Promise.all([
        prisma.fetchJob.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
        prisma.fetchJob.count({ where })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      const response: ApiResponse = {
        success: true,
        data: {
          data: jobs,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          }
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Error getting fetch jobs:', error);
      throw new AppError('Failed to fetch jobs', 500);
    }
  }

  async getFetchJobById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const jobId = parseInt(id);

      if (isNaN(jobId)) {
        throw new AppError('Invalid job ID', 400);
      }

      const job = await prisma.fetchJob.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        throw new AppError('Fetch job not found', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: job
      };

      res.json(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error getting fetch job:', error);
      throw new AppError('Failed to fetch job', 500);
    }
  }

  async retryFetchJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const jobId = parseInt(id);

      if (isNaN(jobId)) {
        throw new AppError('Invalid job ID', 400);
      }

      const job = await prisma.fetchJob.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        throw new AppError('Fetch job not found', 404);
      }

      if (job.status === FetchStatus.RUNNING) {
        throw new AppError('Job is currently running', 400);
      }

      // Reset job status
      await prisma.fetchJob.update({
        where: { id: jobId },
        data: {
          status: FetchStatus.PENDING,
          articlesFetched: 0,
          errorMessage: null,
          startedAt: null,
          completedAt: null
        }
      });

      // Start processing
      this.processFetchJob(jobId).catch(error => {
        console.error(`Error processing fetch job ${jobId}:`, error);
      });

      const response: ApiResponse = {
        success: true,
        message: 'Fetch job restarted successfully'
      };

      res.json(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error retrying fetch job:', error);
      throw new AppError('Failed to retry fetch job', 500);
    }
  }

  private async processFetchJob(jobId: number) {
    try {
      // Update status to running
      await prisma.fetchJob.update({
        where: { id: jobId },
        data: {
          status: FetchStatus.RUNNING,
          startedAt: new Date()
        }
      });

      const job = await prisma.fetchJob.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        throw new Error('Job not found');
      }

      // Fetch articles
      const result = await this.newsService.fetchArticles(
        job.sourceIds as number[],
        job.keyword,
        job.newsType,
        job.articlesPerSource
      );

      // Update job with results
      await prisma.fetchJob.update({
        where: { id: jobId },
        data: {
          status: result.success ? FetchStatus.COMPLETED : FetchStatus.FAILED,
          articlesFetched: result.articlesAdded,
          errorMessage: result.errors.length > 0 ? result.errors.join('; ') : null,
          completedAt: new Date()
        }
      });

    } catch (error) {
      console.error(`Error in processFetchJob ${jobId}:`, error);
      
      // Update job with error
      await prisma.fetchJob.update({
        where: { id: jobId },
        data: {
          status: FetchStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        }
      });
    }
  }

  async deleteFetchJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const jobId = parseInt(id);

      if (isNaN(jobId)) {
        throw new AppError('Invalid job ID', 400);
      }

      const job = await prisma.fetchJob.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        throw new AppError('Fetch job not found', 404);
      }

      if (job.status === FetchStatus.RUNNING) {
        throw new AppError('Cannot delete a running job', 400);
      }

      await prisma.fetchJob.delete({
        where: { id: jobId }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Fetch job deleted successfully'
      };

      res.json(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error deleting fetch job:', error);
      throw new AppError('Failed to delete fetch job', 500);
    }
  }
}