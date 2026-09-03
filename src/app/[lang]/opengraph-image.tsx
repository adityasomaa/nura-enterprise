import { ImageResponse } from "next/og";

import { NEUE_MONTREAL_MEDIUM_TTF_BASE64 } from "@/assets/neue-montreal-medium";
import { CLIENT } from "@/config/client";
import { oklchToHex } from "@/lib/color";
import { isLocale } from "@/lib/i18n";

/* satori tidak menerima oklch, jadi token warna diubah ke hex di sini.
   Warna aksen diambil dari config klien supaya OG image ikut berganti
   sendiri saat basis kode ini dipakai untuk klien berikutnya. */
const COLOR = {
  paper: oklchToHex("oklch(0.976 0.006 78)"),
  ink: oklchToHex("oklch(0.216 0.013 62)"),
  ink2: oklchToHex("oklch(0.432 0.012 62)"),
  accent: oklchToHex(CLIENT.accent.strong),
};

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = CLIENT.name;

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = Buffer.from(base64, "base64");
  const copy = new ArrayBuffer(binary.byteLength);
  new Uint8Array(copy).set(binary);
  return copy;
}

/**
 * OG image memakai wordmark klien, bukan foto stok.
 * Font Neue Montreal disematkan sebagai base64 TTF karena satori hanya
 * menerima TTF atau OTF, bukan WOFF2.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "id";
  // Layanan yang disebut mengikuti flag di config, jadi tidak pernah
  // mengklaim layanan yang tidak dilayani klien ini.
  const service =
    locale === "id"
      ? CLIENT.features.riasPengantin
        ? "Dekorasi dan rias pengantin"
        : "Dekorasi pernikahan"
      : CLIENT.features.riasPengantin
        ? "Wedding decoration and bridal makeup"
        : "Wedding decoration";
  const tagline = `${service}, ${CLIENT.address.locality}, ${CLIENT.address.region}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: COLOR.paper,
          padding: "72px 80px",
          fontFamily: "Neue Montreal",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="56" height="56" viewBox="0 0 64 64">
            <path
              d="M 12 54 L 12 28 A 20 20 0 0 1 52 28 L 52 54"
              fill="none"
              stroke={COLOR.accent}
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M 24 54 L 24 22 L 40 42 L 40 22"
              fill="none"
              stroke={COLOR.accent}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: 26, letterSpacing: "0.22em", color: COLOR.ink2 }}>
            {CLIENT.address.locality.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span style={{ fontSize: 86, lineHeight: 1.02, color: COLOR.ink, letterSpacing: "-0.02em" }}>
            {CLIENT.name}
          </span>
          <span style={{ fontSize: 32, color: COLOR.ink2 }}>{tagline}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 220, height: 3, backgroundColor: COLOR.accent }} />
          <span style={{ fontSize: 26, color: COLOR.ink2 }}>{CLIENT.domain}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Neue Montreal",
          data: base64ToArrayBuffer(NEUE_MONTREAL_MEDIUM_TTF_BASE64),
          weight: 500,
          style: "normal",
        },
      ],
    },
  );
}
