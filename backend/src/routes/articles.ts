import { Router } from 'express';
import { ArticleController } from '@/controllers/articleController';
import { validateQuery } from '@/middleware/validation';
import { ArticleQuerySchema } from '@/types';

const router = Router();
const articleController = new ArticleController();

// Get articles with pagination and filtering
router.get('/', validateQuery(ArticleQuerySchema), (req, res, next) => {
  articleController.getArticles(req, res).catch(next);
});

// Search articles
router.get('/search', (req, res, next) => {
  articleController.searchArticles(req, res).catch(next);
});

// Get article statistics
router.get('/stats', (req, res, next) => {
  articleController.getArticleStats(req, res).catch(next);
});

// Get article by ID
router.get('/:id', (req, res, next) => {
  articleController.getArticleById(req, res).catch(next);
});

// Delete article by ID
router.delete('/:id', (req, res, next) => {
  articleController.deleteArticle(req, res).catch(next);
});

export default router;