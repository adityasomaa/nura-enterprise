/**
 * Generator gambar placeholder.
 *
 *   npm run graphics
 *
 * Menghasilkan SVG geometris yang deterministik: input yang sama selalu
 * menghasilkan file yang sama, jadi aman diregenerate kapan saja.
 *
 * Aturan yang dipegang generator ini:
 * - Tidak ada grain, noise, atau tekstur bintik di mana pun.
 * - Tidak ada yang berpura-pura menjadi foto dekorasi sungguhan atau wajah orang.
 *   Semua bentuk jelas geometris dan jelas ilustratif.
 * - Tiap gaya dekorasi punya bahasa bentuk dan palet sendiri, jadi dua album
 *   dengan gaya berbeda tidak pernah terlihat mirip.
 * - Rasio semua gambar album dikunci 4:3 supaya grid galeri tidak berlompatan.
 */

import { mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ALBUMS, RIAS_ALBUMS, type SceneId, type StyleId } from "../src/data/site-content.ts";
import { oklchToHex, mixHex, shiftHex } from "./lib/color.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "graphics");

const W = 1600;
const H = 1200;
const FLOOR = 962;

/* -------------------------------------------------------------------------- */
/*  Acak deterministik                                                        */
/* -------------------------------------------------------------------------- */

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;
const range = (rng: Rng, min: number, max: number) => min + rng() * (max - min);
const pick = <T,>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length) % list.length];
const round = (n: number) => Math.round(n * 100) / 100;

/* -------------------------------------------------------------------------- */
/*  Palet dan bahasa bentuk per gaya                                          */
/* -------------------------------------------------------------------------- */

type ArchKind = "timber" | "disc" | "tiered" | "organic" | "soft";
type ClusterKind = "dried" | "sparse" | "ornament" | "leaf" | "drape";

type Palette = {
  bg: string;
  bgTop: string;
  floor: string;
  deep: string;
  mid: string;
  soft: string;
  accent: string;
  ink: string;
  arch: ArchKind;
  cluster: ClusterKind;
};

const PALETTES: Record<StyleId, Palette> = {
  rustic: {
    bg: oklchToHex("oklch(0.928 0.024 74)"),
    bgTop: oklchToHex("oklch(0.958 0.016 78)"),
    floor: oklchToHex("oklch(0.878 0.030 68)"),
    deep: oklchToHex("oklch(0.392 0.055 56)"),
    mid: oklchToHex("oklch(0.622 0.072 60)"),
    soft: oklchToHex("oklch(0.862 0.036 80)"),
    accent: oklchToHex("oklch(0.722 0.096 62)"),
    ink: oklchToHex("oklch(0.322 0.034 58)"),
    arch: "timber",
    cluster: "dried",
  },
  "modern-minimalis": {
    bg: oklchToHex("oklch(0.948 0.005 248)"),
    bgTop: oklchToHex("oklch(0.972 0.004 248)"),
    floor: oklchToHex("oklch(0.902 0.006 248)"),
    deep: oklchToHex("oklch(0.352 0.014 248)"),
    mid: oklchToHex("oklch(0.596 0.014 248)"),
    soft: oklchToHex("oklch(0.926 0.007 248)"),
    accent: oklchToHex("oklch(0.688 0.048 232)"),
    ink: oklchToHex("oklch(0.292 0.012 248)"),
    arch: "disc",
    cluster: "sparse",
  },
  "tradisional-bali": {
    bg: oklchToHex("oklch(0.922 0.030 62)"),
    bgTop: oklchToHex("oklch(0.952 0.020 66)"),
    floor: oklchToHex("oklch(0.868 0.038 56)"),
    deep: oklchToHex("oklch(0.368 0.098 26)"),
    mid: oklchToHex("oklch(0.582 0.106 42)"),
    soft: oklchToHex("oklch(0.836 0.054 78)"),
    accent: oklchToHex("oklch(0.756 0.112 86)"),
    ink: oklchToHex("oklch(0.294 0.060 30)"),
    arch: "tiered",
    cluster: "ornament",
  },
  garden: {
    bg: oklchToHex("oklch(0.942 0.018 146)"),
    bgTop: oklchToHex("oklch(0.968 0.012 148)"),
    floor: oklchToHex("oklch(0.888 0.026 146)"),
    deep: oklchToHex("oklch(0.428 0.072 152)"),
    mid: oklchToHex("oklch(0.632 0.084 146)"),
    soft: oklchToHex("oklch(0.868 0.038 142)"),
    accent: oklchToHex("oklch(0.812 0.062 122)"),
    ink: oklchToHex("oklch(0.312 0.042 152)"),
    arch: "organic",
    cluster: "leaf",
  },
  "all-white": {
    bg: oklchToHex("oklch(0.962 0.004 92)"),
    bgTop: oklchToHex("oklch(0.984 0.003 92)"),
    floor: oklchToHex("oklch(0.928 0.005 92)"),
    deep: oklchToHex("oklch(0.652 0.010 92)"),
    mid: oklchToHex("oklch(0.792 0.008 92)"),
    soft: oklchToHex("oklch(0.922 0.005 92)"),
    accent: oklchToHex("oklch(0.726 0.018 86)"),
    ink: oklchToHex("oklch(0.462 0.010 92)"),
    arch: "soft",
    cluster: "drape",
  },
};

