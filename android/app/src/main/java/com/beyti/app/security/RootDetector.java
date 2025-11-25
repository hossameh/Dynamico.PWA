package com.beyti.app.security;

import android.os.Build;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.InputStreamReader;

public final class RootDetector {

  public static final class Result {
    public final boolean rooted;
    public final String details; // short reason(s)
    public Result(boolean rooted, String details) {
      this.rooted = rooted;
      this.details = details;
    }
  }

  private RootDetector() {}

  /** Heuristic, multi-signal detection. We consider rooted if >= 2 signals trip. */
  public static Result check() {
    int score = 0;
    StringBuilder why = new StringBuilder();

    // 1) Build tags (user vs test-keys)
    if (isTestKeys()) { score++; append(why, "test-keys"); }

    // 2) su binary in common paths
    if (hasSuBinary()) { score++; append(why, "su-binary"); }

    // 3) which su in PATH
    if (whichSuFound()) { score++; append(why, "which-su"); }

    // 4) known root mgmt artifacts (magisk, superuser APK)
    if (hasRootArtifacts()) { score++; append(why, "root-artifacts"); }

    // 5) insecure props (ro.debuggable=1 or ro.secure=0)
    String prop = insecureProps();
    if (!prop.isEmpty()) { score++; append(why, prop); }

    // 6) SELinux disabled (best-effort)
    if (!selinuxEnforcing()) { score++; append(why, "selinux-off"); }

    // decide: block if 2 or more independent indicators
    boolean rooted = score >= 2;
    return new Result(rooted, why.toString());
  }

  private static void append(StringBuilder sb, String s) {
    if (sb.length() > 0) sb.append(',');
    sb.append(s);
  }

  private static boolean isTestKeys() {
    String tags = Build.TAGS;
    return tags != null && tags.contains("test-keys");
  }

  private static boolean hasSuBinary() {
    String[] paths = {
      "/system/bin/su", "/system/xbin/su", "/sbin/su",
      "/system/su", "/system/bin/.ext/su", "/system/usr/we-need-root/su",
      "/system/app/Superuser.apk", "/data/local/su", "/data/local/bin/su",
      "/data/local/xbin/su"
    };
    for (String p : paths) {
      if (new File(p).exists()) return true;
    }
    return false;
  }

  private static boolean whichSuFound() {
    try {
      Process p = Runtime.getRuntime().exec(new String[] { "which", "su" });
      BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
      String line = r.readLine();
      r.close(); p.destroy();
      return line != null && !line.trim().isEmpty();
    } catch (Exception ignored) {
      return false;
    }
  }

  private static boolean hasRootArtifacts() {
    String[] suspect = {
      "/system/app/Superuser.apk",
      "/system/app/MagiskManager.apk",
      "/data/adb/magisk",            // Magisk core dir
      "/sbin/magisk", "/sbin/.magisk"
    };
    for (String p : suspect) {
      if (new File(p).exists()) return true;
    }
    return false;
  }

  private static String insecureProps() {
    String insecure = "";
    String dbg = getProp("ro.debuggable");
    if ("1".equals(dbg)) insecure = addProp(insecure, "ro.debuggable=1");
    String sec = getProp("ro.secure");
    if ("0".equals(sec)) insecure = addProp(insecure, "ro.secure=0");
    return insecure;
  }

  private static String addProp(String cur, String add) {
    if (cur.isEmpty()) return add;
    return cur + "+" + add;
  }

  private static String getProp(String key) {
    try {
      Process p = Runtime.getRuntime().exec(new String[]{"getprop", key});
      BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
      String v = br.readLine();
      br.close();
      p.destroy();
      return v == null ? "" : v.trim();
    } catch (Exception e) {
      return "";
    }
  }

  private static boolean selinuxEnforcing() {
    try {
      File f = new File("/sys/fs/selinux/enforce");
      if (!f.exists()) return true; // assume enforcing if unknown
      BufferedReader br = new BufferedReader(new FileReader(f));
      String v = br.readLine();
      br.close();
      // 1 = enforcing, 0 = permissive/disabled
      return "1".equals(v != null ? v.trim() : "");
    } catch (Exception ignored) {
      return true;
    }
  }
}
