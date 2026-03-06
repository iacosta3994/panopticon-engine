import cron from 'node-cron';
import logger from '../lib/logger';
import { config } from '../lib/config';
import { ScanningJob } from './ScanningJob';
import { PatternAnalysisJob } from './PatternAnalysisJob';
import { NotificationProcessor } from './NotificationProcessor';
import { MaintenanceJob } from './MaintenanceJob';

export class JobScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private scanningJob: ScanningJob;
  private patternAnalysisJob: PatternAnalysisJob;
  private notificationProcessor: NotificationProcessor;
  private maintenanceJob: MaintenanceJob;

  constructor() {
    this.scanningJob = new ScanningJob();
    this.patternAnalysisJob = new PatternAnalysisJob();
    this.notificationProcessor = new NotificationProcessor();
    this.maintenanceJob = new MaintenanceJob();
  }

  /**
   * Start all scheduled jobs
   */
  async start(): Promise<void> {
    logger.info('Starting Job Scheduler');

    // Data scanning job - every minute
    this.scheduleJob('scanning', '* * * * *', () => this.scanningJob.execute());

    // Pattern analysis job - every 5 minutes
    this.scheduleJob('pattern_analysis', '*/5 * * * *', () => this.patternAnalysisJob.execute());

    // Notification processing - every 30 seconds
    this.scheduleJob('notifications', '*/30 * * * * *', () => this.notificationProcessor.execute());

    // Maintenance job - daily at 2 AM
    this.scheduleJob('maintenance', '0 2 * * *', () => this.maintenanceJob.execute());

    logger.info(`Scheduled ${this.jobs.size} jobs`);
  }

  /**
   * Schedule a job
   */
  private scheduleJob(name: string, schedule: string, task: () => Promise<void>): void {
    const job = cron.schedule(schedule, async () => {
      logger.debug(`Executing job: ${name}`);
      
      try {
        await task();
        logger.debug(`Job completed: ${name}`);
      } catch (error) {
        logger.error(`Job failed: ${name}`, { error });
      }
    });

    this.jobs.set(name, job);
    logger.info(`Scheduled job: ${name} (${schedule})`);
  }

  /**
   * Stop all scheduled jobs
   */
  stop(): void {
    logger.info('Stopping Job Scheduler');

    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    }

    this.jobs.clear();
  }

  /**
   * Get job status
   */
  getStatus(): Record<string, any> {
    return {
      running: this.jobs.size,
      jobs: Array.from(this.jobs.keys()),
    };
  }
}

// Run scheduler if executed directly
if (require.main === module) {
  const scheduler = new JobScheduler();
  
  scheduler.start().catch(error => {
    logger.error('Failed to start scheduler', { error });
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down...');
    scheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down...');
    scheduler.stop();
    process.exit(0);
  });
}

export default JobScheduler;
