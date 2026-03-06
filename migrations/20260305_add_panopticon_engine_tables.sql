-- Panopticon Engine Schema Migration
-- Version: 1.0.0
-- Date: 2026-03-05
-- Description: Core schema for intelligent surveillance and analysis system

-- ============================================================================
-- CORE SURVEILLANCE TABLES
-- ============================================================================

-- Data Sources: Register all monitored sources
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(100) NOT NULL, -- 'api', 'database', 'stream', 'file', 'sensor'
    endpoint TEXT,
    configuration JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'error', 'disabled'
    health_score DECIMAL(5,2) DEFAULT 100.00,
    last_check_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    CONSTRAINT valid_health_score CHECK (health_score >= 0 AND health_score <= 100)
);

CREATE INDEX idx_data_sources_type ON data_sources(source_type);
CREATE INDEX idx_data_sources_status ON data_sources(status);
CREATE INDEX idx_data_sources_health ON data_sources(health_score);

-- Observations: Raw events and data points captured from sources
CREATE TABLE IF NOT EXISTS observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES data_sources(id) ON DELETE CASCADE,
    observation_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'info', -- 'critical', 'high', 'medium', 'low', 'info'
    payload JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    observed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    correlation_id UUID,
    parent_observation_id UUID REFERENCES observations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_observations_source ON observations(source_id);
CREATE INDEX idx_observations_type ON observations(observation_type);
CREATE INDEX idx_observations_severity ON observations(severity);
CREATE INDEX idx_observations_observed_at ON observations(observed_at DESC);
CREATE INDEX idx_observations_processed ON observations(processed) WHERE NOT processed;
CREATE INDEX idx_observations_correlation ON observations(correlation_id);
CREATE INDEX idx_observations_tags ON observations USING GIN(tags);
CREATE INDEX idx_observations_payload ON observations USING GIN(payload);

-- Monitoring Rules: Define what to watch for
CREATE TABLE IF NOT EXISTS monitoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(100) NOT NULL, -- 'threshold', 'pattern', 'anomaly', 'correlation'
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    enabled BOOLEAN DEFAULT TRUE,
    source_filters JSONB DEFAULT '{}',
    evaluation_window INTERVAL,
    cooldown_period INTERVAL,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255)
);

CREATE INDEX idx_monitoring_rules_enabled ON monitoring_rules(enabled) WHERE enabled = TRUE;
CREATE INDEX idx_monitoring_rules_type ON monitoring_rules(rule_type);
CREATE INDEX idx_monitoring_rules_priority ON monitoring_rules(priority);

-- Alerts: Triggered events from monitoring rules
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES monitoring_rules(id) ON DELETE CASCADE,
    observation_id UUID REFERENCES observations(id) ON DELETE SET NULL,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    message TEXT,
    context JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'acknowledged', 'investigating', 'resolved', 'false_positive'
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alerts_rule ON alerts(rule_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_triggered_at ON alerts(triggered_at DESC);
CREATE INDEX idx_alerts_open ON alerts(status) WHERE status = 'open';

-- ============================================================================
-- ANALYSIS AND INTELLIGENCE TABLES
-- ============================================================================

-- Analysis Jobs: Track analysis tasks and processing
CREATE TABLE IF NOT EXISTS analysis_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(100) NOT NULL, -- 'pattern_detection', 'anomaly_detection', 'correlation', 'prediction'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'cancelled'
    input_criteria JSONB NOT NULL,
    results JSONB,
    error_message TEXT,
    progress INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100)
);

CREATE INDEX idx_analysis_jobs_status ON analysis_jobs(status);
CREATE INDEX idx_analysis_jobs_type ON analysis_jobs(job_type);
CREATE INDEX idx_analysis_jobs_created_at ON analysis_jobs(created_at DESC);

-- Patterns: Detected patterns in observations
CREATE TABLE IF NOT EXISTS patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    signature JSONB NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    occurrence_count INTEGER DEFAULT 1,
    first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'false_positive'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 100)
);

