/**
 * Referral Service - Invite friends, earn bonus coins
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { ensureAuthenticated } from './cloudSyncService';
import { addCoins } from './economyService';

// ============================================
// TYPES
// ============================================

export interface ReferralCode {
  code: string;
  userId: string;
  createdAt: string;
  usageCount: number;
}

export interface ReferralStats {
  totalReferrals: number;
  totalEarned: number;
  referralCode: string;
}

const STORAGE_KEY = 'flowstate_referral_v1';
const REFERRAL_BONUS = 100; // Coins for both referrer and referee

// ============================================
// CODE GENERATION
// ============================================

/**
 * Generate a unique referral code based on user ID
 */
function generateReferralCode(userId: string): string {
  // Take first 4 chars of user ID and add random suffix
  const prefix = userId.replace(/-/g, '').substring(0, 4).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FS${prefix}${suffix}`;
}

// ============================================
// LOCAL STORAGE
// ============================================

interface LocalReferralData {
  myCode: string | null;
  usedCode: string | null;
  referralCount: number;
  totalEarned: number;
}

function loadLocalData(): LocalReferralData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('[Referral] Failed to load local data');
  }
  return {
    myCode: null,
    usedCode: null,
    referralCount: 0,
    totalEarned: 0
  };
}

function saveLocalData(data: LocalReferralData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[Referral] Failed to save local data');
  }
}

// ============================================
// REFERRAL CODE OPERATIONS
// ============================================

/**
 * Get or create user's referral code
 */
export async function getMyReferralCode(): Promise<string> {
  const userId = await ensureAuthenticated();
  const localData = loadLocalData();
  
  // Return cached code if available
  if (localData.myCode) return localData.myCode;
  
  // Generate new code
  if (userId) {
    const newCode = generateReferralCode(userId);
    
    // Try to save to database
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('referral_codes').upsert({
          user_id: userId,
          code: newCode,
          usage_count: 0
        });
      } catch (err) {
        console.warn('[Referral] Failed to save code to DB:', err);
      }
    }
    
    // Save locally
    localData.myCode = newCode;
    saveLocalData(localData);
    
    return newCode;
  }
  
  // Fallback for non-authenticated users
  const fallbackCode = generateReferralCode(Date.now().toString());
  localData.myCode = fallbackCode;
  saveLocalData(localData);
  return fallbackCode;
}

/**
 * Use a referral code (as a new user)
 */
export async function useReferralCode(code: string): Promise<{
  success: boolean;
  message: string;
  bonus?: number;
}> {
  const userId = await ensureAuthenticated();
  const localData = loadLocalData();
  
  // Check if already used a code
  if (localData.usedCode) {
    return { success: false, message: 'Zaten bir referral kodu kullandınız.' };
  }
  
  // Validate code format
  if (!code || code.length < 6) {
    return { success: false, message: 'Geçersiz referral kodu.' };
  }
  
  // Check if trying to use own code
  if (localData.myCode === code.toUpperCase()) {
    return { success: false, message: 'Kendi kodunuzu kullanamazsınız.' };
  }
  
  // Try to find the referrer in database
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data: referralData, error } = await supabase
        .from('referral_codes')
        .select('user_id, usage_count')
        .eq('code', code.toUpperCase())
        .single();
      
      if (error || !referralData) {
        return { success: false, message: 'Referral kodu bulunamadı.' };
      }
      
      // Record the referral
      const { error: usageError } = await supabase.from('referral_usages').insert({
        referrer_id: referralData.user_id,
        referee_id: userId,
        code: code.toUpperCase()
      });
      
      if (usageError) {
        // Check if already used
        if (usageError.code === '23505') { // Unique violation
          return { success: false, message: 'Bu kod zaten kullanılmış.' };
        }
        throw usageError;
      }
      
      // Update usage count
      await supabase.from('referral_codes').update({
        usage_count: referralData.usage_count + 1
      }).eq('code', code.toUpperCase());
      
      // Award bonus to referee (current user)
      addCoins(REFERRAL_BONUS, 'REFERRAL');
      
      // Award bonus to referrer (done via database trigger or manually here)
      // For simplicity, we'll handle this locally on the referrer's next visit
      
      console.log('[Referral] Code used successfully');
      
    } catch (err) {
      console.error('[Referral] Failed to use code:', err);
      return { success: false, message: 'Bir hata oluştu, tekrar deneyin.' };
    }
  }
  
  // Save locally
  localData.usedCode = code.toUpperCase();
  saveLocalData(localData);
  
  return { 
    success: true, 
    message: `Tebrikler! ${REFERRAL_BONUS} coin kazandınız!`,
    bonus: REFERRAL_BONUS
  };
}

/**
 * Check for unclaimed referral bonuses
 */
export async function checkReferralBonuses(): Promise<number> {
  const userId = await ensureAuthenticated();
  if (!userId || !supabase || !isSupabaseConfigured()) return 0;
  
  try {
    // Check how many people used our code
    const { data, error } = await supabase
      .from('referral_usages')
      .select('id, claimed')
      .eq('referrer_id', userId)
      .eq('claimed', false);
    
    if (error || !data) return 0;
    
    const unclaimedCount = data.length;
    if (unclaimedCount === 0) return 0;
    
    // Claim the bonuses
    const bonusAmount = unclaimedCount * REFERRAL_BONUS;
    addCoins(bonusAmount, 'REFERRAL');
    
    // Mark as claimed
    await supabase.from('referral_usages')
      .update({ claimed: true })
      .eq('referrer_id', userId)
      .eq('claimed', false);
    
    // Update local data
    const localData = loadLocalData();
    localData.referralCount += unclaimedCount;
    localData.totalEarned += bonusAmount;
    saveLocalData(localData);
    
    console.log(`[Referral] Claimed ${unclaimedCount} referral bonuses: +${bonusAmount} coins`);
    
    return bonusAmount;
  } catch (err) {
    console.error('[Referral] Failed to check bonuses:', err);
    return 0;
  }
}

/**
 * Get referral statistics
 */
export async function getReferralStats(): Promise<ReferralStats> {
  const code = await getMyReferralCode();
  const localData = loadLocalData();
  
  // Try to get from database
  if (supabase && isSupabaseConfigured()) {
    const userId = await ensureAuthenticated();
    if (userId) {
      try {
        const { data } = await supabase
          .from('referral_codes')
          .select('usage_count')
          .eq('user_id', userId)
          .single();
        
        if (data) {
          localData.referralCount = data.usage_count;
          localData.totalEarned = data.usage_count * REFERRAL_BONUS;
          saveLocalData(localData);
        }
      } catch (err) {
        console.warn('[Referral] Failed to get stats from DB');
      }
    }
  }
  
  return {
    totalReferrals: localData.referralCount,
    totalEarned: localData.totalEarned,
    referralCode: code
  };
}

/**
 * Get shareable referral link
 */
export async function getReferralLink(): Promise<string> {
  const code = await getMyReferralCode();
  const baseUrl = window.location.origin;
  return `${baseUrl}?ref=${code}`;
}

/**
 * Check URL for referral code on app start
 */
export function checkUrlForReferral(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      return refCode.toUpperCase();
    }
  } catch (err) {
    console.warn('[Referral] Failed to check URL');
  }
  return null;
}

/**
 * Get referral bonus amount
 */
export function getReferralBonus(): number {
  return REFERRAL_BONUS;
}
