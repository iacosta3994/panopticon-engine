import { Pool, PoolClient } from 'pg';
import logger from './logger';
import { SchemaValidator } from './SchemaValidator';
import { retry } from './utils';

export class DatabaseManager {
  private pool: Pool | null = null;
  private validator: SchemaValidator;
  private isHealthy: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.validator = new SchemaValidator();
  }

  /**
   * Initialize database connection with validation
   */
  async initialize(): Promise<void> {
    logger.info('🔌 Initializing Database Manager...');

    try {
      // Create connection pool
      await this.createPool();

      // Test connection
      await this.testConnection();

      // Validate schema
      await this.validateSchema();

      // Start health checks
      this.startHealthChecks();

      this.isHealthy = true;
      logger.info('✅ Database Manager initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Database Manager', { error });
      throw error;
    }
  }

  /**
   * Create connection pool
   */
  private async createPool(): Promise<void> {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable not set');
    }

    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      logger.error('Unexpected database pool error', { error: err });
      this.isHealthy = false;
    });

    // Handle pool connection
    this.pool.on('connect', () => {
      logger.debug('📊 New database connection established');
    });

    // Handle pool removal
    this.pool.on('remove', () => {
      logger.debug('📊 Database connection removed from pool');
    });

    logger.info('📊 Connection pool created');
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    if (!this.pool) throw new Error('Pool not initialized');

    await retry(async () => {
      const client = await this.pool!.connect();
      try {
        const result = await client.query('SELECT NOW()');
        logger.info('✅ Database connection test successful', {
          serverTime: result.rows[0].now,
        });
      } finally {
        client.release();
      }
    }, 3, 2000);
  }

  /**
   * Validate database schema
   */
  private async validateSchema(): Promise<void> {
    if (!this.pool) throw new Error('Pool not initialized');

    logger.info('🔍 Validating database schema...');

    const client = await this.pool.connect();
    try {
      const validation = await this.validator.validate(client);

      if (!validation.isValid) {
        logger.warn('⚠️  Schema validation found issues:', validation.issues);

        // Attempt self-healing for minor issues
        if (validation.canAutoFix) {
          logger.info('🔧 Attempting to auto-fix schema issues...');
          await this.validator.autoFix(client, validation.issues);
          logger.info('✅ Schema issues auto-fixed');
        } else {
          logger.error('❌ Schema validation failed. Manual intervention required.');
          throw new Error('Schema validation failed: ' + validation.issues.join(', '));
        }
      } else {
        logger.info('✅ Schema validation passed');
      }
    } finally {
      client.release();
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(
      () => this.performHealthCheck(),
      60000 // Every minute
    );

    logger.info('❤️  Database health checks started');
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    if (!this.pool) return;

    try {
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1');
        
        if (!this.isHealthy) {
          logger.info('✅ Database connection recovered');
          this.isHealthy = true;
        }
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('❌ Database health check failed', { error });
      this.isHealthy = false;
      
      // Attempt reconnection
      await this.reconnect();
    }
  }

  /**
   * Reconnect to database
   */
  private async reconnect(): Promise<void> {
    logger.info('🔄 Attempting database reconnection...');

    try {
      if (this.pool) {
        await this.pool.end();
      }

      await this.createPool();
      await this.testConnection();

      this.isHealthy = true;
      logger.info('✅ Database reconnection successful');
    } catch (error) {
      logger.error('❌ Database reconnection failed', { error });
    }
  }

  /**
   * Get database client
   */
  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    if (!this.isHealthy) {
      throw new Error('Database is unhealthy');
    }

    return await this.pool.connect();
  }

  /**
   * Execute query with logging
   */
  async query(sql: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    const startTime = Date.now();

    try {
      const result = await client.query(sql, params);
      const duration = Date.now() - startTime;

      logger.debug('📊 Query executed', {
        duration,
        rowCount: result.rowCount,
        sql: sql.substring(0, 100),
      });

      return result;
    } catch (error) {
      logger.error('❌ Query failed', {
        error,
        sql: sql.substring(0, 100),
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): Record<string, any> {
    if (!this.pool) return {};

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      isHealthy: this.isHealthy,
    };
  }

  /**
   * Check if database is healthy
   */
  isHealthyStatus(): boolean {
    return this.isHealthy;
  }

  /**
   * Shutdown database connections
   */
  async shutdown(): Promise<void> {
    logger.info('🔌 Shutting down Database Manager...');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }

    this.isHealthy = false;
    logger.info('✅ Database Manager shut down');
  }
}

export default new DatabaseManager();
