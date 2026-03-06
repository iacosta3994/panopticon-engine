import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import logger from './logger';

if (!config.supabase.url || !config.supabase.serviceKey) {
  logger.warn('Supabase configuration not found, using DATABASE_URL instead');
}

export const supabase = config.supabase.url && config.supabase.serviceKey
  ? createClient(config.supabase.url, config.supabase.serviceKey)
  : null;

export default supabase;
