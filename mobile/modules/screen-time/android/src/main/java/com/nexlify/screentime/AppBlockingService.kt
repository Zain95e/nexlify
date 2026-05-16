package com.nexlify.screentime

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent

class AppBlockingService : AccessibilityService() {

    companion object {
        var blockedApps: List<String> = emptyList() // Updated dynamically via Expo Module
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val packageName = event.packageName?.toString() ?: return
            
            val pm = packageManager
            val appName = try {
                pm.getApplicationLabel(pm.getApplicationInfo(packageName, 0)).toString()
            } catch (e: Exception) {
                packageName
            }

            // 5.2.1 Detox mode: Blocks all apps except whitelist
            if (DetoxManager.isDetoxActive) {
                // Ignore system launchers and UI
                if (packageName == "com.android.systemui" || packageName.contains("launcher") || packageName == "com.android.settings") return
                
                if (!DetoxManager.whitelist.contains(packageName)) {
                    Log.d("AppBlockingService", "Detox blocked app launched: $packageName")
                    launchOverlay(packageName, appName, true)
                }
            } 
            // 5.1.2 Normal limit mode
            else if (blockedApps.contains(packageName)) {
                Log.d("AppBlockingService", "Blocked app launched: $packageName")
                launchOverlay(packageName, appName, false)
            }
        }
    }

    private fun launchOverlay(packageName: String, appName: String, isDetox: Boolean) {
        val intent = Intent(this, OverlayActivity::class.java).apply {
            putExtra("BLOCKED_APP_PACKAGE", packageName)
            putExtra("BLOCKED_APP_NAME", appName)
            putExtra("IS_DETOX_ACTIVE", isDetox)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
        }
        startActivity(intent)
    }

    override fun onInterrupt() {
        // No-op
    }
}
