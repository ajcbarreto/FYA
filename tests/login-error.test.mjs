import { test } from "node:test";
import assert from "node:assert/strict";
import { loginErrorMessage } from "../lib/auth/login-error.ts";

test("confirmation, credentials, throttling and service failures have distinct guidance", () => {
  for (const locale of ["pt", "en"]) {
    const messages = ["email_not_confirmed", "invalid_credentials", "over_request_rate_limit", undefined]
      .map((code) => loginErrorMessage(code, locale));
    assert.equal(new Set(messages).size, 4);
  }
  assert.match(loginErrorMessage("email_not_confirmed", "pt"), /Confirma o teu email/);
  assert.match(loginErrorMessage("invalid_credentials", "pt"), /Recuperar/);
  assert.equal(loginErrorMessage("unexpected_error", "pt"), loginErrorMessage(undefined, "pt"));
});
