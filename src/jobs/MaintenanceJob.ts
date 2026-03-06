import logger from '../lib/logger';
import supabase from '../lib/supabase';
import { config } from '../lib/config';

export class MaintenanceJob {
  async execute(): Promise<void> {
    try {
      logger.info('Starting maintenance job');

      await this.cleanupOldObservations();
      await this.cleanupOldMetrics();
      await this.archiveResolvedAlerts();
      await this.updateSystemHealth();

      logger.info('Maintenance job completed');
    } catch (error) {
      logger.error('Maintenance job failed', { error });
      throw error;
    }
  }

  private async cleanupOldObservations(): Promise<void> {
    if (!supabase) return;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.cleanup.retentionDays);

      const { count, error } = await supabase
        .from('observations')
        .delete({ count: 'exact' })
        .eq('processed', true)
        .lt('observed_at', cutoffDate.toISOString());

      if (error) throw error;

      logger.info(`Cleaned up ${count} old observations`);
    } catch (error) {
      logger.error('Failed to cleanup old observations', { error });
    }
  }

  private async cleanupOldMetrics(): Promise<void> {
    if (!supabase) return;

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.cleanup.retentionDays);

      const { count, error } = await supabase
        .from('metrics')
        .delete({ count: 'exact' })
        .lt('recorded_at', cutoffDate.toISOString());

      if (error) throw error;

      logger.info(`Cleaned up ${count} old metrics`);
    } catch (error) {
      logger.error('Failed to cleanup old metrics', { error });
    }
  }

  private async archiveResolvedAlerts(): Promise<void> {
    if (!supabase) return;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // In a real implementation, you might move these to an archive table
      const { count, error } = await supabase
        .from('alerts')
        .delete({ count: 'exact' })
        .eq('status', 'resolved')
        .lt('resolved_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      logger.info(`Archived ${count} resolved alerts`);
    } catch (error) {
      logger.error('Failed to archive resolved alerts', { error });
    }
  }

  private async updateSystemHealth(): Promise<void> {
    if (!supabase) return;

    try {
      // Get various system metrics
      const { count: obsCount } = await supabase
        .from('observations')
        .select('*', { count: 'exact', head: true });

      const { count: alertCount } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      const health = {
        id: crypto.randomUUID(),
        component: 'panopticon-engine',
        status: alertCount && alertCount > 100 ? 'degraded' : 'healthy',
        metrics: {
          total_observations: obsCount,
          open_alerts: alertCount,
          timestamp: new Date().toISOString(),
        },
        issues: alertCount && alertCount > 100 ? ['High number of open alerts'] : [],
        checked_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('system_health')
        .insert([health]);

      if (error) throw error;

      logger.info('System health updated', { status: health.status });
    } catch (error) {
      logger.error('Failed to update system health', { error });
    }
  }
}
