/**
 * Verifikasi loader dan urutan transisi halaman di browser sungguhan.
 *
 *   AUDIT_URL=https://contoh.com node scripts/verify-transitions.mjs
 *
 * Yang diperiksa:
 * - loader pembuka menutupi layar saat situs pertama kali dibuka, lalu terbuka
 * - urutan transisi antar halaman: menutup, konten berganti, balik ke atas, membuka
 * - konten benar-benar berganti saat tirai masih menutup, bukan sesudahnya
 * - halaman berakhir di posisi paling atas
 */

import { existsSync } from "node:fs";
import path from "node:path";

import puppeteer from "puppeteer-core";

const BASE = (process.env.AUDIT_URL ?? "http://localhost:4321").replace(/\/$/, "");
const BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-dev-shm-usage",
  ...(process.env.HOST_RESOLVER_RULES
    ? [`--host-resolver-rules=${process.env.HOST_RESOLVER_RULES}`]
    : []),
];
const chrome = [
  process.env.CHROME_PATH,
  path.join(process.env.LOCALAPPDATA ?? "", "Google/Chrome/Application/chrome.exe"),
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].find((candidate) => candidate && existsSync(candidate));

let failures = 0;
function check(label, ok, detail = "") {
  if (ok) console.log(`  OK    ${label}`);
  else {
    failures += 1;
    console.log(`  GAGAL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

const SAMPLE = `(() => {
  const curtain = document.querySelector('[data-phase]');
  if (!curtain) return null;
  const panels = curtain.querySelectorAll(':scope > div');
  const shift = (node) => {
    if (!node) return null;
    const matrix = new DOMMatrixReadOnly(getComputedStyle(node).transform);
    return Math.round(matrix.m42);
  };
  return {
    phase: curtain.dataset.phase,
    visible: getComputedStyle(curtain).visibility,
    top: shift(panels[0]),
    bottom: shift(panels[1]),
    path: location.pathname,
    scrollY: Math.round(window.scrollY),
    heading: document.querySelector('h1')?.textContent?.trim().slice(0, 40) ?? '',
  };
})()`;

async function main() {
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: "new",
    args: BROWSER_ARGS,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("\n=== Loader pembuka ===");
  await page.goto(`${BASE}/id`, { waitUntil: "domcontentloaded" });

  const intro = [];
  for (let i = 0; i < 40; i += 1) {
    const sample = await page.evaluate(SAMPLE).catch(() => null);
    if (sample) intro.push(sample);
    await new Promise((resolve) => setTimeout(resolve, 90));
  }

  const covered = intro.filter((s) => s.visible === "visible" && s.top === 0 && s.bottom === 0);
  check("layar tertutup penuh saat situs dibuka", covered.length > 0, `${covered.length} sampel`);
  check(
    "tirai membuka sendiri sampai hilang",
    intro.at(-1)?.visible === "hidden" && intro.at(-1)?.phase === "idle",
    `${intro.at(-1)?.phase} / ${intro.at(-1)?.visible}`,
  );
  const openingSeen = intro.some((s) => s.phase === "opening");
  check("ada tahap membuka, bukan langsung hilang", openingSeen);

  console.log("\n=== Transisi antar halaman ===");
  // Turun dulu supaya bisa dibuktikan halaman berikutnya mulai dari atas.
  await page.evaluate(() => window.scrollTo(0, 1200));
  await new Promise((resolve) => setTimeout(resolve, 700));
  const startScroll = await page.evaluate(() => Math.round(window.scrollY));
  check("halaman digulir turun sebelum pindah", startScroll > 400, `${startScroll}`);

  await page.evaluate(() => {
    const link = [...document.querySelectorAll("nav a")].find(
      (anchor) => (anchor.getAttribute("href") ?? "").endsWith("/galeri"),
    );
    link?.click();
  });

  const frames = [];
  for (let i = 0; i < 45; i += 1) {
    const sample = await page.evaluate(SAMPLE).catch(() => null);
    if (sample) frames.push(sample);
    await new Promise((resolve) => setTimeout(resolve, 70));
  }

  const phases = frames.map((f) => f.phase);
  const order = phases.filter((phase, index) => phase !== phases[index - 1]);
  check(
    "urutan tahapnya menutup lalu membuka lalu diam",
    order.includes("closing") && order.includes("opening") && order.at(-1) === "idle",
    order.join(" -> "),
  );

  const coveredFrames = frames.filter((f) => f.top === 0 && f.bottom === 0 && f.visible === "visible");
  check("layar benar-benar tertutup penuh di tengah transisi", coveredFrames.length > 0);

  const firstGallery = frames.findIndex((f) => f.path.endsWith("/galeri"));
  check("alamat halaman berganti", firstGallery >= 0);
  if (firstGallery >= 0) {
    const atSwap = frames[firstGallery];
    check(
      "konten berganti selagi tirai masih menutup",
      atSwap.top === 0 && atSwap.bottom === 0,
      `top=${atSwap.top} bottom=${atSwap.bottom}`,
    );
    const openedAt = frames.findIndex((f, index) => index > firstGallery && f.phase === "opening");
    check("tirai baru membuka setelah konten berganti", openedAt > firstGallery);
  }

  const last = frames.at(-1);
  check("halaman baru berhenti di posisi paling atas", last?.scrollY === 0, `${last?.scrollY}`);
  check("tirai kembali tersembunyi setelah selesai", last?.visible === "hidden", `${last?.visible}`);

  await page.close();
  await browser.close();

  console.log(
    failures === 0 ? "\nLoader dan transisi lolos semua.\n" : `\n${failures} pemeriksaan gagal.\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

await main();
