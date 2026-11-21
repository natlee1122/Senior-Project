import { shade, tone } from '../../utils/color'
import { circle, ellipse, path, rect } from './shapes'

/**
 * Pets are drawn on a 60 x 64 canvas that every species shares: head centred
 * at (30, 27), body at (30, 50), neck at y = 44. Hats and collars attach to
 * those anchors, so every accessory fits every animal.
 */
export const PET_WIDTH = 60
export const PET_HEIGHT = 64

const INK = '#2b2320'
const CREAM = '#fff0d9'
const PINK = '#f3a5b5'

const eyes = (dy = 0, r = 3) => [21, 39].flatMap((x) => [circle(x, 28 + dy, r, { fill: INK }), circle(x + 1, 27 + dy, r * 0.38, { fill: '#fff' })])
const paws = (fill) => [ellipse(21, 60, 6.5, 3.6, { fill }), ellipse(39, 60, 6.5, 3.6, { fill })]
const body = (m, belly) => [ellipse(30, 50, 16, 12, { fill: `g:${m}` }), ellipse(30, 53, 8, 8, { fill: belly })]
const head = (m) => ellipse(30, 27, 22, 19, { fill: `g:${m}` })

const SPECIES = {
  fox(m) {
    const c = tone(m)
    const ear = (x1, x2, tip) => path(`M${x1} 18 L${tip} -2 L${x2} 10Z`, { fill: `g:${c.base}`, stroke: c.deep, sw: 1.2 })
    return [
      path('M42 52 Q60 54 57 32', { stroke: c.base, sw: 11 }),
      circle(57, 32, 5.6, { fill: CREAM }),
      ...body(m, CREAM),
      ...paws('#7a4326'),
      ear(12, 24, 9), ear(48, 36, 51),
      path('M13 15 L11 3 L20 10Z', { fill: '#4b2f25' }), path('M47 15 L49 3 L40 10Z', { fill: '#4b2f25' }),
      head(m),
      path('M8 30 Q16 22 30 30 Q44 22 52 30 Q48 44 30 46 Q12 44 8 30Z', { fill: CREAM }),
      ...eyes(),
      ellipse(30, 35, 3.2, 2.4, { fill: INK }),
      path('M27 38.5 Q30 41.5 33 38.5', { stroke: INK, sw: 1.2 }),
    ]
  },
  cat(m) {
    const c = tone(m)
    const ear = (x1, x2, tip) => path(`M${x1} 20 L${tip} 0 L${x2} 10Z`, { fill: `g:${c.base}`, stroke: c.deep, sw: 1.2 })
    return [
      path('M43 54 Q62 56 58 34', { stroke: c.base, sw: 7 }),
      ...body(m, shade(m, 28)),
      ...paws(shade(m, 22)),
      ear(10, 25, 10), ear(50, 35, 50),
      path('M13 17 L12 6 L21 11Z', { fill: PINK }), path('M47 17 L48 6 L39 11Z', { fill: PINK }),
      head(m),
      ...[26, 30, 34].map((x) => path(`M${x} 9 V16`, { stroke: c.deep, sw: 1.8, op: 0.35 })),
      ...[21, 39].flatMap((x) => [ellipse(x, 28, 3.2, 3.8, { fill: '#7fc37a' }), ellipse(x, 28, 1.4, 3.2, { fill: INK }), circle(x + 1.2, 26.6, 1, { fill: '#fff' })]),
      path('M28 34 L32 34 L30 36.8Z', { fill: PINK }),
      path('M30 37 Q27.5 40 24.5 38.2 M30 37 Q32.5 40 35.5 38.2', { stroke: INK, sw: 1.1 }),
      path('M15 34.5 L3 32.5 M15 37.5 L3 38.5 M45 34.5 L57 32.5 M45 37.5 L57 38.5', { stroke: c.deep, sw: 0.9, op: 0.55 }),
    ]
  },
  dog(m) {
    const c = tone(m)
    return [
      path('M43 54 Q55 52 53 43', { stroke: c.base, sw: 7 }),
      ...body(m, '#f6e6cf'),
      ...paws(c.dark),
      ellipse(8, 28, 7, 13, { fill: c.dark, stroke: c.deep, sw: 1, tf: 'rotate(10 8 28)' }),
      ellipse(52, 28, 7, 13, { fill: c.dark, stroke: c.deep, sw: 1, tf: 'rotate(-10 52 28)' }),
      head(m),
      circle(40, 22, 5, { fill: c.dark, op: 0.55 }),
      ellipse(30, 36, 11.5, 8.5, { fill: '#f6e6cf' }),
      ...eyes(-1, 2.8),
      ellipse(30, 32.5, 4.4, 3.1, { fill: INK }),
      path('M30 35.5 V38 M30 38 Q26.5 41 24 38.5 M30 38 Q33.5 41 36 38.5', { stroke: INK, sw: 1.1 }),
      path('M28 40 Q30 47 32 40Z', { fill: PINK }),
    ]
  },
  bunny(m) {
    const c = tone(m)
    const ear = (x, tilt) => [
      ellipse(x, 6, 6.2, 16, { fill: `g:${c.base}`, stroke: c.deep, sw: 1.1, tf: `rotate(${tilt} ${x} 14)` }),
      ellipse(x, 7, 3, 11, { fill: PINK, tf: `rotate(${tilt} ${x} 14)` }),
    ]
    return [
      circle(47, 56, 6, { fill: c.light, stroke: c.deep, sw: 1 }),
      ...body(m, c.pale),
      ...paws(c.light),
      ...ear(20, -8), ...ear(40, 8),
      head(m),
      ellipse(14.5, 34, 4.5, 3, { fill: PINK, op: 0.45 }), ellipse(45.5, 34, 4.5, 3, { fill: PINK, op: 0.45 }),
      ...eyes(),
      ellipse(30, 33.5, 2.6, 1.9, { fill: '#e58aa0' }),
      path('M30 35.4 V37.4 M30 37.4 Q27.5 40 25 38.4 M30 37.4 Q32.5 40 35 38.4', { stroke: INK, sw: 1 }),
      rect(28.4, 38, 3.2, 3.8, { rx: 1, fill: '#fff', stroke: '#d9d3c8', sw: 0.6 }),
    ]
  },
  panda() {
    const black = '#2d2a30'
    return [
      ellipse(30, 50, 16, 12, { fill: '#f7f5ef', stroke: '#e1ddd3', sw: 1 }),
      ellipse(15, 49, 5.2, 9.5, { fill: black, tf: 'rotate(18 15 49)' }), ellipse(45, 49, 5.2, 9.5, { fill: black, tf: 'rotate(-18 45 49)' }),
      ellipse(21, 60, 6.5, 3.8, { fill: black }), ellipse(39, 60, 6.5, 3.8, { fill: black }),
      circle(12, 11, 7.5, { fill: black }), circle(48, 11, 7.5, { fill: black }),
      ellipse(30, 27, 22, 19, { fill: '#f7f5ef', stroke: '#e1ddd3', sw: 1 }),
      ellipse(20.5, 28, 5.6, 7, { fill: black, tf: 'rotate(-22 20.5 28)' }), ellipse(39.5, 28, 5.6, 7, { fill: black, tf: 'rotate(22 39.5 28)' }),
      circle(21, 27.5, 2.2, { fill: '#fff' }), circle(39, 27.5, 2.2, { fill: '#fff' }),
      circle(21.4, 27.7, 1.1, { fill: black }), circle(38.6, 27.7, 1.1, { fill: black }),
      ellipse(30, 34.5, 3.6, 2.6, { fill: black }),
      path('M30 37 Q27 40.5 24.5 38.5 M30 37 Q33 40.5 35.5 38.5', { stroke: black, sw: 1.1 }),
    ]
  },
}

