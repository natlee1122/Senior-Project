/**
 * Body presets for the avatar.
 *
 * All values are SVG units on a 240 x 330 canvas. A "half" value is the
 * distance from the vertical centre line to the body outline at height y.
 * Garments and accessories are generated from these numbers
 * (see avatarGeometry.js), so editing a preset re-fits everything the
 * avatar wears automatically.
 */
export const VIEW_BOX = '0 0 240 330'
export const CENTER_X = 120
export const GROUND_Y = 292
export const ANKLE_Y = 272

export const BODY_PRESETS = {
  feminine: {
    head: { cy: 70, rx: 27, ry: 32, jaw: [0.42, 0.55] },
    neckHalf: 6.5,
    shoulder: { y: 118, half: 30 },
    chest: { y: 139, half: 27.5 },
    waist: { y: 160, half: 21 },
    hip: { y: 184, half: 28 },
    armWidth: 9,
    leg: { offset: 14, topWidth: 27, ankleWidth: 14 },
    hair: 'long',
    face: { eye: [3.5, 4.4], brow: 1.6, lashes: true },
  },
  masculine: {
    head: { cy: 68, rx: 29, ry: 33, jaw: [0.72, 0.62] },
    neckHalf: 8.5,
    shoulder: { y: 117, half: 39 },
    chest: { y: 138, half: 37 },
    waist: { y: 162, half: 33 },
    hip: { y: 187, half: 31 },
    armWidth: 12.5,
    leg: { offset: 15, topWidth: 29, ankleWidth: 17 },
    hair: 'short',
    face: { eye: [3.1, 3.9], brow: 2.8, lashes: false },
  },
  neutral: {
    head: { cy: 69, rx: 28, ry: 32.5, jaw: [0.55, 0.56] },
    neckHalf: 7.5,
    shoulder: { y: 118, half: 34.5 },
    chest: { y: 139, half: 31.5 },
    waist: { y: 161, half: 27 },
    hip: { y: 185, half: 29.5 },
    armWidth: 10.5,
    leg: { offset: 14.5, topWidth: 28, ankleWidth: 15.5 },
    hair: 'medium',
    face: { eye: [3.3, 4.1], brow: 2, lashes: false },
  },
}
