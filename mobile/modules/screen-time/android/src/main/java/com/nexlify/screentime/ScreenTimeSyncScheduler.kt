package com.nexlify.screentime

import android.content.Context
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

/**
 * ScreenTimeSyncScheduler  (3.1.4)
 * ─────────────────────────────────────────────────────────────────────────
 * Call schedule() once after the user logs in (or on app startup if logged
 * in) to enqueue a PeriodicWorkRequest that fires every 60 minutes.
 *
 * WorkManager ensures the work survives app restarts and device reboots
 * (requires RECEIVE_BOOT_COMPLETED permission or WorkManager's built-in
 * rescheduling on API 23+).
 *
 * Usage from JS (via a small Expo module function, see the JS bridge):
 *   ScreenTimeModule.scheduleBackgroundSync()
 */
object ScreenTimeSyncScheduler {

  private const val WORK_TAG = "nexlify_screen_time_sync"

  /**
   * Enqueues (or replaces) the periodic sync.
   * KEEP_EXISTING means if a job with the same tag already exists, do not
   * reset its timer — avoids unnecessary rescheduling on every app launch.
   */
  fun schedule(context: Context) {
    val request = PeriodicWorkRequestBuilder<ScreenTimeSyncWorker>(
      repeatInterval = 60,
      repeatIntervalTimeUnit = TimeUnit.MINUTES,
    )
      .addTag(WORK_TAG)
      .build()

    WorkManager.getInstance(context).enqueueUniquePeriodicWork(
      WORK_TAG,
      ExistingPeriodicWorkPolicy.KEEP,
      request,
    )
  }

  /** Cancel the periodic sync (e.g. on logout). */
  fun cancel(context: Context) {
    WorkManager.getInstance(context).cancelAllWorkByTag(WORK_TAG)
  }
}
