import { ANKLE_Y, BODY_PRESETS, CENTER_X as CX, GROUND_Y } from './avatarBodies'

/**
 * Pure geometry for the avatar. Everything is derived from a body preset:
 *  - limbs and sleeves share the same centre line, so clothes wrap the body
 *  - garments are the body profile plus an "ease" offset
 *  - caps, headphones and hair are anchored to the head ellipse
 * No Vue code in here, which keeps the maths easy to test.
 */

const KAPPA = 0.5523 // Bezier constant for a quarter ellipse
const SIDES = [-1, 1]

const round = (v) => Math.round(v * 100) / 100
const xy = (x, y) => `${round(x)} ${round(y)}`
const at = (p) => xy(p.x, p.y)
const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
const mirror = (p) => ({ x: 2 * CX - p.x, y: p.y })

let uidCounter = 0
export const nextUid = () => `avatar-${uidCounter++}`

const GARMENTS = {
  tee: { ease: 1.5, hemOffset: 9, neckDepth: 6, sleeveLength: 0.34 },
  hoodie: { ease: 3.5, hemOffset: 15, neckDepth: 3, sleeveLength: 0.9 },
}

/** Catmull-Rom spline through points, returned as cubic Bezier segments. */
function spline(points, tension = 0.5) {
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
function limb(a, b, widthA, widthB, { startCap = 'round', endCap = 'round' } = {}) {
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

function createRig(body) {
  const { head, shoulder, hip, armWidth, leg } = body
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
    head,
  }
}

function headPath({ cy, rx, ry, jaw: [w, d] }) {
  return `M${xy(CX - rx, cy)} A${rx} ${ry} 0 0 1 ${xy(CX + rx, cy)} `
    + `C${xy(CX + rx, cy + ry * d)} ${xy(CX + rx * w, cy + ry)} ${xy(CX, cy + ry)} `
    + `C${xy(CX - rx * w, cy + ry)} ${xy(CX - rx, cy + ry * d)} ${xy(CX - rx, cy)}Z`
}

/** Neck flares into the shoulders and reaches below the neckline. */
function neckPath(rig, depth) {
  const nh = rig.neckHalf
  const flare = nh + 5
  const base = rig.neckBaseY
  const bottom = base + depth + 3
  return `M${xy(CX - nh, rig.head.cy)} L${xy(CX - nh, base - 8)} Q${xy(CX - nh, base - 3)} ${xy(CX - flare, base)} `
    + `L${xy(CX - flare, bottom)} L${xy(CX + flare, bottom)} L${xy(CX + flare, base)} `
    + `Q${xy(CX + nh, base - 3)} ${xy(CX + nh, base - 8)} L${xy(CX + nh, rig.head.cy)}Z`
}

/** Garment silhouette: body profile pushed outwards by `ease`. */
function torsoPath(rig, { ease, hemY, neckDepth }) {
  const { shoulder, chest, waist, hip, neckHalf } = rig
  const right = [
    { x: CX + neckHalf + 5, y: rig.neckBaseY },
    { x: CX + shoulder.half + ease, y: shoulder.y + 5 },
    { x: CX + chest.half + ease, y: chest.y },
    { x: CX + waist.half + ease, y: waist.y },
    { x: CX + hip.half + ease, y: hip.y },
    { x: CX + hip.half + ease + 1, y: hemY },
  ]
  const left = right.map(mirror).reverse()
  const neckline = xy(CX, rig.neckBaseY + 2 * neckDepth)
  return `M${at(right[0])} ${spline(right)} L${at(left[0])} ${spline(left)} Q${neckline} ${at(right[0])}Z`
}

function necklinePath(rig, depth) {
  const y = rig.neckBaseY
  const w = rig.neckHalf + 5
  return `M${xy(CX - w, y)} Q${xy(CX, y + 2 * depth)} ${xy(CX + w, y)}`
}

function faceShapes({ head, face }) {
  const eyeY = head.cy + head.ry * 0.14
  const eyeDX = head.rx * 0.42
  const mouthY = head.cy + head.ry * 0.52
  const noseY = head.cy + head.ry * 0.33
  return {
    eyes: SIDES.map((s) => ({ cx: CX + s * eyeDX, cy: eyeY, rx: face.eye[0], ry: face.eye[1] })),
    brows: SIDES.map((s) => `M${xy(CX + s * (eyeDX + 4.5), eyeY - 7)} Q${xy(CX + s * eyeDX, eyeY - 10)} ${xy(CX + s * (eyeDX - 4.5), eyeY - 7.5)}`),
    lashes: face.lashes
      ? SIDES.map((s) => `M${xy(CX + s * (eyeDX + 3.2), eyeY - 2.5)} L${xy(CX + s * (eyeDX + 6), eyeY - 5)}`)
      : [],
    browWidth: face.brow,
    mouth: `M${xy(CX - 6, mouthY)} Q${xy(CX, mouthY + 4)} ${xy(CX + 6, mouthY)}`,
    nose: `M${xy(CX - 3.5, noseY)} Q${xy(CX, noseY + 3)} ${xy(CX + 3.5, noseY)}`,
    blush: SIDES.map((s) => ({ cx: CX + s * head.rx * 0.55, cy: head.cy + head.ry * 0.38 })),
  }
}

function hairPaths({ head, hair, shoulder }) {
  const { cy, rx, ry } = head
  const top = cy - ry
  const side = (n) => CX - n
  const R = (n) => CX + n

  if (hair === 'long') {
    const w = rx + 5
    const end = shoulder.y + 24
    return {
      back: `M${xy(side(w), cy + 2)} C${xy(side(w + 3), cy - ry * 0.95)} ${xy(side(rx * 0.7), top - 6)} ${xy(CX, top - 4)} `
        + `C${xy(R(rx * 0.7), top - 6)} ${xy(R(w + 3), cy - ry * 0.95)} ${xy(R(w), cy + 2)} `
        + `C${xy(R(w + 4), cy + 30)} ${xy(R(w + 6), end - 14)} ${xy(R(w + 2), end)} `
        + `Q${xy(R(w - 6), end + 5)} ${xy(R(w - 14), end - 2)} L${xy(side(w - 14), end - 2)} `
        + `Q${xy(side(w - 6), end + 5)} ${xy(side(w + 2), end)} `
        + `C${xy(side(w + 6), end - 14)} ${xy(side(w + 4), cy + 30)} ${xy(side(w), cy + 2)}Z`,
      front: `M${xy(side(rx + 1), cy + 2)} C${xy(side(rx + 2), top + 4)} ${xy(side(rx * 0.6), top - 4)} ${xy(CX, top - 3)} `
        + `C${xy(R(rx * 0.6), top - 4)} ${xy(R(rx + 2), top + 4)} ${xy(R(rx + 1), cy + 2)} `
        + `C${xy(R(rx * 0.9), cy - ry * 0.35)} ${xy(R(rx * 0.7), cy - ry * 0.55)} ${xy(R(rx * 0.35), cy - ry * 0.6)} `
        + `C${xy(CX, cy - ry * 0.48)} ${xy(side(rx * 0.5), cy - ry * 0.22)} ${xy(side(rx + 1), cy + 2)}Z`,
    }
  }

  if (hair === 'short') {
    const w = rx + 2.5
    return {
      back: null,
      front: `M${xy(side(w), cy + 3)} C${xy(side(w + 1), top + 6)} ${xy(side(rx * 0.75), top - 5)} ${xy(CX, top - 4)} `
        + `C${xy(R(rx * 0.75), top - 5)} ${xy(R(w + 1), top + 6)} ${xy(R(w), cy + 3)} `
        + `L${xy(R(rx - 3), cy - 4)} L${xy(R(rx * 0.62), cy - ry * 0.5)} L${xy(R(rx * 0.2), cy - ry * 0.64)} `
        + `L${xy(side(rx * 0.25), cy - ry * 0.52)} L${xy(side(rx * 0.65), cy - ry * 0.6)} L${xy(side(rx - 3), cy - 4)}Z`,
    }
  }

  const w = rx + 6
  return {
    back: `M${xy(side(w), cy)} C${xy(side(w + 2), top + 2)} ${xy(side(rx * 0.7), top - 6)} ${xy(CX, top - 4)} `
      + `C${xy(R(rx * 0.7), top - 6)} ${xy(R(w + 2), top + 2)} ${xy(R(w), cy)} `
      + `C${xy(R(w + 3), cy + 14)} ${xy(R(w + 1), cy + ry * 0.8)} ${xy(R(w - 4), cy + ry * 0.9)} `
      + `L${xy(side(w - 4), cy + ry * 0.9)} C${xy(side(w + 1), cy + ry * 0.8)} ${xy(side(w + 3), cy + 14)} ${xy(side(w), cy)}Z`,
    front: `M${xy(side(rx + 1), cy + 1)} C${xy(side(rx + 2), top + 4)} ${xy(side(rx * 0.6), top - 4)} ${xy(CX, top - 3)} `
      + `C${xy(R(rx * 0.6), top - 4)} ${xy(R(rx + 2), top + 4)} ${xy(R(rx + 1), cy + 1)} `
      + `Q${xy(R(rx * 0.78), cy - ry * 0.2)} ${xy(R(rx * 0.5), cy - ry * 0.52)} `
      + `Q${xy(R(rx * 0.2), cy - ry * 0.72)} ${xy(CX, cy - ry * 0.7)} `
      + `Q${xy(side(rx * 0.2), cy - ry * 0.72)} ${xy(side(rx * 0.5), cy - ry * 0.52)} `
      + `Q${xy(side(rx * 0.78), cy - ry * 0.2)} ${xy(side(rx + 1), cy + 1)}Z`,
  }
}

function capShapes({ head }) {
  const a = head.rx + 3.5
  const top = head.cy - head.ry - 9
  const edge = head.cy - head.ry * 0.44
  const h = edge - top
  return {
    edge,
    halfWidth: a,
    dome: `M${xy(CX - a, edge)} C${xy(CX - a, edge - h * KAPPA)} ${xy(CX - a * KAPPA, top)} ${xy(CX, top)} `
      + `C${xy(CX + a * KAPPA, top)} ${xy(CX + a, edge - h * KAPPA)} ${xy(CX + a, edge)} Q${xy(CX, edge + 5)} ${xy(CX - a, edge)}Z`,
    brim: `M${xy(CX - a - 1, edge)} Q${xy(CX, edge + 5)} ${xy(CX + a + 1, edge)} `
      + `C${xy(CX + a + 3, edge + 6)} ${xy(CX + a * 0.55, edge + 11)} ${xy(CX, edge + 11)} `
      + `C${xy(CX - a * 0.55, edge + 11)} ${xy(CX - a - 3, edge + 6)} ${xy(CX - a - 1, edge)}Z`,
    seams: `M${xy(CX, top + 2)} L${xy(CX, edge + 2.5)} `
      + SIDES.map((s) => `M${xy(CX, top + 3)} Q${xy(CX + s * a * 0.7, top + h * 0.35)} ${xy(CX + s * a * 0.85, edge + 1)}`).join(' '),
    button: { cx: CX, cy: top + 1.5 },
  }
}

function headphoneShapes({ head }, hasCap) {
  const lift = hasCap ? 12 : 7
  const bandRx = head.rx + 6
  const bandRy = head.ry + 4 + lift
  const y = head.cy + 4
  return {
    band: `M${xy(CX - bandRx, y)} A${bandRx} ${bandRy} 0 0 1 ${xy(CX + bandRx, y)}`,
    cups: SIDES.map((s) => ({ x: CX + s * (head.rx + 5) - 6.5, y: head.cy - 4, w: 13, h: 24 })),
  }
}

function backpackShapes({ shoulder, chest, waist, neckHalf }) {
  const half = chest.half + 8
  const top = shoulder.y - 8
  const bottom = waist.y + 14
  return {
    body: `M${xy(CX - half, top + 12)} Q${xy(CX - half, top)} ${xy(CX - half + 12, top)} L${xy(CX + half - 12, top)} `
      + `Q${xy(CX + half, top)} ${xy(CX + half, top + 12)} L${xy(CX + half + 1, bottom - 8)} `
      + `Q${xy(CX + half + 1, bottom)} ${xy(CX + half - 8, bottom)} L${xy(CX - half + 8, bottom)} `
      + `Q${xy(CX - half - 1, bottom)} ${xy(CX - half - 1, bottom - 8)}Z`,
    seams: SIDES.map((s) => `M${xy(CX + s * (half - 3.5), top + 14)} L${xy(CX + s * (half - 3.5), bottom - 10)}`).join(' '),
    straps: SIDES.map((s) => `M${xy(CX + s * (neckHalf + 11), shoulder.y + 2)} `
      + `C${xy(CX + s * (neckHalf + 15), shoulder.y + 16)} ${xy(CX + s * (chest.half - 1), chest.y - 4)} ${xy(CX + s * (chest.half - 3), chest.y + 16)}`),
  }
}

function shoeShapes(rig, sneaker) {
  const { leg } = rig
  const top = ANKLE_Y - 7
  const bottom = GROUND_Y
  const mid = top + 12
  return SIDES.map((side) => {
    const ax = CX + side * leg.offset
    const th = leg.ankleWidth / 2 + 1
    const bh = Math.min(th + 5, leg.offset - 0.5)
    return {
      side,
      body: `M${xy(ax - th, top)} L${xy(ax + th, top)} L${xy(ax + bh - 1, mid)} Q${xy(ax + bh + 2, bottom - 4)} ${xy(ax + bh - 4, bottom)} `
        + `L${xy(ax - bh + 4, bottom)} Q${xy(ax - bh - 2, bottom - 4)} ${xy(ax - bh + 1, mid)}Z`,
      sole: sneaker ? `M${xy(ax - bh + 3.5, bottom - 2.5)} L${xy(ax + bh - 3.5, bottom - 2.5)}` : null,
      laces: sneaker ? `M${xy(ax - side * 4, top + 7)} L${xy(ax + side * 4, top + 14)}` : null,
    }
  })
}

function hoodieDetails(rig, { hemY, neckDepth }) {
  const { shoulder, hip } = rig
  const y = rig.neckBaseY
  const zipTop = y + neckDepth + 1
  return {
    hood: `M${xy(CX - rig.neckHalf - 11, y + 6)} Q${xy(CX - rig.neckHalf - 11, y - 14)} ${xy(CX, y - 14)} `
      + `Q${xy(CX + rig.neckHalf + 11, y - 14)} ${xy(CX + rig.neckHalf + 11, y + 6)}Z`,
    placket: `M${xy(CX - 5, zipTop)} L${xy(CX + 5, zipTop)} L${xy(CX + 5, hemY - 5)} L${xy(CX - 5, hemY - 5)}Z`,
    zipper: `M${xy(CX, zipTop)} L${xy(CX, hemY - 5)}`,
    pull: { cx: CX, cy: zipTop + 9 },
    strings: SIDES.map((s) => `M${xy(CX + s * 6.5, zipTop + 2)} L${xy(CX + s * 7.5, zipTop + 20)}`),
    pockets: SIDES.map((s) => `M${xy(CX + s * hip.half * 0.4, hemY - 15)} L${xy(CX + s * hip.half * 0.8, hemY - 29)}`),
    hem: { y: hemY - 5, height: 6 },
    shoulderY: shoulder.y,
  }
}

function petPlacement({ shoulder, hip }) {
  const x = CX + Math.max(shoulder.half, hip.half) + 12
  return { transform: `translate(${round(x)} ${round(GROUND_Y - 60 * 0.85 + 1)}) scale(0.85)` }
}

/** Builds the full scene description for one body type and outfit. */
export function buildFigure(bodyType, worn = {}) {
  const rig = createRig(BODY_PRESETS[bodyType] ?? BODY_PRESETS.neutral)
  const kind = worn.clothing ? 'hoodie' : 'tee'
  const garment = { ...GARMENTS[kind], hemY: rig.hip.y + GARMENTS[kind].hemOffset }
  const { ease, sleeveLength } = garment
  const radius = rig.armWidth / 2

  const arms = rig.arms.map(({ side, from, to }) => {
    const sleeveEnd = lerp(from, to, sleeveLength)
    const sleeveStartW = rig.armWidth + 2 * ease
    const sleeveEndW = rig.armWidth * 0.95 + 2 * ease
    return {
      side,
      skin: limb(from, to, rig.armWidth, rig.armWidth * 0.8),
      hand: { cx: to.x, cy: to.y, r: radius },
      sleeve: limb(from, sleeveEnd, sleeveStartW, sleeveEndW, { endCap: 'flat' }),
      cuff: kind === 'hoodie'
        ? limb(lerp(from, to, sleeveLength - 0.07), lerp(from, to, sleeveLength + 0.03), rig.armWidth * 0.8 + 4, rig.armWidth * 0.8 + 4, { startCap: 'flat', endCap: 'flat' })
        : null,
    }
  })

  const details = kind === 'hoodie' ? hoodieDetails(rig, garment) : null

  return {
    rig,
    kind,
    ground: { cx: CX, cy: GROUND_Y - 1, rx: 52, ry: 5.5 },
    head: {
      path: headPath(rig.head),
      ears: SIDES.map((s) => ({ cx: CX + s * rig.head.rx, cy: rig.head.cy + 3, rx: 5, ry: 8 })),
    },
    neck: neckPath(rig, garment.neckDepth),
    neckShadow: { cx: CX, cy: rig.head.cy + rig.head.ry + 2, rx: rig.neckHalf + 8, ry: 9 },
    face: faceShapes(rig),
    hair: hairPaths(rig),
    torso: torsoPath(rig, garment),
    neckline: necklinePath(rig, garment.neckDepth),
    hemShadow: { cx: CX, cy: garment.hemY + 2, rx: rig.hip.half + 8, ry: 6 },
    details,
    arms,
    legs: rig.legs.map(({ side, from, to }) => ({
      side,
      path: limb(from, to, rig.leg.topWidth, rig.leg.ankleWidth, { endCap: 'flat' }),
    })),
    shoes: shoeShapes(rig, Boolean(worn.shoes)),
    sneakers: Boolean(worn.shoes),
    cap: worn.hat ? capShapes(rig) : null,
    headphones: worn.headphones ? headphoneShapes(rig, Boolean(worn.hat)) : null,
    backpack: worn.backpack ? backpackShapes(rig) : null,
    pet: worn.pet ? petPlacement(rig) : null,
  }
}
