package com.beyti.app.security;

import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;                     // <-- make sure this import exists
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.net.http.SslError;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class SafeWebViewClient extends WebViewClient {
  private final Context ctx;
  private final Set<String> hostAllow;

  public SafeWebViewClient(Context c, Set<String> hosts) {
    this.ctx = c.getApplicationContext();
    this.hostAllow = new HashSet<>();
    for (String h : hosts) this.hostAllow.add(h.toLowerCase());
  }

  private boolean allowed(Uri u) {
    if (u == null) return false;
    String scheme = u.getScheme() == null ? "" : u.getScheme().toLowerCase();
    String host   = u.getHost()   == null ? "" : u.getHost().toLowerCase();
    if ("localhost".equals(host)) return true; // Capacitor local host
    return ("https".equals(scheme) || "http".equals(scheme)) &&
           (hostAllow.contains(host) || hostAllow.contains(host.replaceFirst("^www\\.", "")));
  }

  // Nougat+ path
  @Override
  public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
    Uri u = r.getUrl();
    if (allowed(u)) return false;         // load inside WebView
    openExternal(u);                      // open others externally
    return true;
  }

  // Legacy path
  @Override @SuppressWarnings("deprecation")
  public boolean shouldOverrideUrlLoading(WebView v, String url) {
    Uri u = Uri.parse(url);               // <-- inline logic (no missing overload)
    if (allowed(u)) return false;
    openExternal(u);
    return true;
  }

  private void openExternal(Uri u) {
    try {
      Intent i = new Intent(Intent.ACTION_VIEW, u);
      i.addCategory(Intent.CATEGORY_BROWSABLE);
      i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      ctx.startActivity(i);
    } catch (ActivityNotFoundException ignored) {}
  }

  // Never bypass SSL errors
  @Override
  public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
    handler.cancel();
  }

  // Block file:// & content:// main-frame navigations (allow subresources for uploads)
  @Override
  public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
    Uri u = req.getUrl();
    if (u != null && req.isForMainFrame()) {
      String sch = u.getScheme() == null ? "" : u.getScheme().toLowerCase();
      if ("file".equals(sch) || "content".equals(sch)) {
        return new WebResourceResponse("text/plain", "utf-8", null);
      }
    }
    return super.shouldInterceptRequest(view, req);
  }
}
