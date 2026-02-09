package com.beyti.app.security;

import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;                     // <-- make sure this import exists
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.net.http.SslError;
import android.os.Build;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class SafeWebViewClient extends WebViewClient {
  private final Context ctx;
  private final Set<String> hostAllow;
  private boolean hasError = false;

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

  @Override
  public void onPageStarted(WebView view, String url, Bitmap favicon) {
    super.onPageStarted(view, url, favicon);
    hasError = false;
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

  // Never bypass SSL errors - but show error page instead of white screen
  @Override
  public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
    handler.cancel();
    hasError = true;
    String errorMsg = "SSL Certificate Error";
    switch (error.getPrimaryError()) {
      case SslError.SSL_EXPIRED:
        errorMsg = "The security certificate has expired";
        break;
      case SslError.SSL_IDMISMATCH:
        errorMsg = "The certificate hostname mismatch";
        break;
      case SslError.SSL_NOTYETVALID:
        errorMsg = "The certificate is not yet valid";
        break;
      case SslError.SSL_UNTRUSTED:
        errorMsg = "The certificate authority is not trusted";
        break;
    }
    view.loadData(getErrorPage("Security Error", errorMsg, "Please check your connection and try again."), "text/html", "UTF-8");
  }

  // Handle general errors (network errors, etc.)
  @Override
  public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
    if (request.isForMainFrame()) {
      hasError = true;
      String errorDesc = "";
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        errorDesc = error.getDescription() != null ? error.getDescription().toString() : "Unknown error";
      }
      view.loadData(getErrorPage("Connection Error", 
        "Unable to load the application", 
        errorDesc + "<br><br>Please check your internet connection and try again."), "text/html", "UTF-8");
    }
  }

  // Handle HTTP errors (404, 500, etc.)
  @Override
  public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
    super.onReceivedHttpError(view, request, errorResponse);
    if (request.isForMainFrame() && !hasError) {
      int statusCode = errorResponse.getStatusCode();
      if (statusCode >= 400) {
        hasError = true;
        view.loadData(getErrorPage("Server Error", 
          "Error " + statusCode, 
          "The server returned an error. Please try again later."), "text/html", "UTF-8");
      }
    }
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

  // Generate a styled error page
  private String getErrorPage(String title, String heading, String message) {
    return "<!DOCTYPE html>" +
      "<html dir='rtl'>" +
      "<head>" +
      "<meta charset='UTF-8'>" +
      "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
      "<title>" + title + "</title>" +
      "<style>" +
      "* { box-sizing: border-box; margin: 0; padding: 0; }" +
      "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; " +
      "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); " +
      "min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }" +
      ".container { background: white; border-radius: 20px; padding: 40px; text-align: center; " +
      "max-width: 400px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }" +
      ".icon { font-size: 64px; margin-bottom: 20px; }" +
      "h1 { color: #333; font-size: 24px; margin-bottom: 15px; }" +
      "p { color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px; }" +
      ".btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; " +
      "border: none; padding: 15px 40px; font-size: 16px; border-radius: 30px; cursor: pointer; " +
      "text-decoration: none; display: inline-block; transition: transform 0.2s, box-shadow 0.2s; }" +
      ".btn:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4); }" +
      "</style>" +
      "</head>" +
      "<body>" +
      "<div class='container'>" +
      "<div class='icon'>⚠️</div>" +
      "<h1>" + heading + "</h1>" +
      "<p>" + message + "</p>" +
      "<a href='javascript:location.reload()' class='btn'>إعادة المحاولة</a>" +
      "</div>" +
      "</body>" +
      "</html>";
  }
}

