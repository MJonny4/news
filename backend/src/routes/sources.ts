import { Router } from 'express';
import { SourceController } from '@/controllers/sourceController';
import { validateBody } from '@/middleware/validation';
import { UpdateSourceSchema } from '@/types';

const router = Router();
const sourceController = new SourceController();

// Get all sources
router.get('/', (req, res, next) => {
  sourceController.getSources(req, res).catch(next);
});

// Get categories
router.get('/categories', (req, res, next) => {
  sourceController.getCategories(req, res).catch(next);
});

// Get source by ID
router.get('/:id', (req, res, next) => {
  sourceController.getSourceById(req, res).catch(next);
});

// Update source (activate/deactivate)
router.patch('/:id', validateBody(UpdateSourceSchema), (req, res, next) => {
  sourceController.updateSource(req, res).catch(next);
});

// Test API connection for a source
router.post('/:sourceId/test', (req, res, next) => {
  sourceController.testApiConnection(req, res).catch(next);
});

export default router;