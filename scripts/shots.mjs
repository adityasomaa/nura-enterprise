import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.AUDIT_URL ?? "http://localhost:4321";
const OUT = process.env.SHOT_DIR ?? "./.shots";
const chrome = [process.env.CHROME_PATH, path.join(process.env.LOCALAPPDATA ?? "", "Google/Chrome/Application/chrome.exe")].find(p => p && existsSync(p));
mkdirSync(OUT, { recursive: true });

const shots = JSON.parse(process.env.SHOTS ?? "[]");
const browser = await puppeteer.launch({ executablePath: chrome, headless: "new", args: ["--no-sandbox"] });
for (const shot of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: shot.w, height: shot.h, deviceScaleFactor: 1 });
  await page.goto(BASE + shot.url, { waitUntil: "load", timeout: 60000 });
  await new Promise(r => setTimeout(r, shot.wait ?? 3000));
  if (shot.scroll) { await page.evaluate((y) => window.scrollTo(0, y), shot.scroll); await new Promise(r => setTimeout(r, 1400)); }
  if (shot.click) { await page.click(shot.click); await new Promise(r => setTimeout(r, 900)); }
  await page.screenshot({ path: path.join(OUT, shot.name + ".png"), fullPage: !!shot.full });
  console.log("saved", shot.name);
  await page.close();
}
await browser.close();
