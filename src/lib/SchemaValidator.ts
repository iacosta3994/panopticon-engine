import { PoolClient } from 'pg';
import logger from './logger';

interface ValidationResult {
  isValid: boolean;
  issues: string[];
  canAutoFix: boolean;
}

export class SchemaValidator {
  private requiredTables = [
    'data_sources',
    'observations',
    'monitoring_rules',
    'alerts',
    'patterns',
    'insights',
    'entities',
    'entity_relationships',
    'metrics',
    'audit_log',
  ];

  /**
   * Validate database schema
   */
  async validate(client: PoolClient): Promise<ValidationResult> {
    const issues: string[] = [];

    try {
      // Check tables exist
      const missingTables = await this.checkTables(client);
      if (missingTables.length > 0) {
        issues.push(`Missing tables: ${missingTables.join(', ')}`);
      }

      // Check indexes exist
      const missingIndexes = await this.checkIndexes(client);
      if (missingIndexes.length > 0) {
        issues.push(`Missing indexes: ${missingIndexes.length} indexes`);
      }

      // Check functions exist
      const missingFunctions = await this.checkFunctions(client);
      if (missingFunctions.length > 0) {
        issues.push(`Missing functions: ${missingFunctions.join(', ')}`);
      }

      const isValid = issues.length === 0;
      const canAutoFix = missingIndexes.length > 0 && missingTables.length === 0;

      return {
        isValid,
        issues,
        canAutoFix,
      };
    } catch (error) {
      logger.error('Schema validation error', { error });
      return {
        isValid: false,
        issues: ['Validation error: ' + (error as Error).message],
        canAutoFix: false,
      };
    }
  }

  /**
   * Check if required tables exist
   */
  private async checkTables(client: PoolClient): Promise<string[]> {
    const result = await client.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
    );

    const existingTables = result.rows.map((row) => row.table_name);
    const missing = this.requiredTables.filter((t) => !existingTables.includes(t));

    logger.info('📋 Table check completed', {
      required: this.requiredTables.length,
      found: existingTables.length,
      missing: missing.length,
    });

    return missing;
  }

  /**
   * Check if key indexes exist
   */
  private async checkIndexes(client: PoolClient): Promise<string[]> {
    const result = await client.query(
      `SELECT indexname FROM pg_indexes WHERE schemaname = 'public'`
    );

    const existingIndexes = result.rows.map((row) => row.indexname);
    const expectedIndexCount = 50; // Approximate from migration

    logger.info('📇 Index check completed', {
      found: existingIndexes.length,
      expected: expectedIndexCount,
    });

    return existingIndexes.length < 30 ? ['Insufficient indexes'] : [];
  }

  /**
   * Check if required functions exist
   */
  private async checkFunctions(client: PoolClient): Promise<string[]> {
    const requiredFunctions = [
      'update_updated_at_column',
      'increment_pattern_occurrence',
      'increment_entity_observation',
    ];

    const result = await client.query(
      `SELECT routine_name FROM information_schema.routines 
       WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'`
    );

    const existingFunctions = result.rows.map((row) => row.routine_name);
    const missing = requiredFunctions.filter((f) => !existingFunctions.includes(f));

    logger.info('⚙️  Function check completed', {
      required: requiredFunctions.length,
      found: existingFunctions.length,
      missing: missing.length,
    });

    return missing;
  }

  /**
   * Auto-fix minor schema issues
   */
  async autoFix(client: PoolClient, issues: string[]): Promise<void> {
    logger.info('🔧 Starting auto-fix for schema issues...');

    for (const issue of issues) {
      if (issue.includes('indexes')) {
        await this.recreateIndexes(client);
      }
    }

    logger.info('✅ Auto-fix completed');
  }

  /**
   * Recreate missing indexes
   */
  private async recreateIndexes(client: PoolClient): Promise<void> {
    logger.info('Creating missing indexes...');

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_observations_observed_at ON observations(observed_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_observations_processed ON observations(processed) WHERE NOT processed',
      'CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status)',
      'CREATE INDEX IF NOT EXISTS idx_patterns_confidence ON patterns(confidence_score DESC)',
    ];

    for (const indexSql of indexes) {
      try {
        await client.query(indexSql);
        logger.debug('Index created', { sql: indexSql.substring(0, 50) });
      } catch (error) {
        logger.warn('Failed to create index', { error, sql: indexSql });
      }
    }
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
          logger.info('✅ Database health recovered');
          this.isHealthy = true;
        }
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('❌ Database health check failed', { error });
      this.isHealthy = false;
    }
  }

  /**
   * Start health check interval
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(
      () => this.performHealthCheck(),
      60000 // Every minute
    );

    logger.info('❤️  Database health checks started');
  }

  /**
   * Get connection pool
   */
  getPool(): Pool | null {
    return this.pool;
  }

  /**
   * Get database statistics
   */
  async getStatistics(): Promise<Record<string, any>> {
    if (!this.pool) return {};

    const client = await this.pool.connect();
    try {
      // Get table sizes
      const sizeResult = await client.query(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY size_bytes DESC
        LIMIT 10
      `);

      // Get row counts
      const countResult = await client.query(`
        SELECT COUNT(*) as total FROM observations
      `);

      return {
        poolStats: this.getStats(),
        tableSizes: sizeResult.rows,
        totalObservations: countResult.rows[0].total,
        isHealthy: this.isHealthy,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Get pool statistics
   */
  private getStats(): Record<string, any> {
    if (!this.pool) return {};

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  /**
   * Shutdown database manager
   */
  async shutdown(): Promise<void> {
    logger.info('🔌 Shutting down Database Manager...');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }

    this.isHealthy = false;
    logger.info('✅ Database Manager shut down');
  }
}
