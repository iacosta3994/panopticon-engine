# Panopticon Engine Database Schema

## Overview

The Panopticon Engine database schema is designed to support intelligent surveillance, real-time monitoring, pattern detection, and knowledge extraction from multiple data sources.

## Architecture Principles

### 1. **Time-Series Optimized**
All observation and metric tables are optimized for time-series queries with appropriate indexes on timestamp columns.

### 2. **JSONB Flexibility**
Extensive use of JSONB for flexible schema evolution and complex data structures without rigid schema constraints.

### 3. **Knowledge Graph Integration**
Entity and relationship tables support building a dynamic knowledge graph from surveillance data.

### 4. **Performance First**
Comprehensive indexing strategy including GIN indexes for JSONB/array fields and partial indexes for common queries.

### 5. **Audit Trail**
Complete audit logging for compliance and forensic analysis.

---

## Core Tables

### `data_sources`

**Purpose**: Registry of all monitored data sources

**Key Fields**:
- `id` (UUID) - Unique identifier
- `name` (VARCHAR) - Human-readable name
- `source_type` (VARCHAR) - Type: 'api', 'database', 'stream', 'file', 'sensor'
- `endpoint` (TEXT) - Connection endpoint/URL
- `configuration` (JSONB) - Source-specific config
- `status` (VARCHAR) - Current status: 'active', 'paused', 'error', 'disabled'
- `health_score` (DECIMAL) - 0-100 health score
- `last_check_at` (TIMESTAMP) - Last health check time

**Relationships**:
- One-to-many with `observations`
- One-to-many with `metrics`

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Production API Logs",
  "source_type": "stream",
  "endpoint": "kafka://logs.prod:9092/api-logs",
  "configuration": {
    "format": "json",
    "buffer_size": 1000,
    "compression": "gzip"
  },
  "health_score": 98.5,
  "status": "active"
}
```

---

### `observations`

**Purpose**: Raw events and data points captured from sources

**Key Fields**:
- `id` (UUID) - Unique identifier
- `source_id` (UUID) - Reference to data source
- `observation_type` (VARCHAR) - Type of observation
- `severity` (VARCHAR) - 'critical', 'high', 'medium', 'low', 'info'
- `payload` (JSONB) - The actual observation data
- `metadata` (JSONB) - Additional context
- `tags` (TEXT[]) - Categorization tags
- `observed_at` (TIMESTAMP) - When event occurred
- `processed` (BOOLEAN) - Processing status
- `correlation_id` (UUID) - For linking related observations

**Indexes**:
- GIN index on `payload` for fast JSONB queries
- GIN index on `tags` for tag searches
- B-tree on `observed_at` (DESC) for time-series queries
- Partial index on unprocessed records

**Example**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "source_id": "550e8400-e29b-41d4-a716-446655440000",
  "observation_type": "api_error",
  "severity": "high",
  "payload": {
    "error_code": "500",
    "endpoint": "/api/users",
    "message": "Database connection timeout",
    "stack_trace": "..."
  },
  "tags": ["error", "database", "timeout"],
  "observed_at": "2026-03-05T22:45:00Z"
}
```

---

### `monitoring_rules`

**Purpose**: Define surveillance rules and thresholds

**Key Fields**:
- `id` (UUID) - Unique identifier
- `name` (VARCHAR) - Rule name
- `rule_type` (VARCHAR) - 'threshold', 'pattern', 'anomaly', 'correlation'
- `conditions` (JSONB) - Rule conditions
- `actions` (JSONB) - Actions to take when triggered
- `priority` (VARCHAR) - Rule priority
- `enabled` (BOOLEAN) - Active status
- `evaluation_window` (INTERVAL) - Time window for evaluation
- `cooldown_period` (INTERVAL) - Minimum time between triggers

**Example**:
```json
{
  "name": "High Error Rate Alert",
  "rule_type": "threshold",
  "conditions": {
    "metric": "error_rate",
    "operator": ">",
    "threshold": 5,
    "window": "5 minutes"
  },
  "actions": {
    "notify": ["ops-team@example.com"],
    "create_incident": true,
    "severity": "high"
  },
  "priority": "high",
  "evaluation_window": "5 minutes",
  "cooldown_period": "15 minutes"
}
```

---

### `alerts`

**Purpose**: Store triggered alerts from monitoring rules

**Key Fields**:
- `id` (UUID) - Unique identifier
- `rule_id` (UUID) - Triggering rule
- `observation_id` (UUID) - Related observation
- `severity` (VARCHAR) - Alert severity
- `title` (VARCHAR) - Alert title
- `message` (TEXT) - Detailed message
- `context` (JSONB) - Alert context
- `status` (VARCHAR) - 'open', 'acknowledged', 'investigating', 'resolved', 'false_positive'
- `triggered_at` (TIMESTAMP) - When alert was created

**Lifecycle**:
1. Created: `status = 'open'`
2. Team notified: `status = 'acknowledged'`
3. Investigation: `status = 'investigating'`
4. Resolution: `status = 'resolved'` or `'false_positive'`

