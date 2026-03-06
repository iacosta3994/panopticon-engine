import logger from '../lib/logger';
import supabase from '../lib/supabase';
import { Pattern, Observation, PatternMatch } from '../lib/types';
import { generateId } from '../lib/utils';
import { config } from '../lib/config';

interface PatternSignature {
  events: Array<{
    type: string;
    properties?: Record<string, any>;
  }>;
  timeConstraints?: {
    maxTimeBetween?: string;
    minTimeBetween?: string;
  };
}

export class PatternSynthesizer {
  /**
   * Synthesize patterns from observations
   */
  async synthesizePatterns(observations: Observation[]): Promise<Pattern[]> {
    try {
      logger.info('Starting pattern synthesis', { observations: observations.length });

      const patterns: Pattern[] = [];

      // Detect sequential patterns
      const sequentialPatterns = await this.detectSequentialPatterns(observations);
      patterns.push(...sequentialPatterns);

      // Detect frequency patterns
      const frequencyPatterns = await this.detectFrequencyPatterns(observations);
      patterns.push(...frequencyPatterns);

      // Detect correlation patterns
      const correlationPatterns = await this.detectCorrelationPatterns(observations);
      patterns.push(...correlationPatterns);

      // Store patterns
      for (const pattern of patterns) {
        await this.storePattern(pattern);
      }

      logger.info('Pattern synthesis completed', { patternsFound: patterns.length });
      return patterns;
    } catch (error) {
      logger.error('Failed to synthesize patterns', { error });
      return [];
    }
  }

  /**
   * Detect sequential patterns
   */
  private async detectSequentialPatterns(observations: Observation[]): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    const sequences = new Map<string, Observation[]>();

    // Group observations by correlation_id
    for (const obs of observations) {
      if (obs.correlation_id) {
        const key = obs.correlation_id;
        if (!sequences.has(key)) {
          sequences.set(key, []);
        }
        sequences.get(key)!.push(obs);
      }
    }

