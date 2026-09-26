import { readFileSync } from "node:fs";
import { join } from "node:path";

// Existing original-operator routes are disabled, including old aliases.
export const ORIGINAL_RELAY_URLS = new Set([
  "https://heeler-apns.bybee.dev",
  "https://herdr-push-relay.69709991236.workers.dev",
  "https://herdr-apns.bybee.dev",
]);
const DEFAULT_DEBOUNCE_MS = 5000;
const DEFAULT_ACTIVITY_DEBOUNCE_MS = 1500;
const DEFAULT_RETRY_DELAY_MS = 1000;

function normalizeRelayURL(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\/+$/, "");
  if (!normalized) return null;
  let url;
  try { url = new URL(normalized); } catch { return null; }
  if (!["http:", "https:"].includes(url.protocol) || !url.hostname ||
      url.username || url.password || url.search || url.hash ||
      ORIGINAL_RELAY_URLS.has(`${url.protocol}//${url.hostname.toLowerCase()}`)) return null;
  return normalized;
}

/**
 * Read plugin configuration. Missing, malformed, and original routes disable
 * delivery while retaining registrations for deliberate migration.
 */
export function readNotificationConfig(configDir) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(join(configDir, "notify.json"), "utf8"));
  } catch {
    parsed = {};
  }
  const positiveInt = (value, fallback) =>
    Number.isInteger(value) && value >= 0 ? value : fallback;
  return {
    relayUrl: normalizeRelayURL(parsed.relay_url),
    debounceMs: positiveInt(parsed.debounce_ms, DEFAULT_DEBOUNCE_MS),
    activityDebounceMs: positiveInt(parsed.activity_debounce_ms, DEFAULT_ACTIVITY_DEBOUNCE_MS),
    retryDelayMs: positiveInt(parsed.retry_delay_ms, DEFAULT_RETRY_DELAY_MS),
  };
}
