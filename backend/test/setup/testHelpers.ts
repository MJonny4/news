import { expect } from 'chai';
import { Response } from 'supertest';

// Helper to validate API response structure
export const expectApiResponse = (res: Response, expectedStatus: number = 200) => {
  expect(res.status).to.equal(expectedStatus);
  expect(res.body).to.be.an('object');
  expect(res.body).to.have.property('success');
  expect(res.body.success).to.be.a('boolean');
};

// Helper to validate successful API response
export const expectSuccessResponse = (res: Response, expectedStatus: number = 200) => {
  expectApiResponse(res, expectedStatus);
  expect(res.body.success).to.be.true;
  expect(res.body).to.have.property('data');
};

// Helper to validate error API response
export const expectErrorResponse = (res: Response, expectedStatus: number = 400) => {
  expectApiResponse(res, expectedStatus);
  expect(res.body.success).to.be.false;
  expect(res.body).to.have.property('error');
  expect(res.body.error).to.be.a('string');
};

// Helper to validate pagination structure
export const expectPaginationResponse = (res: Response) => {
  expectSuccessResponse(res);
  expect(res.body.data).to.have.property('data').that.is.an('array');
  expect(res.body.data).to.have.property('pagination').that.is.an('object');
  
  const pagination = res.body.data.pagination;
  expect(pagination).to.have.property('page').that.is.a('number');
  expect(pagination).to.have.property('limit').that.is.a('number');
  expect(pagination).to.have.property('total').that.is.a('number');
  expect(pagination).to.have.property('totalPages').that.is.a('number');
  expect(pagination).to.have.property('hasNext').that.is.a('boolean');
  expect(pagination).to.have.property('hasPrev').that.is.a('boolean');
};

// Helper to validate article structure
export const expectArticleStructure = (article: any) => {
  expect(article).to.be.an('object');
  expect(article).to.have.property('id').that.is.a('number');
  expect(article).to.have.property('title').that.is.a('string');
  expect(article).to.have.property('url').that.is.a('string');
  expect(article).to.have.property('newsType').that.is.a('string');
  expect(article).to.have.property('isEnhanced').that.is.a('boolean');
  expect(article).to.have.property('createdAt').that.is.a('string');
  expect(article).to.have.property('updatedAt').that.is.a('string');
  
  // Check source relationship
  expect(article).to.have.property('source').that.is.an('object');
  expect(article.source).to.have.property('id').that.is.a('number');
  expect(article.source).to.have.property('name').that.is.a('string');
};

// Helper to validate news source structure
export const expectSourceStructure = (source: any) => {
  expect(source).to.be.an('object');
  expect(source).to.have.property('id').that.is.a('number');
  expect(source).to.have.property('name').that.is.a('string');
  expect(source).to.have.property('isActive').that.is.a('boolean');
  expect(source).to.have.property('articleCount').that.is.a('number');
  expect(source).to.have.property('createdAt').that.is.a('string');
  expect(source).to.have.property('updatedAt').that.is.a('string');
};

// Helper to validate fetch job structure
export const expectFetchJobStructure = (job: any) => {
  expect(job).to.be.an('object');
  expect(job).to.have.property('id').that.is.a('number');
  expect(job).to.have.property('keyword').that.is.a('string');
  expect(job).to.have.property('newsType').that.is.a('string');
  expect(job).to.have.property('articlesPerSource').that.is.a('number');
  expect(job).to.have.property('sourceIds').that.is.an('array');
  expect(job).to.have.property('status').that.is.a('string');
  expect(job).to.have.property('articlesFetched').that.is.a('number');
  expect(job).to.have.property('createdAt').that.is.a('string');
};

// Helper to validate category structure
export const expectCategoryStructure = (category: any) => {
  expect(category).to.be.an('object');
  expect(category).to.have.property('id').that.is.a('number');
  expect(category).to.have.property('name').that.is.a('string');
  expect(category).to.have.property('slug').that.is.a('string');
  expect(category).to.have.property('articleCount').that.is.a('number');
};