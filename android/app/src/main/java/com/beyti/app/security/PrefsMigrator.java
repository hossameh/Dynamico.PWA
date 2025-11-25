package com.beyti.app.security;

import android.content.Context;
import android.content.SharedPreferences;

import java.io.File;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public final class PrefsMigrator {
  private static final String SECURE_FILE = "secure_prefs";
  // Add/adjust keys that are sensitive in your app:
  private static final Set<String> SENSITIVE = new HashSet<>(Arrays.asList(
      "token","access_token","refresh_token","id_token","jwt","session","session_id",
      "username","email","phone","user_id","device_id","api_key","client_secret",
      "auth_cookie","cookie","csrf","pin","otp"
  ));
  // Run only once per install:
  private static final String MIGRATED_FLAG = "_migration_done_v1";

  private PrefsMigrator() {}

  public static void migrateIfNeeded(Context ctx) {
    SharedPreferences secure = SecurePrefs.get(ctx);
    if (secure.getBoolean(MIGRATED_FLAG, false)) return;

    File dir = new File(ctx.getApplicationInfo().dataDir, "shared_prefs");
    File[] files = dir.listFiles((d, name) -> name.endsWith(".xml"));
    if (files == null) {
      secure.edit().putBoolean(MIGRATED_FLAG, true).apply();
      return;
    }

    for (File f : files) {
      String name = f.getName().replace(".xml", "");
      if (SECURE_FILE.equals(name)) continue; // skip encrypted store
      SharedPreferences plain = ctx.getSharedPreferences(name, Context.MODE_PRIVATE);
      Map<String,?> all = plain.getAll();
      if (all == null || all.isEmpty()) continue;

      SharedPreferences.Editor secEd = secure.edit();
      SharedPreferences.Editor plainEd = plain.edit();

      for (Map.Entry<String,?> e : all.entrySet()) {
        String key = e.getKey();
        Object val = e.getValue();
        if (!isSensitive(key, val)) continue;

        // Move value into encrypted prefs
        if (val instanceof String) secEd.putString(key, (String) val);
        else if (val instanceof Boolean) secEd.putBoolean(key, (Boolean) val);
        else if (val instanceof Integer) secEd.putInt(key, (Integer) val);
        else if (val instanceof Long) secEd.putLong(key, (Long) val);
        else if (val instanceof Float) secEd.putFloat(key, (Float) val);
        else if (val instanceof Set) {
          @SuppressWarnings("unchecked")
          Set<String> set = (Set<String>) val;
          secEd.putStringSet(key, set);
        } else {
          // fallback: toString
          secEd.putString(key, String.valueOf(val));
        }

        // Remove from plaintext store
        plainEd.remove(key);
      }

      secEd.apply();
      plainEd.apply();
    }

    secure.edit().putBoolean(MIGRATED_FLAG, true).apply();
  }

  private static boolean isSensitive(String key, Object val) {
    if (key == null) return false;
    String k = key.toLowerCase();
    if (SENSITIVE.contains(k)) return true;
    // heuristic matches
    return (k.contains("token") || k.contains("session") || k.contains("secret")
        || k.contains("auth") || k.contains("jwt") || k.matches(".*(user.*id|email|phone).*"));
  }
}
