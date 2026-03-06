import { Router } from 'express';
import logger from '../../lib/logger';
import supabase from '../../lib/supabase';
import { authenticate, authorize } from '../middleware/auth';
import { MonitoringService } from '../../vigilance/MonitoringService';

const router = Router();

// Apply authentication to all admin routes
router.use(authenticate);
router.use(authorize('admin'));

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Get observation count
    const { count: obsCount } = await supabase
      .from('observations')
      .select('*', { count: 'exact', head: true });

    // Get active alerts
    const { count: alertCount } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .in('status', ['open', 'acknowledged']);

    // Get patterns
    const { count: patternCount } = await supabase
      .from('patterns')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get data sources
    const { count: sourceCount } = await supabase
      .from('data_sources')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    res.json({
      observations: obsCount || 0,
      active_alerts: alertCount || 0,
      patterns: patternCount || 0,
      data_sources: sourceCount || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/cleanup
 * Trigger database cleanup
 */
router.post('/cleanup', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { retention_days = 90 } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retention_days);

    // Delete old processed observations
    const { count, error } = await supabase
      .from('observations')
      .delete({ count: 'exact' })
      .eq('processed', true)
      .lt('observed_at', cutoffDate.toISOString());

    if (error) throw error;

    logger.info('Cleanup completed', { deletedRecords: count });

    res.json({
      success: true,
      deleted_records: count || 0,
      cutoff_date: cutoffDate.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/sources
 * Get all data sources
 */
router.get('/sources', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('data_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ sources: data });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/sources
 * Create a new data source
 */
router.post('/sources', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const source = {
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('data_sources')
      .insert([source])
      .select()
      .single();

    if (error) throw error;

    logger.info('Data source created', { id: data.id, name: data.name });

    res.status(201).json({ source: data });
  } catch (error) {
    next(error);
  }
});

export default router;
