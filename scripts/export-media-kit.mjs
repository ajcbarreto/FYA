import { chromium } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const directory = new URL("../public/media-kit/", import.meta.url);
const browser = await chromium.launch();
try {
  for (const name of (await readdir(directory)).filter((f) =>
    f.endsWith(".svg"),
  )) {
    const svg = await readFile(new URL(name, directory), "utf8");
    const width = Number(svg.match(/width="(\d+)"/)[1]),
      height = Number(svg.match(/height="(\d+)"/)[1]);
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<style>body{margin:0}svg{display:block}</style>${svg}`,
    );
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.locator("svg text").evaluateAll((nodes) =>
      nodes.some((n) => {
        const b = n.getBBox(),
          s = n.ownerSVGElement.viewBox.baseVal;
        return (
          b.x < 0 ||
          b.y < 0 ||
          b.x + b.width > s.width ||
          b.y + b.height > s.height
        );
      }),
    );
    if (overflow) throw new Error(`Text exceeds canvas in ${name}`);
    await page.screenshot({
      path: fileURLToPath(new URL(name.replace(".svg", ".png"), directory)),
    });
    await page.close();
  }
} finally {
  await browser.close();
}
console.log("Exported 7 PNG assets; all text fits within its canvas.");
