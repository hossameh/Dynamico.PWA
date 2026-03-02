# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile


# Neutralize attempts to enable file:// cross-origin access in WebView
-assumenosideeffects class android.webkit.WebSettings {
    public void setAllowUniversalAccessFromFileURLs(boolean);
    public void setAllowFileAccessFromFileURLs(boolean);
    public void setAllowFileAccess(boolean);
}
-assumenosideeffects class android.webkit.SslErrorHandler {
  public void proceed();
}

# strip all android.util.Log in release (avoid "Application Logs" finding)
-assumenosideeffects class android.util.Log {
  public static *** v(...); public static *** d(...); public static *** i(...);
  public static *** w(...); public static *** e(...); public static *** wtf(...);
}

-keepattributes *Annotation*
-keepattributes InnerClasses,EnclosingMethod
-dontskipnonpubliclibraryclasses
-optimizationpasses 5
-overloadaggressively

# ========================================
# Capacitor Core - Required for all plugins
# ========================================
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.plugin.** { *; }
-keepclassmembers class com.getcapacitor.** { *; }

# Keep Capacitor Plugin annotations
-keep @com.getcapacitor.annotation.** class * { *; }
-keep @com.getcapacitor.* class * { *; }

# Keep all Plugin classes
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    public <methods>;
}

# ========================================
# Capgo Background Geolocation Plugin
# ========================================
-keep class com.capgo.** { *; }
-keep class com.capgo.capacitor_background_geolocation.** { *; }
-keepclassmembers class com.capgo.capacitor_background_geolocation.** { *; }

# ========================================
# Capacitor HTTP Plugin (for native HTTP)
# ========================================
-keep class com.getcapacitor.plugin.http.** { *; }

# ========================================
# Google Play Services Location
# ========================================
-keep class com.google.android.gms.location.** { *; }
-keep class com.google.android.gms.common.** { *; }
