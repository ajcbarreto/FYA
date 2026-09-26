"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { recordsContext } from "@/lib/records/context";
import { validId } from "@/lib/records/validation";
import {
  parseSupportQuantity,
  externalDonationUrl,
} from "@/lib/support/format";
function end(locale: string, id: string, ok: boolean, team = true) {
  revalidatePath(`/${locale}/canil/apoios`, "layout");
  revalidatePath(`/${locale}/apoios/${id}`);
  revalidatePath(`/${locale}/conta/apoios`);
  redirect(
    `/${locale}/${team ? "canil/apoios" : "apoios"}/${id}?${ok ? "success=saved" : "error=failed"}`,
  );
}
export async function saveSupportProject(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt")),
    id = String(form.get("projectId") ?? "");
  if (!c.shelter || (id && !validId(id)))
    redirect(`/${c.locale}/canil/apoios?error=failed`);
  const existing = id
    ? (
        await c.supabase
          .from("support_projects")
          .select("kind,unit,canil_id,animal_id")
          .eq("id", id)
          .maybeSingle()
      ).data
    : null;
  if (id && (!existing || !c.shelters.some((s) => s.id === existing.canil_id)))
    redirect(`/${c.locale}/canil/apoios?error=failed`);
  const kind = existing?.kind ?? String(form.get("kind") ?? ""),
    title = String(form.get("title") ?? "").trim(),
    description = String(form.get("description") ?? "").trim(),
    goal = parseSupportQuantity(String(form.get("goal") ?? ""), kind),
    unit =
      existing?.unit ??
      (kind === "money" ? "EUR" : String(form.get("unit") ?? "").trim()),
    animal = existing?.animal_id ?? String(form.get("animalId") ?? ""),
    deadline = String(form.get("deadline") ?? "");
  let url: string | null;
  try {
    url = externalDonationUrl(String(form.get("donation_url") ?? ""));
  } catch {
    redirect(`/${c.locale}/canil/apoios?error=failed`);
  }
  if (
    !["money", "goods"].includes(kind) ||
    title.length < 3 ||
    title.length > 160 ||
    description.length < 10 ||
    description.length > 4000 ||
    !goal ||
    unit.length < 1 ||
    unit.length > 40 ||
    (animal && !validId(animal)) ||
    (deadline &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(deadline) ||
        Number.isNaN(Date.parse(deadline))))
  )
    redirect(`/${c.locale}/canil/apoios?error=failed`);
  const values = {
    title,
    description,
    goal,
    donation_url: url,
    deadline: deadline || null,
    published: form.get("published") === "on",
    status: form.get("status") === "closed" ? "closed" : "active",
  };
  const result = id
    ? await c.supabase
        .from("support_projects")
        .update(values)
        .eq("id", id)
        .eq("canil_id", existing!.canil_id)
        .select("id")
    : await c.supabase
        .from("support_projects")
        .insert({
          ...values,
          canil_id: c.shelter!.id,
          kind,
          unit,
          animal_id: animal || null,
        })
        .select("id");
  if (result.error || !result.data?.length)
    redirect(`/${c.locale}/canil/apoios?error=failed`);
  end(c.locale, result.data![0].id, true);
}
export async function publishSupportUpdate(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt")),
    id = String(form.get("projectId") ?? ""),
    body = String(form.get("body") ?? "").trim();
  if (!validId(id) || body.length < 3 || body.length > 2000)
    redirect(`/${c.locale}/canil/apoios?error=failed`);
  const { error } = await c.supabase
    .from("support_updates")
    .insert({ project_id: id, body });
  end(c.locale, id, !error);
}
export async function recordSupport(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt")),
    id = String(form.get("projectId") ?? ""),
    receipt = String(form.get("receiptId") ?? ""),
    pledge = String(form.get("pledgeId") ?? ""),
    note = String(form.get("note") ?? "").trim();
  if (
    !validId(id) ||
    !validId(receipt) ||
    (pledge && !validId(pledge)) ||
    note.length > 1000
  )
    redirect(`/${c.locale}/canil/apoios?error=failed`);
  const { data: p } = await c.supabase
    .from("support_projects")
    .select("kind")
    .eq("id", id)
    .single();
  const quantity = parseSupportQuantity(
    String(form.get("quantity") ?? ""),
    p?.kind ?? "goods",
  );
  if (!quantity) end(c.locale, id, false);
  const { error } = await c.supabase.rpc("record_support_receipt", {
    p_id: receipt,
    p_project: id,
    p_quantity: quantity!,
    p_note: note,
    p_pledge: pledge || undefined,
  });
  end(c.locale, id, !error);
}
export async function voidSupport(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt")),
    id = String(form.get("projectId") ?? ""),
    receipt = String(form.get("receiptId") ?? ""),
    reason = String(form.get("reason") ?? "").trim();
  if (
    !validId(id) ||
    !validId(receipt) ||
    reason.length < 3 ||
    reason.length > 1000
  )
    redirect(`/${c.locale}/canil/apoios?error=failed`);
  const { data: r } = await c.supabase
    .from("support_receipts")
    .select("project_id")
    .eq("id", receipt)
    .single();
  if (r?.project_id !== id) end(c.locale, id, false);
  const { error } = await c.supabase.rpc("void_support_receipt", {
    p_id: receipt,
    p_reason: reason,
  });
  end(c.locale, id, !error);
}
export async function pledgeSupport(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt")),
    id = String(form.get("projectId") ?? ""),
    pledge = String(form.get("pledgeId") ?? ""),
    quantity = parseSupportQuantity(
      String(form.get("quantity") ?? ""),
      "goods",
    ),
    message = String(form.get("message") ?? "").trim();
  if (
    !validId(id) ||
    !validId(pledge) ||
    !quantity ||
    quantity > 1000000 ||
    message.length > 1000 ||
    form.get("contact_consent") !== "on"
  )
    redirect(`/${c.locale}/conta/apoios?error=failed`);
  const { error } = await c.supabase.rpc("pledge_support", {
    p_id: pledge,
    p_project: id,
    p_quantity: quantity!,
    p_message: message,
  });
  end(c.locale, id, !error, false);
}
export async function cancelPledge(form: FormData) {
  const c = await recordsContext(String(form.get("locale") ?? "pt")),
    id = String(form.get("pledgeId") ?? "");
  if (!validId(id)) redirect(`/${c.locale}/conta/apoios?error=failed`);
  const { error } = await c.supabase.rpc("cancel_support_pledge", { p_id: id });
  revalidatePath(`/${c.locale}/conta/apoios`);
  revalidatePath(`/${c.locale}/canil/apoios`, "layout");
  redirect(
    `/${c.locale}/conta/apoios?${error ? "error=failed" : "success=saved"}`,
  );
}
