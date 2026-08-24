import { STYLES, labelOf, type Locale } from "@/data/site-content";

/**
 * Alt text gambar album.
 *
 * Selalu menyebut bahwa gambarnya ilustrasi geometris, tidak pernah mengaku
 * sebagai dokumentasi acara sungguhan. Ini penting di industri dekorasi karena
 * memakai foto milik orang lain adalah masalah nyata.
 */
export function albumAlt(
  album: { code: string; style: string },
  scene: string,
  locale: Locale,
): string {
  const style = labelOf(STYLES, album.style, locale);
  const sceneLabel = scene.replace(/-/g, " ");
  return locale === "id"
    ? `Ilustrasi geometris area ${sceneLabel} bergaya ${style}, album ${album.code}`
    : `Geometric illustration of the ${sceneLabel} area in ${style} style, album ${album.code}`;
}
