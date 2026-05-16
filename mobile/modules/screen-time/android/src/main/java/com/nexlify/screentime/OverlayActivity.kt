package com.nexlify.screentime

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.graphics.Color
import android.view.Gravity
import android.widget.LinearLayout

class OverlayActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val blockedPackage = intent.getStringExtra("BLOCKED_APP_PACKAGE") ?: "Unknown App"
        val blockedAppName = intent.getStringExtra("BLOCKED_APP_NAME") ?: blockedPackage
        val isDetoxActive = intent.getBooleanExtra("IS_DETOX_ACTIVE", false)
        
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#E6F4FE"))
            setPadding(64, 64, 64, 64)
        }
        
        val titleText = TextView(this).apply {
            text = "Time limit reached"
            textSize = 28f
            setTextColor(Color.BLACK)
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 32)
        }
        
        val subtitleText = TextView(this).apply {
            text = if (isDetoxActive) {
                "Detox Active. You cannot access $blockedAppName right now.\n\nAre you sure you want to break your session?"
            } else {
                "You've reached your daily limit for $blockedAppName.\n\n\"Stay focused, you can do this!\""
            }
            textSize = 18f
            setTextColor(Color.DKGRAY)
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 64)
        }
        
        val overrideButton = Button(this).apply {
            text = if (isDetoxActive) "Break Detox Session" else "Override for 15 mins"
            setOnClickListener {
                val title = if (isDetoxActive) "Break Detox Session?" else "Override Limit?"
                val msg = if (isDetoxActive) "This will end your detox early and trigger a 15-minute cooldown." else "This will bypass your limit for 15 minutes and will be recorded."
                
                android.app.AlertDialog.Builder(this@OverlayActivity)
                    .setTitle(title)
                    .setMessage(msg)
                    .setPositiveButton(if (isDetoxActive) "Break" else "Override") { _, _ ->
                        if (isDetoxActive) {
                            ScreenTimeModule.instance?.emitDetoxBrokenEvent()
                        } else {
                            ScreenTimeModule.instance?.emitOverrideEvent(blockedPackage)
                        }
                        finish()
                    }
                    .setNegativeButton("Cancel", null)
                    .show()
            }
        }
        
        val closeButton = Button(this).apply {
            text = "Go to Home"
            setOnClickListener {
                goHome()
            }
        }
        
        layout.addView(titleText)
        layout.addView(subtitleText)
        layout.addView(overrideButton)
        layout.addView(closeButton)
        
        setContentView(layout)
    }
    
    override fun onBackPressed() {
        super.onBackPressed()
        goHome()
    }

    private fun goHome() {
        val homeIntent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        startActivity(homeIntent)
        finish()
    }
}
