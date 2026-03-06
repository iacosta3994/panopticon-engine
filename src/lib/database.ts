import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import logger from './logger';

/**
 * Simple SQLite database manager
 * Auto-creates database and runs migrations
 */
export class DatabaseManager {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    // Use data directory for SQLite
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = join(dataDir, 'panopticon.db');
  }

  /**
   * Initialize database with auto-migration
   */
  async initialize(): Promise<void> {
    try {
      this.db = new Database(this.dbPath);
      logger.info('✅ SQLite database initialized', { path: this.dbPath });

      // Run migrations automatically
      await this.runMigrations();

      // Seed sample data if empty
      await this.seedSampleData();

      logger.info('✅ Database ready');
    } catch (error) {
      logger.error('❌ Database initialization failed', { error });
      throw error;
    }
  }

  /**
   * Run migrations automatically
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) return;

    logger.info('🔄 Running database migrations...');

    // Create core tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS observations (
        id TEXT PRIMARY KEY,
        observation_type TEXT NOT NULL,
        severity TEXT DEFAULT 'medium',
        payload TEXT,
        tags TEXT,
        observed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed BOOLEAN DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        alert_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'open',
        triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS patterns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        pattern_type TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        occurrence_count INTEGER DEFAULT 1,
        signature TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS metrics (
        id TEXT PRIMARY KEY,
        metric_name TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT,
        dimensions TEXT,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_observations_type ON observations(observation_type);
      CREATE INDEX IF NOT EXISTS idx_observations_time ON observations(observed_at DESC);
      CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
      CREATE INDEX IF NOT EXISTS idx_patterns_confidence ON patterns(confidence_score DESC);
      CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(metric_name);
    `);

    logger.info('✅ Migrations completed');
  }

  /**
   * Seed sample data for demo
   */
  private async seedSampleData(): Promise<void> {
    if (!this.db) return;

    // Check if data exists
    const count = this.db.prepare('SELECT COUNT(*) as count FROM observations').get() as any;
    
    if (count.count > 0) {
      logger.info('ℹ️  Database already has data, skipping seed');
      return;
    }

    logger.info('🌱 Seeding sample data...');

    // Insert sample observations
    const insertObs = this.db.prepare(
      'INSERT INTO observations (id, observation_type, severity, payload) VALUES (?, ?, ?, ?)'
    );

    for (let i = 0; i < 10; i++) {
      insertObs.run(
        `obs-${i}`,
        'api_request',
        i % 3 === 0 ? 'high' : 'medium',
        JSON.stringify({ latency: 100 + Math.random() * 100 })
      );
    }

    logger.info('✅ Sample data seeded');
  }

  /**
   * Get database instance
   */
  getDB(): Database.Database | null {
    return this.db;
  }

  /**
   * Query helper
   */
  query(sql: string, params?: any[]): any[] {
    if (!this.db) return [];
    try {
      return this.db.prepare(sql).all(params);
    } catch (error) {
      logger.error('Query failed', { error, sql });
      return [];
    }
  }

  /**
   * Insert helper
   */
  insert(sql: string, params?: any[]): void {
    if (!this.db) return;
    try {
      this.db.prepare(sql).run(params);
    } catch (error) {
      logger.error('Insert failed', { error, sql });
    }
  }

  /**
   * Close database
   */
  close(): void {
    if (this.db) {
      this.db.close();
      logger.info('Database closed');
    }
  }
}

export default new DatabaseManager();
