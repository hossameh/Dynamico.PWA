package com.beyti.app;

import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;
import com.beyti.app.security.HookingGuard;

// AndroidX WebKit (for Safe Browsing + Service Worker settings)
import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import androidx.webkit.ServiceWorkerControllerCompat;
import androidx.webkit.ServiceWorkerWebSettingsCompat;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.net.Socket;

public class MainActivity extends BridgeActivity {
    private HookingGuard guard;

  // Hard drop touches if an overlay obscures the window (tapjacking)
 @Override
public boolean dispatchTouchEvent(MotionEvent ev) {
  // Only evaluate on the first pointer down
  if (ev.getAction() == MotionEvent.ACTION_DOWN) {
    int flags = ev.getFlags();
    boolean obscured = (flags & MotionEvent.FLAG_WINDOW_IS_OBSCURED) != 0;
    // FLAG_WINDOW_IS_PARTIALLY_OBSCURED (API 29+) guards against translucent overlays
    boolean partiallyObscured = (Build.VERSION.SDK_INT >= 29) &&
                                ((flags & 0x2) != 0); // MotionEvent.FLAG_WINDOW_IS_PARTIALLY_OBSCURED

    if (obscured || partiallyObscured) {
      if (BuildConfig.DEBUG) android.util.Log.w("TAPJACK", "Obscured touch dropped");
      return true; // swallow it
    }
  }
  return super.dispatchTouchEvent(ev);
}

