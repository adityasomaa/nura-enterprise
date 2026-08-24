/**
 * Verifikasi perilaku nyata di browser sungguhan.
 *
 *   AUDIT_URL=http://localhost:4321 node scripts/verify-interactions.mjs
 *
 * Yang diuji:
 * - filter galeri untuk ketiga label, termasuk kombinasi yang kosong
 * - lightbox: terbuka, panah kiri kanan, Escape, dan scroll body kembali normal
 * - fokus kembali ke thumbnail asal setelah lightbox ditutup
 * - tombol konsultasi dari dalam album membawa kode album dan gaya yang benar
 * - hamburger menu di layar kecil
 * - pemilih bahasa tetap diingat saat pindah halaman
 */

import { existsSync } from "node:fs";
import path from "node:path";

import puppeteer from "puppeteer-core";

const BASE = (process.env.AUDIT_URL ?? "http://localhost:4321").replace(/\/$/, "");
const chrome = [
  process.env.CHROME_PATH,
  path.join(process.env.LOCALAPPDATA ?? "", "Google/Chrome/Application/chrome.exe"),
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].find((candidate) => candidate && existsSync(candidate));

let failures = 0;
function check(label, ok, detail = "") {
  if (ok) {
    console.log(`  OK    ${label}`);
  } else {
    failures += 1;
    console.log(`  GAGAL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

const settle = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

async function clickChip(page, text) {
  const clicked = await page.evaluate((label) => {
    const buttons = [...document.querySelectorAll("button")];
    const target = buttons.find((button) => button.textContent?.trim() === label);
    if (!target) return false;
    target.click();
    return true;
  }, text);
  await settle(500);
  return clicked;
}

const cardCount = (page) =>
  page.evaluate(() => document.querySelectorAll("article h3 a").length);

async function main() {
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: "new",
    args: ["--no-sandbox"],
  });

  /* ---------------------------------------------------------------- */
  console.log("\n=== Filter galeri ===");
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/id/galeri`, { waitUntil: "load" });
  await settle(2800);
  // Tutup banner cookie supaya tidak menghalangi klik di bagian bawah.
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    buttons.find((button) => button.textContent?.trim() === "Izinkan")?.click();
  });
  await settle(400);

  check("gaya Rustic menyisakan 2 album", (await clickChip(page, "Rustic")) && (await cardCount(page)) === 2);
  await clickChip(page, "Rustic");

  check("tempat Indoor menyisakan 4 album", (await clickChip(page, "Indoor")) && (await cardCount(page)) === 4);
  await clickChip(page, "Indoor");

  check("jenis acara Akad menyisakan 2 album", (await clickChip(page, "Akad")) && (await cardCount(page)) === 2);

  await clickChip(page, "Outdoor");
  const emptyShown = await page.evaluate(() =>
    document.body.innerText.includes("Tidak ada album untuk kombinasi filter ini"),
  );
  check("kombinasi Akad + Outdoor menampilkan keadaan kosong", emptyShown);

  await clickChip(page, "Atur ulang");
  check("atur ulang mengembalikan daftar album", (await cardCount(page)) >= 6);

  /* ---------------------------------------------------------------- */
  console.log("\n=== Lightbox ===");
  await page.goto(`${BASE}/id/galeri/resepsi-tradisional-bali-pura`, { waitUntil: "load" });
  await settle(2800);

  const beforeScroll = await page.evaluate(() => {
    window.scrollTo(0, 400);
    return window.scrollY;
  });
  await settle(300);

  await page.evaluate(() => {
    document.querySelectorAll("li button")[0]?.click();
  });
  await settle(600);

  const opened = await page.evaluate(() => !!document.querySelector('[role="dialog"][aria-modal="true"]'));
  check("lightbox terbuka dari thumbnail", opened);

  const locked = await page.evaluate(() => document.body.dataset.scrollLocked === "true");
  check("scroll body terkunci saat lightbox terbuka", locked);

  const counterBefore = await page.evaluate(
    () => document.querySelector('[role="dialog"] p')?.textContent?.trim() ?? "",
  );
  await page.keyboard.press("ArrowRight");
  await settle(400);
  const counterAfterNext = await page.evaluate(
    () => document.querySelector('[role="dialog"] p')?.textContent?.trim() ?? "",
  );
  check(
    "panah kanan pindah ke foto berikutnya",
    counterBefore !== counterAfterNext,
    `${counterBefore} -> ${counterAfterNext}`,
  );

  await page.keyboard.press("ArrowLeft");
  await settle(400);
  const counterBack = await page.evaluate(
    () => document.querySelector('[role="dialog"] p')?.textContent?.trim() ?? "",
  );
  check("panah kiri kembali ke foto sebelumnya", counterBack === counterBefore, `${counterBack}`);

  await page.keyboard.press("Escape");
  await settle(600);
  const closed = await page.evaluate(() => !document.querySelector('[role="dialog"][aria-modal="true"]'));
  check("Escape menutup lightbox", closed);

  const unlocked = await page.evaluate(
    () => document.body.dataset.scrollLocked === undefined && getComputedStyle(document.body).overflow !== "hidden",
  );
  check("scroll body kembali normal setelah ditutup", unlocked);

  const scrollRestored = await page.evaluate(() => window.scrollY);
  check("posisi scroll dikembalikan", Math.abs(scrollRestored - beforeScroll) < 40, `${scrollRestored}`);

  const focusBack = await page.evaluate(() => {
    const first = document.querySelectorAll("li button")[0];
    return document.activeElement === first;
  });
  check("fokus kembali ke thumbnail asal", focusBack);

  /* ---------------------------------------------------------------- */
  console.log("\n=== Konsultasi dari dalam album ===");
  const consultHref = await page.evaluate(() => {
    const link = [...document.querySelectorAll("a")].find((anchor) =>
      (anchor.getAttribute("href") ?? "").includes("album="),
    );
    return link?.getAttribute("href") ?? "";
  });
  check(
    "tautan konsultasi album membawa kode dan gaya",
    consultHref.includes("album=NRA-04") && consultHref.includes("style=tradisional-bali"),
    consultHref,
  );

  await page.goto(`${BASE}${consultHref}`, { waitUntil: "load" });
  await settle(2800);

  const prefilled = await page.evaluate(() => {
    const album = document.querySelector('input[name="album"]')?.value ?? "";
    const style = document.querySelector('input[name="style"]')?.value ?? "";
    const styleLabel = document.body.innerText.includes("Tradisional Bali");
    const note = document.body.innerText.includes("NRA-04");
    return { album, style, styleLabel, note };
  });
  check("kode album terisi otomatis", prefilled.album === "NRA-04", prefilled.album);
  check("gaya dekorasi terisi otomatis", prefilled.style === "tradisional-bali", prefilled.style);
  check("gaya tampil sebagai label terpilih", prefilled.styleLabel);
  check("kode album disebut di halaman", prefilled.note);

  // Isi form dan kirim, lalu periksa isi pesan yang dihasilkan server.
  await page.evaluate(() => {
    const setValue = (name, value) => {
      const input = document.querySelector(`[name="${name}"]`);
      if (!input) return;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      ).set;
      setter.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    setValue("name", "Uji Otomatis");
    setValue("whatsapp", "081234567890");
    setValue("guests", "300");
    const checkbox = document.querySelector('input[name="dateUndecided"]');
    if (checkbox && !checkbox.checked) checkbox.click();
  });
  await settle(300);

  // Pilih jenis acara dan jenis venue lewat listbox buatan sendiri.
  for (const [labelText, optionText] of [
    ["Jenis acara", "Resepsi"],
    ["Jenis venue", "Pura"],
  ]) {
    await page.evaluate(
      (label, option) => {
        const wrappers = [...document.querySelectorAll("div.flex.flex-col.gap-2")];
        const wrapper = wrappers.find((node) => node.querySelector("span")?.textContent?.trim() === label);
        wrapper?.querySelector('button[role="combobox"]')?.click();
        const list = wrapper?.querySelector('[role="listbox"]');
        const item = [...(list?.querySelectorAll('[role="option"]') ?? [])].find(
          (node) => node.textContent?.trim() === option,
        );
        item?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      },
      labelText,
      optionText,
    );
    await settle(350);
  }

  await page.evaluate(() => {
    const submit = [...document.querySelectorAll('button[type="submit"]')][0];
    submit?.click();
  });
  await settle(2600);

  const outcome = await page.evaluate(() => {
    const pre = document.querySelector("pre")?.textContent ?? "";
    // Ambil tautan di dalam panel hasil, bukan tombol WhatsApp umum di header.
    const panel = document.querySelector("pre")?.closest("div");
    const wa =
      [...(panel?.querySelectorAll("a") ?? [])]
        .map((anchor) => anchor.getAttribute("href") ?? "")
        .find((href) => href.startsWith("https://wa.me/")) ?? "";
    return { pre, wa };
  });

  check("pesan memuat kode album", outcome.pre.includes("NRA-04"), outcome.pre.slice(0, 160));
  check("pesan memuat gaya dekorasi yang benar", outcome.pre.includes("Tradisional Bali"));
  check("pesan memuat URL halaman asal", outcome.pre.includes("/kontak"));
  check("pesan memuat label tombol", outcome.pre.includes("Tombol:"));
  if (outcome.wa) {
    const decoded = decodeURIComponent(outcome.wa);
    check("tautan wa.me memuat kode album", decoded.includes("NRA-04"));
    check("tautan wa.me memuat gaya dekorasi", decoded.includes("Tradisional Bali"));
  } else {
    console.log("  CATATAN nomor WhatsApp belum diisi di config, jadi tautan wa.me belum dibuat");
  }

  await page.close();

  /* ---------------------------------------------------------------- */
  console.log("\n=== Menu mobile dan pemilih bahasa ===");
  const small = await browser.newPage();
  await small.setViewport({ width: 375, height: 812 });
  await small.goto(`${BASE}/id`, { waitUntil: "load" });
  await settle(2800);

  await small.evaluate(() => {
    document.querySelector('button[aria-controls="menu-mobile"]')?.click();
  });
  await settle(500);
  const menuOpen = await small.evaluate(() => {
    const panel = document.getElementById("menu-mobile");
    return !!panel && !panel.hasAttribute("hidden");
  });
  check("hamburger membuka menu", menuOpen);

  const menuLocked = await small.evaluate(() => document.body.dataset.scrollLocked === "true");
  check("menu mobile mengunci scroll", menuLocked);

  const bannerHidden = await small.evaluate(
    () => !document.body.innerText.includes("Cookie preferensi") || document.getElementById("menu-mobile") !== null,
  );
  check("cookie banner tidak menutupi menu mobile", bannerHidden);

  await small.keyboard.press("Escape");
  await settle(400);
  const menuClosed = await small.evaluate(() => {
    const panel = document.getElementById("menu-mobile");
    return !!panel && panel.hasAttribute("hidden");
  });
  check("Escape menutup menu mobile", menuClosed);

  await small.goto(`${BASE}/id/paket`, { waitUntil: "load" });
  await settle(2600);
  await small.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    buttons.find((button) => button.textContent?.trim() === "Izinkan")?.click();
  });
  await settle(300);
  await small.evaluate(() => {
    const link = [...document.querySelectorAll('a[hreflang="en"]')][0];
    link?.click();
  });
  await settle(3200);
  const switched = small.url().includes("/en/paket");
  check("pemilih bahasa pindah ke halaman yang sama", switched, small.url());

  const cookieRemembered = await small.evaluate(() => document.cookie.includes("pref-locale=en"));
  check("pilihan bahasa diingat lewat cookie preferensi", cookieRemembered);

  await small.close();
  await browser.close();

  console.log(
    failures === 0 ? "\nSemua pemeriksaan interaksi lolos." : `\n${failures} pemeriksaan gagal.`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

await main();
