package com.beyti.app.security;

import android.view.View;
import android.view.ViewGroup;

public final class TapShield {
  private TapShield() {}
  /** Recursively set filterTouchesWhenObscured on interactive views. */
  public static void protectTree(View v) {
    if (v == null) return;
    if (v.isClickable() || v.isLongClickable() || v.isFocusable() || v.isFocusableInTouchMode()) {
      try { v.setFilterTouchesWhenObscured(true); } catch (Throwable ignored) {}
    }
    if (v instanceof ViewGroup) {
      ViewGroup g = (ViewGroup) v;
      for (int i = 0; i < g.getChildCount(); i++) protectTree(g.getChildAt(i));
    }
  }
}
