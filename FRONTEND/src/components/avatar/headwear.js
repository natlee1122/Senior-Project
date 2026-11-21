import { shade, tone } from '../../utils/color'
import { circle, ellipse, path, rect } from './shapes'
import { CX, KAPPA, SIDES, xy } from './avatarRig'

/** Hair, face, hats, glasses and headphones, all anchored to the head ellipse. */

export const SKIN = '#eeb596'
export const MANNEQUIN = '#dfe5e2'

export function buildFace({ head, face }) {
  const eyeY = head.cy + head.ry * 0.14
  const eyeDX = head.rx * 0.42
  const mouthY = head.cy + head.ry * 0.52
  const noseY = head.cy + head.ry * 0.33
  const ink = '#382b2b'
  const shapes = SIDES.map((s) => ellipse(CX + s * head.rx * 0.55, head.cy + head.ry * 0.38, 5, 3.2, { fill: '#e57f84', op: 0.22 }))
  for (const s of SIDES) {
    shapes.push(ellipse(CX + s * eyeDX, eyeY, face.eye[0], face.eye[1], { fill: ink }))
    shapes.push(circle(CX + s * eyeDX + 1, eyeY - 1, 1, { fill: '#fff' }))
    shapes.push(path(`M${xy(CX + s * (eyeDX + 4.5), eyeY - 7)} Q${xy(CX + s * eyeDX, eyeY - 10)} ${xy(CX + s * (eyeDX - 4.5), eyeY - 7.5)}`, { stroke: '#49352f', sw: face.brow }))
    if (face.lashes) shapes.push(path(`M${xy(CX + s * (eyeDX + 3.2), eyeY - 2.5)} L${xy(CX + s * (eyeDX + 6), eyeY - 5)}`, { stroke: ink, sw: 1.6 }))
  }
  shapes.push(path(`M${xy(CX - 3.5, noseY)} Q${xy(CX, noseY + 3)} ${xy(CX + 3.5, noseY)}`, { stroke: '#cf8e74', sw: 1.5 }))
  shapes.push(path(`M${xy(CX - 6, mouthY)} Q${xy(CX, mouthY + 4)} ${xy(CX + 6, mouthY)}`, { stroke: '#a64e58', sw: 2.5 }))
  return { shapes, eyeY, eyeDX }
}

