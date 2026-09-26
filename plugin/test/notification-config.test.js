import { afterEach, suite, test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  ORIGINAL_RELAY_URLS,
  readNotificationConfig,
} from "../src/notification-config.js";

let configDir;

afterEach(() => {
  if (configDir) rmSync(configDir, { recursive: true, force: true });
  configDir = undefined;
});

function writeConfig(config) {
  configDir = mkdtempSync(join(tmpdir(), "notification-config-"));
  mkdirSync(configDir, { recursive: true });
  writeFileSync(join(configDir, "notify.json"), JSON.stringify(config));
}

suite("notification config", () => {
  test("disables delivery when notify.json is absent", () => {
    configDir = mkdtempSync(join(tmpdir(), "notification-config-"));

    assert.equal(readNotificationConfig(configDir).relayUrl, null);
  });

  test("preserves an explicit custom relay and normalizes trailing slashes", () => {
    writeConfig({ relay_url: " https://relay.example.com/// " });

    assert.equal(readNotificationConfig(configDir).relayUrl, "https://relay.example.com");
  });

  for (const original of ORIGINAL_RELAY_URLS) {
    test(`disables original operator endpoint ${original}`, () => {
      writeConfig({ relay_url: `${original}/` });

      assert.equal(readNotificationConfig(configDir).relayUrl, null);
    });

    test(`disables original operator host over http ${original}`, () => {
      writeConfig({ relay_url: original.toUpperCase().replace("HTTPS://", "http://") + ":8443" });

      assert.equal(readNotificationConfig(configDir).relayUrl, null);
    });
  }

  for (const value of ["", "relay.example.com", "ftp://relay.example.com", "https://relay.example.com?x=1"]) {
    test(`disables invalid relay ${JSON.stringify(value)}`, () => {
      writeConfig({ relay_url: value });
      assert.equal(readNotificationConfig(configDir).relayUrl, null);
    });
  }

  test("uses the documented debounce and retry defaults", () => {
    configDir = mkdtempSync(join(tmpdir(), "notification-config-"));

    assert.deepEqual(readNotificationConfig(configDir), {
      relayUrl: null,
      debounceMs: 5000,
      activityDebounceMs: 1500,
      retryDelayMs: 1000,
    });
  });

  test("preserves an explicit activity debounce override", () => {
    writeConfig({ activity_debounce_ms: 250 });

    assert.equal(readNotificationConfig(configDir).activityDebounceMs, 250);
  });
});
