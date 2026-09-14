import test from "node:test";
import assert from "node:assert/strict";
import { isDashboardLinkActive } from "../lib/dashboard-navigation.ts";

test("only the current dashboard section is active, including detail pages", () => {
  for (const locale of ["pt", "en"]) {
    for (const section of ["user", "canil", "admin"]) {
      const root = `/${locale}/${section}`;
      assert.equal(isDashboardLinkActive(root, root, root), true);
      assert.equal(isDashboardLinkActive(`${root}/`, root, root), true);
      assert.equal(isDashboardLinkActive(`${root}/pedidos`, root, root), false);
      assert.equal(
        isDashboardLinkActive(`${root}/pedidos/123`, `${root}/pedidos`, root),
        true,
      );
      assert.equal(
        isDashboardLinkActive(
          `${root}/pedidos-antigos`,
          `${root}/pedidos`,
          root,
        ),
        false,
      );
    }
  }
});
