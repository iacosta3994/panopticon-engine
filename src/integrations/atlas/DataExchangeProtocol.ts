import logger from '../../lib/logger';
import { DataExchangeProtocol, AtlasInsight } from './types';
import { generateId } from '../../lib/utils';
import { AtlasMessenger } from './AtlasMessenger';

export class DataExchange {
  private messenger: AtlasMessenger;
  private protocolVersion = '1.0.0';

  constructor(messenger: AtlasMessenger) {
    this.messenger = messenger;
  }

  /**
   * Send insight to Atlas
   */
  async sendInsight(insight: AtlasInsight): Promise<void> {
    try {
      const protocol: DataExchangeProtocol = {
        version: this.protocolVersion,
        messageType: 'insight',
        correlationId: generateId(),
        timestamp: new Date(),
        data: insight,
      };

      await this.messenger.sendMessage({
        type: 'notification',
        priority: this.mapSeverityToPriority(insight.type),
        source: 'panopticon-engine',
        payload: protocol,
      });

      logger.info('Insight sent to Atlas', { insightId: insight.id, type: insight.type });
    } catch (error) {
      logger.error('Failed to send insight to Atlas', { error });
    }
  }

  /**
   * Send pattern discovery to Atlas
   */
  async sendPatternDiscovery(pattern: any): Promise<void> {
    try {
      const protocol: DataExchangeProtocol = {
        version: this.protocolVersion,
        messageType: 'pattern_discovery',
        correlationId: generateId(),
        timestamp: new Date(),
        data: {
          pattern_id: pattern.id,
          pattern_type: pattern.pattern_type,
          name: pattern.name,
          confidence_score: pattern.confidence_score,
          occurrence_count: pattern.occurrence_count,
          signature: pattern.signature,
        },
      };

      await this.messenger.sendMessage({
        type: 'notification',
        priority: pattern.confidence_score > 90 ? 'high' : 'medium',
        source: 'panopticon-engine',
        payload: protocol,
      });

      logger.info('Pattern discovery sent to Atlas', { patternId: pattern.id });
    } catch (error) {
      logger.error('Failed to send pattern discovery to Atlas', { error });
    }
  }

  /**
   * Send anomaly alert to Atlas
   */
  async sendAnomalyAlert(anomaly: any): Promise<void> {
    try {
      const protocol: DataExchangeProtocol = {
        version: this.protocolVersion,
        messageType: 'anomaly_alert',
        correlationId: generateId(),
        timestamp: new Date(),
        data: {
          observation_id: anomaly.observation_id,
          anomaly_score: anomaly.score,
          threshold: anomaly.threshold,
          value: anomaly.value,
          expected_value: anomaly.expectedValue,
          method: anomaly.method,
          confidence: anomaly.confidence,
        },
      };

      await this.messenger.sendMessage({
        type: 'alert',
        priority: 'high',
        source: 'panopticon-engine',
        payload: protocol,
      });

      logger.info('Anomaly alert sent to Atlas');
    } catch (error) {
      logger.error('Failed to send anomaly alert to Atlas', { error });
    }
  }

  /**
   * Request data from Atlas
   */
  async requestData(query: string, parameters?: any): Promise<any> {
    try {
      const protocol: DataExchangeProtocol = {
        version: this.protocolVersion,
        messageType: 'data_request',
        correlationId: generateId(),
        timestamp: new Date(),
        data: {
          query,
          parameters,
        },
      };

      await this.messenger.sendMessage({
        type: 'query',
        priority: 'medium',
        source: 'panopticon-engine',
        payload: protocol,
      });

      logger.info('Data request sent to Atlas', { query });

      // In a real implementation, this would wait for a response
      // For now, we just log the request
      return { status: 'pending', correlationId: protocol.correlationId };
    } catch (error) {
      logger.error('Failed to request data from Atlas', { error });
      return null;
    }
  }

  /**
   * Send health status to Atlas
   */
  async sendHealthStatus(status: any): Promise<void> {
    try {
      const protocol: DataExchangeProtocol = {
        version: this.protocolVersion,
        messageType: 'health_status',
        timestamp: new Date(),
        data: status,
      };

      await this.messenger.sendMessage({
        type: 'notification',
        priority: 'low',
        source: 'panopticon-engine',
        payload: protocol,
      });
    } catch (error) {
      logger.error('Failed to send health status to Atlas', { error });
    }
  }

  /**
   * Map insight type to priority
   */
  private mapSeverityToPriority(type: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (type) {
      case 'anomaly':
        return 'high';
      case 'pattern':
        return 'medium';
      case 'trend':
        return 'medium';
      case 'relationship':
        return 'low';
      default:
        return 'medium';
    }
  }
}
