"use client";

/**
 * Captures ad attribution once, on mount, and keeps it for the rest of the tab.
 *
 * A visitor lands on /?utm_campaign=wcag_scan_test, then navigates (or the URL
 * gets cleaned) before they actually run a scan — so the params are read on the
 * first render and mirrored into sessionStorage. Later mounts with no params in
 * the URL fall back to what the tab already knows.
 *
 * sessionStorage (not localStorage) on purpose: attribution belongs to THIS
 * visit. A user returning organically a week later must not be re-credited to
 * the ad campaign that brought them the first time.
 */

import { useSyncExternalStore } from "react";
import { ATTRIBUTION_KEYS, type Attribution } from "./attribution";

const STORAGE_KEY = "as_attribution";
const MAX_VALUE_LENGTH = 64;

function sanitize(raw: Record<string, unknown>): Attribution {
  const attribution: Attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = raw[key];
    if (typeof value !== "string") continue;
    const trimmed = value.trim().slice(0, MAX_VALUE_LENGTH);
    if (trimmed) attribution[key] = trimmed;
  }
  return attribution;
}

function readFromUrl(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const raw: Record<string, unknown> = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key);
    if (value !== null) raw[key] = value;
  }
  return sanitize(raw);
}

function readFromSession(): Attribution {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null) return {};
    return sanitize(parsed as Record<string, unknown>);
  } catch {
    // Private mode / storage disabled / corrupt JSON — attribution is optional.
    return {};
  }
}

function persist(attribution: Attribution): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Storage unavailable; the in-memory copy still covers this page view.
  }
}

/** Read the URL's UTM params (falling back to the tab's stored ones). */
export function captureAttribution(): Attribution {
  const fromUrl = readFromUrl();
  if (Object.keys(fromUrl).length > 0) {
    persist(fromUrl);
    return fromUrl;
  }
  return readFromSession();
}

// --- the store ------------------------------------------------------------
//
// Attribution is read once per tab and never changes afterwards, so it is an
// external read-only store rather than component state. Modelling it with
// useSyncExternalStore (instead of setState-in-an-effect) gives React a stable
// snapshot to compare, an explicit server snapshot, and no cascading render.

const EMPTY: Attribution = Object.freeze({});

let snapshot: Attribution | null = null;

function getSnapshot(): Attribution {
  // Cached so the reference stays stable across renders — a fresh object every
  // call would make React re-render forever.
  snapshot ??= captureAttribution();
  return snapshot;
}

/** Server render has no URL params and no sessionStorage. */
function getServerSnapshot(): Attribution {
  return EMPTY;
}

/** Nothing to subscribe to: the value is fixed once the page has loaded. */
function subscribe(): () => void {
  return () => {};
}

/**
 * Attribution for the current visit. Empty during SSR and hydration (the
 * browser's URL isn't readable there), resolved on the client immediately
 * after — long before any user can submit the form.
 */
export function useAttribution(): Attribution {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
