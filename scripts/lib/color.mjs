/**
 * Konversi warna dan hitung kontras WCAG.
 * Dipakai oleh generator gambar dan oleh audit kontras.
 * Tidak ada dependensi eksternal supaya bisa jalan di mana saja.
 */

/** Parse string "oklch(L C H)" atau "oklch(L C H / A)" menjadi angka. */
export function parseOklch(input) {
  const match = String(input)
    .trim()
    .match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i);
  if (!match) throw new Error(`bukan warna oklch yang valid: ${input}`);
  const l = match[1].endsWith("%") ? parseFloat(match[1]) / 100 : parseFloat(match[1]);
  return { l, c: parseFloat(match[2]), h: parseFloat(match[3]) };
}

function gamma(x) {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

function ungamma(x) {
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

const clamp01 = (x) => Math.min(1, Math.max(0, x));

/** OKLCH ke sRGB 0..255. */
export function oklchToRgb(input) {
  const { l: L, c: C, h: H } = typeof input === "string" ? parseOklch(input) : input;
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const lr = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const lg = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const lb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  return {
    r: Math.round(clamp01(gamma(lr)) * 255),
    g: Math.round(clamp01(gamma(lg)) * 255),
    b: Math.round(clamp01(gamma(lb)) * 255),
  };
}

export function oklchToHex(input) {
  const { r, g, b } = oklchToRgb(input);
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** Luminansi relatif WCAG dari sRGB 0..255. */
export function relativeLuminance({ r, g, b }) {
  const [R, G, B] = [r, g, b].map((v) => ungamma(v / 255));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Rasio kontras WCAG antara dua warna. Terima string oklch atau objek rgb. */
export function contrastRatio(a, b) {
  const ra = typeof a === "string" ? oklchToRgb(a) : a;
  const rb = typeof b === "string" ? oklchToRgb(b) : b;
  const la = relativeLuminance(ra);
  const lb = relativeLuminance(rb);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

/** Campur dua warna oklch di ruang OKLab, kembalikan hex. t=0 warna pertama. */
export function mixHex(a, b, t) {
  const ca = typeof a === "string" ? parseOklch(a) : a;
  const cb = typeof b === "string" ? parseOklch(b) : b;
  return oklchToHex({
    l: ca.l + (cb.l - ca.l) * t,
    c: ca.c + (cb.c - ca.c) * t,
    h: ca.h + (cb.h - ca.h) * t,
  });
}

/** Geser lightness dan chroma sebuah warna oklch, kembalikan hex. */
export function shiftHex(base, dL = 0, dC = 0, dH = 0) {
  const c = typeof base === "string" ? parseOklch(base) : base;
  return oklchToHex({
    l: Math.min(1, Math.max(0, c.l + dL)),
    c: Math.max(0, c.c + dC),
    h: c.h + dH,
  });
}
