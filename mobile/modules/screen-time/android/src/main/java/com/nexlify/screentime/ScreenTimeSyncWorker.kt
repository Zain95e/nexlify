package com.nexlify.screentime

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * ScreenTimeSyncWorker (3.1.4)
 * ─────────────────────────────────────────────────────────────────────────
 * WorkManager worker that:
 *   1. Calls UsageStatsManager (same logic as ScreenTimeModule) to get 24-hour usage.
 *   2. Reads the JWT and API base URL from SharedPreferences (written by JS on login).
 *   3. POSTs the records to /api/screentime.
 *
 * Scheduled by WorkManager to repeat every 60 minutes (PeriodicWorkRequest).
 * See ScreenTimeSyncScheduler.kt for how to enqueue it.
 *
 * SharedPreferences keys (written by the JS auth layer on login):
 *   "nexlify_prefs" → "access_token" : String
 *   "nexlify_prefs" → "api_base_url"  : String  (e.g. "http://10.0.2.2:5000/api")
 */
class ScreenTimeSyncWorker(
  private val context: Context,
  workerParams: WorkerParameters,
) : CoroutineWorker(context, workerParams) {

  override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
    try {
      val prefs = context.getSharedPreferences("nexlify_prefs", Context.MODE_PRIVATE)
      val token = prefs.getString("access_token", null)
        ?: return@withContext Result.failure() // not logged in — skip silently

      val apiBase = prefs.getString("api_base_url", "http://10.0.2.2:5000/api")!!

      // ── Collect usage stats ──────────────────────────────────────────
      val usageHelper = UsageStatsHelper(context)
      val records = usageHelper.getLast24HourStats()

      if (records.isEmpty()) return@withContext Result.success()

      // ── Build JSON payload ───────────────────────────────────────────
      val payload = JSONObject()
      val arr = JSONArray()
      for (rec in records) {
        val obj = JSONObject()
        obj.put("app_name", rec["app_name"])
        obj.put("app_package", rec["app_package"])
        obj.put("category", rec["category"])
        obj.put("duration_minutes", rec["duration_minutes"])
        arr.put(obj)
      }
      payload.put("records", arr)

      // ── POST to backend ──────────────────────────────────────────────
      val url = URL("$apiBase/screentime")
      val conn = url.openConnection() as HttpURLConnection
      conn.requestMethod = "POST"
      conn.setRequestProperty("Content-Type", "application/json")
      conn.setRequestProperty("Authorization", "Bearer $token")
      conn.doOutput = true
      conn.connectTimeout = 15_000
      conn.readTimeout = 15_000

      conn.outputStream.use { it.write(payload.toString().toByteArray()) }

      val responseCode = conn.responseCode
      conn.disconnect()

      if (responseCode in 200..299) Result.success()
      else Result.retry()          // transient server error — WorkManager will retry

    } catch (e: Exception) {
      // Network error etc — retry later
      Result.retry()
    }
  }
}
