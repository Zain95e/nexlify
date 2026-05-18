package com.nexlify.screentime

import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.text.TextUtils
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

  companion object {
    var instance: ScreenTimeModule? = null
  }

  fun emitOverrideEvent(packageName: String) {
    sendEvent("onAppOverridden", mapOf("packageName" to packageName))
  }

  fun emitDetoxBrokenEvent() {
    sendEvent("onDetoxBroken", emptyMap<String, Any>())
  }

  fun emitDetoxFinishedEvent() {
    sendEvent("onDetoxFinished", emptyMap<String, Any>())
  }

  override fun definition() = ModuleDefinition {
    Name("ScreenTimeModule")
    Events("onAppOverridden", "onDetoxBroken", "onDetoxFinished")

    OnCreate {
      instance = this@ScreenTimeModule
    }

    OnDestroy {
      instance = null
    }

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

    // ── 5.1.1 — Get list of all installed apps ────────────────────────────
    Function("getInstalledApps") {
      val ctx: Context = appContext.reactContext
        ?: throw IllegalStateException("React context is null")
      val pm = ctx.packageManager
      val packages = pm.getInstalledApplications(android.content.pm.PackageManager.GET_META_DATA)
      
      packages.map { appInfo ->
        mapOf(
          "appName" to pm.getApplicationLabel(appInfo).toString(),
          "packageName" to appInfo.packageName
        )
      }
    }

    // ── 5.1.2 — Set blocked apps for AccessibilityService ────────────────
    Function("setBlockedApps") { packages: List<String> ->
      AppBlockingService.blockedApps = packages
    }

    // ── 5.2.0 — Detox Mode ────────────────────────────────────────────────
    Function("startDetox") { durationMinutes: Int, whitelist: List<String> ->
      DetoxManager.isDetoxActive = true
      val essentials = listOf(
        "com.android.dialer", "com.android.server.telecom", "com.google.android.dialer", 
        "com.android.mms", "com.google.android.apps.messaging",
        appContext.reactContext?.packageName ?: ""
      )
      DetoxManager.whitelist = whitelist + essentials

      val ctx: Context = appContext.reactContext ?: return@Function
      val intent = Intent(ctx, DetoxService::class.java).apply {
        putExtra("DURATION_MINUTES", durationMinutes)
      }
      if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
        ctx.startForegroundService(intent)
      } else {
        ctx.startService(intent)
      }
    }

    Function("stopDetox") {
      DetoxManager.isDetoxActive = false
      val ctx: Context = appContext.reactContext ?: return@Function Unit
      val intent = Intent(ctx, DetoxService::class.java)
      ctx.stopService(intent)
    }

    // ── Utility: Permissions ─────────────────────────────────────────────
    Function("hasUsagePermission") {
      val ctx: Context = appContext.reactContext ?: return@Function false
      UsageStatsHelper(ctx).hasUsageStatsPermission()
    }

    Function("requestUsagePermission") {
      val activity = appContext.currentActivity
      if (activity != null) {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        activity.startActivity(intent)
      } else {
        val ctx: Context = appContext.reactContext ?: return@Function Unit
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        ctx.startActivity(intent)
      }
    }

    Function("hasAccessibilityPermission") {
      val ctx: Context = appContext.reactContext ?: return@Function false
      var accessibilityEnabled = 0
      try {
        accessibilityEnabled = Settings.Secure.getInt(
          ctx.contentResolver,
          Settings.Secure.ACCESSIBILITY_ENABLED
        )
      } catch (e: Settings.SettingNotFoundException) {
        // Ignored
      }
      if (accessibilityEnabled == 1) {
        val settingValue = Settings.Secure.getString(
          ctx.contentResolver,
          Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        )
        if (settingValue != null) {
          val mStringColonSplitter = TextUtils.SimpleStringSplitter(':')
          mStringColonSplitter.setString(settingValue)
          while (mStringColonSplitter.hasNext()) {
            val accessibilityService = mStringColonSplitter.next()
            if (accessibilityService.contains(ctx.packageName, ignoreCase = true)) {
              return@Function true
            }
          }
        }
      }
      false
    }

    Function("requestAccessibilityPermission") {
      val ctx: Context = appContext.reactContext ?: return@Function Unit
      val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      ctx.startActivity(intent)
    }
  }
}