/** Returns { back, front } hair paths for a style: 'long', 'short' or 'medium'. */
export function hairPaths(rig, style) {
  const { cy, rx, ry } = rig.head
  const top = cy - ry
  const L = (n) => CX - n
  const R = (n) => CX + n

  if (style === 'long') {
    const w = rx + 5
    const end = rig.shoulder.y + 24
    return {
      back: `M${xy(L(w), cy + 2)} C${xy(L(w + 3), cy - ry * 0.95)} ${xy(L(rx * 0.7), top - 6)} ${xy(CX, top - 4)} `
        + `C${xy(R(rx * 0.7), top - 6)} ${xy(R(w + 3), cy - ry * 0.95)} ${xy(R(w), cy + 2)} `
        + `C${xy(R(w + 4), cy + 30)} ${xy(R(w + 6), end - 14)} ${xy(R(w + 2), end)} `
        + `Q${xy(R(w - 6), end + 5)} ${xy(R(w - 14), end - 2)} L${xy(L(w - 14), end - 2)} `
        + `Q${xy(L(w - 6), end + 5)} ${xy(L(w + 2), end)} `
        + `C${xy(L(w + 6), end - 14)} ${xy(L(w + 4), cy + 30)} ${xy(L(w), cy + 2)}Z`,
      front: `M${xy(L(rx + 1), cy + 2)} C${xy(L(rx + 2), top + 4)} ${xy(L(rx * 0.6), top - 4)} ${xy(CX, top - 3)} `
        + `C${xy(R(rx * 0.6), top - 4)} ${xy(R(rx + 2), top + 4)} ${xy(R(rx + 1), cy + 2)} `
        + `C${xy(R(rx * 0.9), cy - ry * 0.35)} ${xy(R(rx * 0.7), cy - ry * 0.55)} ${xy(R(rx * 0.35), cy - ry * 0.6)} `
        + `C${xy(CX, cy - ry * 0.48)} ${xy(L(rx * 0.5), cy - ry * 0.22)} ${xy(L(rx + 1), cy + 2)}Z`,
    }
  }

  if (style === 'short') {
    const w = rx + 2.5
    return {
      back: null,
      front: `M${xy(L(w), cy + 3)} C${xy(L(w + 1), top + 6)} ${xy(L(rx * 0.75), top - 5)} ${xy(CX, top - 4)} `
        + `C${xy(R(rx * 0.75), top - 5)} ${xy(R(w + 1), top + 6)} ${xy(R(w), cy + 3)} `
        + `L${xy(R(rx - 3), cy - 4)} L${xy(R(rx * 0.62), cy - ry * 0.5)} L${xy(R(rx * 0.2), cy - ry * 0.64)} `
        + `L${xy(L(rx * 0.25), cy - ry * 0.52)} L${xy(L(rx * 0.65), cy - ry * 0.6)} L${xy(L(rx - 3), cy - 4)}Z`,
    }
  }

  const w = rx + 6
  return {
    back: `M${xy(L(w), cy)} C${xy(L(w + 2), top + 2)} ${xy(L(rx * 0.7), top - 6)} ${xy(CX, top - 4)} `
      + `C${xy(R(rx * 0.7), top - 6)} ${xy(R(w + 2), top + 2)} ${xy(R(w), cy)} `
      + `C${xy(R(w + 3), cy + 14)} ${xy(R(w + 1), cy + ry * 0.8)} ${xy(R(w - 4), cy + ry * 0.9)} `
      + `L${xy(L(w - 4), cy + ry * 0.9)} C${xy(L(w + 1), cy + ry * 0.8)} ${xy(L(w + 3), cy + 14)} ${xy(L(w), cy)}Z`,
    front: `M${xy(L(rx + 1), cy + 1)} C${xy(L(rx + 2), top + 4)} ${xy(L(rx * 0.6), top - 4)} ${xy(CX, top - 3)} `
      + `C${xy(R(rx * 0.6), top - 4)} ${xy(R(rx + 2), top + 4)} ${xy(R(rx + 1), cy + 1)} `
      + `Q${xy(R(rx * 0.78), cy - ry * 0.2)} ${xy(R(rx * 0.5), cy - ry * 0.52)} `
      + `Q${xy(R(rx * 0.2), cy - ry * 0.72)} ${xy(CX, cy - ry * 0.7)} `
      + `Q${xy(L(rx * 0.2), cy - ry * 0.72)} ${xy(L(rx * 0.5), cy - ry * 0.52)} `
      + `Q${xy(L(rx * 0.78), cy - ry * 0.2)} ${xy(L(rx + 1), cy + 1)}Z`,
  }
}

