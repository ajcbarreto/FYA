import { getAuthUser } from "@/lib/supabase/get-user";
import { validId } from "@/lib/records/validation";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  const { supabase, user } = await getAuthUser();
  if (!user || !supabase)
    return new Response("Authentication required", { status: 401 });
  if (!validId(documentId)) return new Response("Not found", { status: 404 });
  const { data: d, error } = await supabase
    .from("animal_documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();
  if (error || !d) return new Response("Not found", { status: 404 });
  const { data: file, error: downloadError } = await supabase.storage
    .from("animal-documents")
    .download(d.storage_path);
  if (downloadError || !file)
    return new Response("Document unavailable", { status: 404 });
  const extension =
    d.mime_type === "application/pdf"
      ? "pdf"
      : d.mime_type === "image/png"
        ? "png"
        : "jpg";
  return new Response(file, {
    headers: {
      "Content-Type": d.mime_type,
      "Content-Disposition": `attachment; filename="document.${extension}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}