const HATS = {
  party(color) {
    const c = tone(color)
    return [
      path('M21 14 Q30 11 39 14 L31 -10Z', { fill: `g:${c.base}`, stroke: c.deep, sw: 1.1 }),
      path('M24 8 L36 8 M26.5 1.5 L33.5 1.5', { stroke: '#fff', sw: 2, op: 0.7 }),
      circle(31, -10, 3.4, { fill: '#f1c65b' }),
    ]
  },
  crown(color) {
    const c = tone(color)
    return [
      path('M20 13 L20 1 L25.5 7 L30 -1 L34.5 7 L40 1 L40 13Z', { fill: `g:${c.base}`, stroke: c.deep, sw: 1.1 }),
      circle(30, 8, 1.8, { fill: '#d96f8a' }), circle(22.5, 9, 1.4, { fill: '#5f8fcf' }), circle(37.5, 9, 1.4, { fill: '#6fa8a0' }),
    ]
  },
  ribbon(color) {
    const c = tone(color)
    return [
      path('M43 10 L33 3 Q30 10 33 17Z', { fill: `g:${c.base}`, stroke: c.deep, sw: 1 }),
      path('M43 10 L53 3 Q56 10 53 17Z', { fill: `g:${c.base}`, stroke: c.deep, sw: 1 }),
      circle(43, 10, 3.2, { fill: c.dark, stroke: c.deep, sw: 1 }),
    ]
  },
}

const NECKWEAR = {
  collar(color) {
    const c = tone(color)
    return [
      path('M14.5 42 Q30 53 45.5 42', { stroke: c.deep, sw: 5 }),
      path('M14.5 42 Q30 53 45.5 42', { stroke: c.base, sw: 3.6 }),
      circle(30, 50, 3.4, { fill: '#f1c65b', stroke: '#c99a2a', sw: 1 }),
      path('M30 52.2 v1.4', { stroke: '#7a5a14', sw: 1.2 }),
    ]
  },
  bandana(color) {
    const c = tone(color)
    return [
      path('M13 41 Q30 49 47 41 L30 60Z', { fill: `g:${c.base}`, stroke: c.deep, sw: 1 }),
      ...[[26, 47], [34, 47], [30, 53]].map(([x, y]) => circle(x, y, 1.3, { fill: '#fff', op: 0.8 })),
    ]
  },
  bowtie(color) {
    const c = tone(color)
    return [
      path('M30 46 L19 40 L19 52Z', { fill: `g:${c.base}`, stroke: c.deep, sw: 1 }),
      path('M30 46 L41 40 L41 52Z', { fill: `g:${c.base}`, stroke: c.deep, sw: 1 }),
      rect(27.5, 43.5, 5, 5, { rx: 1.8, fill: c.dark, stroke: c.deep, sw: 1 }),
    ]
  },
}

/** Shapes for one pet and its accessories, on the shared 60 x 64 canvas. */
export function buildPetShapes({ species, color, hat, neck }) {
  const draw = SPECIES[species.style.kind]
  const shapes = [ellipse(30, 62, 22, 3.5, { fill: '#22312a', op: 0.15, soft: true })]
  shapes.push(...draw(color))
  if (neck) shapes.push(...NECKWEAR[neck.item.style.kind](neck.color))
  if (hat) shapes.push(...HATS[hat.item.style.kind](hat.color))
  return shapes
}
