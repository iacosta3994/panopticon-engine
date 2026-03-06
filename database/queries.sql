-- Panopticon Engine: Example Queries
-- Collection of useful queries for working with the Panopticon Engine database

-- ============================================================================
-- REAL-TIME MONITORING QUERIES
-- ============================================================================

-- Get all active alerts by severity
SELECT 
    severity,
    COUNT(*) as alert_count,
    array_agg(DISTINCT alert_type) as alert_types,
    MIN(triggered_at) as oldest_alert
FROM alerts
WHERE status IN ('open', 'acknowledged')
GROUP BY severity
ORDER BY 
    CASE severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
        ELSE 5
    END;

-- Recent high-severity observations
SELECT 
    o.id,
    o.observation_type,
    o.severity,
    o.payload,
    ds.name as source_name,
    o.observed_at
FROM observations o
JOIN data_sources ds ON o.source_id = ds.id
WHERE o.severity IN ('critical', 'high')
  AND o.observed_at > NOW() - INTERVAL '1 hour'
ORDER BY o.observed_at DESC
LIMIT 50;

-- Data source health dashboard
SELECT 
    name,
    source_type,
    status,
    health_score,
    last_check_at,
    CASE 
        WHEN last_check_at < NOW() - INTERVAL '5 minutes' THEN 'STALE'
        WHEN health_score < 50 THEN 'CRITICAL'
        WHEN health_score < 80 THEN 'WARNING'
        ELSE 'HEALTHY'
    END as health_status
FROM data_sources
WHERE status = 'active'
ORDER BY health_score ASC, last_check_at ASC;

-- Unprocessed observations count
SELECT 
    source_id,
    ds.name as source_name,
    COUNT(*) as unprocessed_count,
    MIN(observed_at) as oldest_unprocessed
FROM observations o
JOIN data_sources ds ON o.source_id = ds.id
WHERE processed = FALSE
GROUP BY source_id, ds.name
ORDER BY unprocessed_count DESC;

-- ============================================================================
-- PATTERN ANALYSIS QUERIES
-- ============================================================================

-- Top patterns by occurrence
SELECT 
    p.id,
    p.name,
    p.pattern_type,
    p.occurrence_count,
    p.confidence_score,
    p.last_seen_at,
    COUNT(DISTINCT po.observation_id) as unique_observations
FROM patterns p
LEFT JOIN pattern_observations po ON p.id = po.pattern_id
WHERE p.status = 'active'
GROUP BY p.id
ORDER BY p.occurrence_count DESC
LIMIT 20;

-- Patterns detected in last 24 hours
SELECT 
    p.name,
    p.pattern_type,
    COUNT(*) as detection_count,
    AVG(po.match_score) as avg_match_score,
    MAX(po.detected_at) as last_detection
FROM patterns p
JOIN pattern_observations po ON p.id = po.pattern_id
WHERE po.detected_at > NOW() - INTERVAL '24 hours'
GROUP BY p.id, p.name, p.pattern_type
ORDER BY detection_count DESC;

-- Find observations matching multiple patterns
SELECT 
    o.id,
    o.observation_type,
    o.observed_at,
    COUNT(DISTINCT po.pattern_id) as pattern_count,
    array_agg(DISTINCT p.name) as matching_patterns
FROM observations o
JOIN pattern_observations po ON o.id = po.observation_id
JOIN patterns p ON po.pattern_id = p.id
WHERE o.observed_at > NOW() - INTERVAL '1 hour'
GROUP BY o.id, o.observation_type, o.observed_at
HAVING COUNT(DISTINCT po.pattern_id) > 1
ORDER BY pattern_count DESC, o.observed_at DESC;

-- ============================================================================
-- INSIGHTS AND INTELLIGENCE QUERIES
-- ============================================================================

-- High-impact actionable insights
SELECT 
    i.id,
    i.insight_type,
    i.title,
    i.summary,
    i.impact_level,
    i.confidence_score,
    i.recommended_actions,
    i.created_at
FROM insights i
WHERE i.status = 'new'
  AND i.actionable = TRUE
  AND i.impact_level IN ('critical', 'high')
  AND i.confidence_score > 70
ORDER BY 
    CASE i.impact_level
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        ELSE 3
    END,
    i.confidence_score DESC,
    i.created_at DESC;

-- Insights by type over time
SELECT 
    date_trunc('hour', created_at) as hour,
    insight_type,
    COUNT(*) as insight_count,
    AVG(confidence_score) as avg_confidence
FROM insights
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY hour, insight_type
ORDER BY hour DESC, insight_count DESC;

-- Insight resolution rate
SELECT 
    insight_type,
    COUNT(*) as total_insights,
    COUNT(*) FILTER (WHERE status = 'acted_upon') as acted_upon,
    COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'acted_upon') / COUNT(*), 2) as action_rate
