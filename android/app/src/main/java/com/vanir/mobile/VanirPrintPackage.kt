package com.vanir.mobile

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * React Native package wrapper registering [VanirPrintModule] with the React application bridge.
 */
class VanirPrintPackage : ReactPackage {
  /**
   * Registers custom native modules with the [ReactApplicationContext].
   *
   * @param reactContext The active application context provided by React Native.
   * @return List containing [VanirPrintModule].
   */
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
    listOf(VanirPrintModule(reactContext))

  /**
   * Registers custom native UI view managers (none required for this package).
   *
   * @param reactContext The active application context provided by React Native.
   * @return Empty list of view managers.
   */
  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    emptyList()
}