CREATE INDEX idx_patterns_type ON patterns(pattern_type);
CREATE INDEX idx_patterns_confidence ON patterns(confidence_score DESC);
CREATE INDEX idx_patterns_last_seen ON patterns(last_seen_at DESC);
CREATE INDEX idx_patterns_status ON patterns(status);

-- Pattern Observations: Link patterns to observations
CREATE TABLE IF NOT EXISTS pattern_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_id UUID REFERENCES patterns(id) ON DELETE CASCADE,
    observation_id UUID REFERENCES observations(id) ON DELETE CASCADE,
    match_score DECIMAL(5,2) NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_match_score CHECK (match_score >= 0 AND match_score <= 100),
    UNIQUE(pattern_id, observation_id)
);

CREATE INDEX idx_pattern_observations_pattern ON pattern_observations(pattern_id);
CREATE INDEX idx_pattern_observations_observation ON pattern_observations(observation_id);
CREATE INDEX idx_pattern_observations_score ON pattern_observations(match_score DESC);

-- Insights: Extracted intelligence and meaning
CREATE TABLE IF NOT EXISTS insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insight_type VARCHAR(100) NOT NULL, -- 'trend', 'anomaly', 'prediction', 'recommendation'
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    details JSONB NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    impact_level VARCHAR(50) NOT NULL, -- 'critical', 'high', 'medium', 'low'
    source_observations UUID[],
    related_patterns UUID[],
    actionable BOOLEAN DEFAULT FALSE,
    recommended_actions JSONB,
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'reviewed', 'acted_upon', 'dismissed'
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_insight_confidence CHECK (confidence_score >= 0 AND confidence_score <= 100)
);

CREATE INDEX idx_insights_type ON insights(insight_type);
CREATE INDEX idx_insights_confidence ON insights(confidence_score DESC);
CREATE INDEX idx_insights_impact ON insights(impact_level);
CREATE INDEX idx_insights_status ON insights(status);
CREATE INDEX idx_insights_created_at ON insights(created_at DESC);
CREATE INDEX idx_insights_actionable ON insights(actionable) WHERE actionable = TRUE;

-- ============================================================================
-- METRICS AND MONITORING TABLES
-- ============================================================================

-- Metrics: Time-series metrics and statistics
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(255) NOT NULL,
    metric_type VARCHAR(100) NOT NULL, -- 'counter', 'gauge', 'histogram', 'summary'
    value DECIMAL(20,6) NOT NULL,
    unit VARCHAR(50),
    dimensions JSONB DEFAULT '{}',
    source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_metrics_name ON metrics(metric_name);
CREATE INDEX idx_metrics_recorded_at ON metrics(recorded_at DESC);
CREATE INDEX idx_metrics_source ON metrics(source_id);
CREATE INDEX idx_metrics_dimensions ON metrics USING GIN(dimensions);

-- Aggregated Metrics: Pre-computed metric aggregations
CREATE TABLE IF NOT EXISTS metric_aggregations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(255) NOT NULL,
    aggregation_type VARCHAR(50) NOT NULL, -- 'avg', 'sum', 'min', 'max', 'count', 'p50', 'p95', 'p99'
    time_window INTERVAL NOT NULL,
    value DECIMAL(20,6) NOT NULL,
    sample_count INTEGER NOT NULL,
    dimensions JSONB DEFAULT '{}',
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(metric_name, aggregation_type, time_window, window_start, dimensions)
);

CREATE INDEX idx_metric_agg_name ON metric_aggregations(metric_name);
CREATE INDEX idx_metric_agg_window ON metric_aggregations(window_start DESC, window_end DESC);
CREATE INDEX idx_metric_agg_type ON metric_aggregations(aggregation_type);

-- ============================================================================
-- KNOWLEDGE GRAPH INTEGRATION TABLES
-- ============================================================================

-- Entities: Track entities discovered through surveillance
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL,
    identifier VARCHAR(500) NOT NULL,
    name VARCHAR(500),
    attributes JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    confidence_score DECIMAL(5,2) DEFAULT 50.00,
    first_observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    observation_count INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_entity_confidence CHECK (confidence_score >= 0 AND confidence_score <= 100),
    UNIQUE(entity_type, identifier)
);

