package com.nexlify.screentime

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.CountDownTimer
import android.os.IBinder
import androidx.core.app.NotificationCompat

class DetoxService : Service() {

    private val CHANNEL_ID = "DetoxServiceChannel"
    private val NOTIFICATION_ID = 2
    private var countDownTimer: CountDownTimer? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val durationMinutes = intent?.getIntExtra("DURATION_MINUTES", 30) ?: 30
        
        startForeground(NOTIFICATION_ID, buildNotification(durationMinutes))

        countDownTimer?.cancel()
        countDownTimer = object : CountDownTimer(durationMinutes * 60 * 1000L, 60 * 1000L) {
            override fun onTick(millisUntilFinished: Long) {
                val minsLeft = (millisUntilFinished / 1000 / 60).toInt()
                updateNotification(minsLeft)
            }

            override fun onFinish() {
                DetoxManager.isDetoxActive = false
                ScreenTimeModule.instance?.emitDetoxFinishedEvent()
                stopSelf()
            }
        }.start()

        return START_NOT_STICKY
    }

    private fun buildNotification(minutesRemaining: Int): android.app.Notification {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Detox Active")
            .setContentText("Detox Active — $minutesRemaining minutes remaining")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    private fun updateNotification(minutesRemaining: Int) {
        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, buildNotification(minutesRemaining))
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Detox Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        countDownTimer?.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
