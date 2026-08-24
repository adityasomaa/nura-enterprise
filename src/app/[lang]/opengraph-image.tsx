import { ImageResponse } from "next/og";

import { NEUE_MONTREAL_MEDIUM_TTF_BASE64 } from "@/assets/neue-montreal-medium";
import { CLIENT } from "@/config/client";
import { isLocale } from "@/lib/i18n";

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
  const tagline =
    locale === "id"
      ? `Dekorasi pernikahan, ${CLIENT.address.locality}, ${CLIENT.address.region}`
      : `Wedding decoration, ${CLIENT.address.locality}, ${CLIENT.address.region}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f7f3ee",
          padding: "72px 80px",
          fontFamily: "Neue Montreal",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="56" height="56" viewBox="0 0 64 64">
            <path
              d="M 12 54 L 12 28 A 20 20 0 0 1 52 28 L 52 54"
              fill="none"
              stroke="#8a4a34"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M 24 54 L 24 22 L 40 42 L 40 22"
              fill="none"
              stroke="#8a4a34"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: 26, letterSpacing: "0.22em", color: "#5c5049" }}>
            {CLIENT.address.locality.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span style={{ fontSize: 86, lineHeight: 1.02, color: "#2a231e", letterSpacing: "-0.02em" }}>
            {CLIENT.name}
          </span>
          <span style={{ fontSize: 32, color: "#5c5049" }}>{tagline}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 220, height: 3, backgroundColor: "#8a4a34" }} />
          <span style={{ fontSize: 26, color: "#5c5049" }}>{CLIENT.domain}</span>
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
