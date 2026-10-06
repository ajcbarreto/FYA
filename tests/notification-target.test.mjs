import test from "node:test";
import assert from "node:assert/strict";
import { notificationTarget } from "../lib/notifications/target.ts";
test("notification destinations remain local and preserve the current language", () => {
  assert.equal(notificationTarget("/user/pedidos", "pt"), "/pt/user/pedidos");
  assert.equal(
    notificationTarget("/pt/user/pedidos?id=123", "en"),
    "/en/user/pedidos?id=123",
  );
  for (const unsafe of [
    null,
    "https://example.org",
    "//example.org",
    "/\\example.org",
    "/%2fexample.org",
    "/user/../auth",
    "/%2e%2e/auth",
    "/%zz",
  ])
    assert.equal(notificationTarget(unsafe, "pt"), "/pt/notificacoes");
});
