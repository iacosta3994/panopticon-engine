import { PatternSynthesizer } from '../../meaning/PatternSynthesizer';
import { Observation } from '../../lib/types';

describe('PatternSynthesizer', () => {
  let synthesizer: PatternSynthesizer;

  beforeEach(() => {
    synthesizer = new PatternSynthesizer();
  });

  describe('synthesizePatterns', () => {
    it('should return empty array for no observations', async () => {
      const patterns = await synthesizer.synthesizePatterns([]);
      expect(patterns).toEqual([]);
    });

    it('should synthesize patterns from observations', async () => {
      const observations: Observation[] = [
        {
          id: '1',
          source_id: 'source-1',
          observation_type: 'login_attempt',
          severity: 'info',
          payload: { user: 'test' },
          metadata: {},
          tags: ['login'],
          observed_at: new Date(),
          processed: false,
          created_at: new Date(),
        },
        {
          id: '2',
          source_id: 'source-1',
          observation_type: 'login_success',
          severity: 'info',
          payload: { user: 'test' },
          metadata: {},
          tags: ['login'],
          observed_at: new Date(),
          processed: false,
          created_at: new Date(),
        },
      ];

      const patterns = await synthesizer.synthesizePatterns(observations);
      expect(Array.isArray(patterns)).toBe(true);
    });
  });
});
