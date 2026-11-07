package com.vanir.mobile

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.drawee.backends.pipeline.Fresco
import com.facebook.imagepipeline.backends.okhttp3.OkHttpImagePipelineConfigFactory
import com.facebook.imagepipeline.core.DownsampleMode
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.modules.network.OkHttpClientProvider

/**
 * Global [Application] class for Vanir Mobile.
 *
 * Implements [ReactApplication] to configure and manage the React Native host lifecycle,
 * register custom native packages (such as [VanirPrintPackage]), initialize Fresco image pipeline
 * optimizations, and register system notification channels for Firebase Cloud Messaging (FCM).
 */
class MainApplication : Application(), ReactApplication {

  /**
   * Lazy-initialized [ReactHost] instance managing the React runtime engine and native package registry.
   */
  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
          add(VanirPrintPackage())
        },
    )
  }

  /**
   * Initializes global application dependencies on startup, including React Native entry point,
   * Fresco image downsampling configuration, and FCM notification channels.
   */
  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)

    // Configure Fresco with automated downsampling and memory-optimized OkHttp pipeline
    try {
      val client = OkHttpClientProvider.createClient()
      val imagePipelineConfig = OkHttpImagePipelineConfigFactory.newBuilder(this, client)
        .setDownsampleMode(DownsampleMode.AUTO)
        .build()
      Fresco.initialize(this, imagePipelineConfig)
    } catch (_: Throwable) {
      // Fresco fallback
    }

    // Create high-priority FCM notification channel for Android 8.0+ (Oreo)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        "vanir_concierge",
        "Vanir VIP Concierge Notifications",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Real-time updates, private flight alerts, and VIP bookings"
        enableLights(true)
        enableVibration(true)
      }
      val notificationManager = getSystemService(NotificationManager::class.java)
      notificationManager?.createNotificationChannel(channel)
    }
  }
}

