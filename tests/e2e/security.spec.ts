import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { admin } from "./helpers";

async function testAccount(role: "user" | "canil") {
  const email = `security-${randomUUID()}@fya.test`;
  const password = "Fya-security-test-2026!";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role },
  });
  if (error || !data.user) throw error ?? new Error("Test user unavailable");
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error) throw login.error;
  return { id: data.user.id, client };
}

test("real API denies shelter RPC access to an administrator without MFA", async () => {
  const { id, client } = await testAccount("canil");
  try {
    const shelters = await client.rpc("my_shelters");
    expect(shelters.error).toBeNull();
    const shelter = shelters.data![0].id;
    const promoted = await admin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", id);
    expect(promoted.error).toBeNull();
    const hidden = await client.rpc("my_shelters");
    expect(hidden.error).toBeNull();
    expect(hidden.data).toEqual([]);
    const metrics = await client.rpc("shelter_metrics", { p_shelter: shelter });
    expect(metrics.error?.message).toContain("Access denied");
    const requests = await client.rpc("search_shelter_requests", {
      p_shelter: shelter,
    });
    expect(requests.error?.message).toContain("Forbidden");
  } finally {
    await admin.auth.admin.deleteUser(id);
  }
});

test("simultaneous individual inserts cannot exceed three active listings", async () => {
  const { id, client } = await testAccount("user");
  try {
    const shelter = await client.rpc("start_individual_listing", {
      p_location: "Porto",
      p_phone: "912345678",
    });
    expect(shelter.error).toBeNull();
    const listing = {
      canil_id: shelter.data!,
      nome: "Bobi",
      especie: "cao" as const,
      published: true,
    };
    const initial = await client.from("animais").insert([listing, listing]);
    expect(initial.error).toBeNull();
    const results = await Promise.all([
      client.from("animais").insert(listing),
      client.from("animais").insert(listing),
    ]);
    expect(results.filter((result) => !result.error)).toHaveLength(1);
    expect(results.find((result) => result.error)?.error?.message).toContain(
      "FYA_LISTING_LIMIT",
    );
    const count = await client
      .from("animais")
      .select("id", { count: "exact", head: true })
      .eq("canil_id", shelter.data!);
    expect(count.count).toBe(3);
  } finally {
    await admin.auth.admin.deleteUser(id);
  }
});

test("public responses include browser security headers", async ({
  request,
}) => {
  const response = await request.get("/pt");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(response.headers()["x-powered-by"]).toBeUndefined();
});
