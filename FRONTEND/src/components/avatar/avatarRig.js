import { ANKLE_Y, BODY_PRESETS, CENTER_X as CX, GROUND_Y } from './avatarBodies'

/**
 * The body skeleton and the small geometry helpers every garment builds on.
 * Clothes are derived from the same numbers as the body, which is what makes
 * them fit any body type.
 */
export { ANKLE_Y, CX, GROUND_Y }
export const SIDES = [-1, 1]
export const KAPPA = 0.5523

export const round = (v) => Math.round(v * 100) / 100
export const xy = (x, y) => `${round(x)} ${round(y)}`
export const at = (p) => xy(p.x, p.y)
export const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
export const mirror = (p) => ({ x: 2 * CX - p.x, y: p.y })

/** Catmull-Rom spline through points, returned as cubic Bezier segments. */
export function spline(points, tension = 0.5) {
  const k = tension / 3
  let d = ''
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    d += `C${xy(p1.x + (p2.x - p0.x) * k, p1.y + (p2.y - p0.y) * k)} ${xy(p2.x - (p3.x - p1.x) * k, p2.y - (p3.y - p1.y) * k)} ${at(p2)}`
  }
  return d
}

/** Tapered capsule from a to b. Caps can be 'round' or 'flat'. */
export function limb(a, b, widthA, widthB, { startCap = 'round', endCap = 'round' } = {}) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
  const nx = -(b.y - a.y) / len
  const ny = (b.x - a.x) / len
  const ra = widthA / 2
  const rb = widthB / 2
  const a1 = { x: a.x + nx * ra, y: a.y + ny * ra }
  const a2 = { x: a.x - nx * ra, y: a.y - ny * ra }
  const b1 = { x: b.x + nx * rb, y: b.y + ny * rb }
  const b2 = { x: b.x - nx * rb, y: b.y - ny * rb }
  const end = endCap === 'round' ? `A${rb} ${rb} 0 0 0 ${at(b2)}` : `L${at(b2)}`
  const start = startCap === 'round' ? `A${ra} ${ra} 0 0 0 ${at(a1)}` : `L${at(a1)}`
  return `M${at(a1)} L${at(b1)} ${end} L${at(a2)} ${start}Z`
}

export function createRig(bodyType) {
  const body = BODY_PRESETS[bodyType] ?? BODY_PRESETS.neutral
  const { shoulder, hip, armWidth, leg } = body
  const radius = armWidth / 2
  return {
    ...body,
    neckBaseY: shoulder.y - 2,
    arms: SIDES.map((side) => {
      const from = { x: CX + side * (shoulder.half - radius + 1), y: shoulder.y + radius + 3 }
      return { side, from, to: { x: from.x + side * 3, y: shoulder.y + 74 } }
    }),
    legs: SIDES.map((side) => ({
      side,
      from: { x: CX + side * leg.offset, y: hip.y - 6 },
      to: { x: CX + side * leg.offset, y: ANKLE_Y },
    })),
  }
}

export function headPath({ cy, rx, ry, jaw: [w, d] }) {
  return `M${xy(CX - rx, cy)} A${rx} ${ry} 0 0 1 ${xy(CX + rx, cy)} `
    + `C${xy(CX + rx, cy + ry * d)} ${xy(CX + rx * w, cy + ry)} ${xy(CX, cy + ry)} `
    + `C${xy(CX - rx * w, cy + ry)} ${xy(CX - rx, cy + ry * d)} ${xy(CX - rx, cy)}Z`
}

/** Neck flares into the shoulders and reaches below the neckline. */
export function neckPath(rig, depth) {
  const nh = rig.neckHalf
  const flare = nh + 5
  const base = rig.neckBaseY
  const bottom = base + depth + 3
  return `M${xy(CX - nh, rig.head.cy)} L${xy(CX - nh, base - 8)} Q${xy(CX - nh, base - 3)} ${xy(CX - flare, base)} `
    + `L${xy(CX - flare, bottom)} L${xy(CX + flare, bottom)} L${xy(CX + flare, base)} `
    + `Q${xy(CX + nh, base - 3)} ${xy(CX + nh, base - 8)} L${xy(CX + nh, rig.head.cy)}Z`
}

/** Right-hand outline of a garment, from the neck down to the hem. Sleeveless tops get shoulder straps. */
export function torsoProfile(rig, { ease, hemY, tank = false }) {
  const { shoulder, chest, waist, hip, neckHalf } = rig
  const base = rig.neckBaseY
  const top = tank
    ? [{ x: CX + neckHalf + 5, y: base }, { x: CX + neckHalf + 15, y: base + 3 }, { x: CX + chest.half - 4 + ease, y: shoulder.y + 17 }]
    : [{ x: CX + neckHalf + 5, y: base }, { x: CX + shoulder.half + ease, y: shoulder.y + 5 }]
  return [
    ...top,
    { x: CX + chest.half + ease, y: chest.y },
    { x: CX + waist.half + ease, y: waist.y },
    { x: CX + hip.half + ease, y: hip.y },
    { x: CX + hip.half + ease + 1, y: hemY },
  ]
}

export function torsoPath(rig, { ease, hemY, neckDepth, tank = false }) {
  const right = torsoProfile(rig, { ease, hemY, tank })
  const left = right.map(mirror).reverse()
  return `M${at(right[0])} ${spline(right)} L${at(left[0])} ${spline(left)} Q${xy(CX, rig.neckBaseY + 2 * neckDepth)} ${at(right[0])}Z`
}

export function necklinePath(rig, depth) {
  const y = rig.neckBaseY
  const w = rig.neckHalf + 5
  return `M${xy(CX - w, y)} Q${xy(CX, y + 2 * depth)} ${xy(CX + w, y)}`
}
