import { shade, tone } from '../../utils/color'
import { circle, ellipse, path, rect } from './shapes'
import {
  ANKLE_Y, CX, GROUND_Y, SIDES, at, lerp, limb, mirror, necklinePath, spline, torsoPath, torsoProfile, xy,
} from './avatarRig'

/**
 * Clothing, shoes and bags. Every builder gets the body rig plus the item's
 * style numbers and colour, and returns plain shapes (see shapes.js).
 */

// --- Tops ----------------------------------------------------------------------

export function buildTop(rig, style, color) {
  const c = tone(color)
  const { kind, sleeve, ease, hem, depth } = style
  const hemY = rig.hip.y + hem
  const base = rig.neckBaseY
  const nh = rig.neckHalf
  const d = torsoPath(rig, { ease, hemY, neckDepth: depth, tank: sleeve === 0 })
  const neckline = path(necklinePath(rig, depth), { stroke: c.deep, sw: kind === 'sweater' ? 5 : 3, op: 0.9 })
  const detail = []
  const back = []

  if (kind === 'stripe') {
    for (let y = base + 8; y < hemY; y += 13) detail.push(rect(0, y, 240, 5, { fill: '#ffffff', op: 0.55 }))
  } else if (kind === 'sweater') {
    detail.push(rect(0, hemY - 8, 240, 9, { fill: c.dark }))
    for (let x = CX - 60; x < CX + 60; x += 6) detail.push(path(`M${x} ${hemY - 8} V${hemY}`, { stroke: c.deep, sw: 1, op: 0.45 }))
  } else if (kind === 'shirt') {
    const flap = (s) => path(`M${xy(CX + s * (nh + 6), base - 6)} L${xy(CX + s, base - 3)} L${xy(CX + s * nh * 0.4, base + 15)}Z`, { fill: c.light, stroke: c.deep, sw: 1.2 })
    detail.push(path(`M${xy(CX, base + 12)} V${hemY}`, { stroke: c.deep, sw: 1.3, op: 0.7 }))
    for (let y = base + 22; y < hemY - 6; y += 15) detail.push(circle(CX, y, 1.7, { fill: c.deep }))
    detail.push(flap(-1), flap(1))
  } else if (kind === 'hoodie') {
    detail.push(path(`M${xy(CX - 5, base + depth + 1)} h10 V${hemY - 5} h-10Z`, { fill: c.pale }))
    detail.push(path(`M${xy(CX, base + depth + 1)} V${hemY - 5}`, { stroke: c.deep, sw: 2 }))
    detail.push(circle(CX, base + depth + 10, 2, { fill: c.deep }))
    for (const s of SIDES) {
      detail.push(path(`M${xy(CX + s * 6.5, base + depth + 3)} L${xy(CX + s * 7.5, base + depth + 21)}`, { stroke: c.pale, sw: 2 }))
      detail.push(path(`M${xy(CX + s * rig.hip.half * 0.4, hemY - 15)} L${xy(CX + s * rig.hip.half * 0.8, hemY - 29)}`, { stroke: c.deep, sw: 1.6, op: 0.8 }))
    }
    detail.push(rect(0, hemY - 5, 240, 6, { fill: c.dark }))
    neckline.stroke = c.dark
    neckline.sw = 6
    back.push(path(`M${xy(CX - nh - 11, base + 6)} Q${xy(CX - nh - 11, base - 14)} ${xy(CX, base - 14)} Q${xy(CX + nh + 11, base - 14)} ${xy(CX + nh + 11, base + 6)}Z`, { fill: c.dark, stroke: c.deep, sw: 1.4 }))
  }

  return {
    d,
    outline: [path(d, { fill: `g:${c.base}`, stroke: c.deep, sw: 1.2 })],
    detail: [...detail, neckline],
    back,
    depth,
    sleeve: sleeve ? { t: sleeve, ease, cuff: ['hoodie', 'sweater', 'shirt'].includes(kind) } : null,
  }
}