CREATE INDEX idx_entities_type ON entities(entity_type);
CREATE INDEX idx_entities_identifier ON entities(identifier);
CREATE INDEX idx_entities_last_observed ON entities(last_observed_at DESC);
CREATE INDEX idx_entities_attributes ON entities USING GIN(attributes);

-- Entity Relationships: Track relationships between entities
CREATE TABLE IF NOT EXISTS entity_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    target_entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL,
    properties JSONB DEFAULT '{}',
    strength DECIMAL(5,2) DEFAULT 50.00,
    first_observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    observation_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_relationship_strength CHECK (strength >= 0 AND strength <= 100),
    CONSTRAINT no_self_relationship CHECK (source_entity_id != target_entity_id)
);

CREATE INDEX idx_entity_rel_source ON entity_relationships(source_entity_id);
CREATE INDEX idx_entity_rel_target ON entity_relationships(target_entity_id);
CREATE INDEX idx_entity_rel_type ON entity_relationships(relationship_type);
CREATE INDEX idx_entity_rel_strength ON entity_relationships(strength DESC);

-- Entity Observations: Link entities to observations
CREATE TABLE IF NOT EXISTS entity_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    observation_id UUID REFERENCES observations(id) ON DELETE CASCADE,
    extraction_method VARCHAR(100) NOT NULL, -- 'manual', 'pattern', 'ml', 'rule'
    confidence_score DECIMAL(5,2) NOT NULL,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_extraction_confidence CHECK (confidence_score >= 0 AND confidence_score <= 100),
    UNIQUE(entity_id, observation_id)
);

CREATE INDEX idx_entity_obs_entity ON entity_observations(entity_id);
CREATE INDEX idx_entity_obs_observation ON entity_observations(observation_id);
CREATE INDEX idx_entity_obs_confidence ON entity_observations(confidence_score DESC);

-- ============================================================================
-- AUDIT AND SYSTEM TABLES
-- ============================================================================

-- Audit Log: Track all significant system actions
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    actor VARCHAR(255) NOT NULL,
    changes JSONB,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_actor ON audit_log(actor);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- System Health: Track system performance and health
CREATE TABLE IF NOT EXISTS system_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'healthy', 'degraded', 'down'
    metrics JSONB NOT NULL,
    issues TEXT[],
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_health_component ON system_health(component);
CREATE INDEX idx_system_health_status ON system_health(status);
CREATE INDEX idx_system_health_checked_at ON system_health(checked_at DESC);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active Alerts Summary
CREATE OR REPLACE VIEW active_alerts_summary AS
SELECT 
    a.severity,
    COUNT(*) as alert_count,
    MIN(a.triggered_at) as oldest_alert,
    MAX(a.triggered_at) as newest_alert
FROM alerts a
WHERE a.status IN ('open', 'acknowledged', 'investigating')
GROUP BY a.severity;

-- Recent High-Impact Insights
CREATE OR REPLACE VIEW recent_high_impact_insights AS
SELECT 
    i.*,
    CASE 
        WHEN i.impact_level = 'critical' THEN 4
        WHEN i.impact_level = 'high' THEN 3
        WHEN i.impact_level = 'medium' THEN 2
        ELSE 1
    END as impact_score
FROM insights i
WHERE i.status = 'new'
  AND i.created_at > NOW() - INTERVAL '24 hours'
ORDER BY impact_score DESC, i.confidence_score DESC;

-- Data Source Health Overview
CREATE OR REPLACE VIEW data_source_health_overview AS
SELECT 
    ds.source_type,
    COUNT(*) as total_sources,
    COUNT(*) FILTER (WHERE ds.status = 'active') as active_sources,
    COUNT(*) FILTER (WHERE ds.status = 'error') as error_sources,
    AVG(ds.health_score) as avg_health_score,
    MIN(ds.last_check_at) as oldest_check
FROM data_sources ds
GROUP BY ds.source_type;

