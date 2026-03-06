import { Server as SocketIOServer, Socket } from 'socket.io';
import logger from '../lib/logger';
import supabase from '../lib/supabase';
import { Alert, Observation, Pattern } from '../lib/types';

export class EventStreamer {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Stream new observation
   */
  streamObservation(observation: Observation): void {
    this.io.to('observations').emit('observation:new', observation);
    
    logger.debug('Observation streamed', {
      id: observation.id,
      type: observation.observation_type,
    });
  }

  /**
   * Stream new alert
   */
  streamAlert(alert: Alert): void {
    this.io.to('alerts').emit('alert:new', alert);
    
    logger.info('Alert streamed', {
      id: alert.id,
      severity: alert.severity,
    });
  }

  /**
   * Stream pattern detection
   */
  streamPattern(pattern: Pattern): void {
    this.io.to('patterns').emit('pattern:detected', pattern);
    
    logger.info('Pattern streamed', {
      id: pattern.id,
      type: pattern.pattern_type,
    });
  }

  /**
   * Stream anomaly detection
   */
  streamAnomaly(anomaly: any): void {
    this.io.to('anomalies').emit('anomaly:detected', anomaly);
    
    logger.info('Anomaly streamed', {
      score: anomaly.score,
      method: anomaly.method,
    });
  }

  /**
   * Stream insight
   */
  streamInsight(insight: any): void {
    this.io.to('insights').emit('insight:new', insight);
    
    logger.info('Insight streamed', {
      id: insight.id,
      type: insight.insight_type,
    });
  }

  /**
   * Send alerts to specific client
   */
  async sendAlertsToClient(socket: Socket): Promise<void> {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('status', 'open')
        .order('triggered_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      socket.emit('alerts:initial', data || []);
    } catch (error) {
      logger.error('Failed to send alerts to client', { error });
    }
  }

  /**
   * Broadcast system event
   */
  broadcastSystemEvent(event: string, data: any): void {
    this.io.emit('system:event', { event, data, timestamp: new Date() });
  }
}
