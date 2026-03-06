// Core Types for Panopticon Engine

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ObservationType = string;

export type AlertStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';

export type PatternType = 'sequential' | 'frequency' | 'correlation' | 'anomaly';

export type InsightType = 'trend' | 'anomaly' | 'prediction' | 'recommendation';

export type ImpactLevel = 'critical' | 'high' | 'medium' | 'low';

export type DataSourceType = 'api' | 'database' | 'stream' | 'file' | 'sensor';

export type DataSourceStatus = 'active' | 'paused' | 'error' | 'disabled';

export type RuleType = 'threshold' | 'pattern' | 'anomaly' | 'correlation';

export type EntityType = 'user' | 'service' | 'host' | 'resource' | 'location';

export type RelationshipType = 'depends_on' | 'communicates_with' | 'owns' | 'accesses' | 'deployed_on';

export interface DataSource {
  id: string;
  name: string;
  source_type: DataSourceType;
  endpoint?: string;
  configuration: Record<string, any>;
  metadata: Record<string, any>;
  status: DataSourceStatus;
  health_score: number;
  last_check_at?: Date;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export interface Observation {
  id: string;
  source_id: string;
  observation_type: ObservationType;
  severity: Severity;
  payload: Record<string, any>;
  metadata: Record<string, any>;
  tags: string[];
  observed_at: Date;
  processed: boolean;
  processed_at?: Date;
  correlation_id?: string;
  parent_observation_id?: string;
  created_at: Date;
}

export interface MonitoringRule {
  id: string;
  name: string;
  description?: string;
  rule_type: RuleType;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  priority: string;
  enabled: boolean;
  source_filters: Record<string, any>;
  evaluation_window?: string;
  cooldown_period?: string;
  last_triggered_at?: Date;
  trigger_count: number;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export interface Alert {
  id: string;
  rule_id: string;
  observation_id?: string;
  alert_type: string;
  severity: Severity;
  title: string;
  message?: string;
  context: Record<string, any>;
  status: AlertStatus;
  acknowledged_by?: string;
  acknowledged_at?: Date;
  resolved_by?: string;
  resolved_at?: Date;
  resolution_notes?: string;
  triggered_at: Date;
  created_at: Date;
}

export interface Pattern {
  id: string;
  pattern_type: PatternType;
  name: string;
  description?: string;
  signature: Record<string, any>;
  confidence_score: number;
  occurrence_count: number;
  first_seen_at: Date;
  last_seen_at: Date;
  metadata: Record<string, any>;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface Insight {
  id: string;
  insight_type: InsightType;
  title: string;
  summary: string;
  details: Record<string, any>;
  confidence_score: number;
  impact_level: ImpactLevel;
  source_observations?: string[];
  related_patterns?: string[];
  actionable: boolean;
  recommended_actions?: Record<string, any>;
  status: string;
  reviewed_by?: string;
  reviewed_at?: Date;
  created_at: Date;
  expires_at?: Date;
}

export interface Entity {
  id: string;
  entity_type: EntityType;
  identifier: string;
  name?: string;
  attributes: Record<string, any>;
  metadata: Record<string, any>;
  confidence_score: number;
  first_observed_at: Date;
  last_observed_at: Date;
  observation_count: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface EntityRelationship {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: RelationshipType;
  properties: Record<string, any>;
  strength: number;
  first_observed_at: Date;
  last_observed_at: Date;
  observation_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Metric {
  id: string;
  metric_name: string;
  metric_type: 'counter' | 'gauge' | 'histogram' | 'summary';
  value: number;
  unit?: string;
  dimensions: Record<string, any>;
  source_id?: string;
  recorded_at: Date;
  created_at: Date;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number;
  threshold: number;
  value: number;
  expectedValue: number;
  confidence: number;
  method: string;
}

export interface PatternMatch {
  pattern_id: string;
  observation_id: string;
  match_score: number;
  detected_at: Date;
}

export interface TemporalTrend {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  confidence: number;
  dataPoints: Array<{ timestamp: Date; value: number }>;
  forecast?: Array<{ timestamp: Date; value: number; confidence_interval: [number, number] }>;
}

export interface SentimentAnalysis {
  score: number;
  comparative: number;
  tokens: string[];
  positive: string[];
  negative: string[];
  label: 'positive' | 'negative' | 'neutral';
}