/* -------------------------------------------------------------------------- */
/*  Bentuk dasar                                                              */
/* -------------------------------------------------------------------------- */

function rect(x: number, y: number, w: number, h: number, fill: string, rx = 0, extra = "") {
  return `<rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" rx="${round(rx)}" fill="${fill}"${extra}/>`;
}

function circle(cx: number, cy: number, r: number, fill: string, extra = "") {
  return `<circle cx="${round(cx)}" cy="${round(cy)}" r="${round(r)}" fill="${fill}"${extra}/>`;
}

function ellipse(cx: number, cy: number, rx: number, ry: number, fill: string, rotate = 0) {
  const t = rotate ? ` transform="rotate(${round(rotate)} ${round(cx)} ${round(cy)})"` : "";
  return `<ellipse cx="${round(cx)}" cy="${round(cy)}" rx="${round(rx)}" ry="${round(ry)}" fill="${fill}"${t}/>`;
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, width = 2, opacity = 1) {
  return `<line x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}" stroke="${stroke}" stroke-width="${round(width)}" stroke-opacity="${opacity}" stroke-linecap="round"/>`;
}

function path(d: string, fill: string, stroke = "none", width = 0) {
  const s = stroke === "none" ? "" : ` stroke="${stroke}" stroke-width="${round(width)}" stroke-linejoin="round"`;
  return `<path d="${d}" fill="${fill}"${s}/>`;
}

/** Lengkung setengah lingkaran di atas badan persegi. */
function archPath(cx: number, baseY: number, w: number, h: number): string {
  const half = w / 2;
  const shoulder = baseY - (h - half);
  return [
    `M ${round(cx - half)} ${round(baseY)}`,
    `L ${round(cx - half)} ${round(shoulder)}`,
    `A ${round(half)} ${round(half)} 0 0 1 ${round(cx + half)} ${round(shoulder)}`,
    `L ${round(cx + half)} ${round(baseY)}`,
    "Z",
  ].join(" ");
}

/** Siluet bertingkat, dipakai untuk bahasa bentuk tradisional Bali. */
function tieredPath(cx: number, baseY: number, w: number, h: number, tiers: number): string {
  const steps: string[] = [];
  const stepH = h / tiers;
  let halfW = w / 2;
  let y = baseY;
  steps.push(`M ${round(cx - halfW)} ${round(y)}`);
  for (let i = 0; i < tiers; i += 1) {
    const nextHalf = halfW * (1 - 0.16 - i * 0.015);
    y -= stepH;
    steps.push(`L ${round(cx - halfW)} ${round(y + stepH * 0.22)}`);
    steps.push(`L ${round(cx - nextHalf)} ${round(y + stepH * 0.22)}`);
    steps.push(`L ${round(cx - nextHalf)} ${round(y)}`);
    halfW = nextHalf;
  }
  steps.push(`L ${round(cx)} ${round(y - stepH * 0.55)}`);
  steps.push(`L ${round(cx + halfW)} ${round(y)}`);
  let backHalf = halfW;
  for (let i = tiers - 1; i >= 0; i -= 1) {
    const prevHalf = backHalf / (1 - 0.16 - i * 0.015);
    y += stepH;
    steps.push(`L ${round(cx + backHalf)} ${round(y - stepH * 0.78)}`);
    steps.push(`L ${round(cx + prevHalf)} ${round(y - stepH * 0.78)}`);
    steps.push(`L ${round(cx + prevHalf)} ${round(y)}`);
    backHalf = prevHalf;
  }
  steps.push("Z");
  return steps.join(" ");
}

