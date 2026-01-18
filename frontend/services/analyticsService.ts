/**
 * Analytics Service - Track user behavior, sessions, and device info
 * 
 * Collects: IP address, device info, browser, location, session data
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { ensureAuthenticated } from './cloudSyncService';

// ============================================
// TYPES
// ============================================

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  isMobile: boolean;
  isTablet: boolean;
  browser: string;
  os: string;
}

export interface SessionInfo {
  ip?: string;
  country?: string;
  city?: string;
  timezone?: string;
}

export interface UserVisit {
  userId: string;
  ip: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  userAgent: string;
  platform: string;
  browser: string;
  os: string;
  screenWidth: number;
  screenHeight: number;
  isMobile: boolean;
  referrer: string | null;
  pageUrl: string;
}

export interface AnalyticsEvent {
  eventType: string;
  eventData: Record<string, unknown>;
  pageUrl?: string;
}

// ============================================
// DEVICE DETECTION
// ============================================

/**
 * Get device information from browser
 */
export function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  
  // Detect mobile/tablet
  const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  return {
    userAgent: ua,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    isMobile,
    isTablet,
    browser,
    os,
  };
}

// ============================================
// IP & LOCATION (via free API)
// ============================================

let cachedSessionInfo: SessionInfo | null = null;

/**
 * Get user's IP and location info
 * Uses free ipapi.co service (1000 requests/day free)
 */
export async function getSessionInfo(): Promise<SessionInfo> {
  if (cachedSessionInfo) return cachedSessionInfo;
  
  try {
    // Using ipapi.co free tier
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error('IP API failed');
    
    const data = await response.json();
    
    cachedSessionInfo = {
      ip: data.ip || null,
      country: data.country_name || null,
      city: data.city || null,
      timezone: data.timezone || null,
    };
    
    console.log('[Analytics] Session info:', cachedSessionInfo);
    return cachedSessionInfo;
  } catch (err) {
    console.warn('[Analytics] Could not get IP info:', err);
    return { ip: undefined, country: undefined, city: undefined, timezone: undefined };
  }
}

// ============================================
// DATABASE LOGGING
// ============================================

/**
 * Log a user visit/session start
 */
export async function logUserVisit(): Promise<boolean> {
  const userId = await ensureAuthenticated();
  if (!userId || !supabase || !isSupabaseConfigured()) return false;
  
  try {
    const deviceInfo = getDeviceInfo();
    const sessionInfo = await getSessionInfo();
    
    const visitData: UserVisit = {
      userId,
      ip: sessionInfo.ip || null,
      country: sessionInfo.country || null,
      city: sessionInfo.city || null,
      timezone: sessionInfo.timezone || null,
      userAgent: deviceInfo.userAgent,
      platform: deviceInfo.platform,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      screenWidth: deviceInfo.screenWidth,
      screenHeight: deviceInfo.screenHeight,
      isMobile: deviceInfo.isMobile,
      referrer: document.referrer || null,
      pageUrl: window.location.href,
    };
    
    const { error } = await supabase
      .from('user_visits')
      .insert({
        user_id: visitData.userId,
        ip_address: visitData.ip,
        country: visitData.country,
        city: visitData.city,
        timezone: visitData.timezone,
        user_agent: visitData.userAgent,
        platform: visitData.platform,
        browser: visitData.browser,
        os: visitData.os,
        screen_width: visitData.screenWidth,
        screen_height: visitData.screenHeight,
        is_mobile: visitData.isMobile,
        referrer: visitData.referrer,
        page_url: visitData.pageUrl,
      });
    
    if (error) {
      console.error('[Analytics] Log visit error:', error);
      return false;
    }
    
    console.log('[Analytics] Visit logged successfully');
    return true;
  } catch (err) {
    console.error('[Analytics] Log visit exception:', err);
    return false;
  }
}

/**
 * Log a custom analytics event
 */
