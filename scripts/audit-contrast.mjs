/**
 * Audit kontras WCAG untuk seluruh pasangan warna yang benar-benar dipakai.
 *
 *   npm run audit:contrast
 *
 * Wajib dijalankan ulang setiap kali warna aksen di src/config/client.ts
 * diganti untuk klien berikutnya. Keluar dengan kode 1 kalau ada pasangan
 * yang di bawah ambang.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { contrastRatio, oklchToRgb, relativeLuminance } from "../src/lib/color.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Ambil nilai aksen langsung dari file config klien supaya tidak pernah basi. */
function readAccent() {
  const source = readFileSync(join(ROOT, "src", "config", "client.ts"), "utf8");
  // Mulai dari deklarasi CLIENT, bukan dari definisi tipenya di atas.
  const declaration = source.slice(source.indexOf("export const CLIENT"));
  const block = declaration.slice(
    declaration.indexOf("accent: {"),
    declaration.indexOf("contact: {"),
  );
  const grab = (key) => {
    const match = block.match(new RegExp(`${key}:\\s*"(oklch\\([^"]+\\))"`));
    if (!match) throw new Error(`warna aksen "${key}" tidak ditemukan di src/config/client.ts`);
    return match[1];
  };
  return { base: grab("base"), strong: grab("strong"), on: grab("on") };
}

const accent = readAccent();

const TOKENS = {
  paper: "oklch(0.976 0.006 78)",
  "paper-2": "oklch(0.946 0.008 78)",
  "paper-3": "oklch(0.912 0.009 78)",
  line: "oklch(0.862 0.009 78)",
  "line-strong": "oklch(0.646 0.011 78)",
  ink: "oklch(0.216 0.013 62)",
  "ink-2": "oklch(0.432 0.012 62)",
  "ink-3": "oklch(0.503 0.012 62)",
  accent: accent.base,
  "accent-strong": accent.strong,
  "on-accent": accent.on,
};

/** Campur warna depan beropasitas di atas warna belakang, hasilnya sRGB. */
function over(fg, bg, alpha) {
  const f = oklchToRgb(TOKENS[fg]);
  const b = oklchToRgb(TOKENS[bg]);
  return {
    r: Math.round(f.r * alpha + b.r * (1 - alpha)),
    g: Math.round(f.g * alpha + b.g * (1 - alpha)),
    b: Math.round(f.b * alpha + b.b * (1 - alpha)),
  };
}

/* Pasangan yang benar-benar dipakai di situs. Ambang 4.5 untuk semua teks,
   3.0 untuk pembatas dan elemen non teks. */
const PAIRS = [
  ["teks utama di kertas", TOKENS.ink, TOKENS.paper, 4.5],
  ["teks utama di kertas 2", TOKENS.ink, TOKENS["paper-2"], 4.5],
  ["teks utama di kertas 3", TOKENS.ink, TOKENS["paper-3"], 4.5],
  ["teks sekunder di kertas", TOKENS["ink-2"], TOKENS.paper, 4.5],
  ["teks sekunder di kertas 2", TOKENS["ink-2"], TOKENS["paper-2"], 4.5],
  ["teks meta di kertas", TOKENS["ink-3"], TOKENS.paper, 4.5],
  ["teks meta di kertas 2", TOKENS["ink-3"], TOKENS["paper-2"], 4.5],
  ["teks meta di kertas 3", TOKENS["ink-3"], TOKENS["paper-3"], 4.5],
  ["teks di atas aksen", TOKENS["on-accent"], TOKENS.accent, 4.5],
  ["teks di atas aksen kuat", TOKENS["on-accent"], TOKENS["accent-strong"], 4.5],
  ["teks aksen di kertas", TOKENS["accent-strong"], TOKENS.paper, 4.5],
  ["teks aksen di kertas 2", TOKENS["accent-strong"], TOKENS["paper-2"], 4.5],
  ["kertas di atas tinta (lightbox)", TOKENS.paper, TOKENS.ink, 4.5],
  ["garis pembatas di kertas", TOKENS["line-strong"], TOKENS.paper, 3],
  ["garis halus di kertas", TOKENS.line, TOKENS.paper, 1.3],
];

/* Pasangan yang memakai opasitas, dihitung setelah dicampur. */
const ALPHA_PAIRS = [
  ["teks counter lightbox", over("paper", "ink", 0.7), oklchToRgb(TOKENS.ink), 4.5],
  ["caption lightbox", over("paper", "ink", 0.75), oklchToRgb(TOKENS.ink), 4.5],
  ["teks loader sekunder", over("paper", "ink", 0.6), oklchToRgb(TOKENS.ink), 4.5],
];

let failed = 0;
const rows = [];

for (const [label, fg, bg, min] of PAIRS) {
  const ratio = contrastRatio(fg, bg);
  const pass = ratio >= min;
  if (!pass) failed += 1;
  rows.push({ label, ratio, min, pass });
}

for (const [label, fg, bg, min] of ALPHA_PAIRS) {
  const ratio =
    (Math.max(relativeLuminance(fg), relativeLuminance(bg)) + 0.05) /
    (Math.min(relativeLuminance(fg), relativeLuminance(bg)) + 0.05);
  const pass = ratio >= min;
  if (!pass) failed += 1;
  rows.push({ label, ratio, min, pass });
}

const width = Math.max(...rows.map((row) => row.label.length));
for (const row of rows) {
  const mark = row.pass ? "OK  " : "GAGAL";
  console.log(
    `${mark} ${row.label.padEnd(width)}  ${row.ratio.toFixed(2)}:1  (minimal ${row.min}:1)`,
  );
}

console.log(
  failed === 0
    ? `\nSemua ${rows.length} pasangan warna lolos ambangnya.`
    : `\n${failed} dari ${rows.length} pasangan warna belum lolos.`,
);

process.exit(failed === 0 ? 0 : 1);
