import { updateTag } from "next/cache";

/** Call after successful public-data mutations, before redirecting. */
export function revalidatePublicCatalog() {
  updateTag("public-catalog");
}
