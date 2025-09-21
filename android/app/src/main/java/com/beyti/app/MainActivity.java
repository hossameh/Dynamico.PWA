package com.beyti.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.os.Build;
import com.getcapacitor.BridgeActivity;
import android.view.View;


public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    WebView webView = getBridge().getWebView();
    final View root = getWindow().getDecorView().getRootView();
    root.setFilterTouchesWhenObscured(true);

    if (webView != null) {
      WebSettings s = webView.getSettings();

      // 🚫 Block the dangerous file-url permissions
      s.setAllowFileAccessFromFileURLs(false);
      s.setAllowUniversalAccessFromFileURLs(false);

    }
    if (webView != null) {
      webView.setFilterTouchesWhenObscured(true);

      // (From earlier steps) keep other safe WebView settings
      WebSettings s = webView.getSettings();
      s.setAllowFileAccessFromFileURLs(false);
      s.setAllowUniversalAccessFromFileURLs(false);
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
      }
    }
  }
}
