import logger from '../../lib/logger';
import { AtlasMessenger } from './AtlasMessenger';
import { AtlasMessage } from './types';
import supabase from '../../lib/supabase';

export class AtlasMessageHandler {
  private messenger: AtlasMessenger;
  private isProcessing: boolean = false;

  constructor(messenger: AtlasMessenger) {
    this.messenger = messenger;
  }

  /**
   * Start processing messages from Atlas
   */
  async startProcessing(intervalMs: number = 30000): Promise<void> {
    if (this.isProcessing) {
      logger.warn('Message processing already started');
      return;
    }

    this.isProcessing = true;
    logger.info('Started processing Atlas messages');

    // Process messages on interval
    setInterval(async () => {
      await this.processMessages();
    }, intervalMs);

    // Process immediately
    await this.processMessages();
  }

  /**
   * Process incoming messages
   */
  private async processMessages(): Promise<void> {
    try {
      const messages = await this.messenger.receiveMessages(10);

      if (messages.length === 0) {
        return;
      }

      logger.info(`Processing ${messages.length} messages from Atlas`);

      for (const message of messages) {
        await this.handleMessage(message);
        await this.messenger.markProcessed(message.id);
      }
    } catch (error) {
      logger.error('Failed to process Atlas messages', { error });
    }
  }

  /**
   * Handle individual message
   */
  private async handleMessage(message: AtlasMessage): Promise<void> {
    logger.debug('Handling Atlas message', { id: message.id, type: message.type });

    try {
      switch (message.type) {
        case 'query':
          await this.handleQuery(message);
          break;
        case 'notification':
          await this.handleNotification(message);
          break;
        case 'response':
          await this.handleResponse(message);
          break;
        case 'alert':
          await this.handleAlert(message);
          break;
        default:
          logger.warn('Unknown message type', { type: message.type });
      }
    } catch (error) {
      logger.error('Failed to handle message', { error, messageId: message.id });
    }
  }

  /**
   * Handle query from Atlas
   */
  private async handleQuery(message: AtlasMessage): Promise<void> {
    const { payload } = message;

    if (payload.queryType === 'get_observations') {
      await this.handleObservationQuery(payload);
    } else if (payload.queryType === 'get_patterns') {
      await this.handlePatternQuery(payload);
    } else if (payload.queryType === 'get_insights') {
      await this.handleInsightQuery(payload);
    }
  }

  /**
   * Handle observation query
   */
  private async handleObservationQuery(payload: any): Promise<void> {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .limit(payload.limit || 100);

      if (error) throw error;

      // Send response back to Atlas
      await this.messenger.sendMessage({
        type: 'response',
        priority: 'low',
        source: 'panopticon-engine',
        payload: {
          queryId: payload.queryId,
          data,
        },
      });

      logger.info('Observation query response sent to Atlas');
    } catch (error) {
      logger.error('Failed to handle observation query', { error });
    }
  }

  /**
   * Handle pattern query
   */
  private async handlePatternQuery(payload: any): Promise<void> {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('patterns')
        .select('*')
        .eq('status', 'active')
        .limit(payload.limit || 50);

      if (error) throw error;

      await this.messenger.sendMessage({
        type: 'response',
        priority: 'low',
        source: 'panopticon-engine',
        payload: {
          queryId: payload.queryId,
          data,
        },
      });

      logger.info('Pattern query response sent to Atlas');
    } catch (error) {
      logger.error('Failed to handle pattern query', { error });
    }
  }

  /**
   * Handle insight query
   */
  private async handleInsightQuery(payload: any): Promise<void> {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('status', 'new')
        .order('created_at', { ascending: false })
        .limit(payload.limit || 20);

      if (error) throw error;

      await this.messenger.sendMessage({
        type: 'response',
        priority: 'low',
        source: 'panopticon-engine',
        payload: {
          queryId: payload.queryId,
          data,
        },
      });

      logger.info('Insight query response sent to Atlas');
    } catch (error) {
      logger.error('Failed to handle insight query', { error });
    }
  }

  /**
   * Handle notification from Atlas
   */
  private async handleNotification(message: AtlasMessage): Promise<void> {
    logger.info('Received notification from Atlas', {
      priority: message.priority,
      payload: message.payload,
    });

    // Store notification in database if needed
    // Or trigger actions based on notification content
  }

  /**
   * Handle response from Atlas
   */
  private async handleResponse(message: AtlasMessage): Promise<void> {
    logger.debug('Received response from Atlas', { payload: message.payload });
    // Handle responses to our queries
  }

  /**
   * Handle alert from Atlas
   */
  private async handleAlert(message: AtlasMessage): Promise<void> {
    logger.warn('Received alert from Atlas', {
      priority: message.priority,
      payload: message.payload,
    });

    // Create an alert in our system based on Atlas alert
    if (supabase) {
      try {
        await supabase.from('alerts').insert([
          {
            alert_type: 'atlas_alert',
            severity: message.priority === 'critical' ? 'critical' : 'high',
            title: message.payload.title || 'Alert from Atlas',
            message: message.payload.message || '',
            context: message.payload,
            status: 'open',
            triggered_at: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        logger.error('Failed to create alert from Atlas message', { error });
      }
    }
  }

  /**
   * Stop processing messages
   */
  stop(): void {
    this.isProcessing = false;
    logger.info('Stopped processing Atlas messages');
  }
}