export async function logAnalyticsEvent(event: AnalyticsEvent): Promise<boolean> {
  const userId = await ensureAuthenticated();
  if (!userId || !supabase || !isSupabaseConfigured()) return false;
  
  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_type: event.eventType,
        event_data: event.eventData,
        page_url: event.pageUrl || window.location.href,
      });
    
    if (error) {
      console.error('[Analytics] Log event error:', error);
      return false;
    }
    
    console.log(`[Analytics] Event logged: ${event.eventType}`);
    return true;
  } catch (err) {
    console.error('[Analytics] Log event exception:', err);
    return false;
  }
}

// ============================================
// PREDEFINED EVENTS
// ============================================

export const AnalyticsEvents = {
  // Game Events
  GAME_START: 'game_start',
  GAME_WIN: 'game_win',
  GAME_LOSE: 'game_lose',
  GAME_ABANDON: 'game_abandon',
  
  // Mode Events
  MODE_CHANGE: 'mode_change',
  CAMPAIGN_LEVEL_START: 'campaign_level_start',
  CAMPAIGN_LEVEL_COMPLETE: 'campaign_level_complete',
  
  // Economy Events
  COINS_EARNED: 'coins_earned',
  COINS_SPENT: 'coins_spent',
  SHOP_OPEN: 'shop_open',
  ITEM_PURCHASED: 'item_purchased',
  
  // Power-up Events
  POWERUP_USED: 'powerup_used',
  HINT_USED: 'hint_used',
  UNDO_USED: 'undo_used',
  FREEZE_USED: 'freeze_used',
  
  // UI Events
  SETTINGS_OPEN: 'settings_open',
  THEME_CHANGE: 'theme_change',
  LEADERBOARD_OPEN: 'leaderboard_open',
  SHARE_CLICK: 'share_click',
  
  // Session Events
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  PAGE_VIEW: 'page_view',
};

/**
 * Quick helper to log game start
 */
export function logGameStart(mode: string, levelId?: string) {
  return logAnalyticsEvent({
    eventType: AnalyticsEvents.GAME_START,
    eventData: { mode, levelId },
  });
}

/**
 * Quick helper to log game win
 */
export function logGameWin(mode: string, moves: number, timeMs: number, usedHint: boolean) {
  return logAnalyticsEvent({
    eventType: AnalyticsEvents.GAME_WIN,
    eventData: { mode, moves, timeMs, usedHint },
  });
}

/**
 * Quick helper to log mode change
 */
export function logModeChange(fromMode: string, toMode: string) {
  return logAnalyticsEvent({
    eventType: AnalyticsEvents.MODE_CHANGE,
    eventData: { fromMode, toMode },
  });
}

/**
 * Quick helper to log powerup usage
 */
export function logPowerupUsed(powerupType: string) {
  return logAnalyticsEvent({
    eventType: AnalyticsEvents.POWERUP_USED,
    eventData: { powerupType },
  });
}

/**
 * Quick helper to log shop open
 */
export function logShopOpen() {
  return logAnalyticsEvent({
    eventType: AnalyticsEvents.SHOP_OPEN,
    eventData: {},
  });
}

/**
 * Quick helper to log purchase
 */
export function logItemPurchased(itemId: string, price: number) {
  return logAnalyticsEvent({
    eventType: AnalyticsEvents.ITEM_PURCHASED,
    eventData: { itemId, price },
  });
}

// ============================================
// ANALYTICS SUMMARY (for Admin)
// ============================================

export interface DailyStats {
  date: string;
  uniqueUsers: number;
  totalVisits: number;
  totalGames: number;
  totalWins: number;
}

/**
 * Get daily stats (admin only - needs proper RLS)
 */
export async function getDailyStats(days: number = 7): Promise<DailyStats[]> {
  if (!supabase || !isSupabaseConfigured()) return [];
  
  try {
    // This would need a proper admin view/function in production
    const { data, error } = await supabase
      .rpc('get_daily_stats', { days_back: days });
    
    if (error) {
      console.error('[Analytics] Get daily stats error:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('[Analytics] Get daily stats exception:', err);
    return [];
  }
}
