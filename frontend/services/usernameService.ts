/**
 * Username Service - Generates and manages unique usernames
 * 
 * Discord-style: username#1234
 */

import { supabase, isSupabaseConfigured } from './supabase';

// ============================================
// COOL NAME POOLS
// ============================================

const ADJECTIVES = [
  'Swift', 'Dark', 'Cyber', 'Neon', 'Shadow', 'Quantum', 'Pixel',
  'Sonic', 'Turbo', 'Mega', 'Ultra', 'Hyper', 'Super', 'Epic',
  'Mystic', 'Frost', 'Storm', 'Thunder', 'Blaze', 'Cosmic'
];

const NOUNS = [
  'Runner', 'Hacker', 'Ghost', 'Phoenix', 'Wolf', 'Dragon', 'Ninja',
  'Knight', 'Rogue', 'Cipher', 'Matrix', 'Spark', 'Blade', 'Zero',
  'Nova', 'Pulse', 'Storm', 'Viper', 'Hawk', 'Tiger'
];

const STORAGE_KEY = 'flowstate_username_v1';

// ============================================
// USERNAME GENERATION
// ============================================

/**
 * Generate a random 4-digit tag
 */
function generateTag(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generate a random cool name (no tag)
 */
function generateBaseName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj}${noun}`;
}

/**
 * Generate a unique username with tag
 */
export function generateUniqueUsername(baseName?: string): string {
  const name = baseName || generateBaseName();
  const tag = generateTag();
  return `${name}#${tag}`;
}

// ============================================
// USERNAME MANAGEMENT
// ============================================

/**
 * Get or create username for current user
 * Returns stored username or generates a new unique one
 */
export async function getOrCreateUsername(): Promise<string> {
  // First check localStorage
  const stored = getStoredUsername();
  if (stored) return stored;
  
  // Generate new unique username
  const newUsername = generateUniqueUsername();
  
  // If Supabase configured, ensure it's unique in DB
  if (isSupabaseConfigured() && supabase) {
    try {
      // Check if tag collision (rare but possible)
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', newUsername)
        .single();
      
      if (data) {
        // Collision! Regenerate
        const uniqueUsername = generateUniqueUsername();
        saveUsername(uniqueUsername);
        return uniqueUsername;
      }
    } catch {
      // No collision or error, continue
    }
  }
  
  saveUsername(newUsername);
  return newUsername;
}

/**
 * Get stored username from localStorage
 */
export function getStoredUsername(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Save username to localStorage
 */
export function saveUsername(username: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, username);
  } catch {
    console.warn('[Username] Failed to save');
  }
}

/**
 * Change username (with validation)
 */
export async function changeUsername(newName: string): Promise<{ success: boolean; error?: string; username?: string }> {
  // Validate base name
  const trimmed = newName.trim();
  
  if (trimmed.length < 2) {
    return { success: false, error: 'İsim en az 2 karakter olmalı' };
  }
  
  if (trimmed.length > 16) {
    return { success: false, error: 'İsim en fazla 16 karakter olabilir' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { success: false, error: 'Sadece harf, rakam ve _ kullanabilirsin' };
  }
  
  // Generate new username with tag
  const newUsername = generateUniqueUsername(trimmed);
  
  // Update in Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Update profile
        await supabase
          .from('profiles')
          .update({ username: newUsername })
          .eq('id', user.id);
        
        // Update scores (denormalized)
        await supabase
          .from('scores')
          .update({ username: newUsername })
          .eq('user_id', user.id);
      }
    } catch (err) {
      console.error('[Username] Update error:', err);
      return { success: false, error: 'Güncelleme başarısız' };
    }
  }
  
  saveUsername(newUsername);
  return { success: true, username: newUsername };
}

/**
 * Parse username into name and tag
 */
export function parseUsername(username: string): { name: string; tag: string } {
  const parts = username.split('#');
  if (parts.length === 2) {
    return { name: parts[0], tag: parts[1] };
  }
  return { name: username, tag: '' };
}

/**
 * Get display name (without tag, for UI)
 */
export function getDisplayName(username: string): string {
  return parseUsername(username).name;
}
