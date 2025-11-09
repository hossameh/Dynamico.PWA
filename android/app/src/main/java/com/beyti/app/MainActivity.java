package com.beyti.app;

import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Mitigate overlay/clickjacking
    final View root = getWindow().getDecorView().getRootView();
    root.setFilterTouchesWhenObscured(true);

    WebView webView = getBridge().getWebView();
    if (webView != null) {
      webView.setFilterTouchesWhenObscured(true);

      WebSettings s = webView.getSettings();

      // ✅ Fix for "JavaScript CORS enabled in WebView (static)"
      s.setAllowFileAccessFromFileURLs(false);
      s.setAllowUniversalAccessFromFileURLs(false);

      // 👍 Extra hardening (safe for Capacitor’s virtual host)
      // If any plugin needs direct file:// access, comment these two out.
      s.setAllowFileAccess(false);
      s.setAllowContentAccess(false);

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
      }

      // Runtime verification (check logcat)
      Log.d(
        "WV-SEC",
        "UAFromFile=" + s.getAllowUniversalAccessFromFileURLs()
          + ", FileFromFile=" + s.getAllowFileAccessFromFileURLs()
          + ", FileAccess=" + s.getAllowFileAccess()
          + ", ContentAccess=" + s.getAllowContentAccess()
          + ", MixedContentMode=" + (Build.VERSION.SDK_INT >= 21 ? s.getMixedContentMode() : -1)
      );
    }
  }
}
