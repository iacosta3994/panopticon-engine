import { Router } from 'express';
import { z } from 'zod';
import logger from '../../lib/logger';
import supabase from '../../lib/supabase';
import { generateId } from '../../lib/utils';

const router = Router();

// Validation schema for observations
const observationSchema = z.object({
  source_id: z.string().uuid().optional(),
  source_name: z.string().optional(),
  observation_type: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).optional(),
  payload: z.record(z.any()),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  observed_at: z.string().datetime().optional(),
});

/**
 * POST /api/ingest/observation
 * Ingest a single observation
 */
router.post('/observation', async (req, res, next) => {
  try {
    const validated = observationSchema.parse(req.body);

    const observation = {
      id: generateId(),
      source_id: validated.source_id || generateId(),
      observation_type: validated.observation_type,
      severity: validated.severity || 'info',
      payload: validated.payload,
      metadata: validated.metadata || {},
      tags: validated.tags || [],
      observed_at: validated.observed_at ? new Date(validated.observed_at) : new Date(),
      processed: false,
      created_at: new Date(),
    };

    if (supabase) {
      const { error } = await supabase.from('observations').insert([observation]);
      if (error) throw error;
    }

    logger.info('Observation ingested', { id: observation.id, type: observation.observation_type });

    res.status(201).json({
      success: true,
      observation_id: observation.id,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
});

/**
 * POST /api/ingest/batch
 * Ingest multiple observations
 */
router.post('/batch', async (req, res, next) => {
  try {
    const { observations } = req.body;

    if (!Array.isArray(observations)) {
      return res.status(400).json({ error: 'observations must be an array' });
    }

    const validated = observations.map(obs => observationSchema.parse(obs));

    const formattedObservations = validated.map(obs => ({
      id: generateId(),
      source_id: obs.source_id || generateId(),
      observation_type: obs.observation_type,
      severity: obs.severity || 'info',
      payload: obs.payload,
      metadata: obs.metadata || {},
      tags: obs.tags || [],
      observed_at: obs.observed_at ? new Date(obs.observed_at) : new Date(),
      processed: false,
      created_at: new Date(),
    }));

    if (supabase) {
      const { error } = await supabase.from('observations').insert(formattedObservations);
      if (error) throw error;
    }

    logger.info('Batch observations ingested', { count: formattedObservations.length });

    res.status(201).json({
      success: true,
      count: formattedObservations.length,
      observation_ids: formattedObservations.map(o => o.id),
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
});

/**
 * POST /api/ingest/metric
 * Ingest a metric
 */
router.post('/metric', async (req, res, next) => {
  try {
    const { metric_name, value, unit, dimensions, source_id } = req.body;

    if (!metric_name || typeof value !== 'number') {
      return res.status(400).json({ error: 'metric_name and value are required' });
    }

    const metric = {
      id: generateId(),
      metric_name,
      metric_type: 'gauge',
      value,
      unit,
      dimensions: dimensions || {},
      source_id,
      recorded_at: new Date(),
      created_at: new Date(),
    };

    if (supabase) {
      const { error } = await supabase.from('metrics').insert([metric]);
      if (error) throw error;
    }

    logger.debug('Metric ingested', { name: metric_name, value });

    res.status(201).json({
      success: true,
      metric_id: metric.id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
