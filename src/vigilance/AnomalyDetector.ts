import * as stats from 'simple-statistics';
import logger from '../lib/logger';
import { config } from '../lib/config';
import supabase from '../lib/supabase';
import { Observation, AnomalyResult } from '../lib/types';

export class AnomalyDetector {
  private historicalData: Map<string, number[]> = new Map();
  private readonly maxHistorySize = 1000;

  /**
   * Detect anomalies in an observation
   */
  async detect(observation: Partial<Observation>): Promise<AnomalyResult> {
    try {
      // Extract numeric value from observation
      const value = this.extractNumericValue(observation);
      if (value === null) {
        return this.noAnomalyResult(value || 0);
      }

      const metricKey = `${observation.source_id}:${observation.observation_type}`;
      
      // Get historical data
      const history = await this.getHistoricalData(metricKey, observation);
      
      if (history.length < 10) {
        // Not enough data for anomaly detection
        this.updateHistory(metricKey, value);
        return this.noAnomalyResult(value);
      }

      // Perform multiple anomaly detection methods
      const zScoreResult = this.zScoreDetection(value, history);
      const iqrResult = this.iqrDetection(value, history);
      const maResult = this.movingAverageDetection(value, history);

      // Combine results
      const isAnomaly = zScoreResult.isAnomaly || iqrResult.isAnomaly || maResult.isAnomaly;
      const maxScore = Math.max(zScoreResult.score, iqrResult.score, maResult.score);

      // Update historical data
      this.updateHistory(metricKey, value);

      const result: AnomalyResult = {
        isAnomaly,
        score: maxScore,
        threshold: config.monitoring.anomalyThresholdSigma,
        value,
        expectedValue: stats.mean(history),
        confidence: this.calculateConfidence(history.length),
        method: isAnomaly ? this.getDetectionMethod(zScoreResult, iqrResult, maResult) : 'none',
      };

      if (isAnomaly) {
        logger.info('Anomaly detected', {
          metricKey,
          value,
          expectedValue: result.expectedValue,
          score: result.score,
          method: result.method,
        });
      }

      return result;
    } catch (error) {
      logger.error('Error in anomaly detection', { error });
      return this.noAnomalyResult(0);
    }
  }

  /**
   * Extract numeric value from observation
   */
  private extractNumericValue(observation: Partial<Observation>): number | null {
    const payload = observation.payload || {};

    // Try common numeric fields
    const numericFields = ['value', 'count', 'duration', 'latency', 'size', 'rate'];
    
    for (const field of numericFields) {
      if (typeof payload[field] === 'number') {
        return payload[field];
      }
    }

    return null;
  }

  /**
   * Z-Score based anomaly detection
   */
  private zScoreDetection(value: number, history: number[]): { isAnomaly: boolean; score: number } {
    const mean = stats.mean(history);
    const stdDev = stats.standardDeviation(history);

    if (stdDev === 0) {
      return { isAnomaly: false, score: 0 };
    }

    const zScore = Math.abs((value - mean) / stdDev);
    const isAnomaly = zScore > config.monitoring.anomalyThresholdSigma;

    return { isAnomaly, score: zScore };
  }

  /**
   * Interquartile Range (IQR) based anomaly detection
   */
  private iqrDetection(value: number, history: number[]): { isAnomaly: boolean; score: number } {
    const sorted = [...history].sort((a, b) => a - b);
    const q1 = stats.quantile(sorted, 0.25);
    const q3 = stats.quantile(sorted, 0.75);
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const isAnomaly = value < lowerBound || value > upperBound;
    const score = isAnomaly ? Math.abs(value - stats.median(sorted)) / (iqr || 1) : 0;

    return { isAnomaly, score };
  }

  /**
   * Moving Average based anomaly detection
   */
  private movingAverageDetection(
    value: number,
    history: number[]
  ): { isAnomaly: boolean; score: number } {
    const windowSize = Math.min(20, Math.floor(history.length / 2));
    const recentHistory = history.slice(-windowSize);
    const movingAvg = stats.mean(recentHistory);
    const movingStd = stats.standardDeviation(recentHistory);

    if (movingStd === 0) {
      return { isAnomaly: false, score: 0 };
    }

    const deviation = Math.abs(value - movingAvg) / movingStd;
    const isAnomaly = deviation > config.monitoring.anomalyThresholdSigma;

    return { isAnomaly, score: deviation };
  }

  /**
   * Get historical data for a metric
   */
  private async getHistoricalData(
    metricKey: string,
    observation: Partial<Observation>
  ): Promise<number[]> {
    // Check in-memory cache first
    if (this.historicalData.has(metricKey)) {
      return this.historicalData.get(metricKey)!;
    }

    // Load from database
    if (!supabase) {
      return [];
    }

    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('observations')
        .select('payload')
        .eq('source_id', observation.source_id)
        .eq('observation_type', observation.observation_type)
        .gte('observed_at', oneDayAgo.toISOString())
        .order('observed_at', { ascending: false })
        .limit(this.maxHistorySize);

      if (error) throw error;

      const values = (data || [])
        .map(obs => this.extractNumericValue({ payload: obs.payload }))
        .filter((v): v is number => v !== null);

      this.historicalData.set(metricKey, values);
      return values;
    } catch (error) {
      logger.error('Failed to load historical data', { error, metricKey });
      return [];
    }
  }

  /**
   * Update in-memory historical data
   */
  private updateHistory(metricKey: string, value: number): void {
    const history = this.historicalData.get(metricKey) || [];
    history.unshift(value);

    // Keep only recent history
    if (history.length > this.maxHistorySize) {
      history.pop();
    }

    this.historicalData.set(metricKey, history);
  }

  /**
   * Calculate confidence based on sample size
   */
  private calculateConfidence(sampleSize: number): number {
    // Confidence increases with sample size, capped at 0.95
    return Math.min(0.95, sampleSize / 100);
  }

  /**
   * Determine which method detected the anomaly
   */
  private getDetectionMethod(
    zScore: { isAnomaly: boolean },
    iqr: { isAnomaly: boolean },
    ma: { isAnomaly: boolean }
  ): string {
    const methods: string[] = [];
    if (zScore.isAnomaly) methods.push('z-score');
    if (iqr.isAnomaly) methods.push('iqr');
    if (ma.isAnomaly) methods.push('moving-average');
    return methods.join(', ');
  }

  /**
   * Create a no-anomaly result
   */
  private noAnomalyResult(value: number): AnomalyResult {
    return {
      isAnomaly: false,
      score: 0,
      threshold: config.monitoring.anomalyThresholdSigma,
      value,
      expectedValue: value,
      confidence: 0,
      method: 'none',
    };
  }

  /**
   * Clear historical data cache
   */
  clearCache(): void {
    this.historicalData.clear();
    logger.info('Anomaly detector cache cleared');
  }
}