FROM insights
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY insight_type
ORDER BY total_insights DESC;

-- ============================================================================
-- KNOWLEDGE GRAPH QUERIES
-- ============================================================================

-- Entity activity summary
SELECT 
    e.entity_type,
    e.identifier,
    e.name,
    e.observation_count,
    e.confidence_score,
    e.last_observed_at,
    COUNT(DISTINCT eo.observation_id) as linked_observations
FROM entities e
LEFT JOIN entity_observations eo ON e.id = eo.entity_id
WHERE e.status = 'active'
GROUP BY e.id
ORDER BY e.observation_count DESC
LIMIT 50;

-- Entity relationship graph (immediate connections)
SELECT 
    se.entity_type as source_type,
    se.identifier as source_identifier,
    er.relationship_type,
    te.entity_type as target_type,
    te.identifier as target_identifier,
    er.strength,
    er.observation_count
FROM entity_relationships er
JOIN entities se ON er.source_entity_id = se.id
JOIN entities te ON er.target_entity_id = te.id
WHERE se.identifier = 'user-authentication-api'
ORDER BY er.strength DESC;

-- Find highly connected entities (hubs)
SELECT 
    e.entity_type,
    e.identifier,
    e.name,
    COUNT(DISTINCT er_out.id) as outgoing_connections,
    COUNT(DISTINCT er_in.id) as incoming_connections,
    COUNT(DISTINCT er_out.id) + COUNT(DISTINCT er_in.id) as total_connections
FROM entities e
LEFT JOIN entity_relationships er_out ON e.id = er_out.source_entity_id
LEFT JOIN entity_relationships er_in ON e.id = er_in.target_entity_id
WHERE e.status = 'active'
GROUP BY e.id
HAVING COUNT(DISTINCT er_out.id) + COUNT(DISTINCT er_in.id) > 5
ORDER BY total_connections DESC;

-- Service dependency chain (recursive)
WITH RECURSIVE dependency_chain AS (
    -- Start with the target service
    SELECT 
        e.id,
        e.identifier,
        NULL::TEXT as depends_on,
        0 as depth
    FROM entities e
    WHERE e.identifier = 'frontend-webapp'
    
    UNION ALL
    
    -- Find dependencies recursively
    SELECT 
        e.id,
        e.identifier,
        dc.identifier as depends_on,
        dc.depth + 1
    FROM entity_relationships er
    JOIN entities e ON er.target_entity_id = e.id
    JOIN dependency_chain dc ON er.source_entity_id = dc.id
    WHERE er.relationship_type = 'depends_on'
      AND dc.depth < 5  -- Limit recursion depth
)
SELECT 
    depth,
    identifier,
    depends_on
FROM dependency_chain
ORDER BY depth, identifier;

-- ============================================================================
-- METRICS AND TIME-SERIES QUERIES
-- ============================================================================

-- Recent metric values
SELECT 
    metric_name,
    value,
    unit,
    dimensions,
    recorded_at
FROM metrics
WHERE metric_name = 'api.response_time'
  AND recorded_at > NOW() - INTERVAL '1 hour'
ORDER BY recorded_at DESC
LIMIT 100;

-- Metric aggregation by time buckets
SELECT 
    metric_name,
    date_trunc('5 minutes', recorded_at) as time_bucket,
    AVG(value) as avg_value,
    MIN(value) as min_value,
    MAX(value) as max_value,
    COUNT(*) as sample_count
FROM metrics
WHERE recorded_at > NOW() - INTERVAL '24 hours'
GROUP BY metric_name, time_bucket
ORDER BY time_bucket DESC, metric_name;

-- Metric percentiles (approximate)
SELECT 
    metric_name,
    percentile_cont(0.50) WITHIN GROUP (ORDER BY value) as p50,
    percentile_cont(0.95) WITHIN GROUP (ORDER BY value) as p95,
    percentile_cont(0.99) WITHIN GROUP (ORDER BY value) as p99
FROM metrics
WHERE metric_name IN ('api.response_time', 'api.latency')
  AND recorded_at > NOW() - INTERVAL '1 hour'
GROUP BY metric_name;

-- Pre-computed aggregations
SELECT 
    metric_name,
    aggregation_type,
    value,
    window_start,
    window_end,
    sample_count
FROM metric_aggregations
WHERE metric_name = 'api.request_count'
  AND aggregation_type = 'sum'
  AND time_window = '1 hour'
  AND window_start > NOW() - INTERVAL '24 hours'
ORDER BY window_start DESC;

-- ============================================================================
-- MONITORING RULES AND ALERTS
-- ============================================================================

