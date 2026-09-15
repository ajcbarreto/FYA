type PageResult<T> =
  | { redirectPage: number; total: number; pages: number }
  | {
      redirectPage: null;
      total: number;
      pages: number;
      page: number;
      items: T[];
    };

/** Count and load concurrently; an invalid range must still redirect, not fail. */
export async function loadPaginatedData<T>({
  requestedPage,
  pageSize,
  count,
  load,
}: {
  requestedPage: string | undefined;
  pageSize: number;
  count: () => Promise<number>;
  load: (page: number) => Promise<T[]>;
}): Promise<PageResult<T>> {
  const parsed = Number.parseInt(requestedPage ?? "1", 10);
  const requested = Number.isSafeInteger(parsed) ? Math.max(1, parsed) : 1;
  const [countResult, itemsResult] = await Promise.allSettled([
    count(),
    load(requested),
  ]);
  if (countResult.status === "rejected") throw countResult.reason;
  const total = countResult.value;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requested, pages);
  if (page !== requested) return { redirectPage: page, total, pages };
  if (itemsResult.status === "rejected") throw itemsResult.reason;
  return { redirectPage: null, total, pages, page, items: itemsResult.value };
}
