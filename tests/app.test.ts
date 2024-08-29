import request from 'supertest';
import express from 'express';
import generateRoute from '../src/routes/generateRoute';
import limiter from '../src/middleware/rateLimiter';
import axios from 'axios';
import { jest } from '@jest/globals';

describe('App', () => {
  let app: express.Application;


  beforeAll(() => {
      process.env.OLLAMA_API_URL = 'http://localhost:11434';

    app = express();
    app.use(express.json());
    app.use(limiter);
    app.use('/', generateRoute);
  });

  it('should respond with 200 on root route', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'API is working' });
  });

  describe('Generate Route', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

it('should handle successful generation', async () => {
  process.env.VALIDATE_MODEL = 'false';
  process.env.OLLAMA_API_URL = 'http://localhost:11434';

  const axiosPostSpy = jest.spyOn(axios, 'post').mockResolvedValue({
    data: {
      model: 'test-model',
      created_at: '2023-01-01',
      response: 'Test response'
    }
  });

  const response = await request(app)
    .post('/generate')
    .send({ model: 'test-model', prompt: 'Test prompt' });

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    model: 'test-model',
    created_at: '2023-01-01',
    response: 'Test response'
  });

  expect(axiosPostSpy).toHaveBeenCalledWith(
    'http://localhost:11434/api/generate',
    expect.objectContaining({
      model: 'test-model',
      prompt: 'Test prompt',
      stream: false
    })
  );

  axiosPostSpy.mockRestore();
});

    it('should handle errors correctly', async () => {
      process.env.VALIDATE_MODEL = 'false';
      const axiosPostSpy = jest.spyOn(axios, 'post').mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .post('/generate')
        .send({ model: 'test-model', prompt: 'Test prompt' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'An unexpected error occurred' });

      axiosPostSpy.mockRestore();
    });
  });
});

describe('Rate Limiter', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(limiter);
    app.get('/test', (req, res) => res.send('OK'));
  });

  it('should allow requests within the limit', async () => {
    const response = await request(app).get('/test');
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });
});
