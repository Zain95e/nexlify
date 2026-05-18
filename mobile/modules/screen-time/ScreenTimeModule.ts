import { Platform, NativeEventEmitter } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

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

export interface InstalledApp {
  appName: string;
  packageName: string;
}

const isAndroid = Platform.OS === 'android';

/**
 * Raw bridge to the native ScreenTimeModule.
 * Only available on Android — all functions are no-ops / return empty on other platforms.
 */
const _native = isAndroid ? requireNativeModule('ScreenTimeModule') : null;

/**
 * Event emitter for ScreenTimeModule events (like 'onAppOverridden')
 */
export const screenTimeEmitter = isAndroid && _native 
  ? new NativeEventEmitter(_native) 
  : null;

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

  /**
   * 5.1.1 - Retrieves a list of all installed apps on the device.
   * Required for selecting apps to block.
   */
  async getInstalledApps(): Promise<InstalledApp[]> {
    if (!isAndroid || !_native) return [];
    try {
      return await _native.getInstalledApps();
    } catch (e) {
      console.warn('[ScreenTimeModule] getInstalledApps failed:', e);
      return [];
    }
  },

  /**
   * 5.1.2 - Updates the internal list of blocked packages in the AccessibilityService.
   */
  setBlockedApps(packages: string[]): void {
    if (!isAndroid || !_native) return;
    try {
      _native.setBlockedApps(packages);
    } catch (e) {
      console.warn('[ScreenTimeModule] setBlockedApps failed:', e);
    }
  },
  /**
   * 5.2.0 - Starts Detox Mode
   * @param durationMinutes Length of the detox session
   * @param whitelist Array of package names to allow during detox
   */
  startDetox(durationMinutes: number, whitelist: string[]): void {
    if (!isAndroid || !_native) return;
    try {
      _native.startDetox(durationMinutes, whitelist);
    } catch (e) {
      console.warn('[ScreenTimeModule] startDetox failed:', e);
    }
  },

  /**
   * 5.2.0 - Stops Detox Mode and removes the persistent notification
   */
  stopDetox(): void {
    if (!isAndroid || !_native) return;
    try {
      _native.stopDetox();
    } catch (e) {
      console.warn('[ScreenTimeModule] stopDetox failed:', e);
    }
  },

  /**
   * Permissions Utility
   */
  hasUsagePermission(): boolean {
    if (!isAndroid || !_native) return false;
    try { return _native.hasUsagePermission(); } 
    catch (e) { return false; }
  },

  requestUsagePermission(): void {
    if (!isAndroid || !_native) return;
    try { _native.requestUsagePermission(); } 
    catch (e) { console.warn(e); }
  },

  hasAccessibilityPermission(): boolean {
    if (!isAndroid || !_native) return false;
    try { return _native.hasAccessibilityPermission(); } 
    catch (e) { return false; }
  },

  requestAccessibilityPermission(): void {
    if (!isAndroid || !_native) return;
    try { _native.requestAccessibilityPermission(); } 
    catch (e) { console.warn(e); }
  }
};

export default ScreenTimeModule;
