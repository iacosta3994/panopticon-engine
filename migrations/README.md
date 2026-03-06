# Panopticon Engine Database Migrations

This directory contains database migration files for the Panopticon Engine surveillance and analysis system.

## Overview

The Panopticon Engine uses a PostgreSQL database to store observations, patterns, insights, and manage the intelligent surveillance infrastructure.

## Migration Files

### Current Migrations

- **20260305_add_panopticon_engine_tables.sql** - Initial schema creation
  - Core surveillance tables (data sources, observations, monitoring rules, alerts)
  - Analysis and intelligence tables (patterns, insights, analysis jobs)
  - Metrics and monitoring infrastructure
  - Knowledge graph integration (entities, relationships)
  - Audit and system health tracking

## Running Migrations

### Prerequisites

- PostgreSQL 14+ (requires `gen_random_uuid()` support)
- Database user with CREATE, ALTER, and INSERT privileges
- Connection to your PostgreSQL instance

### Using psql

```bash
# Connect to your database
psql -h localhost -U your_user -d panopticon_db

# Run the migration
\i migrations/20260305_add_panopticon_engine_tables.sql
```

### Using psql Command Line

```bash
psql -h localhost -U your_user -d panopticon_db -f migrations/20260305_add_panopticon_engine_tables.sql
```

### Using Node.js Migration Tools

#### With node-postgres

```javascript
const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  host: 'localhost',
  database: 'panopticon_db',
  user: 'your_user',
  password: 'your_password'
});

async function runMigration() {
  await client.connect();
  const sql = fs.readFileSync('migrations/20260305_add_panopticon_engine_tables.sql', 'utf8');
  await client.query(sql);
  await client.end();
}

runMigration().catch(console.error);
```

#### With Knex.js

```javascript
const knex = require('knex')({
  client: 'postgresql',
  connection: {
    host: 'localhost',
    database: 'panopticon_db',
    user: 'your_user',
    password: 'your_password'
  }
});

const fs = require('fs');

async function migrate() {
  const sql = fs.readFileSync('migrations/20260305_add_panopticon_engine_tables.sql', 'utf8');
  await knex.raw(sql);
  await knex.destroy();
}

migrate().catch(console.error);
```

## Schema Organization

The migration is organized into logical sections:

### 1. Core Surveillance Tables
- `data_sources` - Registry of monitored sources
- `observations` - Raw captured events
- `monitoring_rules` - Surveillance rules
- `alerts` - Triggered alerts

### 2. Analysis & Intelligence
- `analysis_jobs` - Processing tasks
- `patterns` - Detected patterns
- `pattern_observations` - Pattern-observation links
- `insights` - Extracted intelligence

### 3. Metrics & Monitoring
- `metrics` - Time-series data
- `metric_aggregations` - Pre-computed aggregations

### 4. Knowledge Graph
- `entities` - Discovered entities
- `entity_relationships` - Entity connections
- `entity_observations` - Entity-observation links

### 5. System Tables
- `audit_log` - Audit trail
- `system_health` - Health monitoring

## Key Features

### Indexes

The schema includes comprehensive indexes for:
- Fast time-series queries on `observed_at` and `created_at`
- Efficient filtering by status, type, and severity
- JSONB GIN indexes for metadata and payload searches
- Array indexes for tags and relationships

### Constraints

- Foreign key relationships with appropriate ON DELETE behaviors
- Check constraints for valid ranges (scores, percentages)
- Unique constraints to prevent duplicates
- NOT NULL constraints for critical fields

### Triggers

- Automatic `updated_at` timestamp updates
- Pattern occurrence count increments
- Entity observation count tracking

### Views

Pre-defined views for common queries:
- `active_alerts_summary` - Current alert status
- `recent_high_impact_insights` - Priority insights
- `data_source_health_overview` - Source health metrics
- `pattern_detection_summary` - Pattern statistics

## Verification

After running the migration, verify the installation:

```sql
-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check views
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify example data
SELECT name, source_type, status FROM data_sources;
SELECT name, rule_type, priority FROM monitoring_rules;
```

## Rolling Back

If you need to rollback the migration:

```sql
-- Drop all views
DROP VIEW IF EXISTS active_alerts_summary CASCADE;
DROP VIEW IF EXISTS recent_high_impact_insights CASCADE;
DROP VIEW IF EXISTS data_source_health_overview CASCADE;
DROP VIEW IF EXISTS pattern_detection_summary CASCADE;

-- Drop all tables (in dependency order)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS system_health CASCADE;
DROP TABLE IF EXISTS entity_observations CASCADE;
DROP TABLE IF EXISTS entity_relationships CASCADE;
DROP TABLE IF EXISTS entities CASCADE;
DROP TABLE IF EXISTS metric_aggregations CASCADE;
DROP TABLE IF EXISTS metrics CASCADE;
DROP TABLE IF EXISTS insights CASCADE;
DROP TABLE IF EXISTS pattern_observations CASCADE;
DROP TABLE IF EXISTS patterns CASCADE;
DROP TABLE IF EXISTS analysis_jobs CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS monitoring_rules CASCADE;
DROP TABLE IF EXISTS observations CASCADE;
DROP TABLE IF EXISTS data_sources CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS increment_pattern_occurrence() CASCADE;
DROP FUNCTION IF EXISTS increment_entity_observation() CASCADE;
```

## Future Migrations

When adding new migrations:

1. Name files with timestamp: `YYYYMMDD_description.sql`
2. Include both UP and DOWN migration paths
3. Add documentation to this README
4. Test on a development database first
5. Ensure backwards compatibility where possible

## Best Practices

1. **Always backup** your database before running migrations
2. **Test migrations** in a staging environment first
3. **Run migrations** during low-traffic periods
4. **Monitor performance** after applying migrations
5. **Document changes** in this README

## Support

For issues or questions about migrations:
- Open an issue on GitHub
- Check the `database/schema.md` for detailed documentation
- Review `database/queries.sql` for usage examples

## License

Same as the main Panopticon Engine project.
