import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
/** Supabase-owned auth/storage primitives are represented locally; application SQL is unchanged.
 * Sessions default to aal2; set request.jwt.claim.aal to 'aal1' to simulate a password-only session. */
export async function createTestDatabase() {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create schema storage;
      create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create function auth.jwt() returns jsonb language sql stable as $$ select jsonb_build_object('sub',current_setting('request.jwt.claim.sub',true),'aal',coalesce(nullif(current_setting('request.jwt.claim.aal',true),''),'aal2')) $$;
      grant usage on schema auth to authenticated,anon; grant execute on function auth.uid(), auth.jwt() to authenticated,anon;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid,bucket_id text,owner uuid,name text);
      alter table storage.objects enable row level security;`);
    const directory = new URL("../supabase/migrations/", import.meta.url);
    for (const file of (await readdir(directory))
      .filter((f) => f.endsWith(".sql"))
      .sort())
      await db.exec(await readFile(new URL(file, directory), "utf8"));
    return db;
  } catch (error) {
    await db.close();
    throw error;
  }
}
