package com.nexlify.screentime

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Nexlify ScreenTimeModule  (3.1.1 – 3.1.4)
 * ─────────────────────────────────────────────────────────────────────────
 * Expo Modules API native module.  Exposes to JS:
 *
 *   getUsageStats()
 *     → Promise<Array<{ app_name, app_package, category, duration_minutes }>>
 *
 *   scheduleBackgroundSync()
 *     → void   — enqueues WorkManager periodic job (every 60 min)
 *
 *   cancelBackgroundSync()
 *     → void   — cancels the WorkManager job (call on logout)
 *
 * AndroidManifest requirement (add to android/app/src/main/AndroidManifest.xml):
 *   <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS"
 *     tools:ignore="ProtectedPermissions" />
 */
class ScreenTimeModule : Module() {

  override fun definition() = ModuleDefinition {
    Name("ScreenTimeModule")

    // ── 3.1.1 / 3.1.2 / 3.1.3 ─────────────────────────────────────────
    AsyncFunction("getUsageStats") {
      val ctx: Context = appContext.reactContext
        ?: throw IllegalStateException("React context is null")
      UsageStatsHelper(ctx).getLast24HourStats()
    }

    // ── 3.1.4 — schedule background WorkManager sync ───────────────────
    Function("scheduleBackgroundSync") {
      val ctx: Context = appContext.reactContext
        ?: throw IllegalStateException("React context is null")
      ScreenTimeSyncScheduler.schedule(ctx)
    }

    Function("cancelBackgroundSync") {
      val ctx: Context = appContext.reactContext
        ?: throw IllegalStateException("React context is null")
      ScreenTimeSyncScheduler.cancel(ctx)
    }
  }
}
