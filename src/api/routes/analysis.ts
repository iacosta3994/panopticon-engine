import { Router } from 'express';
import logger from '../../lib/logger';
import supabase from '../../lib/supabase';
import { TemporalAnalyzer } from '../../meaning/TemporalAnalyzer';
import { PatternSynthesizer } from '../../meaning/PatternSynthesizer';
import { AnomalyDetector } from '../../vigilance/AnomalyDetector';

const router = Router();

const temporalAnalyzer = new TemporalAnalyzer();
const patternSynthesizer = new PatternSynthesizer();
const anomalyDetector = new AnomalyDetector();

/**
 * GET /api/analysis/trends/:metric
 * Get trend analysis for a metric
 */
router.get('/trends/:metric', async (req, res, next) => {
  try {
    const { metric } = req.params;
    const { timeRange = 'day' } = req.query;

    const trend = await temporalAnalyzer.analyzeTrend(
      metric,
      timeRange as any
    );

    if (!trend) {
      return res.status(404).json({ error: 'Insufficient data for trend analysis' });
    }

    res.json({ trend });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analysis/patterns
 * Get active patterns
 */
router.get('/patterns', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('patterns')
      .select('*')
      .eq('status', 'active')
      .order('confidence_score', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({ patterns: data });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analysis/insights
 * Get recent insights
 */
router.get('/insights', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { impact_level, status = 'new', limit = 50 } = req.query;

    let query = supabase
      .from('insights')
      .select('*')
      .eq('status', status as string)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string, 10));

    if (impact_level) {
      query = query.eq('impact_level', impact_level);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ insights: data });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analysis/alerts
 * Get active alerts
 */
router.get('/alerts', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { status = 'open', severity, limit = 100 } = req.query;

    let query = supabase
      .from('alerts')
      .select('*')
      .order('triggered_at', { ascending: false })
      .limit(parseInt(limit as string, 10));

    if (status) {
      query = query.eq('status', status);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ alerts: data });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/analysis/alerts/:id
 * Update alert status
 */
router.put('/alerts/:id', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    const { status, resolution_notes } = req.body;

    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'acknowledged') {
      updates.acknowledged_at = new Date().toISOString();
      updates.acknowledged_by = req.body.acknowledged_by || 'system';
    }

    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = req.body.resolved_by || 'system';
      updates.resolution_notes = resolution_notes;
    }

    const { error } = await supabase
      .from('alerts')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analysis/entities
 * Get discovered entities
 */
router.get('/entities', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { entity_type, limit = 100 } = req.query;

    let query = supabase
      .from('entities')
      .select('*')
      .eq('status', 'active')
      .order('observation_count', { ascending: false })
      .limit(parseInt(limit as string, 10));

    if (entity_type) {
      query = query.eq('entity_type', entity_type);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ entities: data });
  } catch (error) {
    next(error);
  }
});

export default router;