-- Pattern Detection Summary
CREATE OR REPLACE VIEW pattern_detection_summary AS
SELECT 
    p.pattern_type,
    COUNT(*) as pattern_count,
    AVG(p.confidence_score) as avg_confidence,
    SUM(p.occurrence_count) as total_occurrences,
    MAX(p.last_seen_at) as most_recent_detection
FROM patterns p
WHERE p.status = 'active'
GROUP BY p.pattern_type;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function: Update timestamp on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitoring_rules_updated_at BEFORE UPDATE ON monitoring_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patterns_updated_at BEFORE UPDATE ON patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entity_relationships_updated_at BEFORE UPDATE ON entity_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Increment pattern occurrence count
CREATE OR REPLACE FUNCTION increment_pattern_occurrence()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE patterns
    SET occurrence_count = occurrence_count + 1,
        last_seen_at = NEW.detected_at
    WHERE id = NEW.pattern_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pattern_observation_created AFTER INSERT ON pattern_observations
    FOR EACH ROW EXECUTE FUNCTION increment_pattern_occurrence();

-- Function: Increment entity observation count
CREATE OR REPLACE FUNCTION increment_entity_observation()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE entities
    SET observation_count = observation_count + 1,
        last_observed_at = NOW()
    WHERE id = NEW.entity_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entity_observation_created AFTER INSERT ON entity_observations
    FOR EACH ROW EXECUTE FUNCTION increment_entity_observation();

-- ============================================================================
-- INITIAL DATA / EXAMPLES
-- ============================================================================

-- Insert example monitoring rules
INSERT INTO monitoring_rules (name, description, rule_type, conditions, actions, priority) VALUES
(
    'High Error Rate Detection',
    'Trigger when error rate exceeds 5% in a 5-minute window',
    'threshold',
    '{"metric": "error_rate", "operator": ">", "threshold": 5, "window": "5 minutes"}',
    '{"notify": ["ops-team"], "create_incident": true}',
    'high'
),
(
    'Anomalous Traffic Pattern',
    'Detect unusual spikes in traffic that deviate from normal patterns',
    'anomaly',
    '{"metric": "request_count", "algorithm": "zscore", "sensitivity": 3}',
    '{"notify": ["security-team"], "log": true}',
    'medium'
),
(
    'Suspicious Login Pattern',
    'Multiple failed login attempts from same source',
    'pattern',
    '{"event_type": "login_failed", "count": 5, "window": "10 minutes", "group_by": "source_ip"}',
    '{"notify": ["security-team"], "block_source": true}',
    'critical'
);

-- Insert example data source types
INSERT INTO data_sources (name, source_type, endpoint, configuration, status) VALUES
(
    'Application Logs',
    'stream',
    'kafka://logs.internal:9092/app-logs',
    '{"format": "json", "buffer_size": 1000}',
    'active'
),
(
    'Metrics Collector',
    'api',
    'https://metrics.internal/api/v1/collect',
    '{"interval": 60, "auth_type": "bearer"}',
    'active'
),
(
    'Database Audit Trail',
    'database',
    'postgresql://audit.internal:5432/audit',
    '{"tables": ["user_actions", "system_events"]}',
    'active'
);

COMMENT ON TABLE data_sources IS 'Registry of all data sources monitored by Panopticon Engine';
COMMENT ON TABLE observations IS 'Raw events and data points captured from monitored sources';
COMMENT ON TABLE monitoring_rules IS 'Rules that define what patterns and thresholds to monitor';
COMMENT ON TABLE alerts IS 'Alerts triggered when monitoring rules detect issues';
COMMENT ON TABLE patterns IS 'Detected patterns in observation data';
COMMENT ON TABLE insights IS 'High-level intelligence extracted from observations and patterns';
COMMENT ON TABLE entities IS 'Entities discovered and tracked through surveillance';
COMMENT ON TABLE entity_relationships IS 'Relationships between discovered entities forming a knowledge graph';
COMMENT ON TABLE metrics IS 'Time-series metrics and performance statistics';
COMMENT ON TABLE audit_log IS 'Comprehensive audit trail of all system actions';
