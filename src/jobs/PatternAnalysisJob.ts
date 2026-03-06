import logger from '../lib/logger';
import supabase from '../lib/supabase';
import { PatternSynthesizer } from '../meaning/PatternSynthesizer';
import { Observation } from '../lib/types';

export class PatternAnalysisJob {
  private synthesizer: PatternSynthesizer;

  constructor() {
    this.synthesizer = new PatternSynthesizer();
  }

  async execute(): Promise<void> {
    try {
      logger.debug('Starting pattern analysis job');

      // Get unprocessed observations
      const observations = await this.getUnprocessedObservations();

      if (observations.length === 0) {
        logger.debug('No unprocessed observations found');
        return;
      }

      logger.info(`Analyzing ${observations.length} observations for patterns`);

      // Synthesize patterns
      const patterns = await this.synthesizer.synthesizePatterns(observations);

      logger.info(`Pattern analysis completed`, { patternsFound: patterns.length });

      // Mark observations as processed
      await this.markObservationsProcessed(observations.map(o => o.id));

    } catch (error) {
      logger.error('Pattern analysis job failed', { error });
      throw error;
    }
  }

  private async getUnprocessedObservations(): Promise<Observation[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .eq('processed', false)
        .order('observed_at', { ascending: true })
        .limit(1000);

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch unprocessed observations', { error });
      return [];
    }
  }

  private async markObservationsProcessed(ids: string[]): Promise<void> {
    if (!supabase || ids.length === 0) return;

    try {
      const { error } = await supabase
        .from('observations')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .in('id', ids);

      if (error) throw error;

      logger.debug(`Marked ${ids.length} observations as processed`);
    } catch (error) {
      logger.error('Failed to mark observations as processed', { error });
    }
  }
}
