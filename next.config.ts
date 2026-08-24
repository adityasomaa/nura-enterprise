import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Kuota Vercel Image Optimization di akun ini habis. Kalau optimizer menyala,
    // setiap gambar balas 402 dan halaman production tampil kosong.
    // Situs ini memakai <img> biasa dengan SVG statis, jadi optimizer memang tidak dibutuhkan.
    unoptimized: true,
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/graphics/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
