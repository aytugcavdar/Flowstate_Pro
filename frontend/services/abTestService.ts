/**
 * A/B Testing Service - Run experiments and track variants
 * 
 * Allows testing different features/UI with different user groups
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { ensureAuthenticated } from './cloudSyncService';

// ============================================
// TYPES
// ============================================

export interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: string[];
  weights: number[];  // Probability weights for each variant
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

export interface UserAssignment {
  experimentId: string;
  variant: string;
  assignedAt: string;
}

const STORAGE_KEY = 'flowstate_ab_v1';

// ============================================
// ACTIVE EXPERIMENTS
// These can be configured in the database or hardcoded for development
// ============================================

const EXPERIMENTS: Experiment[] = [
  {
    id: 'hint_button_color',
    name: 'Hint Button Color',
    description: 'Test different colors for hint button',
    variants: ['cyan', 'yellow', 'green'],
    weights: [0.34, 0.33, 0.33],
    isActive: true,
    startDate: '2026-01-01'
  },
  {
    id: 'win_celebration',
    name: 'Win Celebration Style',
    description: 'Test different celebration animations',
    variants: ['confetti', 'simple', 'matrix'],
    weights: [0.5, 0.25, 0.25],
    isActive: true,
    startDate: '2026-01-01'
  },
  {
    id: 'daily_reward_layout',
    name: 'Daily Reward Layout',
    description: 'Test grid vs list layout for daily rewards',
    variants: ['grid', 'list'],
    weights: [0.5, 0.5],
    isActive: true,
    startDate: '2026-01-01'
  },
  {
    id: 'powerup_pricing',
    name: 'Powerup Pricing',
    description: 'Test different powerup prices',
    variants: ['low', 'medium', 'high'],
    weights: [0.34, 0.33, 0.33],
    isActive: false,
    startDate: '2026-01-15'
  }
];

// ============================================
// LOCAL STORAGE
// ============================================

interface ABStorage {
  userId: string;
  assignments: Record<string, UserAssignment>;
}

function loadABStorage(): ABStorage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('[AB] Failed to load storage');
  }
  return { userId: '', assignments: {} };
}

function saveABStorage(data: ABStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[AB] Failed to save storage');
  }
}

// ============================================
// VARIANT ASSIGNMENT
// ============================================

/**
 * Hash function for consistent assignment
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get variant for user based on weights
 */
function selectVariant(userId: string, experiment: Experiment): string {
  // Create consistent hash from userId + experimentId
  const hash = hashString(`${userId}_${experiment.id}`);
  const randomValue = (hash % 1000) / 1000; // 0.000 to 0.999
  
  // Select variant based on cumulative weights
  let cumulative = 0;
  for (let i = 0; i < experiment.variants.length; i++) {
    cumulative += experiment.weights[i];
    if (randomValue < cumulative) {
      return experiment.variants[i];
    }
  }
  
  // Fallback to first variant
  return experiment.variants[0];
}

/**
 * Get or assign variant for an experiment
 */
export async function getVariant(experimentId: string): Promise<string | null> {
  const experiment = EXPERIMENTS.find(e => e.id === experimentId);
  
  if (!experiment || !experiment.isActive) {
    console.log(`[AB] Experiment ${experimentId} not found or inactive`);
    return null;
  }
  
  const storage = loadABStorage();
  let userId = storage.userId;
  
  // Get or create user ID
  if (!userId) {
    userId = await ensureAuthenticated() || `anon_${Date.now()}`;
    storage.userId = userId;
  }
  
  // Check existing assignment
  if (storage.assignments[experimentId]) {
    return storage.assignments[experimentId].variant;
  }
  
  // Assign new variant
  const variant = selectVariant(userId, experiment);
  
  storage.assignments[experimentId] = {
    experimentId,
    variant,
    assignedAt: new Date().toISOString()
  };
  
  saveABStorage(storage);
  
  // Log assignment to database
  logAssignment(experimentId, variant);
  
  console.log(`[AB] User assigned to ${experimentId}: ${variant}`);
  return variant;
}

/**
 * Get variant synchronously (from cache only)
 */
export function getVariantSync(experimentId: string): string | null {
  const storage = loadABStorage();
  return storage.assignments[experimentId]?.variant || null;
}

// ============================================
// EVENT TRACKING
// ============================================

/**
 * Log experiment assignment to database
 */
async function logAssignment(experimentId: string, variant: string): Promise<void> {
  const userId = await ensureAuthenticated();
  if (!userId || !supabase || !isSupabaseConfigured()) return;
  
  try {
    await supabase.from('experiment_assignments').upsert({
      user_id: userId,
      experiment_id: experimentId,
      variant,
      assigned_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,experiment_id'
    });
  } catch (err) {
    console.warn('[AB] Failed to log assignment:', err);
  }
}

/**
 * Track an event within an experiment
 */
export async function trackExperimentEvent(
  experimentId: string,
  eventType: string,
  eventData?: Record<string, unknown>
): Promise<void> {
  const userId = await ensureAuthenticated();
  const storage = loadABStorage();
  const assignment = storage.assignments[experimentId];
  
  if (!assignment) {
    console.warn(`[AB] No assignment for experiment ${experimentId}`);
    return;
  }
  
  if (!supabase || !isSupabaseConfigured()) return;
  
  try {
    await supabase.from('experiment_events').insert({
      user_id: userId,
      experiment_id: experimentId,
      variant: assignment.variant,
      event_type: eventType,
      event_data: eventData || {}
    });
    
    console.log(`[AB] Event tracked: ${experimentId}/${eventType}`);
  } catch (err) {
    console.warn('[AB] Failed to track event:', err);
  }
}

// ============================================
// EXPERIMENT INFO
// ============================================

/**
 * Get all active experiments
 */
export function getActiveExperiments(): Experiment[] {
  return EXPERIMENTS.filter(e => e.isActive);
}

/**
 * Get experiment by ID
 */
export function getExperiment(experimentId: string): Experiment | undefined {
  return EXPERIMENTS.find(e => e.id === experimentId);
}

/**
 * Get all user assignments
 */
export function getAllAssignments(): Record<string, string> {
  const storage = loadABStorage();
  const result: Record<string, string> = {};
  
  Object.entries(storage.assignments).forEach(([expId, assignment]) => {
    result[expId] = assignment.variant;
  });
  
  return result;
}

// ============================================
// UTILITY HOOKS (optional helpers)
// ============================================

/**
 * Check if user is in a specific variant
 */
export function isInVariant(experimentId: string, variant: string): boolean {
  return getVariantSync(experimentId) === variant;
}

/**
 * Initialize all active experiments (call on app start)
 */
export async function initExperiments(): Promise<void> {
  console.log('[AB] Initializing experiments...');
  
  for (const experiment of EXPERIMENTS) {
    if (experiment.isActive) {
      await getVariant(experiment.id);
    }
  }
  
  console.log('[AB] Experiments initialized:', getAllAssignments());
}
