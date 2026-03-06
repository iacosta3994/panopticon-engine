import logger from '../lib/logger';
import supabase from '../lib/supabase';
import { Alert, MonitoringRule, Observation, Severity } from '../lib/types';
import { generateId } from '../lib/utils';
import axios from 'axios';
import { config } from '../lib/config';

interface InterventionAction {
  type: 'alert' | 'notify' | 'block' | 'escalate' | 'auto_remediate';
  target: string;
  parameters: Record<string, any>;
}

export class InterventionEngine {
  /**
   * Decide if intervention is needed
   */
  async shouldIntervene(
    observation: Observation,
    rule: MonitoringRule
  ): Promise<boolean> {
    // Check cooldown period
    if (rule.last_triggered_at && rule.cooldown_period) {
      const cooldownMs = this.parseDuration(rule.cooldown_period);
      const timeSinceLastTrigger = Date.now() - new Date(rule.last_triggered_at).getTime();
      
      if (timeSinceLastTrigger < cooldownMs) {
        logger.debug('Rule in cooldown period', {
          rule: rule.name,
          remainingMs: cooldownMs - timeSinceLastTrigger,
        });
        return false;
      }
    }

    // Evaluate conditions
    const conditionsMet = await this.evaluateConditions(observation, rule);
    
    if (conditionsMet) {
      logger.info('Intervention conditions met', {
        rule: rule.name,
        observation: observation.id,
      });
    }

    return conditionsMet;
  }

  /**
   * Execute intervention
   */
  async intervene(
    observation: Observation,
    rule: MonitoringRule
  ): Promise<void> {
    try {
      logger.info('Executing intervention', {
        rule: rule.name,
        observation: observation.id,
      });

      // Create alert
      const alert = await this.createAlert(observation, rule);

      // Execute actions defined in the rule
      const actions = rule.actions as Record<string, any>;
      await this.executeActions(actions, alert, observation);

      // Update rule trigger count
      await this.updateRuleTrigger(rule.id);

      logger.info('Intervention completed successfully', {
        rule: rule.name,
        alert: alert.id,
      });
    } catch (error) {
      logger.error('Failed to execute intervention', {
        error,
        rule: rule.name,
        observation: observation.id,
      });
      throw error;
    }
  }

  /**
   * Evaluate rule conditions
   */
  private async evaluateConditions(
    observation: Observation,
    rule: MonitoringRule
  ): Promise<boolean> {
    const conditions = rule.conditions as Record<string, any>;

    switch (rule.rule_type) {
      case 'threshold':
        return this.evaluateThresholdCondition(observation, conditions);
      
      case 'pattern':
        return this.evaluatePatternCondition(observation, conditions);
      
      case 'anomaly':
        return this.evaluateAnomalyCondition(observation, conditions);
      
      case 'correlation':
        return await this.evaluateCorrelationCondition(observation, conditions);
      
      default:
        logger.warn('Unknown rule type', { ruleType: rule.rule_type });
        return false;
    }
  }

  /**
   * Evaluate threshold condition
   */
  private evaluateThresholdCondition(
    observation: Observation,
    conditions: Record<string, any>
  ): boolean {
    const { metric, operator, threshold } = conditions;
    const value = observation.payload[metric];

    if (typeof value !== 'number') return false;

    switch (operator) {
      case '>':
        return value > threshold;
      case '<':
        return value < threshold;
      case '>=':
        return value >= threshold;
      case '<=':
        return value <= threshold;
      case '==':
        return value === threshold;
      default:
        return false;
    }
  }

  /**
   * Evaluate pattern condition
   */
  private evaluatePatternCondition(
    observation: Observation,
    conditions: Record<string, any>
  ): boolean {
    // Check if observation metadata contains pattern match
    return observation.metadata?.pattern_match !== undefined;
  }

  /**
   * Evaluate anomaly condition
   */
  private evaluateAnomalyCondition(
    observation: Observation,
    conditions: Record<string, any>
  ): boolean {
    const anomaly = observation.metadata?.anomaly;
    if (!anomaly) return false;

    const { sensitivity = 3 } = conditions;
    return anomaly.isAnomaly && anomaly.score >= sensitivity;
  }

  /**
   * Evaluate correlation condition
   */
  private async evaluateCorrelationCondition(
    observation: Observation,
    conditions: Record<string, any>
  ): Promise<boolean> {
    if (!supabase || !observation.correlation_id) return false;

    const { min_events = 2, time_window = '5 minutes' } = conditions;
    const windowMs = this.parseDuration(time_window);
    const cutoffTime = new Date(Date.now() - windowMs);

    try {
      const { count, error } = await supabase
        .from('observations')
        .select('*', { count: 'exact', head: true })
        .eq('correlation_id', observation.correlation_id)
        .gte('observed_at', cutoffTime.toISOString());

      if (error) throw error;

      return (count || 0) >= min_events;
    } catch (error) {
      logger.error('Failed to evaluate correlation condition', { error });
      return false;
    }
  }

