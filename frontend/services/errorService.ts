/**
 * Error Tracking Service - Log errors to database for debugging
 * 
 * Captures: error message, stack trace, browser info, user context
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { ensureAuthenticated } from './cloudSyncService';
import { getDeviceInfo } from './analyticsService';

// ============================================
// TYPES
// ============================================

export interface ErrorLog {
  message: string;
  stack?: string;
  component?: string;
  context?: Record<string, unknown>;
  severity: 'error' | 'warning' | 'info';
}

export interface ErrorContext {
  component?: string;
  action?: string;
  data?: Record<string, unknown>;
}

// ============================================
// ERROR LOGGING
// ============================================

/**
 * Log an error to the database
 */
export async function logError(
  error: Error | string,
  context?: ErrorContext,
  severity: 'error' | 'warning' | 'info' = 'error'
): Promise<boolean> {
  const userId = await ensureAuthenticated();
  if (!supabase || !isSupabaseConfigured()) {
    console.error('[ErrorService] Supabase not configured, error not logged:', error);
    return false;
  }

  try {
    const deviceInfo = getDeviceInfo();
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    const { error: dbError } = await supabase
      .from('error_logs')
      .insert({
        user_id: userId,
        message: errorMessage,
        stack: errorStack,
        component: context?.component,
        action: context?.action,
        context_data: context?.data || {},
        severity,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        platform: deviceInfo.platform,
        is_mobile: deviceInfo.isMobile,
        screen_width: deviceInfo.screenWidth,
        screen_height: deviceInfo.screenHeight,
        page_url: window.location.href,
        user_agent: deviceInfo.userAgent,
      });

    if (dbError) {
      console.error('[ErrorService] Failed to log error:', dbError);
      return false;
    }

    console.log('[ErrorService] Error logged successfully:', errorMessage);
    return true;
  } catch (err) {
    console.error('[ErrorService] Exception while logging error:', err);
    return false;
  }
}

/**
 * Log a warning (less severe than error)
 */
export function logWarning(message: string, context?: ErrorContext): Promise<boolean> {
  return logError(message, context, 'warning');
}

/**
 * Log an info message (for tracking important events)
 */
export function logInfo(message: string, context?: ErrorContext): Promise<boolean> {
  return logError(message, context, 'info');
}

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

let isGlobalHandlerSetup = false;

/**
 * Setup global error handlers (call once on app start)
 */
export function setupGlobalErrorHandler(): void {
  if (isGlobalHandlerSetup) return;
  isGlobalHandlerSetup = true;

  // Catch unhandled errors
  window.onerror = (message, source, lineno, colno, error) => {
    logError(error || String(message), {
      component: 'global',
      action: 'unhandled_error',
      data: { source, lineno, colno },
    });
    return false; // Don't prevent default handling
  };

  // Catch unhandled promise rejections
  window.onunhandledrejection = (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : String(event.reason);
    
    logError(error, {
      component: 'global',
      action: 'unhandled_rejection',
    });
  };

  console.log('[ErrorService] Global error handlers registered');
}

// ============================================
// ERROR STATS (for admin)
// ============================================

export interface ErrorStats {
  totalErrors: number;
  todayErrors: number;
  topErrors: { message: string; count: number }[];
}

/**
 * Get error statistics (admin function)
 */
export async function getErrorStats(): Promise<ErrorStats | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .rpc('get_error_stats');

    if (error) {
      console.error('[ErrorService] Failed to get error stats:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[ErrorService] Exception getting error stats:', err);
    return null;
  }
}

/**
 * Get recent errors (admin function)
 */
export async function getRecentErrors(limit: number = 50): Promise<ErrorLog[]> {
  if (!supabase || !isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[ErrorService] Failed to get recent errors:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[ErrorService] Exception getting recent errors:', err);
    return [];
  }
}
