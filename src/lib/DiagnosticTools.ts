import { PoolClient } from 'pg';
import logger from './logger';

export class DiagnosticTools {
  /**
   * Run comprehensive database diagnostics
   */
  async runDiagnostics(client: PoolClient): Promise<Record<string, any>> {
    logger.info('🔍 Running database diagnostics...');

    const diagnostics = {
      timestamp: new Date().toISOString(),
      connection: await this.checkConnection(client),
      tables: await this.checkTables(client),
      indexes: await this.checkIndexes(client),
      performance: await this.checkPerformance(client),
      diskUsage: await this.checkDiskUsage(client),
    };

    logger.info('✅ Diagnostics completed', diagnostics);
    return diagnostics;
  }

  /**
   * Check connection health
   */
  private async checkConnection(client: PoolClient): Promise<Record<string, any>> {
    try {
      const result = await client.query('SELECT version(), current_database(), current_user');
      const row = result.rows[0];

      return {
        status: 'healthy',
        version: row.version,
        database: row.current_database,
        user: row.current_user,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Check table statistics
   */
  private async checkTables(client: PoolClient): Promise<Record<string, any>> {
    const result = await client.query(`
      SELECT 
        schemaname,
        COUNT(*) as table_count
      FROM pg_tables
      WHERE schemaname = 'public'
      GROUP BY schemaname
    `);

    return {
      tableCount: result.rows[0]?.table_count || 0,
    };
  }

  /**
   * Check index health
   */
  private async checkIndexes(client: PoolClient): Promise<Record<string, any>> {
    const result = await client.query(`
      SELECT 
        COUNT(*) as index_count,
        COUNT(*) FILTER (WHERE idx_scan = 0) as unused_count
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
    `);

    return {
      indexCount: result.rows[0]?.index_count || 0,
      unusedCount: result.rows[0]?.unused_count || 0,
    };
  }

  /**
   * Check query performance
   */
  private async checkPerformance(client: PoolClient): Promise<Record<string, any>> {
    try {
      const result = await client.query(`
        SELECT 
          COUNT(*) as active_connections,
          SUM(CASE WHEN state = 'active' THEN 1 ELSE 0 END) as active_queries
        FROM pg_stat_activity
        WHERE datname = current_database()
      `);

      return {
        activeConnections: result.rows[0]?.active_connections || 0,
        activeQueries: result.rows[0]?.active_queries || 0,
      };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  /**
   * Check disk usage
   */
  private async checkDiskUsage(client: PoolClient): Promise<Record<string, any>> {
    const result = await client.query(`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        pg_database_size(current_database()) as database_size_bytes
    `);

    return {
      databaseSize: result.rows[0]?.database_size || '0',
      databaseSizeBytes: result.rows[0]?.database_size_bytes || 0,
    };
  }
}
