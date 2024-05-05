const request = require('supertest');
const app = require('../app.js'); // Assuming your app is exported from app.js
const DB = require('../services/db.js');
const jwt = require('jsonwebtoken');
const Env = require('../helpers/getEnv.js');

jest.mock('../services/db.js'); // Mock DB module
jest.mock('jsonwebtoken'); // Mock jsonwebtoken module
jest.mock('../helpers/getEnv.js'); // Mock getEnv module

describe('GET /api/v1/blogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated list of published blogs', async () => {
    // Mock JWT token verification
    jwt.verify.mockReturnValueOnce({ userId: 1 });

    // Mock getEnv function
    Env.getEnv.mockReturnValueOnce('secret'); // Mock secret key

    // Mock database query result for published blogs
    const mockPublishedBlogs = {
      data: [
        { title: 'Blog 1', slug: 'blog-1', description: 'Description 1', image: 'image1.jpg', id: 1 },
        { title: 'Blog 2', slug: 'blog-2', description: 'Description 2', image: 'image2.jpg', id: 2 }
      ],
      totalCount: { total: 2 }
    };
    DB.from.mockReturnValueOnce({
      from : jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      whereRaw: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      count: jest.fn().mockResolvedValueOnce({ total: 2 }),
      first: jest.fn().mockResolvedValueOnce({ total: 2 })
    });
    DB.from.mockResolvedValueOnce(mockPublishedBlogs);
    // Send request to the endpoint
    const response = await request(app)
      .get('/api/v1/blogs')
      .expect('Content-Type', /json/)
      .expect(200);
    console.log(response.body)
    // Assert the response body
    expect(response.body.code).toBe(200);
    expect(response.body.message).toBe('ok');
    expect(response.body.data).toEqual(mockPublishedBlogs.data);
    expect(response.body.pagination).toEqual({
      page: 1,
      pageSize: 10,
      total: 2,
      totalPages: 1
    });
  });
  // Add more test cases for other scenarios (unpublished blogs, blogs by email, error handling, etc.)
});