export function sleeveShapes(rig, arm, { t, ease, cuff }, color) {
  const c = tone(color)
  const from = arm.from
  const end = lerp(from, arm.to, t)
  const shapes = [path(limb(from, end, rig.armWidth + 2 * ease, rig.armWidth * 0.95 + 2 * ease, { endCap: 'flat' }), { fill: `g:${c.base}`, stroke: c.deep, sw: 1.1 })]
  if (cuff) {
    const w = rig.armWidth * 0.8 + 4
    shapes.push(path(limb(lerp(from, arm.to, t - 0.07), lerp(from, arm.to, t + 0.02), w, w, { startCap: 'flat', endCap: 'flat' }), { fill: c.dark, stroke: c.deep, sw: 1 }))
  }
  return shapes
}

// --- Outerwear: two panels with an opening so the layer underneath shows -------------

export function buildOuter(rig, style, color) {
  const c = tone(color)
  const { kind, ease, hem, gap, vDrop } = style
  const hemY = rig.hip.y + hem
  const base = rig.neckBaseY
  const nh = rig.neckHalf
  const vY = rig.chest.y + vDrop
  const right = torsoProfile(rig, { ease, hemY, tank: kind === 'vest' })
  const left = right.map(mirror)
  const panel = (pts, s) => `M${at(pts[0])} ${spline(pts)} L${xy(CX + s * gap, hemY)} L${xy(CX + s * gap, vY)} L${xy(CX + s * (nh + 4), base + 2)}Z`
  const panels = [panel(right, 1), panel(left, -1)]

  const shapes = panels.map((d) => path(d, { fill: `g:${c.base}`, stroke: c.deep, sw: 1.3 }))
  const detail = []
  for (const s of SIDES) {
    if (kind === 'blazer') {
      detail.push(path(`M${xy(CX + s * (nh + 4), base + 1)} L${xy(CX + s * gap, vY)} L${xy(CX + s * (gap + 13), vY - 17)} L${xy(CX + s * (nh + 19), base + 9)}Z`, { fill: c.light, stroke: c.deep, sw: 1.2 }))
      detail.push(path(`M${xy(CX + s * rig.hip.half * 0.45, hemY - 17)} h${s * 18}`, { stroke: c.deep, sw: 1.6 }))
    } else if (kind === 'jacket') {
      detail.push(path(`M${xy(CX + s * (nh + 4), base + 1)} L${xy(CX + s * gap, vY)} L${xy(CX + s * (gap + 9), vY - 9)} L${xy(CX + s * (nh + 14), base + 5)}Z`, { fill: c.light, stroke: c.deep, sw: 1.2 }))
      detail.push(path(`M${xy(CX + s * (rig.chest.half * 0.3), rig.chest.y + 6)} h${s * 16} v10 h${-s * 16}Z`, { stroke: c.deep, sw: 1.2, op: 0.7 }))
      detail.push(rect(CX + s * (rig.hip.half + ease) - (s > 0 ? 9 : 0), hemY - 7, 9, 8, { fill: c.dark }))
    } else {
      detail.push(path(`M${xy(CX + s * rig.hip.half * 0.5, hemY - 16)} h${s * 14}`, { stroke: c.deep, sw: 1.5 }))
    }
  }
  const buttons = kind === 'jacket' ? 3 : 2
  for (let i = 0; i < buttons; i++) detail.push(circle(CX + gap + 5, vY + 6 + i * 16, 1.8, { fill: c.deep }))

  return {
    panels,
    shapes,
    detail,
    sleeve: style.sleeve ? { t: style.sleeve, ease, cuff: false } : null,
  }
}

// --- Bottoms ---------------------------------------------------------------------

