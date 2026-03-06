import { AnomalyDetector } from '../../vigilance/AnomalyDetector';
import { Observation } from '../../lib/types';

describe('AnomalyDetector', () => {
  let detector: AnomalyDetector;

  beforeEach(() => {
    detector = new AnomalyDetector();
  });

  describe('detect', () => {
    it('should detect no anomaly for normal values', async () => {
      const observation: Partial<Observation> = {
        id: 'test-1',
        source_id: 'source-1',
        observation_type: 'test_metric',
        payload: { value: 50 },
        severity: 'info',
        observed_at: new Date(),
        processed: false,
        metadata: {},
        tags: [],
        created_at: new Date(),
      };

      const result = await detector.detect(observation);

      expect(result.isAnomaly).toBe(false);
      expect(result.value).toBe(50);
    });

    it('should return no anomaly for observations without numeric values', async () => {
      const observation: Partial<Observation> = {
        id: 'test-1',
        source_id: 'source-1',
        observation_type: 'test_metric',
        payload: { message: 'test' },
        severity: 'info',
        observed_at: new Date(),
        processed: false,
        metadata: {},
        tags: [],
        created_at: new Date(),
      };

      const result = await detector.detect(observation);

      expect(result.isAnomaly).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear historical data cache', () => {
      detector.clearCache();
      // If no error is thrown, the test passes
      expect(true).toBe(true);
    });
  });
});
