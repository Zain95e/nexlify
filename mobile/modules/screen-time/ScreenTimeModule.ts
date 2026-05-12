import { NativeModules, Platform } from 'react-native';

/**
 * Type returned by the native UsageStatsManager query.
 */
export interface UsageRecord {
  app_name: string;
  app_package: string;
  /** "social" | "productivity" | "entertainment" | "other" */
  category: string;
  duration_minutes: number;
}

/**
 * Raw bridge to the native ScreenTimeModule.
 * Only available on Android — all functions are no-ops / return empty on other platforms.
 */
const { ScreenTimeModule: _native } = NativeModules;

const isAndroid = Platform.OS === 'android';

/**
 * ScreenTimeModule
 * ─────────────────────────────────────────────────────────────────────────
 * Typed JS wrapper around the Kotlin Expo native module.
 *
 * Usage:
 *   import ScreenTimeModule from '@/modules/screen-time/ScreenTimeModule';
 *   const stats = await ScreenTimeModule.getUsageStats();
 */
const ScreenTimeModule = {
  /**
   * Queries UsageStatsManager for the past 24 hours.
   * Requires the user to have granted "Usage Access" in Android Settings.
   * Returns an empty array on non-Android platforms or if permission is denied.
   */
  async getUsageStats(): Promise<UsageRecord[]> {
    if (!isAndroid || !_native) return [];
    try {
      return await _native.getUsageStats();
    } catch (e) {
      console.warn('[ScreenTimeModule] getUsageStats failed:', e);
      return [];
    }
  },

  /**
   * Enqueues the WorkManager periodic background sync (every 60 min).
   * Call this once after the user logs in.
   */
  scheduleBackgroundSync(): void {
    if (!isAndroid || !_native) return;
    try {
      _native.scheduleBackgroundSync();
    } catch (e) {
      console.warn('[ScreenTimeModule] scheduleBackgroundSync failed:', e);
    }
  },

  /**
   * Cancels the background sync job.
   * Call this on logout.
   */
  cancelBackgroundSync(): void {
    if (!isAndroid || !_native) return;
    try {
      _native.cancelBackgroundSync();
    } catch (e) {
      console.warn('[ScreenTimeModule] cancelBackgroundSync failed:', e);
    }
  },
};

export default ScreenTimeModule;
