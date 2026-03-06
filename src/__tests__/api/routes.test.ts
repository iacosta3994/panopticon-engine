import request from 'supertest';
import app from '../../api/server';

describe('API Routes', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Panopticon Engine API');
    });
  });

  describe('POST /api/ingest/observation', () => {
    it('should ingest an observation', async () => {
      const observation = {
        observation_type: 'test_event',
        payload: { test: 'data' },
        severity: 'info',
      };

      const response = await request(app)
        .post('/api/ingest/observation')
        .send(observation);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.observation_id).toBeDefined();
    });

    it('should return 400 for invalid observation', async () => {
      const response = await request(app)
        .post('/api/ingest/observation')
        .send({});
      
      expect(response.status).toBe(400);
    });
  });
});