  /**
   * Create alert from observation and rule
   */
  private async createAlert(
    observation: Observation,
    rule: MonitoringRule
  ): Promise<Alert> {
    const alert: Partial<Alert> = {
      id: generateId(),
      rule_id: rule.id,
      observation_id: observation.id,
      alert_type: rule.rule_type,
      severity: this.determineSeverity(observation, rule),
      title: `${rule.name} triggered`,
      message: this.generateAlertMessage(observation, rule),
      context: {
        observation_type: observation.observation_type,
        source_id: observation.source_id,
        rule_conditions: rule.conditions,
        observation_payload: observation.payload,
      },
      status: 'open',
      triggered_at: new Date(),
      created_at: new Date(),
    };

    if (supabase) {
      const { error } = await supabase.from('alerts').insert([alert]);
      if (error) throw error;
    }

    return alert as Alert;
  }

  /**
   * Execute intervention actions
   */
  private async executeActions(
    actions: Record<string, any>,
    alert: Alert,
    observation: Observation
  ): Promise<void> {
    const actionPromises: Promise<void>[] = [];

    // Send notifications
    if (actions.notify && Array.isArray(actions.notify)) {
      actionPromises.push(this.sendNotifications(actions.notify, alert));
    }

    // Create incident
    if (actions.create_incident) {
      actionPromises.push(this.createIncident(alert, observation));
    }

    // Block source
    if (actions.block_source) {
      actionPromises.push(this.blockSource(observation.source_id));
    }

    // Execute webhook
    if (actions.webhook_url) {
      actionPromises.push(this.executeWebhook(actions.webhook_url, alert));
    }

    // Auto-remediate
    if (actions.auto_remediate) {
      actionPromises.push(this.autoRemediate(alert, observation, actions.remediation_script));
    }

    await Promise.allSettled(actionPromises);
  }

  /**
   * Send notifications
   */
  private async sendNotifications(recipients: string[], alert: Alert): Promise<void> {
    if (!config.notification.enabled) {
      logger.debug('Notifications disabled');
      return;
    }

    logger.info('Sending notifications', { recipients, alert: alert.id });

    // Send to Slack if configured
    if (config.notification.slackWebhookUrl) {
      await this.sendSlackNotification(alert);
    }

    // TODO: Send email notifications
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(alert: Alert): Promise<void> {
    try {
      await axios.post(config.notification.slackWebhookUrl, {
        text: `🚨 ${alert.title}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${alert.title}*\n${alert.message}`,
            },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Severity:*\n${alert.severity}` },
              { type: 'mrkdwn', text: `*Status:*\n${alert.status}` },
            ],
          },
        ],
      });

      logger.info('Slack notification sent', { alert: alert.id });
    } catch (error) {
      logger.error('Failed to send Slack notification', { error });
    }
  }

  /**
   * Create incident (placeholder)
   */
  private async createIncident(alert: Alert, observation: Observation): Promise<void> {
    logger.info('Creating incident', { alert: alert.id });
    // TODO: Integrate with incident management system
  }

  /**
   * Block data source
   */
  private async blockSource(sourceId: string): Promise<void> {
    if (!supabase) return;

    logger.warn('Blocking data source', { sourceId });

    const { error } = await supabase
      .from('data_sources')
      .update({
        status: 'disabled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sourceId);

    if (error) {
      logger.error('Failed to block source', { error, sourceId });
    }
  }

  /**
   * Execute webhook
   */
  private async executeWebhook(url: string, alert: Alert): Promise<void> {
    try {
      await axios.post(url, alert, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      });

      logger.info('Webhook executed', { url, alert: alert.id });
    } catch (error) {
      logger.error('Failed to execute webhook', { error, url });
    }
  }

  /**
   * Auto-remediate (placeholder)
   */
  private async autoRemediate(
    alert: Alert,
    observation: Observation,
    script?: string
  ): Promise<void> {
    logger.info('Auto-remediation triggered', { alert: alert.id, script });
    // TODO: Implement auto-remediation logic
  }

  /**
   * Determine alert severity
   */
  private determineSeverity(observation: Observation, rule: MonitoringRule): Severity {
    // Use observation severity if available
    if (observation.severity) return observation.severity;

    // Use rule priority as fallback
    const priorityToSeverity: Record<string, Severity> = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low',
    };

    return priorityToSeverity[rule.priority] || 'medium';
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(observation: Observation, rule: MonitoringRule): string {
    return `Rule "${rule.name}" was triggered by observation ${observation.id} at ${observation.observed_at}`;
  }

  /**
   * Update rule trigger count and timestamp
   */
  private async updateRuleTrigger(ruleId: string): Promise<void> {
    if (!supabase) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('monitoring_rules')
        .select('trigger_count')
        .eq('id', ruleId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('monitoring_rules')
        .update({
          trigger_count: (data?.trigger_count || 0) + 1,
          last_triggered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', ruleId);

      if (updateError) throw updateError;
    } catch (error) {
      logger.error('Failed to update rule trigger', { error, ruleId });
    }
  }

  /**
   * Parse duration string to milliseconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)\s*(second|minute|hour|day)s?$/i);
    if (!match) return 0;

    const [, value, unit] = match;
    const multipliers: Record<string, number> = {
      second: 1000,
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
    };

    return parseInt(value, 10) * (multipliers[unit.toLowerCase()] || 0);
  }
}
