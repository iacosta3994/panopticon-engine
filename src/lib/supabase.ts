import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from './logger';
import { config } from './config';

/**
 * Supabase client - Original PostgreSQL architecture
 * Auto-initializes with environment variables
 */

let supabase: SupabaseClient | null = null;

try {
  const supabaseUrl = config.supabase.url;
  const supabaseKey = config.supabase.serviceKey;

  if (!supabaseUrl || !supabaseKey) {
    logger.warn('⚠️  Supabase credentials not configured. Database features disabled.');
    logger.info('Add SUPABASE_URL and SUPABASE_SERVICE_KEY to enable database.');
  } else {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });
    logger.info('✅ Supabase client initialized');
  }
} catch (error) {
  logger.error('❌ Failed to initialize Supabase client', { error });
}

export default supabase;