  @Override
  public void onCreate(Bundle savedInstanceState) {
       if (SecurityUtils.isHooked() || SecurityUtils.detectSuspiciousPackages(this)) {
        // Show a message and close
        Toast.makeText(this,
                "Security check failed. Please use a non-modified device.",
                Toast.LENGTH_LONG).show();
        finish();
        return;
    }
    super.onCreate(savedInstanceState);
     View rootView = getWindow().getDecorView().getRootView();
    rootView.setFilterTouchesWhenObscured(true);
    final View content = getWindow().getDecorView().findViewById(android.R.id.content);
if (content != null) {
  com.beyti.app.security.TapShield.protectTree(content);
  content.getViewTreeObserver().addOnGlobalLayoutListener(
    () -> com.beyti.app.security.TapShield.protectTree(content)
  );
}
    // One-time migration of flagged keys to encrypted SharedPreferences
try {
  com.beyti.app.security.PrefsMigrator.migrateIfNeeded(this);
} catch (Throwable t) {
  // don’t crash — if migration fails, app still runs
  if (BuildConfig.DEBUG) android.util.Log.w("PREFS", "Migration failed", t);
}
    // OPTIONAL: block screenshots/recording on this screen
    getWindow().setFlags(
        android.view.WindowManager.LayoutParams.FLAG_SECURE,
        android.view.WindowManager.LayoutParams.FLAG_SECURE
    );

    // === Release-only security gates (keep dev workflow smooth) ===
    if (BuildConfig.ENFORCE_HOOK_BLOCK) {
      if (isDebuggerAttached() || hasHookingLibs() || isFridaServerUp()) {
        Toast.makeText(this, "Security check failed. Closing.", Toast.LENGTH_LONG).show();
        getWindow().getDecorView().postDelayed(() -> {
          finishAndRemoveTask();
        }, 500);
        return;
      }
    }
    if (BuildConfig.ENFORCE_ROOT_BLOCK) {
      if (isRooted()) {
        Toast.makeText(this, "Security check failed. Closing.", Toast.LENGTH_LONG).show();
        getWindow().getDecorView().postDelayed(() -> {
          finishAndRemoveTask();
        }, 500);
        return;
      }
    }

    // Tapjacking soft guard
    final View root = getWindow().getDecorView().getRootView();
    root.setFilterTouchesWhenObscured(true);

    // === WebView hardening (WebView Exploits) ===
    WebView webView = getBridge().getWebView();
    if (webView != null) {
      webView.setFilterTouchesWhenObscured(true);

      java.util.Set<String> hosts = new java.util.HashSet<>(java.util.Arrays.asList(
  "dynamico.cloud",
  "lab7software.com",
  "api.dynamico.cloud",
  "egybell-apps.com",
  "admi.egybell-apps.com",
  "internal.egybell-apps.com",
  "vacation.dynamico.cloud"
  // add others you truly need
));
webView.setWebViewClient(new com.beyti.app.security.SafeWebViewClient(this, hosts));
      WebSettings s = webView.getSettings();

      // Core CORS/file:// mitigations
      s.setAllowFileAccessFromFileURLs(false);
      s.setAllowUniversalAccessFromFileURLs(false);
      s.setAllowFileAccess(false);
      s.setAllowContentAccess(true);

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
      }

      // WebView Exploits: conservative toggles
      s.setJavaScriptCanOpenWindowsAutomatically(false);
      s.setSupportMultipleWindows(false);
      try { s.setGeolocationEnabled(true); } catch (Throwable ignored) {}

      // Disable remote debugging in release
      if (!BuildConfig.DEBUG) {
        WebView.setWebContentsDebuggingEnabled(false);
      }

      // Safe Browsing
      if (WebViewFeature.isFeatureSupported(WebViewFeature.START_SAFE_BROWSING)) {
        WebViewCompat.startSafeBrowsing(this, success -> {});
      }
      if (WebViewFeature.isFeatureSupported(WebViewFeature.SAFE_BROWSING_ENABLE)) {
        WebSettingsCompat.setSafeBrowsingEnabled(s, true);
      }

      // Service Worker hardening
      if (WebViewFeature.isFeatureSupported(WebViewFeature.SERVICE_WORKER_BASIC_USAGE)) {
        ServiceWorkerControllerCompat swc = ServiceWorkerControllerCompat.getInstance();
        ServiceWorkerWebSettingsCompat sws = swc.getServiceWorkerWebSettings();
        try {
          sws.setAllowFileAccess(false);
          sws.setAllowContentAccess(false);
          // Do NOT block network loads if your PWA needs online fetches.
          // If you don't use SW at all, you can also consider disabling the SW client from your web app.
        } catch (Throwable ignored) {}
      }

      if (BuildConfig.DEBUG) {
        Log.d("WV-SEC",
            "WV hardened | UAFromFile=" + s.getAllowUniversalAccessFromFileURLs()
            + ", FileFromFile=" + s.getAllowFileAccessFromFileURLs()
            + ", FileAccess=" + s.getAllowFileAccess()
            + ", ContentAccess=" + s.getAllowContentAccess()
            + ", MixedContent=" + (Build.VERSION.SDK_INT >= 21 ? s.getMixedContentMode() : -1));
      }
    }
        guard = HookingGuard.attach(this, BuildConfig.ENFORCE_HOOK_BLOCK);

  }

  // ====== helpers (inline so this compiles even without separate classes) ======

  private boolean isDebuggerAttached() {
    return android.os.Debug.isDebuggerConnected() || android.os.Debug.waitingForDebugger();
  }

  private boolean hasHookingLibs() {
    try (BufferedReader r = new BufferedReader(new FileReader("/proc/self/maps"))) {
      String line;
      while ((line = r.readLine()) != null) {
        String l = line.toLowerCase();
        if (l.contains("xposedbridge.jar") || l.contains("frida") || l.contains("substrate")
            || l.contains("edxposed") || l.contains("lsposed")) {
          return true;
        }
      }
    } catch (Exception ignored) {}
    return false;
  }

  private boolean isFridaServerUp() {
    return isPortOpen("127.0.0.1", 27042) || isPortOpen("127.0.0.1", 27043);
  }
  private boolean isPortOpen(String host, int port) {
    try (Socket s = new Socket(host, port)) { return true; } catch (Exception ignored) { return false; }
  }

  private boolean isRooted() {
    int score = 0;
    if (Build.TAGS != null && Build.TAGS.contains("test-keys")) score++;
    if (hasSuBinary()) score++;
    if (whichSuFound()) score++;
    if (hasRootArtifacts()) score++;
    String dbg = getProp("ro.debuggable");
    String sec = getProp("ro.secure");
    if ("1".equals(dbg) || "0".equals(sec)) score++;
    return score >= 2; // threshold to reduce false positives
  }

  private boolean hasSuBinary() {
    String[] paths = {
        "/system/bin/su","/system/xbin/su","/sbin/su","/system/su",
        "/system/bin/.ext/su","/system/usr/we-need-root/su",
        "/data/local/su","/data/local/bin/su","/data/local/xbin/su"
    };
    for (String p : paths) { if (new File(p).exists()) return true; }
    return false;
  }
  private boolean whichSuFound() {
    try {
      Process p = Runtime.getRuntime().exec(new String[]{"which","su"});
      BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
      String line = r.readLine();
      r.close(); p.destroy();
      return line != null && !line.trim().isEmpty();
    } catch (Exception ignored) { return false; }
  }
  private boolean hasRootArtifacts() {
    String[] suspect = {
        "/system/app/Superuser.apk",
        "/system/app/MagiskManager.apk",
        "/data/adb/magisk",
        "/sbin/magisk", "/sbin/.magisk"
    };
    for (String p : suspect) { if (new File(p).exists()) return true; }
    return false;
  }
  private String getProp(String key) {
    try {
      Process p = Runtime.getRuntime().exec(new String[]{"getprop", key});
      BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
      String v = br.readLine();
      br.close(); p.destroy();
      return v == null ? "" : v.trim();
    } catch (Exception e) { return ""; }
  }

@Override public void onPause() {
  super.onPause();
  if (guard != null) {
    guard.stop();
    guard = null;           // <— important
  }
}

@Override public void onResume() {
  super.onResume();
  if (BuildConfig.ENFORCE_HOOK_BLOCK) {
    guard = HookingGuard.attach(this, true);  // <— restarts checks every time
  }
}
}
