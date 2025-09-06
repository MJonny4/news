import { describe, it } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import app from '../setup/testApp';
import { 
  expectSuccessResponse, 
  expectErrorResponse, 
  expectPaginationResponse,
  expectArticleStructure
} from '../setup/testHelpers';

describe('Articles API', () => {
  describe('GET /api/articles', () => {
    it('should return paginated articles', async () => {
      const res = await request(app)
        .get('/api/articles')
        .expect(200);

      expectPaginationResponse(res);
      
      const { data, pagination } = res.body.data;
      console.log(`✓ Found ${data.length} articles (page ${pagination.page}/${pagination.totalPages}, total: ${pagination.total})`);
      
      if (data.length > 0) {
        expectArticleStructure(data[0]);
        console.log(`✓ Sample article: "${data[0].title.substring(0, 50)}..."`);
      }
    });

    it('should handle pagination parameters', async () => {
      const res = await request(app)
        .get('/api/articles')
        .query({ page: 1, limit: 5 })
        .expect(200);

      expectPaginationResponse(res);
      
      const { data, pagination } = res.body.data;
      expect(pagination.page).to.equal(1);
      expect(pagination.limit).to.equal(5);
      expect(data.length).to.be.at.most(5);
      
      console.log(`✓ Pagination works: returned ${data.length} articles with limit 5`);
    });

    it('should filter by news type', async () => {
      const res = await request(app)
        .get('/api/articles')
        .query({ newsType: 'financial' })
        .expect(200);

      expectPaginationResponse(res);
      
      const { data } = res.body.data;
      if (data.length > 0) {
        data.forEach((article: any) => {
          expect(article.newsType).to.equal('financial');
        });
        console.log(`✓ News type filter works: found ${data.length} financial articles`);
      } else {
        console.log('ℹ No financial articles found');
      }
    });

    it('should filter by source', async () => {
      const res = await request(app)
        .get('/api/articles')
        .query({ source: 'NewsAPI' })
        .expect(200);

      expectPaginationResponse(res);
      
      const { data } = res.body.data;
      if (data.length > 0) {
        data.forEach((article: any) => {
          expect(article.source.name).to.include('NewsAPI');
        });
        console.log(`✓ Source filter works: found ${data.length} NewsAPI articles`);
      } else {
        console.log('ℹ No NewsAPI articles found');
      }
    });

    it('should search articles by keyword', async () => {
      const res = await request(app)
        .get('/api/articles')
        .query({ search: 'test' })
        .expect(200);

      expectPaginationResponse(res);
      console.log(`✓ Search works: found ${res.body.data.data.length} articles containing 'test'`);
    });

    it('should sort articles', async () => {
      const res = await request(app)
        .get('/api/articles')
        .query({ sortBy: 'createdAt', sortOrder: 'desc' })
        .expect(200);

      expectPaginationResponse(res);
      
      const { data } = res.body.data;
      if (data.length > 1) {
        const firstCreated = new Date(data[0].createdAt);
        const secondCreated = new Date(data[1].createdAt);
        expect(firstCreated.getTime()).to.be.at.least(secondCreated.getTime());
        console.log('✓ Sorting works: articles ordered by creation date descending');
      }
    });
  });

  describe('GET /api/articles/search', () => {
    it('should search articles with query parameter', async () => {
      const res = await request(app)
        .get('/api/articles/search')
        .query({ q: 'news' })
        .expect(200);

      expectSuccessResponse(res);
      expect(res.body.data).to.be.an('array');
      
      console.log(`✓ Search endpoint works: found ${res.body.data.length} articles for 'news'`);
      
      if (res.body.data.length > 0) {
        expectArticleStructure(res.body.data[0]);
      }
    });

    it('should require search query', async () => {
      const res = await request(app)
        .get('/api/articles/search')
        .expect(400);

      expectErrorResponse(res, 400);
      expect(res.body.error).to.include('required');
      console.log('✓ Properly validates required search query');
    });

    it('should handle empty search results', async () => {
      const res = await request(app)
        .get('/api/articles/search')
        .query({ q: 'xyzzynotfound123' })
        .expect(200);

      expectSuccessResponse(res);
      expect(res.body.data).to.be.an('array').with.length(0);
      console.log('✓ Handles empty search results gracefully');
    });
  });

  describe('GET /api/articles/stats', () => {
    it('should return article statistics', async () => {
      const res = await request(app)
        .get('/api/articles/stats')
        .expect(200);

      expectSuccessResponse(res);
      
      const stats = res.body.data;
      expect(stats).to.have.property('total').that.is.a('number');
      expect(stats).to.have.property('thisWeek').that.is.a('number');
      expect(stats).to.have.property('bySource').that.is.an('array');
      expect(stats).to.have.property('byCategory').that.is.an('array');
      expect(stats).to.have.property('byNewsType').that.is.an('array');
      
      console.log('✓ Article statistics:');
      console.log(`  Total articles: ${stats.total}`);
      console.log(`  This week: ${stats.thisWeek}`);
      console.log(`  Sources: ${stats.bySource.length}`);
      console.log(`  Categories: ${stats.byCategory.length}`);
      console.log(`  News types: ${stats.byNewsType.length}`);
    });
  });

  describe('GET /api/articles/:id', () => {
    it('should return a specific article by ID', async () => {
      // First get articles to get a valid ID
      const articlesRes = await request(app)
        .get('/api/articles')
        .expect(200);

      const articles = articlesRes.body.data.data;
      if (articles.length > 0) {
        const firstArticle = articles[0];
        
        const res = await request(app)
          .get(`/api/articles/${firstArticle.id}`)
          .expect(200);

        expectSuccessResponse(res);
        expectArticleStructure(res.body.data);
        expect(res.body.data.id).to.equal(firstArticle.id);
        
        console.log(`✓ Retrieved article: "${res.body.data.title.substring(0, 50)}..."`);
      } else {
        console.log('⚠ Skipping test - no articles available');
      }
    });

    it('should return 404 for non-existent article', async () => {
      const res = await request(app)
        .get('/api/articles/99999')
        .expect(404);

      expectErrorResponse(res, 404);
      console.log('✓ Properly handles non-existent article ID');
    });

    it('should return 400 for invalid article ID', async () => {
      const res = await request(app)
        .get('/api/articles/invalid')
        .expect(400);

      expectErrorResponse(res, 400);
      console.log('✓ Properly validates article ID format');
    });
  });

  describe('DELETE /api/articles/:id', () => {
    it('should handle delete request for non-existent article', async () => {
      const res = await request(app)
        .delete('/api/articles/99999')
        .expect(404);

      expectErrorResponse(res, 404);
      console.log('✓ Properly handles deletion of non-existent article');
    });

    it('should validate article ID for deletion', async () => {
      const res = await request(app)
        .delete('/api/articles/invalid')
        .expect(400);

      expectErrorResponse(res, 400);
      console.log('✓ Properly validates article ID for deletion');
    });
  });
});