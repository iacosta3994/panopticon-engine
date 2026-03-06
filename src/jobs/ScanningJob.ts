import logger from '../lib/logger';
import { MonitoringService } from '../vigilance/MonitoringService';

export class ScanningJob {
  private monitoringService: MonitoringService | null = null;
  private isRunning = false;

  async execute(): Promise<void> {
    if (this.isRunning) {
      logger.debug('Scanning job already running, skipping');
      return;
    }

    this.isRunning = true;

    try {
      // Initialize monitoring service if needed
      if (!this.monitoringService) {
        this.monitoringService = new MonitoringService();
        await this.monitoringService.initialize();
      }

      // Scan all data sources
      await this.monitoringService.scanAllSources();

      logger.debug('Scanning job completed');
    } catch (error) {
      logger.error('Scanning job failed', { error });
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  async cleanup(): Promise<void> {
    if (this.monitoringService) {
      await this.monitoringService.shutdown();
      this.monitoringService = null;
    }
  }
}
