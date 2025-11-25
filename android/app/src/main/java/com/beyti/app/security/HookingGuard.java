package com.beyti.app.security;

import android.app.Activity;
import android.os.Debug;
import android.os.Handler;
import android.os.Looper;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.InputStreamReader;
import java.net.Socket;
import java.util.Locale;

/** Release-only anti-hooking watchdog: detects debugger, tracer, Frida/LSPosed/Xposed/Substrate. */
public final class HookingGuard {

  private final Activity activity;
  private final Handler h = new Handler(Looper.getMainLooper());
  private final Runnable lightTick = new Runnable() {
    @Override public void run() {
      if (detectedLight()) {
        tripAndExit();
        return;
      }
      // re-check ~every 800 ms (cheap: debugger + tracer + frida port)
      h.postDelayed(this, 800);
    }
  };

  private final Runnable heavyTick = new Runnable() {
    @Override public void run() {
      if (detectedHeavy()) {
        tripAndExit();
        return;
      }
      // rescan maps/classes every 20s (heavier)
      h.postDelayed(this, 20_000);
    }
  };

  private volatile boolean tripped = false;

  private HookingGuard(Activity a) { this.activity = a; }

  public static HookingGuard attach(Activity a, boolean enabled) {
    HookingGuard g = new HookingGuard(a);
    if (enabled) g.start();
    return g;
  }

  public void start() {
    // one-shot checks at startup
    if (detectedStartup()) {
      tripAndExit();
      return;
    }
    // start periodic loops
    h.post(lightTick);
    h.postDelayed(heavyTick, 2_000);
  }

  public void stop() {
    h.removeCallbacks(lightTick);
    h.removeCallbacks(heavyTick);
  }

  // ----- DETECTION LAYERS -----

  private boolean detectedStartup() {
    return hasHookingLibsInMaps() || classPresent(
        "de.robv.android.xposed.XposedBridge",
        "lsposed.lspd.nativebridge.NativeBridge",
        "com.saurik.substrate.MS$2",
        "com.frida.server"
    ) || detectedLight();
  }

  /** cheap/fast checks for the tight loop */
  private boolean detectedLight() {
    return isDebuggerAttached() || tracerPid() > 0 || fridaServerListening();
  }

  /** heavier checks run less frequently */
  private boolean detectedHeavy() {
    return hasHookingLibsInMaps();
  }

  // debugger present (JDWP)
  private boolean isDebuggerAttached() {
    return Debug.isDebuggerConnected() || Debug.waitingForDebugger();
  }

  // someone tracing this process (ptrace)
  private int tracerPid() {
    try (BufferedReader br = new BufferedReader(new FileReader("/proc/self/status"))) {
      String line;
      while ((line = br.readLine()) != null) {
        if (line.startsWith("TracerPid:")) {
          String v = line.substring("TracerPid:".length()).trim();
          return v.isEmpty() ? 0 : Integer.parseInt(v);
        }
      }
    } catch (Exception ignored) {}
    return 0;
  }

  // common frida server ports (27042/27043). On non-rooted devices, this should fail harmlessly.
  private boolean fridaServerListening() {
    return canTcp("127.0.0.1", 27042) || canTcp("127.0.0.1", 27043);
  }
  private boolean canTcp(String host, int port) {
    try (Socket s = new Socket(host, port)) { return true; } catch (Exception e) { return false; }
  }

  // scan /proc/self/maps for hooking libs
  private boolean hasHookingLibsInMaps() {
    try (BufferedReader r = new BufferedReader(new FileReader("/proc/self/maps"))) {
      String line;
      while ((line = r.readLine()) != null) {
        String l = line.toLowerCase(Locale.US);
        if (l.contains("xposedbridge.jar") ||
            l.contains("edxposed") || l.contains("lsposed") ||
            l.contains("substrate") || l.contains("frida")) {
          return true;
        }
      }
    } catch (Exception ignored) {}
    return false;
  }

  // detect class present via reflection (works if framework is injected as Java code)
  private boolean classPresent(String... names) {
    for (String n : names) {
      try { Class.forName(n, false, activity.getClassLoader()); return true; }
      catch (Throwable ignored) {}
    }
    return false;
  }

  // terminate cleanly without ANR
  private void tripAndExit() {
    if (tripped) return;
    tripped = true;
    try {
      android.widget.Toast.makeText(activity, "Security check failed. Closing.", android.widget.Toast.LENGTH_LONG).show();
    } catch (Throwable ignored) {}
    activity.getWindow().getDecorView().postDelayed(() -> {
      try { activity.finishAndRemoveTask(); } catch (Throwable ignored) { activity.finish(); }
    }, 500);
  }
}
