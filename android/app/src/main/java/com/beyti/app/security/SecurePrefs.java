package com.beyti.app.security;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

public final class SecurePrefs {
  private static final String FILE = "secure_prefs";
  private SecurePrefs() {}

  public static SharedPreferences get(Context ctx) {
    try {
      MasterKey mk = new MasterKey.Builder(ctx)
          .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
          .build();
      return EncryptedSharedPreferences.create(
          ctx,
          FILE,
          mk,
          EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
          EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
      );
    } catch (Exception e) {
      // If something goes wrong, fall back to regular prefs (avoid crash).
      return ctx.getSharedPreferences(FILE, Context.MODE_PRIVATE);
    }
  }

  // Convenience helpers
  public static void putString(Context ctx, String k, String v) {
    get(ctx).edit().putString(k, v).apply();
  }
  public static String getString(Context ctx, String k, String def) {
    return get(ctx).getString(k, def);
  }
  public static void remove(Context ctx, String k) {
    get(ctx).edit().remove(k).apply();
  }
}
