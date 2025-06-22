import { createClient } from '@supabase/supabase-js';
import { config } from './config';

const supabase = createClient(
  config.db.url,
  config.db.anonKey
);

export { supabase };
export type Database = typeof supabase;