/** Daun tunggal, dipakai untuk gaya garden. */
function leafPath(cx: number, cy: number, len: number, wide: number, angle: number): string {
  const rad = (angle * Math.PI) / 180;
  const tipX = cx + Math.cos(rad) * len;
  const tipY = cy + Math.sin(rad) * len;
  const nx = Math.cos(rad + Math.PI / 2) * wide;
  const ny = Math.sin(rad + Math.PI / 2) * wide;
  return [
    `M ${round(cx)} ${round(cy)}`,
    `Q ${round(cx + (tipX - cx) / 2 + nx)} ${round(cy + (tipY - cy) / 2 + ny)} ${round(tipX)} ${round(tipY)}`,
    `Q ${round(cx + (tipX - cx) / 2 - nx)} ${round(cy + (tipY - cy) / 2 - ny)} ${round(cx)} ${round(cy)}`,
    "Z",
  ].join(" ");
}

/* -------------------------------------------------------------------------- */
/*  Rangkaian bunga per bahasa bentuk                                         */
/* -------------------------------------------------------------------------- */

function cluster(rng: Rng, p: Palette, cx: number, cy: number, scale: number): string {
  const out: string[] = [];
  switch (p.cluster) {
    case "dried": {
      const count = Math.round(range(rng, 12, 17));
      for (let i = 0; i < count; i += 1) {
        const a = range(rng, 0, Math.PI * 2);
        const d = range(rng, 0.1, 1) * 92 * scale;
        const r = range(rng, 9, 26) * scale;
        const fill = pick(rng, [p.accent, p.mid, p.soft, shiftHex(`oklch(0.722 0.096 62)`, 0.06, -0.02)]);
        out.push(circle(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.72, r, fill));
      }
      for (let i = 0; i < 7; i += 1) {
        const a = range(rng, -160, -20);
        out.push(
          line(
            cx,
            cy,
            cx + Math.cos((a * Math.PI) / 180) * 118 * scale,
            cy + Math.sin((a * Math.PI) / 180) * 96 * scale,
            p.deep,
            3.2 * scale,
            0.55,
          ),
        );
      }
      break;
    }
    case "sparse": {
      const count = Math.round(range(rng, 4, 7));
      for (let i = 0; i < count; i += 1) {
        const a = range(rng, 0, Math.PI * 2);
        const d = range(rng, 0.2, 1) * 74 * scale;
        out.push(circle(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, range(rng, 10, 20) * scale, i % 2 ? p.accent : p.soft));
      }
      out.push(line(cx - 96 * scale, cy, cx + 96 * scale, cy, p.mid, 2.4 * scale, 0.7));
      break;
    }
    case "ornament": {
      const petals = 8;
      for (let i = 0; i < petals; i += 1) {
        const a = (360 / petals) * i + range(rng, -6, 6);
        out.push(path(leafPath(cx, cy, 88 * scale, 26 * scale, a), i % 2 ? p.mid : p.deep));
      }
      out.push(circle(cx, cy, 26 * scale, p.accent));
      out.push(circle(cx, cy, 12 * scale, p.soft));
      for (let i = 0; i < 4; i += 1) {
        const a = range(rng, 0, 360);
        const d = range(rng, 96, 132) * scale;
        out.push(
          circle(cx + Math.cos((a * Math.PI) / 180) * d, cy + Math.sin((a * Math.PI) / 180) * d * 0.7, range(rng, 8, 15) * scale, p.accent),
        );
      }
      break;
    }
    case "leaf": {
      const count = Math.round(range(rng, 14, 20));
      for (let i = 0; i < count; i += 1) {
        const a = range(rng, 0, 360);
        const len = range(rng, 52, 104) * scale;
        out.push(path(leafPath(cx, cy, len, range(rng, 16, 28) * scale, a), pick(rng, [p.mid, p.deep, p.soft])));
      }
      for (let i = 0; i < 5; i += 1) {
        const a = range(rng, 0, Math.PI * 2);
        const d = range(rng, 20, 66) * scale;
        out.push(circle(cx + Math.cos(a) * d, cy + Math.sin(a) * d, range(rng, 8, 14) * scale, p.accent));
      }
      break;
    }
    case "drape": {
      const bands = Math.round(range(rng, 5, 8));
      for (let i = 0; i < bands; i += 1) {
        const x = cx - 92 * scale + (i * 184 * scale) / bands;
        out.push(
          path(
            `M ${round(x)} ${round(cy - 96 * scale)} Q ${round(x + range(rng, -22, 22) * scale)} ${round(cy)} ${round(x)} ${round(cy + 96 * scale)}`,
            "none",
            i % 2 ? p.deep : p.mid,
            range(rng, 8, 16) * scale,
          ),
        );
      }
      out.push(ellipse(cx, cy, 78 * scale, 54 * scale, p.soft));
      out.push(circle(cx, cy, 22 * scale, p.accent));
      break;
    }
  }
  return out.join("");
}

