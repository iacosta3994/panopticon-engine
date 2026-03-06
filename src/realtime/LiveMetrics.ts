import { Server as SocketIOServer } from 'socket.io';
import logger from '../lib/logger';
import supabase from '../lib/supabase';
import { Socket } from 'socket.io';

export class LiveMetrics {
  private io: SocketIOServer;
  private broadcastInterval: NodeJS.Timeout | null = null;
  private updateIntervalMs: number = 5000; // 5 seconds

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Start broadcasting metrics
   */
  startBroadcasting(): void {
    if (this.broadcastInterval) {
      logger.warn('Metrics broadcasting already started');
      return;
    }

    this.broadcastInterval = setInterval(
      () => this.broadcastMetrics(),
      this.updateIntervalMs
    );

    logger.info('Started broadcasting live metrics', {
      interval: this.updateIntervalMs,
    });
  }

  /**
   * Stop broadcasting metrics
   */
  stopBroadcasting(): void {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
      logger.info('Stopped broadcasting live metrics');
    }
  }

  /**
   * Broadcast current metrics
   */
  private async broadcastMetrics(): Promise<void> {
    try {
      const metrics = await this.collectMetrics();
      this.io.to('metrics').emit('metrics:update', metrics);
      
      logger.debug('Metrics broadcasted', { metricCount: Object.keys(metrics).length });
    } catch (error) {
      logger.error('Failed to broadcast metrics', { error });
    }
  }

  /**
   * Collect current system metrics
   */
  private async collectMetrics(): Promise<Record<string, any>> {
    if (!supabase) {
      return this.getMockMetrics();
    }

    try {
      // Get observation count (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { count: obsCount } = await supabase
        .from('observations')
        .select('*', { count: 'exact', head: true })
        .gte('observed_at', oneHourAgo.toISOString());

      // Get active alerts
      const { count: alertCount } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'acknowledged']);

      // Get patterns detected (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const { count: patternCount } = await supabase
        .from('patterns')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo.toISOString());

      // Get data source health
      const { data: sources } = await supabase
        .from('data_sources')
        .select('health_score')
        .eq('status', 'active');

      const avgHealth = sources && sources.length > 0
        ? sources.reduce((sum, s) => sum + s.health_score, 0) / sources.length
        : 100;

      return {
        observations: {
          lastHour: obsCount || 0,
          rate: ((obsCount || 0) / 60).toFixed(2), // per minute
        },
        alerts: {
          active: alertCount || 0,
        },
        patterns: {
          detected: patternCount || 0,
        },
        health: {
          average: avgHealth.toFixed(2),
          status: avgHealth > 90 ? 'healthy' : avgHealth > 70 ? 'degraded' : 'unhealthy',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to collect metrics', { error });
      return this.getMockMetrics();
    }
  }

  /**
   * Get mock metrics for development
   */
  private getMockMetrics(): Record<string, any> {
    return {
      observations: {
        lastHour: 1234,
        rate: 20.57,
      },
      alerts: {
        active: 5,
      },
      patterns: {
        detected: 12,
      },
      health: {
        average: 98.5,
        status: 'healthy',
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Send metrics to specific client
   */
  async sendMetricsToClient(socket: Socket): Promise<void> {
    try {
      const metrics = await this.collectMetrics();
      socket.emit('metrics:update', metrics);
    } catch (error) {
      logger.error('Failed to send metrics to client', { error });
    }
  }

  /**
   * Set update interval
   */
  setUpdateInterval(ms: number): void {
    this.updateIntervalMs = ms;
    
    if (this.broadcastInterval) {
      this.stopBroadcasting();
      this.startBroadcasting();
    }
    
    logger.info('Metrics update interval changed', { intervalMs: ms });
  }
}
