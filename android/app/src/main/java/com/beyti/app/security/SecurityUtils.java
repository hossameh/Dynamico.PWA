// e.g. in a new file SecurityUtils.java
package com.beyti.app;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.util.Log;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class SecurityUtils {

    private static final String TAG = "HookDetection";

    public static boolean isHooked() {
        return detectFridaServer() || detectFridaInMaps() || detectXposedOrSubstrate();
    }

    private static boolean detectFridaServer() {
        // Frida default port
        try {
            java.net.Socket s = new java.net.Socket("127.0.0.1", 27042);
            s.close();
            Log.wtf(TAG, "Frida server detected on 27042");
            return true;
        } catch (Exception ignore) {
            return false;
        }
    }

    private static boolean detectFridaInMaps() {
        try (BufferedReader reader =
                     new BufferedReader(new FileReader("/proc/self/maps"))) {

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains("frida") || line.contains("LIBFRIDA")) {
                    Log.wtf(TAG, "Frida found in /proc/self/maps: " + line);
                    return true;
                }
            }
        } catch (Exception e) {
            // ignore
        }
        return false;
    }

    private static boolean detectXposedOrSubstrate() {
        try {
            ClassLoader cl = SecurityUtils.class.getClassLoader();
            cl.loadClass("de.robv.android.xposed.XposedBridge");
            Log.wtf(TAG, "XposedBridge class present");
            return true;
        } catch (ClassNotFoundException ignored) {
        }

        try {
            ClassLoader cl = SecurityUtils.class.getClassLoader();
            cl.loadClass("com.saurik.substrate.MS$2");
            Log.wtf(TAG, "Substrate class present");
            return true;
        } catch (ClassNotFoundException ignored) {
        }
        return false;
    }

    public static boolean detectSuspiciousPackages(Context context) {
        PackageManager pm = context.getPackageManager();
        List<ApplicationInfo> apps =
                pm.getInstalledApplications(PackageManager.GET_META_DATA);
        for (ApplicationInfo ai : apps) {
            if ("de.robv.android.xposed.installer".equals(ai.packageName) ||
                "com.saurik.substrate".equals(ai.packageName)) {
                Log.wtf(TAG, "Hooking framework installed: " + ai.packageName);
                return true;
            }
        }
        return false;
    }
}