/* -------------------------------------------------------------------------- */
/*  Elemen latar utama per bahasa bentuk                                      */
/* -------------------------------------------------------------------------- */

function backdrop(rng: Rng, p: Palette, cx: number, baseY: number, w: number, h: number): string {
  const out: string[] = [];
  switch (p.arch) {
    case "timber": {
      const post = w * 0.085;
      out.push(rect(cx - w / 2, baseY - h, post, h, p.deep, post * 0.15));
      out.push(rect(cx + w / 2 - post, baseY - h, post, h, p.deep, post * 0.15));
      out.push(rect(cx - w / 2 - post * 0.4, baseY - h, w + post * 0.8, post * 0.9, p.deep, post * 0.15));
      out.push(rect(cx - w / 2 + post, baseY - h + post * 0.9, w - post * 2, h - post * 0.9, p.soft));
      for (let i = 1; i < 5; i += 1) {
        const y = baseY - h + (h / 5) * i;
        out.push(line(cx - w / 2 + post, y, cx + w / 2 - post, y, p.mid, 3, 0.42));
      }
      break;
    }
    case "disc": {
      out.push(circle(cx, baseY - h * 0.62, Math.min(w, h) * 0.44, p.soft));
      out.push(
        `<circle cx="${round(cx)}" cy="${round(baseY - h * 0.62)}" r="${round(Math.min(w, h) * 0.44)}" fill="none" stroke="${p.deep}" stroke-width="3" stroke-opacity="0.5"/>`,
      );
      const bars = 3;
      for (let i = 0; i < bars; i += 1) {
        const x = cx - w * 0.3 + (i * w * 0.6) / (bars - 1);
        out.push(rect(x - 5, baseY - h * 0.98, 10, h * 0.98, p.mid, 5));
      }
      out.push(rect(cx - w / 2, baseY - 14, w, 14, p.deep, 7));
      break;
    }
    case "tiered": {
      out.push(path(tieredPath(cx, baseY, w * 0.86, h, 4), p.deep));
      out.push(path(tieredPath(cx, baseY, w * 0.86 - 26, h - 22, 4), p.mid));
      out.push(path(tieredPath(cx, baseY, w * 0.5, h * 0.68, 3), p.accent));
      break;
    }
    case "organic": {
      out.push(path(archPath(cx, baseY, w, h), p.soft));
      out.push(path(archPath(cx, baseY, w - 44, h - 30), p.bg));
      const steps = 26;
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const angle = Math.PI * (1 - t);
        const rx = (w / 2) * Math.cos(angle);
        const ry = (w / 2) * Math.sin(angle);
        const px = cx + rx;
        const py = baseY - (h - w / 2) - ry;
        if (py > baseY) continue;
        out.push(path(leafPath(px, py, range(rng, 34, 62), range(rng, 11, 19), range(rng, 0, 360)), pick(rng, [p.mid, p.deep])));
      }
      break;
    }
    case "soft": {
      out.push(rect(cx - w / 2, baseY - h, w, h, p.soft, w * 0.4));
      const bands = 9;
      for (let i = 1; i < bands; i += 1) {
        const x = cx - w / 2 + (w / bands) * i;
        out.push(
          path(
            `M ${round(x)} ${round(baseY)} Q ${round(x + range(rng, -16, 16))} ${round(baseY - h * 0.55)} ${round(x)} ${round(baseY - h * 0.94)}`,
            "none",
            i % 2 ? p.mid : p.deep,
            range(rng, 5, 11),
          ),
        );
      }
      break;
    }
  }
  return out.join("");
}

