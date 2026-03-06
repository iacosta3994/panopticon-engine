import logger from '../lib/logger';
import supabase from '../lib/supabase';
import { MonitoringRule } from '../lib/types';
import * as stats from 'simple-statistics';

interface ThresholdConfig {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: number;
  autoAdjust: boolean;
}

export class ThresholdManager {
  private thresholds: Map<string, ThresholdConfig> = new Map();
  private historicalMetrics: Map<string, number[]> = new Map();

  /**
   * Initialize threshold manager
   */
  async initialize(): Promise<void> {
    logger.info('Initializing Threshold Manager');
    await this.loadThresholdsFromRules();
  }

  /**
   * Load thresholds from monitoring rules
   */
  private async loadThresholdsFromRules(): Promise<void> {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('monitoring_rules')
        .select('*')
        .eq('enabled', true)
        .eq('rule_type', 'threshold');

      if (error) throw error;

      for (const rule of data || []) {
        const conditions = rule.conditions as any;
        if (conditions.metric && conditions.threshold) {
          this.setThreshold(rule.id, {
            metric: conditions.metric,
            operator: conditions.operator || '>',
            value: conditions.threshold,
            autoAdjust: conditions.auto_adjust || false,
          });
        }
      }

      logger.info(`Loaded ${this.thresholds.size} threshold configurations`);
    } catch (error) {
      logger.error('Failed to load thresholds', { error });
    }
  }

  /**
   * Set a threshold configuration
   */
  setThreshold(id: string, config: ThresholdConfig): void {
    this.thresholds.set(id, config);
    logger.debug('Threshold configured', { id, config });
  }

  /**
   * Check if a value exceeds threshold
   */
  checkThreshold(ruleId: string, value: number): boolean {
    const config = this.thresholds.get(ruleId);
    if (!config) return false;

    // Record metric value for auto-adjustment
    this.recordMetricValue(config.metric, value);

    // Evaluate threshold
    const result = this.evaluateThreshold(value, config);

    if (result) {
      logger.info('Threshold exceeded', {
        ruleId,
        metric: config.metric,
        value,
        threshold: config.value,
        operator: config.operator,
      });
    }

    return result;
  }

  /**
   * Evaluate threshold condition
   */
  private evaluateThreshold(value: number, config: ThresholdConfig): boolean {
    switch (config.operator) {
      case '>':
        return value > config.value;
      case '<':
        return value < config.value;
      case '>=':
        return value >= config.value;
      case '<=':
        return value <= config.value;
      case '==':
        return value === config.value;
      case '!=':
        return value !== config.value;
      default:
        return false;
    }
  }

  /**
   * Record metric value for historical tracking
   */
  private recordMetricValue(metric: string, value: number): void {
    const history = this.historicalMetrics.get(metric) || [];
    history.push(value);

    // Keep only last 1000 values
    if (history.length > 1000) {
      history.shift();
    }

    this.historicalMetrics.set(metric, history);
  }

  /**
   * Auto-adjust thresholds based on historical data
   */
  async autoAdjustThresholds(): Promise<void> {
    logger.info('Running auto-adjustment of thresholds');

    for (const [ruleId, config] of this.thresholds.entries()) {
      if (!config.autoAdjust) continue;

      const history = this.historicalMetrics.get(config.metric);
      if (!history || history.length < 100) continue;

      try {
        const newThreshold = this.calculateOptimalThreshold(history, config.operator);
        
        if (newThreshold !== config.value) {
          logger.info('Adjusting threshold', {
            ruleId,
            metric: config.metric,
            oldThreshold: config.value,
            newThreshold,
          });

          config.value = newThreshold;
          await this.updateThresholdInDatabase(ruleId, newThreshold);
        }
      } catch (error) {
        logger.error('Failed to auto-adjust threshold', { error, ruleId });
      }
    }
  }

  /**
   * Calculate optimal threshold based on statistical analysis
   */
  private calculateOptimalThreshold(history: number[], operator: string): number {
    const mean = stats.mean(history);
    const stdDev = stats.standardDeviation(history);
    const q95 = stats.quantile(history, 0.95);
    const q05 = stats.quantile(history, 0.05);

    // For upper thresholds, use 95th percentile or mean + 2σ
    if (operator === '>' || operator === '>=') {
      return Math.max(q95, mean + 2 * stdDev);
    }

    // For lower thresholds, use 5th percentile or mean - 2σ
    if (operator === '<' || operator === '<=') {
      return Math.min(q05, mean - 2 * stdDev);
    }

    return mean;
  }

  /**
   * Update threshold in database
   */
  private async updateThresholdInDatabase(ruleId: string, newThreshold: number): Promise<void> {
    if (!supabase) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('monitoring_rules')
        .select('conditions')
        .eq('id', ruleId)
        .single();

      if (fetchError) throw fetchError;

      const conditions = data.conditions as any;
      conditions.threshold = newThreshold;

      const { error: updateError } = await supabase
        .from('monitoring_rules')
        .update({
          conditions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ruleId);

      if (updateError) throw updateError;
    } catch (error) {
      logger.error('Failed to update threshold in database', { error, ruleId });
      throw error;
    }
  }

  /**
   * Get current threshold value
   */
  getThreshold(ruleId: string): number | undefined {
    return this.thresholds.get(ruleId)?.value;
  }

  /**
   * Get all thresholds
   */
  getAllThresholds(): Map<string, ThresholdConfig> {
    return new Map(this.thresholds);
  }

  /**
   * Get threshold statistics
   */
  getStatistics(metric: string): Record<string, any> | null {
    const history = this.historicalMetrics.get(metric);
    if (!history || history.length === 0) return null;

    return {
      count: history.length,
      mean: stats.mean(history),
      median: stats.median(history),
      stdDev: stats.standardDeviation(history),
      min: stats.min(history),
      max: stats.max(history),
      q25: stats.quantile(history, 0.25),
      q75: stats.quantile(history, 0.75),
      q95: stats.quantile(history, 0.95),
    };
  }
}