export function buildBottom(rig, style, color) {
  const c = tone(color)
  const { kind } = style
  if (kind === 'skirt') return buildSkirt(rig, style, c)

  const { topWidth, ankleWidth } = rig.leg
  const widthAt = (t) => topWidth + (ankleWidth - topWidth) * t
  const legs = rig.legs.map(({ from, to }) => limb(from, lerp(from, to, style.reach), topWidth * style.width, widthAt(style.reach) * style.width, { endCap: 'flat' }))
  const shapes = legs.map((d) => path(d, { fill: `g:${c.base}`, stroke: c.deep, sw: 1 }))
  const detail = []
  rig.legs.forEach((leg) => {
    const endY = lerp(leg.from, leg.to, style.reach).y
    if (kind === 'trousers') detail.push(path(`M${xy(leg.from.x, rig.hip.y + 22)} L${xy(leg.to.x, endY)}`, { stroke: c.deep, sw: 1.4, op: 0.45 }))
    if (kind === 'jeans') {
      const s = leg.side
      detail.push(path(`M${xy(leg.from.x + s * (topWidth * 0.5 - 2), rig.hip.y + 8)} L${xy(leg.to.x + s * (ankleWidth * 0.5 - 1.5), endY)}`, { stroke: c.pale, sw: 1.1, dash: '3 2.5', op: 0.8 }))
    }
    if (kind === 'shorts') detail.push(path(`M${xy(leg.from.x - topWidth * 0.55, endY - 4)} h${topWidth * 1.1}`, { stroke: c.deep, sw: 1.4, op: 0.5 }))
  })
  const hemY = kind === 'shorts' ? lerp(rig.legs[0].from, rig.legs[0].to, style.reach).y : null
  return { clips: legs, shapes, detail, hemShadow: hemY ? { y: hemY, rx: topWidth * 0.6 } : null }
}

function buildSkirt(rig, style, c) {
  const { waist, hip } = rig
  const hemY = hip.y + style.hem
  const waistY = waist.y + 3
  const right = [
    { x: CX + waist.half + 2, y: waistY },
    { x: CX + hip.half + 3, y: hip.y },
    { x: CX + hip.half + style.flare, y: hemY },
  ]
  const left = right.map(mirror).reverse()
  const d = `M${at(right[0])} ${spline(right)} Q${xy(CX, hemY + 9)} ${at(left[0])} ${spline(left)}Z`
  const shapes = [path(d, { fill: `g:${c.base}`, stroke: c.deep, sw: 1.2 })]
  const detail = [rect(0, waistY - 1, 240, 6, { fill: c.dark })]
  if (style.pleats) {
    for (let i = -5; i <= 5; i++) detail.push(path(`M${xy(CX + (i * (waist.half + 2)) / 5.5, waistY + 5)} L${xy(CX + (i * (hip.half + style.flare)) / 5.5, hemY + 4)}`, { stroke: c.deep, sw: 1.2, op: 0.35 }))
  } else {
    detail.push(path(`M${xy(CX, waistY + 5)} V${hemY}`, { stroke: c.deep, sw: 1, op: 0.25 }))
  }
  return { clips: [d], shapes, detail, hemShadow: { y: hemY + 4, rx: hip.half + style.flare - 4 } }
}

// --- Neckwear --------------------------------------------------------------------