---

### `patterns`

**Purpose**: Store detected patterns in observation data

**Key Fields**:
- `id` (UUID) - Unique identifier
- `pattern_type` (VARCHAR) - Type of pattern
- `name` (VARCHAR) - Pattern name
- `signature` (JSONB) - Pattern signature/definition
- `confidence_score` (DECIMAL) - 0-100 confidence
- `occurrence_count` (INTEGER) - Times pattern seen
- `first_seen_at` (TIMESTAMP) - First detection
- `last_seen_at` (TIMESTAMP) - Most recent detection

**Pattern Types**:
- **Sequential**: Time-ordered event sequences
- **Frequency**: Recurring events at specific intervals
- **Correlation**: Related events across sources
- **Anomaly**: Deviation from normal behavior

**Example**:
```json
{
  "pattern_type": "sequential",
  "name": "Login Failure Cascade",
  "signature": {
    "events": [
      {"type": "login_attempt", "result": "failed"},
      {"type": "login_attempt", "result": "failed"},
      {"type": "login_attempt", "result": "failed"},
      {"type": "account_lock"}
    ],
    "max_time_between": "30 seconds"
  },
  "confidence_score": 95.5,
  "occurrence_count": 42
}
```

---

### `insights`

**Purpose**: High-level intelligence extracted from data

**Key Fields**:
- `id` (UUID) - Unique identifier
- `insight_type` (VARCHAR) - 'trend', 'anomaly', 'prediction', 'recommendation'
- `title` (VARCHAR) - Insight title
- `summary` (TEXT) - Brief summary
- `details` (JSONB) - Detailed analysis
- `confidence_score` (DECIMAL) - 0-100 confidence
- `impact_level` (VARCHAR) - 'critical', 'high', 'medium', 'low'
- `actionable` (BOOLEAN) - Requires action
- `recommended_actions` (JSONB) - Suggested actions

**Insight Types**:

1. **Trend**: Pattern over time
   ```json
   {
     "type": "trend",
     "direction": "increasing",
     "metric": "api_latency",
     "change_rate": "+15% over 24h"
   }
   ```

2. **Anomaly**: Unusual behavior
   ```json
   {
     "type": "anomaly",
     "deviation": "3.5 sigma",
     "expected": 1000,
     "actual": 5000
   }
   ```

3. **Prediction**: Future forecast
   ```json
   {
     "type": "prediction",
     "timeframe": "next 6 hours",
     "predicted_value": 10000,
     "confidence_interval": [8000, 12000]
   }
   ```

4. **Recommendation**: Actionable advice
   ```json
   {
     "type": "recommendation",
     "action": "scale_up",
     "reason": "Predicted capacity shortage",
     "urgency": "high"
   }
   ```

---

### `entities`

**Purpose**: Track discovered entities for knowledge graph

**Key Fields**:
- `id` (UUID) - Unique identifier
- `entity_type` (VARCHAR) - Entity type (user, service, host, etc.)
- `identifier` (VARCHAR) - Unique identifier for entity
- `attributes` (JSONB) - Entity attributes
- `confidence_score` (DECIMAL) - Confidence in entity existence
- `observation_count` (INTEGER) - Times observed

**Entity Types**:
- **User**: Human or service accounts
- **Host**: Servers, containers, VMs
- **Service**: Applications, APIs, microservices
- **Resource**: Files, databases, queues
- **Location**: Geographic or network locations

**Example**:
```json
{
  "entity_type": "service",
  "identifier": "user-authentication-api",
  "attributes": {
    "version": "2.3.1",
    "environment": "production",
    "region": "us-east-1",
    "owner_team": "platform"
  },
  "confidence_score": 99.0,
  "observation_count": 1547
}
```

---

### `entity_relationships`

**Purpose**: Map relationships between entities

**Key Fields**:
- `source_entity_id` (UUID) - Source entity
- `target_entity_id` (UUID) - Target entity
- `relationship_type` (VARCHAR) - Type of relationship
- `properties` (JSONB) - Relationship properties
- `strength` (DECIMAL) - 0-100 relationship strength

**Relationship Types**:
- **depends_on**: Service dependencies
- **communicates_with**: Network communication
- **owns**: Ownership relationships
- **accesses**: Resource access patterns
- **deployed_on**: Deployment topology

**Example**:
```json
{
  "relationship_type": "depends_on",
  "properties": {
    "protocol": "https",
    "port": 443,
    "call_frequency": "1000/min",
    "critical": true
  },
  "strength": 95.0
}
```

---

### `metrics`

**Purpose**: Time-series metrics storage

**Key Fields**:
- `metric_name` (VARCHAR) - Metric name
- `metric_type` (VARCHAR) - 'counter', 'gauge', 'histogram', 'summary'
- `value` (DECIMAL) - Metric value
- `dimensions` (JSONB) - Metric dimensions/labels
- `recorded_at` (TIMESTAMP) - Recording time

**Metric Types**:

