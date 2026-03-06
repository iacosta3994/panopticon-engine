import logger from '../lib/logger';
import { config } from '../lib/config';
import supabase from '../lib/supabase';
import { DataSource, Observation, Severity } from '../lib/types';
import { generateId } from '../lib/utils';
import { DataSourceConnector } from './DataSourceConnector';
import { AnomalyDetector } from './AnomalyDetector';
import { ThresholdManager } from './ThresholdManager';

export class MonitoringService {
  private connectors: Map<string, DataSourceConnector> = new Map();
  private anomalyDetector: AnomalyDetector;
  private thresholdManager: ThresholdManager;
  private scanInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.anomalyDetector = new AnomalyDetector();
    this.thresholdManager = new ThresholdManager();
  }

  /**
   * Initialize monitoring service
   */
  async initialize(): Promise<void> {
    logger.info('Initializing Monitoring Service');

    try {
      // Load all active data sources
      const sources = await this.loadDataSources();
      
      logger.info(`Loaded ${sources.length} data sources`);

      // Initialize connectors for each source
      for (const source of sources) {
        await this.registerDataSource(source);
      }

      // Start periodic scanning
      this.startScanning();

      logger.info('Monitoring Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Monitoring Service', { error });
      throw error;
    }
  }

  /**
   * Load active data sources from database
   */
  private async loadDataSources(): Promise<DataSource[]> {
    if (!supabase) {
      logger.warn('Supabase not configured, returning empty data sources');
      return [];
    }

    const { data, error } = await supabase
      .from('data_sources')
      .select('*')
      .eq('status', 'active');

    if (error) {
      logger.error('Error loading data sources', { error });
      throw error;
    }

    return data || [];
  }

  /**
   * Register a data source for monitoring
   */
  async registerDataSource(source: DataSource): Promise<void> {
    try {
      const connector = new DataSourceConnector(source);
      await connector.initialize();
      
      this.connectors.set(source.id, connector);
      
      logger.info(`Registered data source: ${source.name}`, {
        id: source.id,
        type: source.source_type,
      });
    } catch (error) {
      logger.error(`Failed to register data source: ${source.name}`, { error });
    }
  }

  /**
   * Start periodic scanning of all data sources
   */
  private startScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }

    this.scanInterval = setInterval(
      () => this.scanAllSources(),
      config.monitoring.scanIntervalMs
    );

    logger.info(`Started scanning with interval: ${config.monitoring.scanIntervalMs}ms`);
  }

  /**
   * Scan all registered data sources
   */
  async scanAllSources(): Promise<void> {
    logger.debug('Starting scan of all data sources');

    const scanPromises = Array.from(this.connectors.values()).map(connector =>
      this.scanDataSource(connector)
    );

    const results = await Promise.allSettled(scanPromises);

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    logger.info('Scan completed', { successful, failed, total: results.length });
  }

  /**
   * Scan a single data source
   */
  private async scanDataSource(connector: DataSourceConnector): Promise<void> {
    try {
      const observations = await connector.collect();
      
      logger.debug(`Collected ${observations.length} observations from ${connector.source.name}`);

      for (const observation of observations) {
        await this.processObservation(observation, connector.source);
      }

      // Update source health
      await this.updateSourceHealth(connector.source.id, 100);
    } catch (error) {
      logger.error(`Failed to scan data source: ${connector.source.name}`, { error });
      await this.updateSourceHealth(connector.source.id, 0);
    }
  }

  /**
   * Process a single observation
   */
  private async processObservation(
    rawData: Record<string, any>,
    source: DataSource
  ): Promise<void> {
    try {
      // Create observation record
      const observation: Partial<Observation> = {
        id: generateId(),
        source_id: source.id,
        observation_type: rawData.type || 'unknown',
        severity: this.determineSeverity(rawData),
        payload: rawData,
        metadata: {
          source_name: source.name,
          collected_at: new Date().toISOString(),
        },
        tags: this.extractTags(rawData),
        observed_at: new Date(rawData.timestamp || Date.now()),
        processed: false,
        created_at: new Date(),
      };

      // Check for anomalies
      if (config.monitoring.anomalyDetectionEnabled) {
        const anomalyResult = await this.anomalyDetector.detect(observation);
        
        if (anomalyResult.isAnomaly) {
          observation.severity = 'high';
          observation.metadata = {
            ...observation.metadata,
            anomaly: anomalyResult,
          };
          
          logger.warn('Anomaly detected', {
            observation: observation.id,
            score: anomalyResult.score,
          });
        }
      }

      // Store observation
      await this.storeObservation(observation);

      logger.debug('Observation processed', {
        id: observation.id,
        type: observation.observation_type,
        severity: observation.severity,
      });
    } catch (error) {
      logger.error('Failed to process observation', { error, rawData });
    }
  }

  /**
   * Determine severity based on observation data
   */
  private determineSeverity(data: Record<string, any>): Severity {
    if (data.severity) {
      return data.severity as Severity;
    }

    // Apply heuristics based on data content
    if (data.error || data.exception) return 'high';
    if (data.warning) return 'medium';
    if (data.info) return 'low';
    
    return 'info';
  }

  /**
   * Extract tags from observation data
   */
  private extractTags(data: Record<string, any>): string[] {
    const tags: string[] = [];

    if (data.tags && Array.isArray(data.tags)) {
      tags.push(...data.tags);
    }

    // Extract tags from common fields
    if (data.error) tags.push('error');
    if (data.warning) tags.push('warning');
    if (data.service) tags.push(`service:${data.service}`);
    if (data.environment) tags.push(`env:${data.environment}`);

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Store observation in database
   */
  private async storeObservation(observation: Partial<Observation>): Promise<void> {
    if (!supabase) {
      logger.warn('Supabase not configured, skipping observation storage');
      return;
    }

    const { error } = await supabase
      .from('observations')
      .insert([observation]);

    if (error) {
      logger.error('Failed to store observation', { error });
      throw error;
    }
  }

  /**
   * Update data source health score
   */
  private async updateSourceHealth(sourceId: string, healthScore: number): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase
      .from('data_sources')
      .update({
        health_score: healthScore,
        last_check_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sourceId);

    if (error) {
      logger.error('Failed to update source health', { error, sourceId });
    }
  }

  /**
   * Stop monitoring service
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down Monitoring Service');

    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }

    // Disconnect all connectors
    for (const connector of this.connectors.values()) {
      await connector.disconnect();
    }

    this.connectors.clear();

    logger.info('Monitoring Service shut down successfully');
  }

  /**
   * Get monitoring statistics
   */
  async getStatistics(): Promise<Record<string, any>> {
    return {
      activeSources: this.connectors.size,
      scanInterval: config.monitoring.scanIntervalMs,
      anomalyDetectionEnabled: config.monitoring.anomalyDetectionEnabled,
    };
  }
}
