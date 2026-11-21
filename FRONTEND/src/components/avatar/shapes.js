import { shade } from '../../utils/color'

/**
 * A tiny drawing language. Geometry code describes the avatar as plain shape
 * objects; AvatarFigure only has to render them. Colours may be:
 *   '#rrggbb'   flat colour
 *   'g:#rrggbb' soft gradient built from that colour
 *   'edge'      darkens the sides of a garment
 */
export const path = (d, o = {}) => ({ t: 'path', d, ...o })
export const ellipse = (cx, cy, rx, ry, o = {}) => ({ t: 'ellipse', cx, cy, rx, ry, ...o })
export const circle = (cx, cy, r, o = {}) => ({ t: 'circle', cx, cy, r, ...o })
export const rect = (x, y, width, height, o = {}) => ({ t: 'rect', x, y, width, height, ...o })

let uidCounter = 0
export const nextUid = () => `avatar-${uidCounter++}`

const GEOMETRY = ['d', 'cx', 'cy', 'rx', 'ry', 'r', 'x', 'y', 'width', 'height']
const round = (v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v)

function resolveFill(fill, uid) {
  if (!fill) return 'none'
  if (fill === 'edge') return `url(#${uid}-edge)`
  if (fill.startsWith('g:')) return `url(#${uid}-g${fill.slice(3)})`
  return fill
}

/** Converts a shape into the tag name and attributes Vue should render. */
export function toElement(shape, uid) {
  const attrs = {}
  for (const key of GEOMETRY) if (shape[key] !== undefined) attrs[key] = round(shape[key])
  attrs.fill = resolveFill(shape.fill, uid)
  if (shape.stroke) {
    attrs.stroke = shape.stroke
    attrs['stroke-width'] = shape.sw ?? 1.5
    attrs['stroke-linecap'] = shape.cap ?? 'round'
    attrs['stroke-linejoin'] = 'round'
    if (shape.dash) attrs['stroke-dasharray'] = shape.dash
  }
  if (shape.op !== undefined) attrs.opacity = shape.op
  if (shape.soft) attrs.filter = `url(#${uid}-soft)`
  if (shape.tf) attrs.transform = shape.tf
  return { tag: shape.t, attrs }
}

/** Every gradient colour used by a set of layers, so the renderer can define them once. */
export function gradientColors(layers) {
  const found = new Set()
  for (const layer of layers) for (const s of layer.shapes) if (s.fill?.startsWith('g:')) found.add(s.fill.slice(2))
  return [...found]
}

export const gradientStops = (hex) => [shade(hex, 14), shade(hex, -12)]
