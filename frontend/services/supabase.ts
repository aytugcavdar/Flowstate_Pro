/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isSupabaseConfigured = () => !!supabase;

/**
 * Database Types
 */
export interface DBProfile {
  id: string; // uuid
  username: string;
  created_at: string;
  updated_at: string;
}

export interface DBScore {
  id: number;
  user_id: string; // uuid
  username: string; // denormalized for easier fetch
  date_key: string; 
  moves: number;
  time_ms: number;
  created_at: string;
}