    // Analyze sequences
    for (const [correlationId, sequence] of sequences) {
      if (sequence.length < 2) continue;

      // Sort by observed_at
      sequence.sort((a, b) => a.observed_at.getTime() - b.observed_at.getTime());

      // Create pattern signature
      const signature: PatternSignature = {
        events: sequence.map(obs => ({
          type: obs.observation_type,
          properties: this.extractKeyProperties(obs.payload),
        })),
        timeConstraints: this.calculateTimeConstraints(sequence),
      };

      // Check if pattern already exists
      const existingPattern = await this.findSimilarPattern(signature, 'sequential');
      
      if (existingPattern) {
        await this.incrementPatternOccurrence(existingPattern.id);
      } else {
        patterns.push({
          id: generateId(),
          pattern_type: 'sequential',
          name: this.generatePatternName(signature, 'sequential'),
          description: `Sequential pattern: ${sequence.map(o => o.observation_type).join(' → ')}`,
          signature: signature as any,
          confidence_score: this.calculateConfidence(sequence.length),
          occurrence_count: 1,
          first_seen_at: sequence[0].observed_at,
          last_seen_at: sequence[sequence.length - 1].observed_at,
          metadata: { correlation_id: correlationId },
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    return patterns;
  }

  /**
   * Detect frequency patterns
   */
  private async detectFrequencyPatterns(observations: Observation[]): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    const typeCounts = new Map<string, number>();

    // Count observation types
    for (const obs of observations) {
      const count = typeCounts.get(obs.observation_type) || 0;
      typeCounts.set(obs.observation_type, count + 1);
    }

    // Find high-frequency patterns
    for (const [type, count] of typeCounts) {
      if (count >= config.patternAnalysis.minOccurrences) {
        patterns.push({
          id: generateId(),
          pattern_type: 'frequency',
          name: `High frequency: ${type}`,
          description: `${type} occurs ${count} times`,
          signature: { event_type: type, frequency: count } as any,
          confidence_score: Math.min(100, (count / observations.length) * 100),
          occurrence_count: count,
          first_seen_at: observations[0].observed_at,
          last_seen_at: observations[observations.length - 1].observed_at,
          metadata: {},
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    return patterns;
  }

  /**
   * Detect correlation patterns
   */
  private async detectCorrelationPatterns(observations: Observation[]): Promise<Pattern[]> {
    const patterns: Pattern[] = [];
    const timeWindow = 5 * 60 * 1000; // 5 minutes

    // Find observations that occur close in time
    for (let i = 0; i < observations.length; i++) {
      const correlatedObs: Observation[] = [observations[i]];

      for (let j = i + 1; j < observations.length; j++) {
        const timeDiff = observations[j].observed_at.getTime() - observations[i].observed_at.getTime();
        
        if (timeDiff > timeWindow) break;
        
        correlatedObs.push(observations[j]);
      }

      if (correlatedObs.length >= 2) {
        const types = correlatedObs.map(o => o.observation_type);
        const uniqueTypes = [...new Set(types)];

        if (uniqueTypes.length >= 2) {
          patterns.push({
            id: generateId(),
            pattern_type: 'correlation',
            name: `Correlated events: ${uniqueTypes.join(', ')}`,
            description: `${uniqueTypes.length} different event types occur together`,
            signature: { events: uniqueTypes, time_window: timeWindow } as any,
            confidence_score: this.calculateConfidence(correlatedObs.length),
            occurrence_count: 1,
            first_seen_at: correlatedObs[0].observed_at,
            last_seen_at: correlatedObs[correlatedObs.length - 1].observed_at,
            metadata: {},
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Extract key properties from payload
   */
  private extractKeyProperties(payload: Record<string, any>): Record<string, any> {
    const keyProperties: Record<string, any> = {};
    const importantFields = ['status', 'code', 'type', 'severity', 'result'];

    for (const field of importantFields) {
      if (payload[field] !== undefined) {
        keyProperties[field] = payload[field];
      }
    }

    return keyProperties;
  }

  /**
   * Calculate time constraints for a sequence
   */
  private calculateTimeConstraints(sequence: Observation[]): { maxTimeBetween: string } | undefined {
    if (sequence.length < 2) return undefined;

    const timeDiffs: number[] = [];
    for (let i = 1; i < sequence.length; i++) {
      timeDiffs.push(sequence[i].observed_at.getTime() - sequence[i - 1].observed_at.getTime());
    }

    const maxDiff = Math.max(...timeDiffs);
    const seconds = Math.ceil(maxDiff / 1000);

    return { maxTimeBetween: `${seconds} seconds` };
  }

  /**
   * Generate pattern name
   */
  private generatePatternName(signature: PatternSignature, type: string): string {
    const eventTypes = signature.events.map(e => e.type).join(' → ');
    return `${type}: ${eventTypes}`;
  }

  /**
   * Calculate pattern confidence
   */
  private calculateConfidence(occurrences: number): number {
    // Confidence increases with occurrences, capped at 95
    return Math.min(95, 50 + occurrences * 5);
  }

  /**
   * Find similar existing pattern
   */
  private async findSimilarPattern(signature: PatternSignature, type: string): Promise<Pattern | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('patterns')
        .select('*')
        .eq('pattern_type', type)
        .eq('status', 'active');

      if (error || !data) return null;

      // Simple similarity check based on event types
      const signatureTypes = signature.events.map(e => e.type).join(',');

      for (const pattern of data) {
        const patternTypes = pattern.signature.events?.map((e: any) => e.type).join(',');
        if (patternTypes === signatureTypes) {
          return pattern;
        }
      }

      return null;
    } catch (error) {
      logger.error('Failed to find similar pattern', { error });
      return null;
    }
  }

  /**
   * Increment pattern occurrence
   */
  private async incrementPatternOccurrence(patternId: string): Promise<void> {
    if (!supabase) return;

    try {
      const { error } = await supabase.rpc('increment_pattern_occurrence', {
        pattern_id: patternId,
      });

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to increment pattern occurrence', { error, patternId });
    }
  }

  /**
   * Store pattern in database
   */
  private async storePattern(pattern: Pattern): Promise<void> {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('patterns')
        .insert([pattern]);

      if (error) throw error;

      logger.debug('Pattern stored', { id: pattern.id, name: pattern.name });
    } catch (error) {
      logger.error('Failed to store pattern', { error });
    }
  }

  /**
   * Match observations against known patterns
   */
  async matchPatterns(observation: Observation): Promise<PatternMatch[]> {
    if (!supabase) return [];

    try {
      const { data: patterns, error } = await supabase
        .from('patterns')
        .select('*')
        .eq('status', 'active');

      if (error || !patterns) return [];

      const matches: PatternMatch[] = [];

      for (const pattern of patterns) {
        const matchScore = this.calculateMatchScore(observation, pattern);
        
        if (matchScore >= config.patternAnalysis.minConfidence * 100) {
          matches.push({
            pattern_id: pattern.id,
            observation_id: observation.id,
            match_score: matchScore,
            detected_at: new Date(),
          });
        }
      }

      return matches;
    } catch (error) {
      logger.error('Failed to match patterns', { error });
      return [];
    }
  }

  /**
   * Calculate match score between observation and pattern
   */
  private calculateMatchScore(observation: Observation, pattern: Pattern): number {
    let score = 0;

    // Check observation type match
    if (pattern.signature.event_type === observation.observation_type) {
      score += 50;
    }

    // Check severity match
    if (pattern.signature.severity === observation.severity) {
      score += 25;
    }

    // Check tags overlap
    if (pattern.signature.tags && observation.tags) {
      const overlap = observation.tags.filter((tag: string) => 
        pattern.signature.tags?.includes(tag)
      ).length;
      score += (overlap / Math.max(pattern.signature.tags.length, 1)) * 25;
    }

    return Math.min(100, score);
  }
}
