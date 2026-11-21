/** Lightens (positive) or darkens (negative) a #rrggbb colour by a percentage. */
export function shade(hex, percent) {
  const n = parseInt(hex.slice(1), 16)
  const target = percent < 0 ? 0 : 255
  const p = Math.abs(percent) / 100
  const channel = (shift) => Math.round(((n >> shift) & 255) * (1 - p) + target * p)
  return `#${[16, 8, 0].map((s) => channel(s).toString(16).padStart(2, '0')).join('')}`
}

/** A small colour family derived from one base colour. */
export const tone = (hex) => ({ base: hex, dark: shade(hex, -18), deep: shade(hex, -34), light: shade(hex, 22), pale: shade(hex, 50) })
