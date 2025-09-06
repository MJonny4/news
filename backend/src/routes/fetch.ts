import { Router } from 'express';
import { FetchController } from '@/controllers/fetchController';
import { validateBody } from '@/middleware/validation';
import { CreateFetchJobSchema } from '@/types';

const router = Router();
const fetchController = new FetchController();

// Create new fetch job
router.post('/', validateBody(CreateFetchJobSchema), (req, res, next) => {
  fetchController.createFetchJob(req, res).catch(next);
});

// Get fetch jobs with pagination
router.get('/', (req, res, next) => {
  fetchController.getFetchJobs(req, res).catch(next);
});

// Get fetch job by ID
router.get('/:id', (req, res, next) => {
  fetchController.getFetchJobById(req, res).catch(next);
});

// Retry failed fetch job
router.post('/:id/retry', (req, res, next) => {
  fetchController.retryFetchJob(req, res).catch(next);
});

// Delete fetch job
router.delete('/:id', (req, res, next) => {
  fetchController.deleteFetchJob(req, res).catch(next);
});

export default router;