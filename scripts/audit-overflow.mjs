/**
 * Audit otomatis di tiga lebar layar: 375, 768, dan 1440.
 *
 *   npm run audit:overflow                 (menguji http://localhost:3000)
 *   AUDIT_URL=https://contoh.com npm run audit:overflow
 *
 * Yang diperiksa untuk setiap rute di kedua bahasa:
 * - status HTTP harus 200
 * - tidak ada elemen yang melebar keluar layar ke samping
 * - tidak ada gambar yang gagal dimuat
 * - tidak ada permintaan jaringan yang gagal
 * - jumlah baris heading: maksimal 3 di mobile, 2 di tablet, 2 di desktop,
 *   dan tidak pernah 4 di lebar mana pun
 *
 * Butuh Google Chrome terpasang. Set CHROME_PATH kalau lokasinya tidak biasa.
 */

import { existsSync } from "node:fs";
import path from "node:path";

import puppeteer from "puppeteer-core";

const BASE = (process.env.AUDIT_URL ?? "http://localhost:3000").replace(/\/$/, "");

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  path.join(process.env.LOCALAPPDATA ?? "", "Google/Chrome/Application/chrome.exe"),
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812, maxHeadingLines: 3 },
  { name: "tablet", width: 768, height: 1024, maxHeadingLines: 2 },
  { name: "desktop", width: 1440, height: 900, maxHeadingLines: 2 },
];

const PATHS = [
  "",
  "/galeri",
  "/galeri/resepsi-rustic-gedung",
  "/galeri/resepsi-tradisional-bali-pura",
  "/paket",
  "/kontak",
  "/privacy",
  "/terms",
];

function chromePath() {
  for (const candidate of CHROME_CANDIDATES) {
    if (candidate && existsSync(candidate)) return candidate;
  }
  throw new Error(
    "Google Chrome tidak ditemukan. Set CHROME_PATH ke lokasi chrome.exe lalu jalankan ulang.",
  );
}

const AUDIT_IN_PAGE = `(() => {
  const docWidth = document.documentElement.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll("body *")) {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    if (rect.right > docWidth + 1 || rect.left < -1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute("class") || "").slice(0, 90),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
      });
    }
  }

  const brokenImages = [];
  for (const img of document.images) {
    // Gambar lazy yang belum sempat dimuat bukan gambar rusak.
    if (img.complete && img.naturalWidth === 0) {
      brokenImages.push(img.getAttribute("src") || "(tanpa src)");
    }
  }

  // Jumlah baris dihitung dari posisi kotak teks yang sebenarnya, bukan dari
  // tinggi elemen, karena item grid ikut meregang mengikuti tinggi barisnya
  // dan akan terbaca sebagai banyak baris padahal teksnya hanya satu baris.
  function countLines(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const tops = [];
    for (const rect of range.getClientRects()) {
      if (rect.width === 0 && rect.height === 0) continue;
      if (!tops.some((top) => Math.abs(top - rect.top) < 6)) tops.push(rect.top);
    }
    return Math.max(1, tops.length);
  }

  const headings = [];
  for (const heading of document.querySelectorAll("h1, h2, h3")) {
    const style = getComputedStyle(heading);
    if (style.display === "none" || style.visibility === "hidden") continue;
    if (!(heading.textContent || "").trim()) continue;
    headings.push({
      tag: heading.tagName.toLowerCase(),
      text: (heading.textContent || "").trim().slice(0, 70),
      lines: countLines(heading),
    });
  }

  return {
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: docWidth,
    offenders: offenders.slice(0, 12),
    brokenImages,
    headings,
  };
})()`;

async function main() {
  const browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  let problems = 0;
  const warnings = [];

  for (const viewport of VIEWPORTS) {
    console.log(`\n=== ${viewport.name} (${viewport.width}px) ===`);
    const page = await browser.newPage();
    await page.setViewport({ width: viewport.width, height: viewport.height });

    const failedRequests = [];
    page.on("requestfailed", (request) => {
      const error = request.failure()?.errorText ?? "";
      // Permintaan yang dibatalkan bukan permintaan yang gagal: browser
      // membatalkan prefetch yang masih berjalan begitu halaman berpindah.
      if (error.includes("ERR_ABORTED")) return;
      failedRequests.push(`${request.method()} ${request.url()} — ${error}`);
    });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });

    for (const locale of ["id", "en"]) {
      for (const suffix of PATHS) {
        const url = `${BASE}/${locale}${suffix}`;
        const response = await page.goto(url, { waitUntil: "load", timeout: 60000 });
        const status = response?.status() ?? 0;
        // Hitung kegagalan hanya milik halaman ini, bukan sisa dari halaman
        // sebelumnya yang dibatalkan saat berpindah.
        failedRequests.length = 0;
        // Loader pembuka menutupi layar sesaat; tunggu sampai selesai.
        await new Promise((resolve) => setTimeout(resolve, 2600));
        const result = await page.evaluate(AUDIT_IN_PAGE);

        const issues = [];
        // 304 berarti browser memakai salinan cache, tetap dianggap berhasil.
        if (status !== 200 && status !== 304) issues.push(`status ${status}`);
        if (result.scrollWidth > result.clientWidth + 1) {
          issues.push(`melebar ${result.scrollWidth}px > ${result.clientWidth}px`);
          for (const offender of result.offenders) {
            issues.push(`  keluar layar: <${offender.tag} class="${offender.cls}"> ${offender.left}..${offender.right}`);
          }
        }
        if (result.brokenImages.length > 0) {
          issues.push(`gambar gagal: ${result.brokenImages.join(", ")}`);
        }
        const external = failedRequests.filter((entry) => !entry.includes("favicon"));
        if (external.length > 0) issues.push(`request gagal: ${external.join(" | ")}`);

        for (const heading of result.headings) {
          if (heading.lines >= 4) {
            issues.push(`heading ${heading.tag} tembus ${heading.lines} baris: "${heading.text}"`);
          } else if (heading.lines > viewport.maxHeadingLines) {
            issues.push(
              `heading ${heading.tag} ${heading.lines} baris, batas ${viewport.maxHeadingLines}: "${heading.text}"`,
            );
          } else if (viewport.name === "desktop" && heading.lines === 2 && heading.tag === "h1") {
            warnings.push(`desktop h1 dua baris: "${heading.text}" (${url})`);
          }
        }

        if (issues.length === 0) {
          console.log(`  OK    ${locale}${suffix || "/"}`);
        } else {
          problems += issues.length;
          console.log(`  GAGAL ${locale}${suffix || "/"}`);
          for (const issue of issues) console.log(`        ${issue}`);
        }
      }
    }

    await page.close();
  }

  await browser.close();

  if (warnings.length > 0) {
    console.log("\nCatatan (bukan kegagalan):");
    for (const warning of warnings) console.log(`  ${warning}`);
  }

  console.log(
    problems === 0
      ? "\nNol temuan di 375, 768, dan 1440."
      : `\n${problems} temuan perlu diperbaiki.`,
  );
  process.exit(problems === 0 ? 0 : 1);
}

await main();