/** inner = tie and bow tie (worn under a jacket); outer = scarf (worn over everything). */
export function buildNeckwear(rig, style, color, neckDepth) {
  const c = tone(color)
  const y0 = rig.neckBaseY + neckDepth + 1
  if (style.kind === 'tie') {
    const end = rig.waist.y + 8
    return { layer: 'inner', shapes: [
      path(`M${xy(CX - 5, y0 - 1)} L${xy(CX + 5, y0 - 1)} L${xy(CX + 3.8, y0 + 7)} L${xy(CX - 3.8, y0 + 7)}Z`, { fill: c.dark, stroke: c.deep, sw: 1 }),
      path(`M${xy(CX - 3.8, y0 + 6)} L${xy(CX + 3.8, y0 + 6)} L${xy(CX + 8, y0 + 32)} L${xy(CX, end)} L${xy(CX - 8, y0 + 32)}Z`, { fill: `g:${c.base}`, stroke: c.deep, sw: 1 }),
      path(`M${xy(CX - 6, y0 + 24)} L${xy(CX + 6, y0 + 20)}`, { stroke: c.pale, sw: 1.6, op: 0.6 }),
    ] }
  }
  if (style.kind === 'bowtie') {
    return { layer: 'inner', shapes: [
      path(`M${xy(CX, y0 + 3)} L${xy(CX - 13, y0 - 4)} L${xy(CX - 13, y0 + 10)}Z`, { fill: `g:${c.base}`, stroke: c.deep, sw: 1 }),
      path(`M${xy(CX, y0 + 3)} L${xy(CX + 13, y0 - 4)} L${xy(CX + 13, y0 + 10)}Z`, { fill: `g:${c.base}`, stroke: c.deep, sw: 1 }),
      rect(CX - 3.5, y0 - 1, 7, 8, { rx: 2.5, fill: c.dark, stroke: c.deep, sw: 1 }),
    ] }
  }
  const w = rig.neckHalf + 9
  const by = rig.neckBaseY
  return { layer: 'outer', shapes: [
    path(`M${xy(CX + 9, by + 8)} L${xy(CX + 20, by + 8)} L${xy(CX + 22, rig.chest.y + 34)} L${xy(CX + 10, rig.chest.y + 34)}Z`, { fill: `g:${c.base}`, stroke: c.deep, sw: 1.2 }),
    path(`M${xy(CX + 10, rig.chest.y + 26)} h12`, { stroke: c.pale, sw: 2, op: 0.7 }),
    path(`M${xy(CX - w, by - 3)} Q${xy(CX, by + 20)} ${xy(CX + w, by - 3)}`, { stroke: c.deep, sw: 14 }),
    path(`M${xy(CX - w, by - 3)} Q${xy(CX, by + 20)} ${xy(CX + w, by - 3)}`, { stroke: c.base, sw: 11 }),
    path(`M${xy(CX - w + 4, by + 3)} Q${xy(CX, by + 22)} ${xy(CX + w - 4, by + 3)}`, { stroke: c.pale, sw: 2, op: 0.5 }),
  ] }
}

// --- Shoes -----------------------------------------------------------------------

export function buildShoes(rig, style, color) {
  const c = tone(color)
  const { leg } = rig
  const kind = style.kind
  const boots = kind === 'boots'
  const top = boots ? ANKLE_Y - 26 : ANKLE_Y - 7
  const bottom = GROUND_Y
  const mid = boots ? ANKLE_Y - 1 : top + 12
  const shapes = []
  for (const side of SIDES) {
    const ax = CX + side * leg.offset
    const th = leg.ankleWidth / 2 + 1
    const bh = Math.min(th + (kind === 'leather' ? 4 : 5), leg.offset - 0.5)
    const body = `M${xy(ax - th, top)} L${xy(ax + th, top)} L${xy(ax + bh - 1, mid)} Q${xy(ax + bh + 2, bottom - 4)} ${xy(ax + bh - 4, bottom)} `
      + `L${xy(ax - bh + 4, bottom)} Q${xy(ax - bh - 2, bottom - 4)} ${xy(ax - bh + 1, mid)}Z`
    if (kind === 'sandals') {
      shapes.push(path(body, { fill: '#eeb596' }))
      shapes.push(path(`M${xy(ax - bh + 3, bottom - 2.5)} L${xy(ax + bh - 3, bottom - 2.5)}`, { stroke: c.deep, sw: 5 }))
      shapes.push(path(`M${xy(ax - bh + 1, mid + 2)} L${xy(ax + bh - 1, mid + 2)} M${xy(ax - bh + 2, mid + 11)} L${xy(ax + bh - 2, mid + 11)}`, { stroke: c.base, sw: 3.2 }))
      for (const dx of [-5, 0, 5]) shapes.push(circle(ax + dx, bottom - 6, 2.2, { fill: '#e0a283' }))
      continue
    }
    shapes.push(path(body, { fill: `g:${c.base}`, stroke: c.deep, sw: 1.4 }))
    if (kind === 'sneakers') {
      shapes.push(path(`M${xy(ax - bh + 3.5, bottom - 2.5)} L${xy(ax + bh - 3.5, bottom - 2.5)}`, { stroke: '#f7f0ff', sw: 4.5 }))
      shapes.push(path(`M${xy(ax - side * 4, top + 7)} L${xy(ax + side * 4, top + 14)}`, { stroke: '#e6dcff', sw: 2 }))
    } else if (kind === 'leather') {
      shapes.push(ellipse(ax + side * 1.5, bottom - 10, bh - 5, 4, { fill: '#ffffff', op: 0.22 }))
      shapes.push(path(`M${xy(ax - bh + 3, bottom - 1.5)} L${xy(ax + bh - 3, bottom - 1.5)}`, { stroke: c.deep, sw: 3.4 }))
    } else if (boots) {
      shapes.push(path(`M${xy(ax - th, top + 4)} h${th * 2}`, { stroke: c.deep, sw: 3, op: 0.5 }))
      shapes.push(path(`M${xy(ax - bh + 3, bottom - 2.5)} L${xy(ax + bh - 3, bottom - 2.5)}`, { stroke: c.deep, sw: 4 }))
    }
  }
  return { shapes, overPants: boots }
}