/** Hats sit on the head; `shadow` is the soft shade they cast onto the forehead. */
export function buildHat(rig, kind, color) {
  const { cy, rx, ry } = rig.head
  const c = tone(color)
  const a = rx + 3.5
  const dome = (edge, top, half) => {
    const h = edge - top
    return `M${xy(CX - half, edge)} C${xy(CX - half, edge - h * KAPPA)} ${xy(CX - half * KAPPA, top)} ${xy(CX, top)} `
      + `C${xy(CX + half * KAPPA, top)} ${xy(CX + half, edge - h * KAPPA)} ${xy(CX + half, edge)} Q${xy(CX, edge + 5)} ${xy(CX - half, edge)}Z`
  }

  if (kind === 'cap') {
    const top = cy - ry - 9
    const edge = cy - ry * 0.44
    return {
      shadow: { cy: edge + 9, rx: a },
      shapes: [
        path(dome(edge, top, a), { fill: `g:${c.base}` }),
        path(`M${xy(CX, top + 2)} L${xy(CX, edge + 2.5)} M${xy(CX, top + 3)} Q${xy(CX - a * 0.7, top + (edge - top) * 0.35)} ${xy(CX - a * 0.85, edge + 1)} M${xy(CX, top + 3)} Q${xy(CX + a * 0.7, top + (edge - top) * 0.35)} ${xy(CX + a * 0.85, edge + 1)}`, { stroke: c.pale, sw: 1.6, op: 0.7 }),
        circle(CX, top + 1.5, 2.4, { fill: c.dark }),
        path(`M${xy(CX - a - 1, edge)} Q${xy(CX, edge + 5)} ${xy(CX + a + 1, edge)} C${xy(CX + a + 3, edge + 6)} ${xy(CX + a * 0.55, edge + 11)} ${xy(CX, edge + 11)} C${xy(CX - a * 0.55, edge + 11)} ${xy(CX - a - 3, edge + 6)} ${xy(CX - a - 1, edge)}Z`, { fill: c.dark, stroke: c.deep, sw: 1 }),
      ],
    }
  }
  if (kind === 'beanie') {
    const top = cy - ry - 11
    const edge = cy - ry * 0.34
    return {
      shadow: { cy: edge + 6, rx: a },
      shapes: [
        path(dome(edge, top, a + 1), { fill: `g:${c.base}`, stroke: c.deep, sw: 1.2 }),
        rect(CX - a - 2, edge - 8, (a + 2) * 2, 10, { rx: 5, fill: c.dark, stroke: c.deep, sw: 1.2 }),
        ...[-18, -9, 0, 9, 18].map((dx) => path(`M${xy(CX + dx, edge - 7)} v7`, { stroke: c.deep, sw: 1, op: 0.5 })),
        circle(CX, top - 3, 6.5, { fill: c.light, stroke: c.deep, sw: 1.1 }),
      ],
    }
  }
  if (kind === 'bucket') {
    const top = cy - ry - 6
    const edge = cy - ry * 0.5
    return {
      shadow: { cy: edge + 12, rx: a + 8 },
      shapes: [
        path(`M${xy(CX - a - 17, edge + 2)} Q${xy(CX, edge + 22)} ${xy(CX + a + 17, edge + 2)} Q${xy(CX, edge - 8)} ${xy(CX - a - 17, edge + 2)}Z`, { fill: c.dark, stroke: c.deep, sw: 1.2 }),
        path(`M${xy(CX - a + 1, edge + 2)} L${xy(CX - a + 4, top + 8)} Q${xy(CX, top - 4)} ${xy(CX + a - 4, top + 8)} L${xy(CX + a - 1, edge + 2)} Q${xy(CX, edge + 9)} ${xy(CX - a + 1, edge + 2)}Z`, { fill: `g:${c.base}`, stroke: c.deep, sw: 1.2 }),
        path(`M${xy(CX - a + 2, edge - 3)} Q${xy(CX, edge + 5)} ${xy(CX + a - 2, edge - 3)}`, { stroke: c.deep, sw: 3, op: 0.55 }),
      ],
    }
  }
  if (kind === 'tophat') {
    const top = cy - ry - 30
    const edge = cy - ry * 0.45
    const w = a - 3
    return {
      shadow: { cy: edge + 8, rx: a + 6 },
      shapes: [
        path(`M${xy(CX - w, edge)} L${xy(CX - w + 1, top + 4)} Q${xy(CX - w + 1, top)} ${xy(CX - w + 6, top)} L${xy(CX + w - 6, top)} Q${xy(CX + w - 1, top)} ${xy(CX + w - 1, top + 4)} L${xy(CX + w, edge)}Z`, { fill: `g:${c.base}`, stroke: c.deep, sw: 1.2 }),
        rect(CX - w + 0.5, edge - 11, (w - 0.5) * 2, 8, { fill: shade(color, 55), op: 0.85 }),
        path(`M${xy(CX - a - 11, edge + 1)} Q${xy(CX, edge + 10)} ${xy(CX + a + 11, edge + 1)} Q${xy(CX, edge - 6)} ${xy(CX - a - 11, edge + 1)}Z`, { fill: c.dark, stroke: c.deep, sw: 1.2 }),
      ],
    }
  }
  // Hair bow, clipped to one side like a barrette.
  const bx = CX + rx * 0.62
  const by = cy - ry * 0.78
  return {
    shadow: null,
    shapes: [
      path(`M${xy(bx, by)} L${xy(bx - 15, by - 9)} Q${xy(bx - 18, by)} ${xy(bx - 15, by + 9)}Z`, { fill: `g:${c.base}`, stroke: c.deep, sw: 1.2 }),
      path(`M${xy(bx, by)} L${xy(bx + 15, by - 9)} Q${xy(bx + 18, by)} ${xy(bx + 15, by + 9)}Z`, { fill: `g:${c.base}`, stroke: c.deep, sw: 1.2 }),
      circle(bx, by, 4, { fill: c.dark, stroke: c.deep, sw: 1.1 }),
    ],
  }
}