/** Sepasang tiang gate, siluetnya mengikuti bahasa bentuk gaya. */
function gatePost(rng: Rng, p: Palette, cx: number, baseY: number, w: number, h: number, mirror: boolean): string {
  const out: string[] = [];
  switch (p.arch) {
    case "timber":
      out.push(rect(cx - w / 2, baseY - h, w, h, p.deep, 6));
      out.push(rect(cx - w * 0.66, baseY - h - 18, w * 1.32, 22, p.mid, 6));
      for (let i = 1; i < 4; i += 1) {
        out.push(rect(cx - w * 0.58, baseY - h + (h / 4) * i, w * 1.16, 12, p.mid, 6));
      }
      break;
    case "disc":
      out.push(rect(cx - w / 2, baseY - h, w, h, p.mid, w / 2));
      out.push(circle(cx, baseY - h + w * 0.7, w * 0.28, p.soft));
      break;
    case "tiered":
      out.push(path(tieredPath(cx, baseY, w * 1.5, h, 5), p.deep));
      out.push(path(tieredPath(cx, baseY, w * 1.5 - 20, h - 18, 5), p.mid));
      out.push(circle(cx, baseY - h - 16, 15, p.accent));
      break;
    case "organic":
      out.push(rect(cx - w / 2, baseY - h, w, h, p.mid, w / 2));
      for (let i = 0; i < 16; i += 1) {
        const y = baseY - range(rng, 0.08, 1) * h;
        out.push(path(leafPath(cx, y, range(rng, 30, 58), range(rng, 10, 17), range(rng, 0, 360)), pick(rng, [p.deep, p.soft])));
      }
      break;
    case "soft":
      out.push(rect(cx - w / 2, baseY - h, w, h, p.soft, w / 2));
      out.push(
        path(
          `M ${round(cx)} ${round(baseY - h * 0.96)} Q ${round(cx + (mirror ? 14 : -14))} ${round(baseY - h * 0.5)} ${round(cx)} ${round(baseY - 12)}`,
          "none",
          p.deep,
          9,
        ),
      );
      break;
  }
  return out.join("");
}

/* -------------------------------------------------------------------------- */
/*  Adegan                                                                    */
/* -------------------------------------------------------------------------- */

function ground(p: Palette, rng: Rng): string {
  const wallTop = range(rng, 96, 168);
  const bandY = range(rng, 250, 340);
  return [
    // Bidang dinding di belakang, sedikit berbeda tone dari langit gambar,
    // supaya bagian atas frame tidak terasa kosong.
    rect(96, wallTop, W - 192, FLOOR - wallTop, p.soft, 0, ' opacity="0.42"'),
    line(96, bandY, W - 96, bandY, p.ink, 2, 0.12),
    rect(0, FLOOR, W, H - FLOOR, p.floor),
    line(0, FLOOR, W, FLOOR, p.ink, 2, 0.26),
    // Bayangan lembut di kaki komposisi, tanpa tekstur apa pun.
    ellipse(W / 2, FLOOR + 18, 620, 22, p.ink, 0).replace("/>", ' opacity="0.10"/>'),
  ].join("");
}

