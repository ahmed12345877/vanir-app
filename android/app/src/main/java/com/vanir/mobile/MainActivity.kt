package com.vanir.mobile

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.core.view.WindowCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

/**
 * Primary single-activity entry point for the Vanir Mobile application.
 *
 * Extends [ReactActivity] to host the root React Native component tree. Handles
 * window inset setup for modern Android edge-to-edge layout styling, cutout support,
 * and intent redirection handling for deep links.
 */
class MainActivity : ReactActivity() {

  /**
   * Initializes the activity and sets up edge-to-edge window fitting and display cutout modes.
   *
   * @param savedInstanceState Saved state bundle from a previous activity instance, if any.
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    // Official AndroidX API for Android 15 Edge-to-Edge window handling
    WindowCompat.setDecorFitsSystemWindows(window, false)

    // Android 15 Cutout Mode: Replace deprecated DEFAULT / SHORT_EDGES with ALWAYS
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      window.attributes.layoutInDisplayCutoutMode =
        WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
    }
  }

  /**
   * Handles incoming new intents delivered while the activity is running in single-task launch mode.
   *
   * @param intent The new [Intent] delivered to this activity.
   */
  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
  }

  /**
   * Returns the name of the main component registered from JavaScript (`AppRegistry.registerComponent`).
   * Used by React Native to schedule initial UI rendering.
   *
   * @return The string identifier `"VanirMobile"`.
   */
  override fun getMainComponentName(): String = "VanirMobile"

  /**
   * Returns the instance of [ReactActivityDelegate] used to configure activity behavior,
   * enabling React Native's New Architecture via [DefaultReactActivityDelegate].
   *
   * @return Configured [ReactActivityDelegate] instance.
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
