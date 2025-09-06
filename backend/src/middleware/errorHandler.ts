import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Log error for debugging
  console.error(`Error ${statusCode}: ${message}`, error.stack);

  const response: ApiResponse = {
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.originalUrl} not found`,
    message: 'The requested resource does not exist'
  };
  res.status(404).json(response);
};