function sceneBody(scene: SceneId, rng: Rng, p: Palette): string {
  const out: string[] = [];
  const cx = W / 2 + range(rng, -34, 34);

  switch (scene) {
    case "pelaminan": {
      const w = range(rng, 720, 860);
      const h = range(rng, 660, 780);
      out.push(rect(cx - w * 0.78, FLOOR - 26, w * 1.56, 26, p.mid, 6));
      out.push(rect(cx - w * 0.66, FLOOR - 52, w * 1.32, 28, p.soft, 6));
      out.push(backdrop(rng, p, cx, FLOOR - 52, w, h));
      out.push(cluster(rng, p, cx - w * 0.46, FLOOR - 52 - h * 0.88, 1.25));
      out.push(cluster(rng, p, cx + w * 0.5, FLOOR - 52 - h * 0.3, 0.9));
      out.push(rect(cx - w * 0.92, FLOOR - 96, 96, 96, p.deep, 8));
      out.push(rect(cx + w * 0.82, FLOOR - 64, 78, 64, p.mid, 8));
      break;
    }
    case "gate": {
      const h = range(rng, 620, 730);
      const w = range(rng, 106, 146);
      const gap = range(rng, 330, 410);
      out.push(gatePost(rng, p, cx - gap, FLOOR, w, h, false));
      out.push(gatePost(rng, p, cx + gap, FLOOR, w, h, true));
      if (p.arch === "tiered") {
        out.push(rect(cx - gap, FLOOR - h * 0.42, gap * 2, 16, p.accent, 8));
      } else {
        out.push(
          path(
            `M ${round(cx - gap)} ${round(FLOOR - h)} Q ${round(cx)} ${round(FLOOR - h - range(rng, 120, 190))} ${round(cx + gap)} ${round(FLOOR - h)}`,
            "none",
            p.deep,
            18,
          ),
        );
      }
      out.push(cluster(rng, p, cx - gap, FLOOR - h - 12, 0.82));
      out.push(cluster(rng, p, cx + gap, FLOOR - h - 12, 0.66));
      out.push(cluster(rng, p, cx, FLOOR - h - range(rng, 96, 150), 0.58));
      break;
    }
    case "meja-penerima-tamu": {
      const tw = range(rng, 780, 900);
      const th = 224;
      const topY = FLOOR - th;
      out.push(backdrop(rng, p, cx, topY + 26, tw * 0.78, range(rng, 300, 380)));
      out.push(path(`M ${round(cx - tw / 2)} ${round(FLOOR)} L ${round(cx - tw / 2 + 46)} ${round(topY)} L ${round(cx + tw / 2 - 46)} ${round(topY)} L ${round(cx + tw / 2)} ${round(FLOOR)} Z`, p.mid));
      out.push(rect(cx - tw / 2 - 18, topY - 22, tw + 36, 26, p.deep, 8));
      out.push(cluster(rng, p, cx - tw * 0.28, topY - 66, 0.6));
      out.push(cluster(rng, p, cx + tw * 0.26, topY - 52, 0.44));
      for (let i = 0; i < 3; i += 1) {
        const x = cx - 60 + i * 62;
        out.push(rect(x, topY - 74, 16, 52, p.soft, 8));
        out.push(circle(x + 8, topY - 82, 9, p.accent));
      }
      break;
    }
    case "area-foto": {
      const w = range(rng, 540, 650);
      const h = range(rng, 660, 760);
      out.push(backdrop(rng, p, cx + 40, FLOOR, w, h));
      out.push(rect(cx - w * 0.72, FLOOR - range(rng, 96, 150), 74, range(rng, 96, 150), p.deep, 8));
      out.push(rect(cx - w * 0.44, FLOOR - range(rng, 60, 96), 62, range(rng, 60, 96), p.mid, 8));
      out.push(cluster(rng, p, cx - w * 0.68, FLOOR - 168, 0.66));
      out.push(cluster(rng, p, cx + 40 - w * 0.3, FLOOR - h * 0.86, 0.86));
      out.push(cluster(rng, p, cx + w * 0.5, FLOOR - 44, 0.46));
      break;
    }
    case "jalur-masuk": {
      const vanishY = FLOOR - 420;
      out.push(path(`M ${round(cx - 640)} ${round(H)} L ${round(cx - 96)} ${round(vanishY)} L ${round(cx + 96)} ${round(vanishY)} L ${round(cx + 640)} ${round(H)} Z`, p.soft));
      out.push(line(cx - 640, H, cx - 96, vanishY, p.ink, 2, 0.28));
      out.push(line(cx + 640, H, cx + 96, vanishY, p.ink, 2, 0.28));
      const markers = 6;
      for (let i = 0; i < markers; i += 1) {
        const t = i / (markers - 1);
        const y = vanishY + (H - 120 - vanishY) * Math.pow(t, 1.5);
        const spread = 100 + t * 520;
        const s = 0.28 + t * 0.72;
        out.push(rect(cx - spread - 16 * s, y - 150 * s, 32 * s, 150 * s, p.mid, 16 * s));
        out.push(rect(cx + spread - 16 * s, y - 150 * s, 32 * s, 150 * s, p.mid, 16 * s));
        out.push(cluster(rng, p, cx - spread, y - 160 * s, 0.34 * s + 0.12));
        out.push(cluster(rng, p, cx + spread, y - 160 * s, 0.34 * s + 0.12));
      }
      out.push(backdrop(rng, p, cx, vanishY + 20, 300, 260));
      break;
    }
    case "area-akad": {
      const w = range(rng, 700, 820);
      const h = range(rng, 560, 650);
      out.push(rect(cx - w * 0.8, FLOOR - 34, w * 1.6, 34, p.mid, 8));
      out.push(backdrop(rng, p, cx, FLOOR - 34, w, h));
      const seatW = 150;
      out.push(rect(cx - seatW - 26, FLOOR - 34 - 118, seatW, 118, p.deep, 14));
      out.push(rect(cx + 26, FLOOR - 34 - 118, seatW, 118, p.deep, 14));
      out.push(rect(cx - seatW - 26, FLOOR - 34 - 138, seatW, 26, p.soft, 13));
      out.push(rect(cx + 26, FLOOR - 34 - 138, seatW, 26, p.soft, 13));
      out.push(cluster(rng, p, cx - w * 0.46, FLOOR - 34 - h * 0.7, 0.78));
      out.push(cluster(rng, p, cx + w * 0.46, FLOOR - 34 - h * 0.52, 0.62));
      break;
    }
  }
  return out.join("");
}

