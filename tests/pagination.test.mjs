import test from "node:test";
import assert from "node:assert/strict";
import { loadPaginatedData } from "../lib/pagination.ts";

test("page data starts loading before the count completes", async () => {
  const count = Promise.withResolvers();
  const rows = Promise.withResolvers();
  let requested;
  const result = loadPaginatedData({
    requestedPage: "2",
    pageSize: 16,
    count: () => count.promise,
    load: (page) => {
      requested = page;
      return rows.promise;
    },
  });
  assert.equal(requested, 2);
  rows.resolve([{ id: "pet" }]);
  count.resolve(33);
  assert.deepEqual(await result, {
    redirectPage: null,
    total: 33,
    pages: 3,
    page: 2,
    items: [{ id: "pet" }],
  });
});

test("out-of-range database errors retain the canonical page redirect", async () => {
  const result = await loadPaginatedData({
    requestedPage: "999",
    pageSize: 16,
    count: async () => 17,
    load: async () => {
      throw new Error("Requested range not satisfiable");
    },
  });
  assert.deepEqual(result, { redirectPage: 2, total: 17, pages: 2 });
});

test("valid pages propagate database failures instead of looking empty", async () => {
  const failure = new Error("Database unavailable");
  await assert.rejects(
    loadPaginatedData({
      requestedPage: "1",
      pageSize: 25,
      count: async () => 10,
      load: async () => {
        throw failure;
      },
    }),
    (error) => error === failure,
  );
  await assert.rejects(
    loadPaginatedData({
      requestedPage: "1",
      pageSize: 25,
      count: async () => {
        throw failure;
      },
      load: async () => [],
    }),
    (error) => error === failure,
  );
});

test("empty results and malformed page numbers resolve to page one", async () => {
  for (const requestedPage of [
    undefined,
    "invalid",
    "-1",
    "0",
    "9".repeat(400),
  ]) {
    const result = await loadPaginatedData({
      requestedPage,
      pageSize: 25,
      count: async () => 0,
      load: async (page) => {
        assert.equal(page, 1);
        return [];
      },
    });
    assert.equal(result.redirectPage, null);
    assert.equal(result.page, 1);
    assert.deepEqual(result.items, []);
  }
});
