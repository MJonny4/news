import { describe, it } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import app from '../setup/testApp';
import { 
  expectSuccessResponse, 
  expectErrorResponse, 
  expectPaginationResponse,
  expectFetchJobStructure
} from '../setup/testHelpers';

describe('Fetch Jobs API', () => {
  let testJobId: number | null = null;
  let activeSources: any[] = [];

  // Get active sources for testing
  before(async () => {
    const sourcesRes = await request(app)
      .get('/api/sources')
      .expect(200);
    
    activeSources = sourcesRes.body.data.filter((s: any) => s.isActive);
    console.log(`Found ${activeSources.length} active sources for testing`);
  });

  describe('GET /api/fetch', () => {
    it('should return paginated fetch jobs', async () => {
      const res = await request(app)
        .get('/api/fetch')
        .expect(200);

      expectPaginationResponse(res);
      
      const { data, pagination } = res.body.data;
      console.log(`✓ Found ${data.length} fetch jobs (page ${pagination.page}/${pagination.totalPages}, total: ${pagination.total})`);
      
      if (data.length > 0) {
        expectFetchJobStructure(data[0]);
        console.log(`✓ Sample job: "${data[0].keyword}" (${data[0].status})`);
      }
    });

    it('should handle pagination parameters', async () => {
      const res = await request(app)
        .get('/api/fetch')
        .query({ page: 1, limit: 3 })
        .expect(200);

      expectPaginationResponse(res);
      
      const { data, pagination } = res.body.data;
      expect(pagination.page).to.equal(1);
      expect(pagination.limit).to.equal(3);
      expect(data.length).to.be.at.most(3);
      
      console.log(`✓ Pagination works: returned ${data.length} jobs with limit 3`);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/fetch')
        .query({ status: 'completed' })
        .expect(200);

      expectPaginationResponse(res);
      
      const { data } = res.body.data;
      data.forEach((job: any) => {
        expect(job.status).to.equal('completed');
      });
      
      console.log(`✓ Status filter works: found ${data.length} completed jobs`);
    });
  });

  describe('POST /api/fetch', () => {
    it('should create a new fetch job with valid data', async () => {
      if (activeSources.length === 0) {
        console.log('⚠ Skipping test - no active sources available');
        return;
      }

      const jobData = {
        keyword: 'test-keyword-' + Date.now(),
        newsType: 'general',
        articlesPerSource: 2,
        sourceIds: [activeSources[0].id]
      };

      const res = await request(app)
        .post('/api/fetch')
        .send(jobData)
        .expect(201);

      expectSuccessResponse(res, 201);
      expectFetchJobStructure(res.body.data);
      
      expect(res.body.data.keyword).to.equal(jobData.keyword);
      expect(res.body.data.newsType).to.equal(jobData.newsType);
      expect(res.body.data.articlesPerSource).to.equal(jobData.articlesPerSource);
      expect(res.body.data.sourceIds).to.deep.equal(jobData.sourceIds);
      expect(res.body.data.status).to.be.oneOf(['pending', 'running']);
      
      testJobId = res.body.data.id;
      console.log(`✓ Created fetch job with ID: ${testJobId}, keyword: "${jobData.keyword}"`);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/fetch')
        .send({})
        .expect(400);

      expectErrorResponse(res, 400);
      console.log('✓ Properly validates required fields');
    });

    it('should validate news type enum', async () => {
      const res = await request(app)
        .post('/api/fetch')
        .send({
          keyword: 'test',
          newsType: 'invalid-type',
          articlesPerSource: 5,
          sourceIds: [1]
        })
        .expect(400);

      expectErrorResponse(res, 400);
      console.log('✓ Properly validates news type enum');
    });

    it('should validate articles per source range', async () => {
      const res = await request(app)
        .post('/api/fetch')
        .send({
          keyword: 'test',
          newsType: 'general',
          articlesPerSource: 25, // Should be max 20
          sourceIds: [1]
        })
        .expect(400);

      expectErrorResponse(res, 400);
      console.log('✓ Properly validates articles per source range');
    });

    it('should validate source IDs array', async () => {
      const res = await request(app)
        .post('/api/fetch')
        .send({
          keyword: 'test',
          newsType: 'general',
          articlesPerSource: 5,
          sourceIds: [] // Empty array
        })
        .expect(400);

      expectErrorResponse(res, 400);
      console.log('✓ Properly validates non-empty source IDs');
    });

    it('should validate source IDs exist and are active', async () => {
      const res = await request(app)
        .post('/api/fetch')
        .send({
          keyword: 'test',
          newsType: 'general',
          articlesPerSource: 5,
          sourceIds: [99999] // Non-existent source
        })
        .expect(400);

      expectErrorResponse(res, 400);
      console.log('✓ Properly validates source existence and active status');
    });
  });

  describe('GET /api/fetch/:id', () => {
    it('should return a specific fetch job by ID', async () => {
      if (!testJobId) {
        console.log('⚠ Skipping test - no test job created');
        return;
      }

      const res = await request(app)
        .get(`/api/fetch/${testJobId}`)
        .expect(200);

      expectSuccessResponse(res);
      expectFetchJobStructure(res.body.data);
      expect(res.body.data.id).to.equal(testJobId);
      
      console.log(`✓ Retrieved fetch job: ${res.body.data.keyword} (${res.body.data.status})`);
    });

    it('should return 404 for non-existent job', async () => {
      const res = await request(app)
        .get('/api/fetch/99999')
        .expect(404);

      expectErrorResponse(res, 404);
      console.log('✓ Properly handles non-existent fetch job ID');
    });

    it('should return 400 for invalid job ID', async () => {
      const res = await request(app)
        .get('/api/fetch/invalid')
        .expect(400);

      expectErrorResponse(res, 400);
      console.log('✓ Properly validates fetch job ID format');
    });
  });

  describe('POST /api/fetch/:id/retry', () => {
    it('should handle retry for non-existent job', async () => {
      const res = await request(app)
        .post('/api/fetch/99999/retry')
        .expect(404);

      expectErrorResponse(res, 404);
      console.log('✓ Properly handles retry of non-existent job');
    });

    it('should validate job ID for retry', async () => {
      const res = await request(app)
        .post('/api/fetch/invalid/retry')
        .expect(400);

      expectErrorResponse(res, 400);
      console.log('✓ Properly validates job ID for retry');
    });
  });

  describe('DELETE /api/fetch/:id', () => {
    it('should handle delete for non-existent job', async () => {
      const res = await request(app)
        .delete('/api/fetch/99999')
        .expect(404);

      expectErrorResponse(res, 404);
      console.log('✓ Properly handles deletion of non-existent job');
    });

    it('should validate job ID for deletion', async () => {
      const res = await request(app)
        .delete('/api/fetch/invalid')
        .expect(400);

      expectErrorResponse(res, 400);
      console.log('✓ Properly validates job ID for deletion');
    });

    // Clean up test job
    it('should delete the test job (cleanup)', async () => {
      if (!testJobId) {
        console.log('⚠ No test job to clean up');
        return;
      }

      // Wait a moment to ensure job isn't running
      await new Promise(resolve => setTimeout(resolve, 1000));

      const res = await request(app)
        .delete(`/api/fetch/${testJobId}`)
        .expect((res) => {
          // Allow both success (200) and not found (404) for cleanup
          expect(res.status).to.be.oneOf([200, 404, 400]);
        });

      if (res.status === 200) {
        console.log(`✓ Cleaned up test job: ${testJobId}`);
      } else {
        console.log(`ℹ Test job ${testJobId} cleanup: ${res.body.error || 'Already removed'}`);
      }
    });
  });
});