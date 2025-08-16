import request from 'supertest';
import express from 'express';
import {
  globalErrorHandler,
  notFoundHandler,
  asyncHandler,
  securityHeaders,
  sanitizeInput,
  rateLimitHandler
} from '../../middleware/errorHandler.js';
import { VALIDATION_ERRORS } from '../../utils/withdrawalValidation.js';

describe('Error Handler Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('globalErrorHandler', () => {
    test('should handle ValidationError', async () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.errors = {
        field1: { message: 'Field 1 is required' },
        field2: { message: 'Field 2 is invalid' }
      };

      app.get('/test', (req, res, next) => {
        next(validationError);
      });
      app.use(globalErrorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe(VALIDATION_ERRORS.VALIDATION_ERROR);
      expect(response.body.error.details).toEqual([
        'Field 1 is required',
        'Field 2 is invalid'
      ]);
    });

    test('should handle CastError', async () => {
      const castError = new Error('Cast failed');
      castError.name = 'CastError';
      castError.path = 'userId';
      castError.value = 'invalid-id';

      app.get('/test', (req, res, next) => {
        next(castError);
      });
      app.use(globalErrorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(VALIDATION_ERRORS.VALIDATION_ERROR);
      expect(response.body.error.details.field).toBe('userId');
      expect(response.body.error.details.value).toBe('invalid-id');
    });

    test('should handle duplicate key error', async () => {
      const duplicateError = new Error('Duplicate key');
      duplicateError.code = 11000;
      duplicateError.keyValue = { email: 'test@example.com' };

      app.get('/test', (req, res, next) => {
        next(duplicateError);
      });
      app.use(globalErrorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe(VALIDATION_ERRORS.DUPLICATE_REQUEST);
      expect(response.body.error.details.field).toBe('email');
      expect(response.body.error.details.value).toBe('test@example.com');
    });

    test('should handle JWT errors', async () => {
      const jwtError = new Error('Invalid token');
      jwtError.name = 'JsonWebTokenError';

      app.get('/test', (req, res, next) => {
        next(jwtError);
      });
      app.use(globalErrorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe(VALIDATION_ERRORS.UNAUTHORIZED_ACCESS);
    });

    test('should handle rate limiting errors', async () => {
      const rateLimitError = new Error('Too many requests');
      rateLimitError.status = 429;
      rateLimitError.retryAfter = 60;

      app.get('/test', (req, res, next) => {
        next(rateLimitError);
      });
      app.use(globalErrorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(429);
      expect(response.body.error.code).toBe(VALIDATION_ERRORS.TOO_MANY_REQUESTS);
      expect(response.body.error.details.retryAfter).toBe(60);
    });

    test('should handle generic errors', async () => {
      const genericError = new Error('Something went wrong');
      genericError.statusCode = 500;

      app.get('/test', (req, res, next) => {
        next(genericError);
      });
      app.use(globalErrorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe(VALIDATION_ERRORS.INTERNAL_SERVER_ERROR);
    });
  });

  describe('notFoundHandler', () => {
    test('should handle 404 routes', async () => {
      app.use(notFoundHandler);
      app.use(globalErrorHandler);

      const response = await request(app).get('/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error.message).toContain('Route not found: GET /nonexistent');
    });
  });

  describe('asyncHandler', () => {
    test('should catch async errors', async () => {
      const asyncRoute = asyncHandler(async (req, res, next) => {
        throw new Error('Async error');
      });

      app.get('/test', asyncRoute);
      app.use(globalErrorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(500);
      expect(response.body.error.message).toContain('Async error');
    });

    test('should handle successful async routes', async () => {
      const asyncRoute = asyncHandler(async (req, res) => {
        res.json({ success: true });
      });

      app.get('/test', asyncRoute);

      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('securityHeaders', () => {
    test('should set security headers', async () => {
      app.use(securityHeaders);
      app.get('/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('sanitizeInput', () => {
    test('should sanitize request body', async () => {
      app.use(sanitizeInput);
      app.post('/test', (req, res) => {
        res.json({ body: req.body });
      });

      const maliciousData = {
        name: '  John<script>alert("xss")</script>Doe  ',
        email: 'test@example.com',
        nested: {
          value: '<img src="x" onerror="alert(1)">'
        }
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousData);

      expect(response.body.body.name).toBe('JohnscriptDoe');
      expect(response.body.body.email).toBe('test@example.com');
      expect(response.body.body.nested.value).toBe('img src=x onerror=alert(1)');
    });

    test('should sanitize query parameters', async () => {
      app.use(sanitizeInput);
      app.get('/test', (req, res) => {
        res.json({ query: req.query });
      });

      const response = await request(app)
        .get('/test')
        .query({
          search: '  <script>alert("xss")</script>  ',
          filter: 'normal value'
        });

      expect(response.body.query.search).toBe('scriptalert(xss)/script');
      expect(response.body.query.filter).toBe('normal value');
    });

    test('should handle arrays in request body', async () => {
      app.use(sanitizeInput);
      app.post('/test', (req, res) => {
        res.json({ body: req.body });
      });

      const dataWithArray = {
        items: ['  item1  ', '<script>item2</script>', 'item3'],
        tags: ['tag1', '  tag2<>  ']
      };

      const response = await request(app)
        .post('/test')
        .send(dataWithArray);

      expect(response.body.body.items).toEqual(['item1', 'scriptitem2/script', 'item3']);
      expect(response.body.body.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('Error handling integration', () => {
    test('should handle complete error flow', async () => {
      app.use(sanitizeInput);
      app.use(securityHeaders);
      
      app.post('/test', asyncHandler(async (req, res) => {
        if (!req.body.name) {
          const error = new Error('Name is required');
          error.name = 'ValidationError';
          error.errors = {
            name: { message: 'Name field is required' }
          };
          throw error;
        }
        res.json({ success: true, name: req.body.name });
      }));
      
      app.use(globalErrorHandler);

      // Test successful request with sanitization
      const successResponse = await request(app)
        .post('/test')
        .send({ name: '  John<script>Doe  ' });

      expect(successResponse.status).toBe(200);
      expect(successResponse.body.success).toBe(true);
      expect(successResponse.body.name).toBe('JohnscriptDoe');
      expect(successResponse.headers['x-content-type-options']).toBe('nosniff');

      // Test error handling
      const errorResponse = await request(app)
        .post('/test')
        .send({});

      expect(errorResponse.status).toBe(400);
      expect(errorResponse.body.success).toBe(false);
      expect(errorResponse.body.error.code).toBe(VALIDATION_ERRORS.VALIDATION_ERROR);
      expect(errorResponse.body.error.details).toEqual(['Name field is required']);
    });
  });
});