function frameSvg(seedKey: string, style: StyleId, scene: SceneId): string {
  const rng = mulberry32(hashSeed(seedKey));
  const p = PALETTES[style];
  const gradId = `g${hashSeed(seedKey).toString(36)}`;

  const halo = [
    circle(range(rng, 240, 460), range(rng, 180, 320), range(rng, 150, 240), mixHex(`oklch(0.928 0.024 74)`, `oklch(0.958 0.016 78)`, 0.5), ' opacity="0.0"'),
  ].join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">`,
    `<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0" stop-color="${p.bgTop}"/><stop offset="1" stop-color="${p.bg}"/>`,
    `</linearGradient></defs>`,
    rect(0, 0, W, H, `url(#${gradId})`),
    halo,
    ground(p, rng),
    sceneBody(scene, rng, p),
    rect(0, 0, W, H, "none", 0, ` stroke="${p.ink}" stroke-opacity="0.10" stroke-width="4"`),
    `</svg>`,
  ].join("");
}

/* -------------------------------------------------------------------------- */
/*  Grafis hero dan penanda situs                                             */
/* -------------------------------------------------------------------------- */

function heroSvg(): string {
  const rng = mulberry32(hashSeed("hero-nura"));
  const p = PALETTES.rustic;
  const hw = 2400;
  const hh = 1500;
  const floor = 1180;
  const out: string[] = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${hw} ${hh}" width="${hw}" height="${hh}" preserveAspectRatio="xMidYMid slice" role="img">`);
  out.push(
    `<defs><linearGradient id="heroG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${oklchToHex("oklch(0.972 0.012 78)")}"/><stop offset="0.62" stop-color="${oklchToHex("oklch(0.944 0.020 74)")}"/><stop offset="1" stop-color="${oklchToHex("oklch(0.906 0.028 70)")}"/></linearGradient></defs>`,
  );
  out.push(rect(0, 0, hw, hh, "url(#heroG)"));
  out.push(rect(0, floor, hw, hh - floor, oklchToHex("oklch(0.884 0.030 68)")));
  out.push(line(0, floor, hw, floor, p.ink, 2, 0.2));

  // Tiga lengkung berlapis dengan kedalaman lewat perbedaan tone, tanpa tekstur.
  const arches = [
    { cx: 1200, w: 1560, h: 1210, fill: oklchToHex("oklch(0.912 0.030 74)") },
    { cx: 1200, w: 1150, h: 1010, fill: oklchToHex("oklch(0.872 0.040 70)") },
    { cx: 1200, w: 780, h: 830, fill: oklchToHex("oklch(0.826 0.048 68)") },
  ];
  for (const a of arches) out.push(path(archPath(a.cx, floor, a.w, a.h), a.fill));
  out.push(path(archPath(1200, floor, 780, 830), "none", p.deep, 4));

  // Panggung dan dua bidang samping, supaya bagian bawah punya bentuk yang jelas.
  out.push(rect(760, floor - 44, 880, 44, oklchToHex("oklch(0.788 0.050 66)"), 6));
  out.push(rect(830, floor - 78, 740, 36, oklchToHex("oklch(0.856 0.040 72)"), 6));
  out.push(rect(250, floor - 300, 120, 300, oklchToHex("oklch(0.836 0.044 70)"), 10));
  out.push(rect(2030, floor - 380, 140, 380, oklchToHex("oklch(0.848 0.042 70)"), 10));
  out.push(line(0, floor - 620, 2400, floor - 620, p.ink, 2, 0.1));

  for (const [cx, cy, s] of [
    [560, 700, 1.5],
    [1880, 820, 1.25],
    [1200, 470, 0.95],
    [820, 1050, 0.8],
    [1640, 1080, 0.7],
  ] as const) {
    out.push(cluster(rng, p, cx, cy, s));
  }
  out.push(`</svg>`);
  return out.join("");
}

