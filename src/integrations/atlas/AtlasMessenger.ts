import { Pool } from 'pg';
import logger from '../../lib/logger';
import { config } from '../../lib/config';
import { AtlasMessage } from './types';
import { generateId } from '../../lib/utils';

export class AtlasMessenger {
  private pool: Pool | null = null;
  private connected: boolean = false;

  /**
   * Initialize connection to Atlas database
   */
  async initialize(): Promise<void> {
    if (!process.env.ATLAS_DB_CONNECTION) {
      logger.warn('Atlas database connection not configured');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: process.env.ATLAS_DB_CONNECTION,
      });

      // Test connection
      const client = await this.pool.connect();
      client.release();

      this.connected = true;
      logger.info('Atlas Messenger initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Atlas Messenger', { error });
      throw error;
    }
  }

  /**
   * Send message to Atlas
   */
  async sendMessage(message: Omit<AtlasMessage, 'id' | 'timestamp'>): Promise<void> {
    if (!this.connected || !this.pool) {
      logger.warn('Atlas Messenger not connected');
      return;
    }

    try {
      const fullMessage: AtlasMessage = {
        id: generateId(),
        timestamp: new Date(),
        ...message,
      };

      await this.pool.query(
        `INSERT INTO atlas_messages (id, type, priority, source, payload, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          fullMessage.id,
          fullMessage.type,
          fullMessage.priority,
          fullMessage.source,
          JSON.stringify(fullMessage.payload),
          JSON.stringify(fullMessage.metadata || {}),
          fullMessage.timestamp,
        ]
      );

      logger.info('Message sent to Atlas', { messageId: fullMessage.id, type: message.type });
    } catch (error) {
      logger.error('Failed to send message to Atlas', { error });
      throw error;
    }
  }

  /**
   * Receive messages from Atlas
   */
  async receiveMessages(limit: number = 10): Promise<AtlasMessage[]> {
    if (!this.connected || !this.pool) {
      return [];
    }

    try {
      const result = await this.pool.query(
        `SELECT * FROM atlas_messages 
         WHERE processed = false 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      );

      return result.rows.map(row => ({
        id: row.id,
        type: row.type,
        priority: row.priority,
        source: row.source,
        timestamp: new Date(row.created_at),
        payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      }));
    } catch (error) {
      logger.error('Failed to receive messages from Atlas', { error });
      return [];
    }
  }

  /**
   * Mark message as processed
   */
  async markProcessed(messageId: string): Promise<void> {
    if (!this.connected || !this.pool) return;

    try {
      await this.pool.query(
        `UPDATE atlas_messages SET processed = true, processed_at = NOW() WHERE id = $1`,
        [messageId]
      );
    } catch (error) {
      logger.error('Failed to mark message as processed', { error, messageId });
    }
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.connected = false;
      logger.info('Atlas Messenger connection closed');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}
