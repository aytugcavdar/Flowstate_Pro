/**
 * Push Notification Service
 * 
 * Handles browser push notifications for daily reminders
 */

// ============================================
// TYPES
// ============================================

export interface NotificationSettings {
  enabled: boolean;
  dailyReminderEnabled: boolean;
  reminderTime: string; // HH:mm format
  lastNotificationDate: string;
}

const STORAGE_KEY = 'flowstate_notifications_v1';
const DEFAULT_REMINDER_TIME = '09:00';

// ============================================
// PERMISSION & SUPPORT
// ============================================

/**
 * Check if browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Get current notification permission status
 */
export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('[Notifications] Not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Notifications] Permission:', permission);
    
    if (permission === 'granted') {
      // Save settings
      const settings = loadNotificationSettings();
      settings.enabled = true;
      saveNotificationSettings(settings);
      
      // Schedule daily reminder
      scheduleDailyReminder();
      
      return true;
    }
    return false;
  } catch (err) {
    console.error('[Notifications] Permission request failed:', err);
    return false;
  }
}

// ============================================
// SETTINGS
// ============================================

/**
 * Load notification settings
 */
export function loadNotificationSettings(): NotificationSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('[Notifications] Failed to load settings');
  }
  return {
    enabled: false,
    dailyReminderEnabled: true,
    reminderTime: DEFAULT_REMINDER_TIME,
    lastNotificationDate: ''
  };
}

/**
 * Save notification settings
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('[Notifications] Failed to save settings');
  }
}

/**
 * Update reminder time
 */
export function setReminderTime(time: string): void {
  const settings = loadNotificationSettings();
  settings.reminderTime = time;
  saveNotificationSettings(settings);
  scheduleDailyReminder();
}

/**
 * Toggle daily reminder
 */
export function toggleDailyReminder(enabled: boolean): void {
  const settings = loadNotificationSettings();
  settings.dailyReminderEnabled = enabled;
  saveNotificationSettings(settings);
  
  if (enabled) {
    scheduleDailyReminder();
  }
}

// ============================================
// SEND NOTIFICATIONS
// ============================================

/**
 * Send a notification immediately
 */
export async function sendNotification(
  title: string,
  options?: NotificationOptions
): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    // Try to use service worker for persistent notification
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(title, {
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      vibrate: [100, 50, 100],
      tag: 'flowstate-notification',
      ...options,
    });
    
    console.log('[Notifications] Sent:', title);
    return true;
  } catch (err) {
    // Fallback to regular notification
    try {
      new Notification(title, {
        icon: '/icons/icon-192.svg',
        ...options,
      });
      return true;
    } catch (fallbackErr) {
      console.error('[Notifications] Failed to send:', fallbackErr);
      return false;
    }
  }
}

/**
 * Send daily puzzle reminder
 */
export async function sendDailyReminder(): Promise<boolean> {
  const settings = loadNotificationSettings();
  const today = new Date().toISOString().split('T')[0];
  
  // Don't send if already sent today
  if (settings.lastNotificationDate === today) {
    console.log('[Notifications] Already sent today');
    return false;
  }
  
  const success = await sendNotification('🧩 Günlük Bulmaca Hazır!', {
    body: 'Bugünün FlowState bulmacası seni bekliyor. Streak\'ini korumayı unutma!',
    tag: 'daily-reminder',
    requireInteraction: false,
    data: { type: 'daily-reminder', date: today }
  });
  
  if (success) {
    settings.lastNotificationDate = today;
    saveNotificationSettings(settings);
  }
  
  return success;
}

// ============================================
// SCHEDULING
// ============================================

let reminderTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Schedule daily reminder based on settings
 */
export function scheduleDailyReminder(): void {
  const settings = loadNotificationSettings();
  
  if (!settings.enabled || !settings.dailyReminderEnabled) {
    console.log('[Notifications] Daily reminder disabled');
    return;
  }
  
  // Clear existing timeout
  if (reminderTimeout) {
    clearTimeout(reminderTimeout);
  }
  
  // Parse reminder time
  const [hours, minutes] = settings.reminderTime.split(':').map(Number);
  
  // Calculate next reminder time
  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, schedule for tomorrow
  if (reminderTime <= now) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }
  
  const msUntilReminder = reminderTime.getTime() - now.getTime();
  
  console.log('[Notifications] Next reminder in', Math.round(msUntilReminder / 1000 / 60), 'minutes');
  
  // Schedule the reminder
  reminderTimeout = setTimeout(() => {
    sendDailyReminder().then(() => {
      // Reschedule for next day
      scheduleDailyReminder();
    });
  }, msUntilReminder);
}

/**
 * Initialize notification system (call on app start)
 */
export function initNotifications(): void {
  if (!isNotificationSupported()) {
    console.log('[Notifications] Not supported');
    return;
  }
  
  const settings = loadNotificationSettings();
  
  if (settings.enabled && Notification.permission === 'granted') {
    scheduleDailyReminder();
  }
  
  console.log('[Notifications] Initialized, enabled:', settings.enabled);
}

// ============================================
// QUICK NOTIFICATIONS
// ============================================

/**
 * Send streak warning notification
 */
export function sendStreakWarning(): Promise<boolean> {
  return sendNotification('⚠️ Streak Risk!', {
    body: 'Bugün oynamayı unutma, streak\'in sıfırlanabilir!',
    tag: 'streak-warning'
  });
}

/**
 * Send level up notification
 */
export function sendLevelUpNotification(level: number): Promise<boolean> {
  return sendNotification(`🎉 Seviye ${level}!`, {
    body: 'Tebrikler, yeni bir seviyeye ulaştın!',
    tag: 'level-up'
  });
}

/**
 * Send milestone notification
 */
export function sendMilestoneNotification(milestoneName: string, reward: number): Promise<boolean> {
  return sendNotification(`🏆 ${milestoneName}`, {
    body: `Streak milestone'ı tamamladın! +${reward} coin kazandın!`,
    tag: 'milestone'
  });
}
