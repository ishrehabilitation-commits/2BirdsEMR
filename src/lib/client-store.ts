"use client";

// Tiny per-browser preferences (theme, pinned reports). Personalization lives
// here for the demo; with Supabase connected it can move to user_preferences.

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the preference just won't persist.
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

const PINS_KEY = "2birds:pinned-reports";
const EMPTY = "[]";

export function usePinnedReports() {
  const raw = useSyncExternalStore(subscribe, () => read(PINS_KEY) ?? EMPTY, () => EMPTY);
  const pins: string[] = JSON.parse(raw);
  const toggle = useCallback(
    (slug: string) => {
      const next = pins.includes(slug) ? pins.filter((s) => s !== slug) : [...pins, slug];
      write(PINS_KEY, JSON.stringify(next));
    },
    [pins],
  );
  return { pins, toggle, isPinned: (slug: string) => pins.includes(slug) };
}

export function toggleTheme() {
  const dark = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", dark);
  write("2birds:theme", dark ? "dark" : "light");
}

export const openPalette = () => window.dispatchEvent(new Event("2birds:open-palette"));
export const openFeedback = () => window.dispatchEvent(new Event("2birds:open-feedback"));
