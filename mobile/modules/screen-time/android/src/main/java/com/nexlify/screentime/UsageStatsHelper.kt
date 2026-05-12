package com.nexlify.screentime

import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.pm.PackageManager

/**
 * Shared helper used by both ScreenTimeModule (JS-facing) and
 * ScreenTimeSyncWorker (background). Keeps the package→category map
 * and the UsageStatsManager query in one place (DRY).
 */
class UsageStatsHelper(private val context: Context) {

  private val packageCategoryMap: Map<String, String> = mapOf(
    // Social
    "com.facebook.katana"              to "social",
    "com.facebook.lite"                to "social",
    "com.instagram.android"            to "social",
    "com.twitter.android"              to "social",
    "com.zhiliaoapp.musically"         to "social",
    "com.ss.android.ugc.trill"         to "social",
    "com.snapchat.android"             to "social",
    "com.pinterest"                    to "social",
    "com.linkedin.android"             to "social",
    "com.reddit.frontpage"             to "social",
    "com.whatsapp"                     to "social",
    "com.whatsapp.w4b"                 to "social",
    "com.discord"                      to "social",
    "org.telegram.messenger"           to "social",
    "com.viber.voip"                   to "social",
    "jp.naver.line.android"            to "social",
    "com.skype.raider"                 to "social",

    // Productivity
    "com.google.android.gm"            to "productivity",
    "com.microsoft.office.outlook"     to "productivity",
    "com.google.android.calendar"      to "productivity",
    "com.microsoft.teams"              to "productivity",
    "com.slack"                        to "productivity",
    "com.google.android.apps.docs"     to "productivity",
    "com.google.android.apps.sheets"   to "productivity",
    "com.google.android.apps.slides"   to "productivity",
    "com.microsoft.office.word"        to "productivity",
    "com.microsoft.office.excel"       to "productivity",
    "com.microsoft.office.powerpoint"  to "productivity",
    "com.todoist.android.Todoist"      to "productivity",
    "com.notion.id"                    to "productivity",
    "md.obsidian"                      to "productivity",
    "com.evernote"                     to "productivity",
    "com.dropbox.android"              to "productivity",
    "com.google.android.keep"          to "productivity",
    "com.trello"                       to "productivity",
    "com.asana.app"                    to "productivity",

    // Entertainment
    "com.google.android.youtube"       to "entertainment",
    "com.netflix.mediaclient"          to "entertainment",
    "com.spotify.music"                to "entertainment",
    "com.amazon.avod.thirdpartyclient" to "entertainment",
    "com.disney.disneyplus"            to "entertainment",
    "com.hbo.hbonow"                   to "entertainment",
    "com.apple.android.music"          to "entertainment",
    "com.amazon.music"                 to "entertainment",
    "com.soundcloud.android"           to "entertainment",
    "com.zhiliaoapp.musically.go"      to "entertainment",
    "com.supercell.clashofclans"       to "entertainment",
    "com.pubg.krmobile"                to "entertainment",
    "com.dts.freefireth"               to "entertainment",
    "com.epicgames.fortnite"           to "entertainment",
    "tv.twitch.android.app"            to "entertainment",
    "com.google.android.apps.youtube.music" to "entertainment",
    "com.tencent.ig"                   to "entertainment",
  )

  /**
   * Returns a list of usage records for the past 24 hours.
   * Each record is a Map with keys: app_name, app_package, category, duration_minutes.
   */
  fun getLast24HourStats(): List<Map<String, Any>> {
    val usageStatsManager =
      context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
        ?: return emptyList()

    val packageManager: PackageManager = context.packageManager
    val endTime = System.currentTimeMillis()
    val startTime = endTime - 24L * 60 * 60 * 1000

    val statsMap = usageStatsManager.queryAndAggregateUsageStats(startTime, endTime)
    val results = mutableListOf<Map<String, Any>>()

    for ((pkg, stats) in statsMap) {
      val durationMs = stats.totalTimeInForeground
      if (durationMs <= 0L) continue
      val durationMinutes = (durationMs / 1000 / 60).toInt()
      if (durationMinutes < 1) continue

      val appName = try {
        val info = packageManager.getApplicationInfo(pkg, 0)
        packageManager.getApplicationLabel(info).toString()
      } catch (_: PackageManager.NameNotFoundException) {
        pkg
      }

      results.add(
        mapOf(
          "app_name"         to appName,
          "app_package"      to pkg,
          "category"         to (packageCategoryMap[pkg] ?: "other"),
          "duration_minutes" to durationMinutes,
        )
      )
    }

    results.sortByDescending { it["duration_minutes"] as Int }
    return results
  }
}
