import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const directory = new URL("../public/media-kit/", import.meta.url);
mkdirSync(directory, { recursive: true });
const escape = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const text = (x, y, size, content, fill = "#fff") =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial, sans-serif" font-size="${size}" font-weight="700">${escape(content)}</text>`;
function save(name, w, h, body, title) {
  writeFileSync(
    new URL(name, directory),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title"><title id="title">${escape(title)}</title><rect width="${w}" height="${h}" fill="#214e43"/>${body}</svg>\n`,
  );
}
// Logo artwork comes from public/brand/; paths are [person, person, letters].
const logo = (name) => {
  const svg = readFileSync(new URL(`../brand/${name}`, directory), "utf8");
  const [x, y, w, h] = svg
    .match(/viewBox="([^"]+)"/)[1]
    .split(" ")
    .map(Number);
  return { x, y, w, h, paths: svg.match(/<path[^>]*\/>/g) };
};
const recolor = (path, fill) => path.replace(/fill="[^"]+"/, `fill="${fill}"`);
const place = ({ x, y, h }, left, top, height, body) =>
  `<g transform="translate(${left} ${top}) scale(${height / h}) translate(${-x} ${-y})">${body}</g>`;
const compact = logo("fya-logo-compacto.svg");
const symbol = logo("fya-simbolo.svg");
// Sits where the old "fya." text did: baseline y, font size `size`.
const wordmark = (x, y, size) =>
  place(
    compact,
    x,
    y - size * 0.95,
    size * 1.25,
    recolor(compact.paths[0], "#fff") +
      compact.paths[1] +
      recolor(compact.paths[2], "#fff"),
  );
save(
  "perfil.svg",
  1080,
  1080,
  `<circle cx="540" cy="540" r="400" fill="#edf1e8"/>` +
    place(
      symbol,
      540 - (520 * symbol.w) / symbol.h / 2,
      280,
      520,
      symbol.paths.join(""),
    ),
  "FYA — imagem de perfil",
);
save(
  "capa-facebook.svg",
  1640,
  624,
  wordmark(120, 195, 115) +
    text(120, 345, 62, "Mais tempo para os animais.") +
    text(120, 425, 38, "Registos, adoções e equipa num só lugar.") +
    text(120, 530, 26, "Find Your Animal · Piloto em preparação", "#d9e5da"),
  "FYA — capa Facebook",
);
save(
  "capa-youtube.svg",
  2560,
  1440,
  wordmark(530, 660, 100) +
    text(890, 635, 62, "Aprender a usar a FYA") +
    text(890, 720, 34, "Guias para canis e associações") +
    text(890, 780, 26, "Find Your Animal", "#d9e5da"),
  "FYA — capa YouTube, texto na área central",
);
// Default Open Graph / Twitter images (lib/seo/metadata.ts), one per locale.
for (const [name, lines, subtitle, title] of [
  [
    "og-pt.svg",
    ["Animais para adoção,", "direto dos canis."],
    "Candidatura, mensagens e visitas com canis e associações.",
    "FYA: animais para adoção de canis e associações",
  ],
  [
    "og-en.svg",
    ["Animals for adoption,", "straight from shelters."],
    "Applications, messages and visits with shelters and rescue groups.",
    "FYA: animals for adoption from shelters and rescue groups",
  ],
])
  save(
    name,
    1200,
    630,
    wordmark(80, 150, 80) +
      lines.map((line, i) => text(80, 320 + i * 86, 68, line)).join("") +
      text(80, 530, 28, subtitle, "#d9e5da"),
    title,
  );
const posts = [
  [
    "01-apresentacao.svg",
    ["Mais tempo", "para os animais."],
    "Conhece a FYA: registos, candidaturas e equipa.",
  ],
  [
    "02-registos.svg",
    ["Cada animal,", "um registo."],
    "Informação privada e documentos organizados.",
  ],
  [
    "03-candidaturas.svg",
    ["Cada pedido,", "um acompanhamento."],
    "Pesquisa, responsáveis e respostas modelo.",
  ],
  [
    "04-piloto.svg",
    ["O teu canil pode", "ajudar a construir", "o próximo passo."],
    "Conhece o piloto FYA e partilha as tuas necessidades.",
  ],
];
for (const [name, lines, subtitle] of posts)
  save(
    name,
    1080,
    1080,
    wordmark(80, 180, 90) +
      lines.map((line, i) => text(80, 390 + i * 105, 70, line)).join("") +
      text(80, 820, 27, subtitle) +
      text(80, 970, 24, "FYA · Piloto em preparação", "#d9e5da"),
    `FYA — ${lines.join(" ")}`,
  );
console.log("Created 9 editable SVG assets in public/media-kit.");
