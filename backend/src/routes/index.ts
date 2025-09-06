import { Router } from 'express';
import articlesRouter from './articles';
import fetchRouter from './fetch';
import sourcesRouter from './sources';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    success: true,
    data: {
      status: 'healthy',
      service: 'Financial News Hub API',
      timestamp: new Date().toISOString()
    },
    message: 'Financial News Hub API is running'
  });
});

// API routes
router.use('/articles', articlesRouter);
router.use('/fetch', fetchRouter);
router.use('/sources', sourcesRouter);

export default router;