import logger from '../lib/logger';
import supabase from '../lib/supabase';
import { TemporalTrend } from '../lib/types';
import * as stats from 'simple-statistics';
import { subHours, subDays } from 'date-fns';

interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

export class TemporalAnalyzer {
  /**
   * Analyze temporal trends in metrics
   */
  async analyzeTrend(
    metricName: string,
    timeRange: 'hour' | 'day' | 'week' = 'day'
  ): Promise<TemporalTrend | null> {
    try {
      const dataPoints = await this.fetchTimeSeriesData(metricName, timeRange);
      
      if (dataPoints.length < 2) {
        logger.warn('Insufficient data for trend analysis', { metricName, points: dataPoints.length });
        return null;
      }

      const trend = this.calculateTrend(dataPoints);
      const forecast = this.generateForecast(dataPoints, 10);

      return {
        metric: metricName,
        direction: trend.direction,
        slope: trend.slope,
        confidence: trend.confidence,
        dataPoints,
        forecast,
      };
    } catch (error) {
      logger.error('Failed to analyze trend', { error, metricName });
      return null;
    }
  }

  /**
   * Fetch time series data from database
   */
  private async fetchTimeSeriesData(
    metricName: string,
    timeRange: 'hour' | 'day' | 'week'
  ): Promise<TimeSeriesPoint[]> {
    if (!supabase) return [];

    const now = new Date();
    const startTime = this.getStartTime(now, timeRange);

    const { data, error } = await supabase
      .from('metrics')
      .select('value, recorded_at')
      .eq('metric_name', metricName)
      .gte('recorded_at', startTime.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) {
      logger.error('Failed to fetch time series data', { error });
      return [];
    }

    return (data || []).map(row => ({
      timestamp: new Date(row.recorded_at),
      value: row.value,
    }));
  }

  /**
   * Calculate start time based on range
   */
  private getStartTime(now: Date, timeRange: string): Date {
    switch (timeRange) {
      case 'hour':
        return subHours(now, 1);
      case 'day':
        return subDays(now, 1);
      case 'week':
        return subDays(now, 7);
      default:
        return subDays(now, 1);
    }
  }

  /**
   * Calculate trend from data points
   */
  private calculateTrend(dataPoints: TimeSeriesPoint[]): {
    direction: 'increasing' | 'decreasing' | 'stable';
    slope: number;
    confidence: number;
  } {
    // Convert timestamps to numeric values (hours since first point)
    const firstTimestamp = dataPoints[0].timestamp.getTime();
    const x = dataPoints.map(p => (p.timestamp.getTime() - firstTimestamp) / (1000 * 60 * 60));
    const y = dataPoints.map(p => p.value);

    // Calculate linear regression
    const regression = stats.linearRegression([x, y]);
    const slope = regression.m;
    const rSquared = stats.rSquared([x, y], stats.linearRegressionLine(regression));

    // Determine direction
    let direction: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(slope) < 0.01) {
      direction = 'stable';
    } else if (slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    return {
      direction,
      slope,
      confidence: rSquared,
    };
  }

  /**
   * Generate forecast using simple linear extrapolation
   */
  private generateForecast(
    dataPoints: TimeSeriesPoint[],
    periods: number
  ): Array<{ timestamp: Date; value: number; confidence_interval: [number, number] }> {
    if (dataPoints.length < 2) return [];

    const firstTimestamp = dataPoints[0].timestamp.getTime();
    const x = dataPoints.map(p => (p.timestamp.getTime() - firstTimestamp) / (1000 * 60 * 60));
    const y = dataPoints.map(p => p.value);

    const regression = stats.linearRegression([x, y]);
    const stdError = this.calculateStandardError(x, y, regression);

    const lastTimestamp = dataPoints[dataPoints.length - 1].timestamp;
    const timeStep = this.calculateAverageTimeStep(dataPoints);

    const forecast: Array<{ timestamp: Date; value: number; confidence_interval: [number, number] }> = [];

    for (let i = 1; i <= periods; i++) {
      const forecastTimestamp = new Date(lastTimestamp.getTime() + timeStep * i);
      const xValue = x[x.length - 1] + (timeStep / (1000 * 60 * 60)) * i;
      const predictedValue = regression.m * xValue + regression.b;

      // 95% confidence interval
      const margin = 1.96 * stdError;

      forecast.push({
        timestamp: forecastTimestamp,
        value: predictedValue,
        confidence_interval: [predictedValue - margin, predictedValue + margin],
      });
    }

    return forecast;
  }

  /**
   * Calculate standard error of regression
   */
  private calculateStandardError(
    x: number[],
    y: number[],
    regression: { m: number; b: number }
  ): number {
    const predicted = x.map(xi => regression.m * xi + regression.b);
    const residuals = y.map((yi, i) => yi - predicted[i]);
    const sumSquaredResiduals = residuals.reduce((sum, r) => sum + r * r, 0);
    return Math.sqrt(sumSquaredResiduals / (y.length - 2));
  }

  /**
   * Calculate average time step between data points
   */
  private calculateAverageTimeStep(dataPoints: TimeSeriesPoint[]): number {
    if (dataPoints.length < 2) return 60 * 60 * 1000; // Default 1 hour

    const diffs = [];
    for (let i = 1; i < dataPoints.length; i++) {
      diffs.push(dataPoints[i].timestamp.getTime() - dataPoints[i - 1].timestamp.getTime());
    }

    return stats.mean(diffs);
  }

  /**
   * Detect seasonality patterns
   */
  async detectSeasonality(metricName: string, period: number = 24): Promise<boolean> {
    const dataPoints = await this.fetchTimeSeriesData(metricName, 'week');
    
    if (dataPoints.length < period * 2) {
      logger.warn('Insufficient data for seasonality detection');
      return false;
    }

    // Simple autocorrelation check
    const values = dataPoints.map(p => p.value);
    const autocorr = this.calculateAutocorrelation(values, period);

    // Threshold for significant autocorrelation
    return Math.abs(autocorr) > 0.5;
  }

  /**
   * Calculate autocorrelation at a given lag
   */
  private calculateAutocorrelation(values: number[], lag: number): number {
    if (lag >= values.length) return 0;

    const mean = stats.mean(values);
    const variance = stats.variance(values);

    let sum = 0;
    for (let i = 0; i < values.length - lag; i++) {
      sum += (values[i] - mean) * (values[i + lag] - mean);
    }

    return sum / ((values.length - lag) * variance);
  }

  /**
   * Detect change points in time series
   */
  async detectChangePoints(metricName: string): Promise<Date[]> {
    const dataPoints = await this.fetchTimeSeriesData(metricName, 'week');
    
    if (dataPoints.length < 10) return [];

    const changePoints: Date[] = [];
    const windowSize = 5;

    for (let i = windowSize; i < dataPoints.length - windowSize; i++) {
      const beforeWindow = dataPoints.slice(i - windowSize, i).map(p => p.value);
      const afterWindow = dataPoints.slice(i, i + windowSize).map(p => p.value);

      const beforeMean = stats.mean(beforeWindow);
      const afterMean = stats.mean(afterWindow);
      const pooledStd = Math.sqrt(
        (stats.variance(beforeWindow) + stats.variance(afterWindow)) / 2
      );

      // T-test for significant difference
      const tStat = Math.abs(beforeMean - afterMean) / (pooledStd * Math.sqrt(2 / windowSize));

      if (tStat > 2.0) {
        // Significant change detected
        changePoints.push(dataPoints[i].timestamp);
      }
    }

    logger.info('Change points detected', { metricName, count: changePoints.length });
    return changePoints;
  }
}
