import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiResponse } from '@/types';

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        };
        return res.status(400).json(response);
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Convert string numbers to numbers for query params
      const query = { ...req.query };
      if (query.page) query.page = parseInt(query.page as string);
      if (query.limit) query.limit = parseInt(query.limit as string);
      
      req.query = schema.parse(query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'Query validation failed',
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        };
        return res.status(400).json(response);
      }
      next(error);
    }
  };
};