/** Ikon situs: monogram geometris tanpa latar, jadi transparan di tab manapun. */
function iconSvg(): string {
  const ink = oklchToHex("oklch(0.478 0.113 40)");
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">`,
    `<path d="M 12 54 L 12 28 A 20 20 0 0 1 52 28 L 52 54" fill="none" stroke="${ink}" stroke-width="7" stroke-linecap="round"/>`,
    `<path d="M 24 54 L 24 22 L 40 42 L 40 22" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
    `</svg>`,
  ].join("");
}

/* -------------------------------------------------------------------------- */
/*  Tulis file                                                                */
/* -------------------------------------------------------------------------- */

async function main() {
  await rm(join(OUT, "albums"), { recursive: true, force: true });
  await mkdir(join(OUT, "albums"), { recursive: true });

  let count = 0;
  for (const album of ALBUMS) {
    for (const photo of album.photos) {
      const svg = frameSvg(`${album.code}-${photo.scene}`, album.style, photo.scene);
      await writeFile(join(OUT, "albums", `${album.code}-${photo.scene}.svg`), svg, "utf8");
      count += 1;
    }
  }
  for (const album of RIAS_ALBUMS) {
    for (const photo of album.photos) {
      const svg = frameSvg(`${album.code}-${photo.scene}`, album.style, photo.scene);
      await writeFile(join(OUT, "albums", `${album.code}-${photo.scene}.svg`), svg, "utf8");
      count += 1;
    }
  }

  await writeFile(join(OUT, "hero.svg"), heroSvg(), "utf8");
  await writeFile(join(ROOT, "src", "app", "icon.svg"), iconSvg(), "utf8");

  console.log(`${count} gambar album ditulis ke public/graphics/albums`);
  console.log("hero.svg dan src/app/icon.svg diperbarui");
}

await main();
