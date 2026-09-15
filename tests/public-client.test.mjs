import test from "node:test";
import assert from "node:assert/strict";
import { createPublicSupabaseClient } from "../lib/supabase/public-client.ts";

test("public cache reads use an anonymous client without a persisted session", async (t) => {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, init) => {
    requests.push({ url: String(url), headers: new Headers(init.headers) });
    return Response.json([]);
  });
  const client = createPublicSupabaseClient(
    "https://fixture.supabase.co",
    "public-test-key",
  );
  const {
    data: { session },
  } = await client.auth.getSession();
  assert.equal(session, null);
  assert.equal(requests.length, 0);
  const { error } = await client.from("animais").select("id");
  assert.equal(error, null);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].headers.get("apikey"), "public-test-key");
  assert.equal(
    requests[0].headers.get("authorization"),
    "Bearer public-test-key",
  );
  assert.equal(requests[0].headers.has("cookie"), false);
});
