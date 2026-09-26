"use server";
import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { recordsContext } from "@/lib/records/context";
import {
  DOCUMENT_LIMIT,
  documentMime,
  shortText,
  validId,
} from "@/lib/records/validation";
import { deliverEmailOutbox } from "@/lib/email/outbox";
import { revalidatePublicCatalog } from "@/lib/pet-catalog/revalidate";

async function context(form: FormData) {
  return recordsContext(
    String(form.get("locale") ?? "pt"),
    String(form.get("animalId") ?? ""),
  );
}
function done(locale: string, animal: string, ok: boolean) {
  const path = `/${locale}/canil/animais/${animal}/registos`;
  revalidatePath(path);
  redirect(`${path}?${ok ? "success=saved" : "error=failed"}`);
}
export async function saveRecord(form: FormData) {
  const c = await context(form);
  const animal = c.animal!;
  const date = (key: string) => {
    const value = shortText(form, key, 10);
    if (
      value &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)))
    )
      throw new Error("Invalid date");
    return value || null;
  };
  const { error } = await c.supabase
    .from("animal_records")
    .upsert({
      animal_id: animal.id,
      internal_ref: shortText(form, "internal_ref", 100),
      microchip: shortText(form, "microchip", 30),
      intake_date: date("intake_date"),
      birth_date: date("birth_date"),
      origin: shortText(form, "origin", 500),
      location: shortText(form, "location", 200),
      health_notes: shortText(form, "health_notes", 6000),
      behaviour_notes: shortText(form, "behaviour_notes", 6000),
      internal_notes: shortText(form, "internal_notes", 6000),
      handover_notes: shortText(form, "handover_notes", 6000),
      updated_at: new Date().toISOString(),
    });
  done(c.locale, animal.id, !error);
}
export async function uploadDocument(form: FormData) {
  const c = await context(form);
  const animal = c.animal!;
  const file = form.get("document");
  const title = shortText(form, "title", 160);
  const category = shortText(form, "category", 30);
  if (
    !(file instanceof File) ||
    !file.size ||
    file.size > DOCUMENT_LIMIT ||
    !title ||
    !["health", "identification", "adoption", "other"].includes(category)
  )
    done(c.locale, animal.id, false);
  const bytes = new Uint8Array(await (file as File).arrayBuffer());
  const mime = documentMime(bytes);
  if (!mime) done(c.locale, animal.id, false);
  const id = randomUUID(),
    path = `${animal.id}/${id}`;
  const { error: metadataError } = await c.supabase
    .from("animal_documents")
    .insert({
      id,
      animal_id: animal.id,
      title,
      category,
      storage_path: path,
      mime_type: mime!,
      size_bytes: bytes.length,
      shareable: form.get("shareable") === "on",
    });
  if (metadataError) done(c.locale, animal.id, false);
  const { error } = await c.supabase.storage
    .from("animal-documents")
    .upload(path, bytes, { contentType: mime!, upsert: false });
  if (error) await c.supabase.from("animal_documents").delete().eq("id", id);
  done(c.locale, animal.id, !error);
}
export async function removeDocument(form: FormData) {
  const c = await context(form);
  const animal = c.animal!;
  const id = String(form.get("documentId") ?? "");
  if (!validId(id)) done(c.locale, animal.id, false);
  const { data } = await c.supabase
    .from("animal_documents")
    .select("storage_path")
    .eq("id", id)
    .eq("animal_id", animal.id)
    .maybeSingle();
  if (!data) done(c.locale, animal.id, false);
  const { error: storageError } = await c.supabase.storage
    .from("animal-documents")
    .remove([data!.storage_path]);
  if (storageError) done(c.locale, animal.id, false);
  const { error } = await c.supabase
    .from("animal_documents")
    .delete()
    .eq("id", id)
    .select("id");
  done(c.locale, animal.id, !error);
}
export async function shareDocuments(form: FormData) {
  const c = await context(form);
  const animal = c.animal!;
  // No email is silently reported as sent when delivery is not configured.
  if (
    !process.env.RESEND_API_KEY ||
    !process.env.EMAIL_FROM ||
    !process.env.NEXT_PUBLIC_APP_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  )
    done(c.locale, animal.id, false);
  const request = String(form.get("requestId") ?? ""),
    id = String(form.get("shareId") ?? "");
  const documents = form.getAll("documents").map(String),
    days = Number(form.get("days"));
  if (
    !validId(request) ||
    !validId(id) ||
    !documents.length ||
    documents.some((x) => !validId(x)) ||
    !Number.isInteger(days)
  )
    done(c.locale, animal.id, false);
  const { data: r } = await c.supabase
    .from("pedidos_adocao")
    .select("animal_id")
    .eq("id", request)
    .maybeSingle();
  if (r?.animal_id !== animal.id) done(c.locale, animal.id, false);
  const { error } = await c.supabase.rpc("share_animal_documents", {
    p_id: id,
    p_request: request,
    p_documents: documents,
    p_days: days,
  });
  if (!error)
    after(async () => {
      await deliverEmailOutbox();
    });
  done(c.locale, animal.id, !error);
}
export async function revokeShare(form: FormData) {
  const c = await context(form);
  const id = String(form.get("shareId") ?? "");
  if (!validId(id)) done(c.locale, c.animal!.id, false);
  const { error } = await c.supabase.rpc("revoke_document_share", { p_id: id });
  done(c.locale, c.animal!.id, !error);
}
export async function manageAnimal(form: FormData) {
  const c = await context(form);
  const { error } = await c.supabase.rpc("manage_animal", {
    p_animal: c.animal!.id,
    p_operation: String(form.get("operation") ?? ""),
  });
  revalidatePublicCatalog();
  revalidatePath(`/${c.locale}/canil/animais`);
  done(c.locale, c.animal!.id, !error);
}
