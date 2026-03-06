import { Router } from 'express';
import logger from '../../lib/logger';
import supabase from '../../lib/supabase';
import { generateId } from '../../lib/utils';

const router = Router();

/**
 * POST /api/webhooks/github
 * GitHub webhook receiver
 */
router.post('/github', async (req, res, next) => {
  try {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    logger.info('GitHub webhook received', { event });

    // Create observation from GitHub event
    const observation = {
      id: generateId(),
      source_id: generateId(), // Or lookup GitHub source
      observation_type: `github_${event}`,
      severity: 'info',
      payload,
      metadata: {
        source: 'github',
        event_type: event,
      },
      tags: ['github', event as string],
      observed_at: new Date(),
      processed: false,
      created_at: new Date(),
    };

    if (supabase) {
      await supabase.from('observations').insert([observation]);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/webhooks/slack
 * Slack webhook receiver
 */
router.post('/slack', async (req, res, next) => {
  try {
    const payload = req.body;

    logger.info('Slack webhook received');

    // Handle Slack URL verification
    if (payload.type === 'url_verification') {
      return res.json({ challenge: payload.challenge });
    }

    // Create observation from Slack event
    const observation = {
      id: generateId(),
      source_id: generateId(),
      observation_type: `slack_${payload.type}`,
      severity: 'info',
      payload,
      metadata: {
        source: 'slack',
      },
      tags: ['slack'],
      observed_at: new Date(),
      processed: false,
      created_at: new Date(),
    };

    if (supabase) {
      await supabase.from('observations').insert([observation]);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/webhooks/generic
 * Generic webhook receiver
 */
router.post('/generic', async (req, res, next) => {
  try {
    const payload = req.body;
    const { source_name, observation_type } = req.query;

    const observation = {
      id: generateId(),
      source_id: generateId(),
      observation_type: (observation_type as string) || 'webhook_event',
      severity: payload.severity || 'info',
      payload,
      metadata: {
        source: source_name || 'webhook',
      },
      tags: ['webhook'],
      observed_at: new Date(),
      processed: false,
      created_at: new Date(),
    };

    if (supabase) {
      await supabase.from('observations').insert([observation]);
    }

    logger.info('Generic webhook received', { source: source_name, type: observation_type });

    res.status(200).json({ success: true, observation_id: observation.id });
  } catch (error) {
    next(error);
  }
});

export default router;
