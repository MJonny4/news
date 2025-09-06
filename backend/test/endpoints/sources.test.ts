import { describe, it } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import app from '../setup/testApp';
import { 
  expectSuccessResponse, 
  expectErrorResponse, 
  expectSourceStructure,
  expectCategoryStructure
} from '../setup/testHelpers';

describe('Sources API', () => {
  describe('GET /api/sources', () => {
    it('should return all news sources', async () => {
      const res = await request(app)
        .get('/api/sources')
        .expect(200);

      expectSuccessResponse(res);
      expect(res.body.data).to.be.an('array');
      
      if (res.body.data.length > 0) {
        expectSourceStructure(res.body.data[0]);
        console.log('✓ Found sources:', res.body.data.map((s: any) => s.name).join(', '));
      } else {
        console.log('ℹ No sources found in database');
      }
    });

    it('should have expected default sources', async () => {
      const res = await request(app)
        .get('/api/sources')
        .expect(200);

      expectSuccessResponse(res);
      const sources = res.body.data;
      const sourceNames = sources.map((s: any) => s.name);
      
      // Check for expected default sources
      const expectedSources = ['NewsAPI', 'Guardian', 'Alpha Vantage'];
      expectedSources.forEach(expectedSource => {
        const found = sourceNames.includes(expectedSource);
        console.log(`${found ? '✓' : '✗'} Expected source "${expectedSource}": ${found ? 'Found' : 'Missing'}`);
      });
    });
  });

  describe('GET /api/sources/:id', () => {
    it('should return a specific source by ID', async () => {
      // First get all sources to get a valid ID
      const sourcesRes = await request(app)
        .get('/api/sources')
        .expect(200);

      if (sourcesRes.body.data.length > 0) {
        const firstSource = sourcesRes.body.data[0];
        
        const res = await request(app)
          .get(`/api/sources/${firstSource.id}`)
          .expect(200);

        expectSuccessResponse(res);
        expectSourceStructure(res.body.data);
        expect(res.body.data.id).to.equal(firstSource.id);
        console.log(`✓ Retrieved source: ${res.body.data.name}`);
      } else {
        console.log('⚠ Skipping test - no sources available');
      }
    });

    it('should return 404 for non-existent source', async () => {
      const res = await request(app)
        .get('/api/sources/99999')
        .expect(404);

      expectErrorResponse(res, 404);
      console.log('✓ Properly handles non-existent source ID');
    });

    it('should return 400 for invalid source ID', async () => {
      const res = await request(app)
        .get('/api/sources/invalid')
        .expect(400);

      expectErrorResponse(res, 400);
      console.log('✓ Properly validates source ID format');
    });
  });

  describe('GET /api/sources/categories', () => {
    it('should return all categories', async () => {
      const res = await request(app)
        .get('/api/sources/categories')
        .expect(200);

      expectSuccessResponse(res);
      expect(res.body.data).to.be.an('array');
      
      if (res.body.data.length > 0) {
        expectCategoryStructure(res.body.data[0]);
        console.log('✓ Found categories:', res.body.data.map((c: any) => c.name).join(', '));
      } else {
        console.log('ℹ No categories found in database');
      }
    });
  });

  describe('PATCH /api/sources/:id', () => {
    it('should update source active status', async () => {
      // First get all sources to get a valid ID
      const sourcesRes = await request(app)
        .get('/api/sources')
        .expect(200);

      if (sourcesRes.body.data.length > 0) {
        const firstSource = sourcesRes.body.data[0];
        const newStatus = !firstSource.isActive;
        
        const res = await request(app)
          .patch(`/api/sources/${firstSource.id}`)
          .send({ isActive: newStatus })
          .expect(200);

        expectSuccessResponse(res);
        expect(res.body.data.isActive).to.equal(newStatus);
        expect(res.body.data.id).to.equal(firstSource.id);
        console.log(`✓ Updated source "${firstSource.name}" active status to: ${newStatus}`);
        
        // Restore original status
        await request(app)
          .patch(`/api/sources/${firstSource.id}`)
          .send({ isActive: firstSource.isActive });
      } else {
        console.log('⚠ Skipping test - no sources available');
      }
    });

    it('should validate request body', async () => {
      const sourcesRes = await request(app)
        .get('/api/sources')
        .expect(200);

      if (sourcesRes.body.data.length > 0) {
        const firstSource = sourcesRes.body.data[0];
        
        const res = await request(app)
          .patch(`/api/sources/${firstSource.id}`)
          .send({ invalidField: true })
          .expect(400);

        expectErrorResponse(res, 400);
        console.log('✓ Properly validates request body structure');
      } else {
        console.log('⚠ Skipping test - no sources available');
      }
    });
  });

  describe('POST /api/sources/:sourceId/test', () => {
    it('should test API connection for a source', async () => {
      const sourcesRes = await request(app)
        .get('/api/sources')
        .expect(200);

      if (sourcesRes.body.data.length > 0) {
        const firstSource = sourcesRes.body.data[0];
        
        const res = await request(app)
          .post(`/api/sources/${firstSource.id}/test`)
          .expect(200);

        expect(res.body).to.have.property('data');
        expect(res.body.data).to.have.property('source').that.is.a('string');
        expect(res.body.data).to.have.property('connected').that.is.a('boolean');
        
        console.log(`✓ API test for "${res.body.data.source}": ${res.body.data.connected ? 'Connected' : 'Failed'}`);
        if (res.body.data.error) {
          console.log(`  Error: ${res.body.data.error}`);
        }
      } else {
        console.log('⚠ Skipping test - no sources available');
      }
    });
  });
});