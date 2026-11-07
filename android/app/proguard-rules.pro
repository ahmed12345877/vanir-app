# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android-optimize.txt

-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keep public class * extends java.lang.Exception

# ---------------------------------------------------------------------------
# React Native Annotations & Reflection Protection
# ---------------------------------------------------------------------------
-keep @interface com.facebook.proguard.annotations.DoNotStrip
-keep @interface com.facebook.common.internal.DoNotStrip
-keep @interface com.facebook.react.uimanager.annotations.ReactProp
-keep @interface com.facebook.react.uimanager.annotations.ReactPropGroup
-keep @interface com.facebook.react.bridge.ReactMethod

-keep @com.facebook.proguard.annotations.DoNotStrip class * { *; }
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keepclassmembers class * {
    @com.facebook.common.internal.DoNotStrip *;
}

# ---------------------------------------------------------------------------
# React Native NativeModules & ViewManagers
# ---------------------------------------------------------------------------
-keepclassmembers class * extends com.facebook.react.bridge.NativeModule {
    @com.facebook.react.bridge.ReactMethod *;
}
-keep public class * extends com.facebook.react.bridge.ReactContextBaseJavaModule {
    public <init>(...);
}
-keep public class * extends com.facebook.react.uimanager.ViewManager {
    public <init>(...);
}
-keep public class * implements com.facebook.react.ReactPackage {
    public <init>(...);
}
-keep class com.facebook.react.bridge.JavaScriptModule { *; }
-keep class com.facebook.react.views.view.ReactViewBackgroundDrawable { *; }

# Native JNI, Hermes, and Soloader bindings
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.yoga.** { *; }
-keep class com.facebook.soloader.** { *; }

# Keep native methods and JavaScript interfaces
-keepclasseswithmembers class * {
    native <methods>;
}

-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ---------------------------------------------------------------------------
# Reanimated (JNI bindings require explicit keep)
# ---------------------------------------------------------------------------
-keep class com.swmansion.reanimated.** { *; }

# ---------------------------------------------------------------------------
# Firebase & Play Services (Consumer rules in AARs handle necessary keeps;
# avoid blanket keeps to maintain high R8 obfuscation rate)
# ---------------------------------------------------------------------------
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**
-dontwarn androidx.credentials.**
-dontwarn com.google.android.play.**

# ---------------------------------------------------------------------------
# Firebase Crashlytics
# ---------------------------------------------------------------------------
-keep class com.crashlytics.** { *; }
-dontwarn com.crashlytics.**

# ---------------------------------------------------------------------------
# Suppress harmless warnings for optional dependencies
# ---------------------------------------------------------------------------
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn com.facebook.react.**
-dontwarn org.bouncycastle.**