1. **Counter**: Monotonically increasing values
   - Request counts, error counts
   
2. **Gauge**: Point-in-time measurements
   - Memory usage, active connections
   
3. **Histogram**: Distribution of values
   - Request latencies, response sizes
   
4. **Summary**: Statistical summaries
   - Percentiles, averages

---

## Key Relationships

```
data_sources
    ├── observations (1:many)
    └── metrics (1:many)

monitoring_rules
    └── alerts (1:many)

observations
    ├── alerts (1:many)
    ├── pattern_observations (many:many via patterns)
    └── entity_observations (many:many via entities)

patterns
    └── pattern_observations (1:many)

entities
    ├── entity_observations (1:many)
    ├── source relationships (1:many)
    └── target relationships (1:many)
```

## Query Patterns

### Time-Series Queries

```sql
-- Recent observations
SELECT * FROM observations
WHERE observed_at > NOW() - INTERVAL '1 hour'
ORDER BY observed_at DESC;

-- Metrics over time window
SELECT 
    metric_name,
    AVG(value) as avg_value,
    MAX(value) as max_value,
    date_trunc('minute', recorded_at) as time_bucket
FROM metrics
WHERE recorded_at > NOW() - INTERVAL '24 hours'
GROUP BY metric_name, time_bucket
ORDER BY time_bucket;
```

### Pattern Detection

```sql
-- Find patterns with high confidence
SELECT p.*, COUNT(po.id) as recent_matches
FROM patterns p
LEFT JOIN pattern_observations po ON p.id = po.pattern_id
    AND po.detected_at > NOW() - INTERVAL '1 hour'
WHERE p.confidence_score > 90
GROUP BY p.id
ORDER BY recent_matches DESC;
```

### Knowledge Graph

```sql
-- Find entity dependencies (2 levels deep)
WITH RECURSIVE deps AS (
    SELECT er.*, 1 as depth
    FROM entity_relationships er
    WHERE source_entity_id = 'some-entity-id'
      AND relationship_type = 'depends_on'
    
    UNION ALL
    
    SELECT er.*, d.depth + 1
    FROM entity_relationships er
    JOIN deps d ON er.source_entity_id = d.target_entity_id
    WHERE d.depth < 2
      AND er.relationship_type = 'depends_on'
)
SELECT DISTINCT e.*, d.depth
FROM deps d
JOIN entities e ON d.target_entity_id = e.id
ORDER BY d.depth;
```

## Performance Considerations

### Partitioning Strategy

For high-volume deployments, consider partitioning:

```sql
-- Partition observations by month
CREATE TABLE observations_2026_03 PARTITION OF observations
FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

### Retention Policies

```sql
-- Delete old observations (90 day retention)
DELETE FROM observations
WHERE observed_at < NOW() - INTERVAL '90 days';

-- Archive to cold storage before deletion
INSERT INTO observations_archive
SELECT * FROM observations
WHERE observed_at < NOW() - INTERVAL '90 days';
```

### Index Maintenance

```sql
-- Regular vacuum and analyze
VACUUM ANALYZE observations;
VACUUM ANALYZE metrics;

-- Reindex for performance
REINDEX TABLE observations;
```

## Security

### Row-Level Security

```sql
-- Enable RLS
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their team's data
CREATE POLICY team_isolation ON observations
FOR SELECT
USING (metadata->>'team' = current_setting('app.current_team'));
```

### Audit Logging

All significant operations are logged to `audit_log`:

```sql
INSERT INTO audit_log (action, resource_type, resource_id, actor, changes)
VALUES (
    'create', 'monitoring_rule', rule_id, current_user,
    jsonb_build_object('rule', row_to_json(NEW))
);
```

## Monitoring the Monitor

The `system_health` table tracks Panopticon Engine itself:

```sql
INSERT INTO system_health (component, status, metrics)
VALUES (
    'observation_processor',
    'healthy',
    jsonb_build_object(
        'queue_depth', 0,
        'processing_rate', 1000,
        'error_rate', 0.01
    )
);
```

## Integration Points

### External Knowledge Graphs

The entity tables can integrate with external knowledge graphs:

```sql
-- Link to external knowledge base
UPDATE entities
SET metadata = metadata || jsonb_build_object(
    'external_kb_id', 'kg://dbpedia.org/resource/...',
    'external_kb_score', 0.95
)
WHERE entity_type = 'organization';
```

### Event Streaming

Use PostgreSQL NOTIFY for real-time events:

```sql
CREATE OR REPLACE FUNCTION notify_new_alert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('new_alert', row_to_json(NEW)::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alert_notification
AFTER INSERT ON alerts
FOR EACH ROW EXECUTE FUNCTION notify_new_alert();
```

## Future Enhancements

- [ ] TimescaleDB integration for better time-series performance
- [ ] PostgreSQL extensions: pg_trgm for fuzzy matching, postgis for geo data
- [ ] Machine learning model storage and versioning
- [ ] Distributed tracing integration
- [ ] Real-time dashboards via materialized views