export function buildGlasses(rig, kind, color, face) {
  const c = tone(color)
  const { eyeY, eyeDX } = face
  const arm = (s) => path(`M${xy(CX + s * (eyeDX + 9), eyeY - 1)} L${xy(CX + s * (rig.head.rx + 1), eyeY - 2)}`, { stroke: c.deep, sw: 1.8 })
  if (kind === 'round') {
    return [
      arm(-1), arm(1),
      ...SIDES.map((s) => circle(CX + s * eyeDX, eyeY, 8.8, { fill: '#cfe8ee', op: 0.28 })),
      ...SIDES.map((s) => circle(CX + s * eyeDX, eyeY, 8.8, { stroke: c.base, sw: 2 })),
      path(`M${xy(CX - eyeDX + 8.8, eyeY)} Q${xy(CX, eyeY - 4)} ${xy(CX + eyeDX - 8.8, eyeY)}`, { stroke: c.base, sw: 1.8 }),
    ]
  }
  return [
    arm(-1), arm(1),
    ...SIDES.map((s) => rect(CX + s * eyeDX - 10.5, eyeY - 7.5, 21, 15, { rx: 6, fill: c.base, op: 0.92, stroke: c.deep, sw: 1.2 })),
    ...SIDES.map((s) => path(`M${xy(CX + s * eyeDX - 6, eyeY - 4)} l5 -1.5`, { stroke: '#ffffff', sw: 1.6, op: 0.55 })),
    path(`M${xy(CX - eyeDX + 10.5, eyeY - 3)} Q${xy(CX, eyeY - 6)} ${xy(CX + eyeDX - 10.5, eyeY - 3)}`, { stroke: c.deep, sw: 2 }),
  ]
}

export function buildHeadphones(rig, color, hasHat) {
  const { head } = rig
  const c = tone(color)
  const lift = hasHat ? 12 : 7
  const bandRx = head.rx + 6
  const bandRy = head.ry + 4 + lift
  const y = head.cy + 4
  const band = `M${xy(CX - bandRx, y)} A${bandRx} ${bandRy} 0 0 1 ${xy(CX + bandRx, y)}`
  const shapes = [path(band, { stroke: c.deep, sw: 6 }), path(band, { stroke: c.pale, sw: 2.4, tf: 'translate(0 -.8)' })]
  for (const s of SIDES) {
    const x = CX + s * (head.rx + 5) - 6.5
    shapes.push(rect(x, head.cy - 4, 13, 24, { rx: 5.5, fill: c.base }))
    shapes.push(rect(x + 2.5, head.cy, 8, 16, { rx: 3, fill: c.pale }))
  }
  return shapes
}
