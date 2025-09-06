import { describe, it } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import app from '../setup/testApp';
import { expectSuccessResponse } from '../setup/testHelpers';

describe('Health Check API', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expectSuccessResponse(res);
      expect(res.body).to.have.property('message').that.is.a('string');
      expect(res.body.data).to.have.property('status', 'healthy');
      expect(res.body.data).to.have.property('service').that.is.a('string');
      expect(res.body.data).to.have.property('timestamp').that.is.a('string');
      
      // Validate timestamp is a valid ISO date
      const timestamp = new Date(res.body.data.timestamp);
      expect(timestamp.toISOString()).to.equal(res.body.data.timestamp);
      
      console.log('✓ Health check endpoint working');
      console.log(`  Service: ${res.body.data.service}`);
      console.log(`  Status: ${res.body.data.status}`);
      console.log(`  Timestamp: ${res.body.data.timestamp}`);
    });

    it('should return JSON content type', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.header['content-type']).to.match(/application\/json/);
      console.log('✓ Health check returns proper JSON content type');
    });

    it('should be accessible without authentication', async () => {
      // This test ensures the health endpoint is publicly accessible
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expectSuccessResponse(res);
      console.log('✓ Health check endpoint is publicly accessible');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const res = await request(app)
        .get('/api/non-existent-endpoint')
        .expect(404);

      expect(res.body).to.have.property('success', false);
      expect(res.body).to.have.property('error').that.includes('not found');
      
      console.log('✓ 404 handler working for non-existent endpoints');
    });

    it('should return proper JSON for 404 errors', async () => {
      const res = await request(app)
        .get('/api/invalid/path')
        .expect(404);

      expect(res.header['content-type']).to.match(/application\/json/);
      expect(res.body.success).to.be.false;
      
      console.log('✓ 404 errors return proper JSON structure');
    });
  });
});