-- Alert frequency by rule
SELECT 
    mr.name as rule_name,
    mr.rule_type,
    mr.priority,
    COUNT(a.id) as alert_count,
    MIN(a.triggered_at) as first_trigger,
    MAX(a.triggered_at) as last_trigger
FROM monitoring_rules mr
LEFT JOIN alerts a ON mr.id = a.rule_id
    AND a.triggered_at > NOW() - INTERVAL '7 days'
WHERE mr.enabled = TRUE
GROUP BY mr.id, mr.name, mr.rule_type, mr.priority
ORDER BY alert_count DESC;

-- Alert response time
SELECT 
    severity,
    COUNT(*) as total_alerts,
    AVG(EXTRACT(EPOCH FROM (acknowledged_at - triggered_at))) as avg_ack_time_seconds,
    AVG(EXTRACT(EPOCH FROM (resolved_at - triggered_at))) as avg_resolution_time_seconds
FROM alerts
WHERE triggered_at > NOW() - INTERVAL '30 days'
  AND resolved_at IS NOT NULL
GROUP BY severity
ORDER BY 
    CASE severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
    END;

-- False positive rate
SELECT 
    mr.name,
    COUNT(*) as total_alerts,
    COUNT(*) FILTER (WHERE a.status = 'false_positive') as false_positives,
    ROUND(100.0 * COUNT(*) FILTER (WHERE a.status = 'false_positive') / COUNT(*), 2) as false_positive_rate
FROM alerts a
JOIN monitoring_rules mr ON a.rule_id = mr.id
WHERE a.triggered_at > NOW() - INTERVAL '30 days'
GROUP BY mr.id, mr.name
HAVING COUNT(*) > 10
ORDER BY false_positive_rate DESC;

-- ============================================================================
-- ANALYSIS JOBS
-- ============================================================================

-- Recent analysis jobs status
SELECT 
    job_type,
    status,
    COUNT(*) as job_count,
    AVG(execution_time_ms) as avg_execution_time,
    MAX(execution_time_ms) as max_execution_time
FROM analysis_jobs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY job_type, status
ORDER BY job_type, status;

-- Failed analysis jobs
SELECT 
    id,
    job_type,
    error_message,
    input_criteria,
    created_at,
    started_at
FROM analysis_jobs
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- ============================================================================
-- AUDIT AND COMPLIANCE QUERIES
-- ============================================================================

-- Recent system actions
SELECT 
    action,
    resource_type,
    actor,
    COUNT(*) as action_count,
    MAX(created_at) as last_action
FROM audit_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY action, resource_type, actor
ORDER BY action_count DESC;

-- User activity audit
SELECT 
    actor,
    action,
    resource_type,
    resource_id,
    created_at
FROM audit_log
WHERE actor = 'specific_user@example.com'
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- System health check
SELECT 
    component,
    status,
    metrics,
    issues,
    checked_at
FROM system_health
WHERE checked_at > NOW() - INTERVAL '1 hour'
ORDER BY 
    CASE status
        WHEN 'down' THEN 1
        WHEN 'degraded' THEN 2
        ELSE 3
    END,
    checked_at DESC;

-- ============================================================================
-- CORRELATION QUERIES
-- ============================================================================

-- Correlated observations (by correlation_id)
SELECT 
    o.correlation_id,
    COUNT(*) as observation_count,
    array_agg(DISTINCT o.observation_type) as types,
    array_agg(DISTINCT o.severity) as severities,
    MIN(o.observed_at) as first_observation,
    MAX(o.observed_at) as last_observation
FROM observations o
WHERE o.correlation_id IS NOT NULL
  AND o.observed_at > NOW() - INTERVAL '1 hour'
GROUP BY o.correlation_id
HAVING COUNT(*) > 1
ORDER BY observation_count DESC;

-- Tag co-occurrence analysis
SELECT 
    t1.tag as tag1,
    t2.tag as tag2,
    COUNT(*) as co_occurrence_count
FROM (
    SELECT id, unnest(tags) as tag FROM observations
    WHERE observed_at > NOW() - INTERVAL '24 hours'
) t1
JOIN (
    SELECT id, unnest(tags) as tag FROM observations
    WHERE observed_at > NOW() - INTERVAL '24 hours'
) t2 ON t1.id = t2.id AND t1.tag < t2.tag
GROUP BY t1.tag, t2.tag
HAVING COUNT(*) > 5
ORDER BY co_occurrence_count DESC
LIMIT 20;

-- ============================================================================
-- CLEANUP AND MAINTENANCE QUERIES
-- ============================================================================

-- Old processed observations (for archival/deletion)
SELECT COUNT(*)
FROM observations
WHERE processed = TRUE
  AND observed_at < NOW() - INTERVAL '90 days';

-- Disk space usage by table
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