// --- Bags ------------------------------------------------------------------------

export function buildBag(rig, style, color) {
  const c = tone(color)
  const { shoulder, chest, waist, hip, neckHalf } = rig
  if (style.kind === 'backpack') {
    const half = chest.half + 8
    const top = shoulder.y - 8
    const bottom = waist.y + 14
    const body = `M${xy(CX - half, top + 12)} Q${xy(CX - half, top)} ${xy(CX - half + 12, top)} L${xy(CX + half - 12, top)} `
      + `Q${xy(CX + half, top)} ${xy(CX + half, top + 12)} L${xy(CX + half + 1, bottom - 8)} `
      + `Q${xy(CX + half + 1, bottom)} ${xy(CX + half - 8, bottom)} L${xy(CX - half + 8, bottom)} `
      + `Q${xy(CX - half - 1, bottom)} ${xy(CX - half - 1, bottom - 8)}Z`
    return {
      back: [
        path(body, { fill: `g:${c.base}`, stroke: c.deep, sw: 2 }),
        ...SIDES.map((s) => path(`M${xy(CX + s * (half - 3.5), top + 14)} L${xy(CX + s * (half - 3.5), bottom - 10)}`, { stroke: '#ffd66f', sw: 1.6, dash: '3 3', op: 0.75 })),
      ],
      front: SIDES.flatMap((s) => {
        const d = `M${xy(CX + s * (neckHalf + 11), shoulder.y + 2)} C${xy(CX + s * (neckHalf + 15), shoulder.y + 16)} ${xy(CX + s * (chest.half - 1), chest.y - 4)} ${xy(CX + s * (chest.half - 3), chest.y + 16)}`
        return [path(d, { stroke: c.deep, sw: 5 }), path(d, { stroke: c.light, sw: 1.6 })]
      }),
    }
  }
  // Shoulder bag: strap crosses the chest, the bag rests on the opposite hip.
  const bx = CX - (hip.half - 3)
  const by = hip.y - 2
  const strap = `M${xy(CX + neckHalf + 9, shoulder.y + 1)} L${xy(bx + 8, by + 4)}`
  return {
    back: [],
    front: [
      path(strap, { stroke: c.deep, sw: 5.5 }),
      path(strap, { stroke: c.base, sw: 3.4 }),
      rect(bx - 16, by, 32, 30, { rx: 6, fill: `g:${c.base}`, stroke: c.deep, sw: 1.6 }),
      path(`M${xy(bx - 16, by + 6)} Q${xy(bx, by + 18)} ${xy(bx + 16, by + 6)} V${by} h-32Z`, { fill: c.dark, stroke: c.deep, sw: 1.4 }),
      circle(bx, by + 14, 2.2, { fill: c.pale }),
    ],
  }
}
