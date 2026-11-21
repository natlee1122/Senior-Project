import { tone } from '../../utils/color'
import { circle, ellipse, path } from './shapes'
import {
  CX, GROUND_Y, SIDES, createRig, headPath, limb, neckPath,
} from './avatarRig'
import { buildBag, buildBottom, buildNeckwear, buildOuter, buildShoes, buildTop, sleeveShapes } from './garments'
import { MANNEQUIN, SKIN, buildFace, buildGlasses, buildHat, buildHeadphones, hairPaths } from './headwear'
import { buildPetShapes, PET_HEIGHT } from './petGeometry'
import { resolveOutfit } from './wardrobeCatalog'

export { PET_HEIGHT }

/**
 * Turns a body type and an outfit into drawable layers (see shapes.js).
 * Layers are listed back to front. A layer may carry a `clip` name that refers
 * to an entry in `clips`, and `tf` for a group transform.
 */
export function buildAvatar(bodyType, equipped = {}, { mannequin = false, useDefaults = true, flat = false } = {}) {
  const rig = createRig(bodyType)
  const outfit = resolveOutfit(equipped, useDefaults)
  const skin = mannequin ? MANNEQUIN : SKIN
  const skinFill = `g:${skin}`
  const layers = []
  const clips = {}
  const add = (key, shapes, clip) => { if (shapes?.length) layers.push({ key, shapes, clip }) }

  const top = outfit.top && buildTop(rig, outfit.top.item.style, outfit.top.color)
  const outer = outfit.outer && buildOuter(rig, outfit.outer.item.style, outfit.outer.color)
  const bottom = outfit.bottom && buildBottom(rig, outfit.bottom.item.style, outfit.bottom.color)
  const shoes = outfit.shoes && buildShoes(rig, outfit.shoes.item.style, outfit.shoes.color)
  const bag = outfit.bag && buildBag(rig, outfit.bag.item.style, outfit.bag.color)
  const neckwear = outfit.neck && buildNeckwear(rig, outfit.neck.item.style, outfit.neck.color, top?.depth ?? 6)
  const hat = outfit.hat && buildHat(rig, outfit.hat.item.style.kind, outfit.hat.color)
  const hairStyle = outfit.hair?.item.style.kind ?? (mannequin || flat ? null : rig.hair)
  const hair = hairStyle ? hairPaths(rig, hairStyle) : { back: null, front: null }
  const hairColor = outfit.hair?.color ?? '#49352f'
  const face = buildFace(rig)

  const headD = headPath(rig.head)
  const neckD = neckPath(rig, top?.depth ?? 6)
  const legsSkin = rig.legs.map(({ from, to }) => limb(from, to, rig.leg.topWidth, rig.leg.ankleWidth, { endCap: 'flat' }))
  clips.head = [headD]
  clips.neck = [neckD]
  clips.legs = legsSkin
  if (top) clips.top = [top.d]
  if (outer) clips.outer = outer.panels
  if (bottom) clips.bottom = bottom.clips
  rig.arms.forEach((arm) => { clips[`arm${arm.side}`] = [limb(arm.from, arm.to, rig.armWidth, rig.armWidth * 0.8)] })

  const edge = (d) => path(d, { fill: 'edge' })

  // Flat mode draws the garments alone, like an icon, with no body underneath.
  if (!flat) add('ground', [ellipse(CX, GROUND_Y - 1, 52, 5.5, { fill: '#22312a', op: 0.16, soft: true })])

  if (outfit.pet) {
    const x = CX + Math.max(rig.shoulder.half, rig.hip.half) + 12
    const scale = 0.85
    layers.push({ key: 'pet', tf: `translate(${x} ${GROUND_Y - PET_HEIGHT * scale + 1}) scale(${scale})`, shapes: buildPetShapes({ species: outfit.pet.item, color: outfit.pet.color, hat: outfit.petHat, neck: outfit.petNeck }) })
  }

  add('bag-back', bag?.back)
  if (hair.back) add('hair-back', [path(hair.back, { fill: hairColor })])
  add('hood', top?.back)
  if (!flat) add('neck', [path(neckD, { fill: skinFill }), ellipse(CX, rig.head.cy + rig.head.ry + 2, rig.neckHalf + 8, 9, { fill: '#8a4a3c', op: 0.3, soft: true })], 'neck')
  if (!flat) add('legs', legsSkin.map((d) => path(d, { fill: skinFill })))
  if (!shoes?.overPants) add('shoes', shoes?.shapes)

  if (bottom) {
    add('bottom', bottom.shapes)
    add('bottom-detail', bottom.detail, 'bottom')
    if (bottom.hemShadow && !flat) add('hem-shadow', [ellipse(CX, bottom.hemShadow.y + 3, bottom.hemShadow.rx + 12, 6, { fill: '#1f1a2e', op: 0.3, soft: true })], 'legs')
  }
  if (shoes?.overPants) add('shoes', shoes.shapes)

  if (top) {
    add('top', top.outline)
    add('top-detail', [...top.detail, edge(top.d)], 'top')
  }
  if (neckwear?.layer === 'inner') add('neck-inner', neckwear.shapes)
  if (outer) {
    add('outer', outer.shapes)
    add('outer-detail', [...outer.detail, ...outer.panels.map(edge)], 'outer')
  }
  if (neckwear?.layer === 'outer') add('neck-outer', neckwear.shapes)
  add('bag-front', bag?.front)

  for (const arm of rig.arms) {
    const armD = limb(arm.from, arm.to, rig.armWidth, rig.armWidth * 0.8)
    if (!flat) add(`arm${arm.side}`, [path(armD, { fill: skinFill }), circle(arm.to.x, arm.to.y, rig.armWidth / 2, { fill: skinFill })])
    for (const [key, source, item] of [['top', top, outfit.top], ['outer', outer, outfit.outer]]) {
      if (!source?.sleeve) continue
      const sleeve = sleeveShapes(rig, arm, source.sleeve, item.color)
      if (!flat) add(`${key}-sleeve-shadow${arm.side}`, [{ ...sleeve[0], fill: '#1f1a2e', stroke: undefined, op: 0.25, soft: true, tf: 'translate(0 3)' }], `arm${arm.side}`)
      add(`${key}-sleeve${arm.side}`, sleeve)
    }
  }
  // Arms also shade the garments they hang in front of.
  if (top && !flat) layers.splice(layers.findIndex((l) => l.key === 'top-detail') + 1, 0, { key: 'top-arm-shadow', clip: 'top', shapes: rig.arms.map((arm) => path(limb(arm.from, arm.to, rig.armWidth, rig.armWidth * 0.8), { fill: '#1f1a2e', op: 0.16, soft: true, tf: `translate(${-arm.side * 3} 2)` })) })

  const ear = tone(skin)
  const showHead = !flat || Boolean(outfit.hair) // hair icons need a head to sit on
  if (showHead) add('ears', SIDES.map((s) => ellipse(CX + s * rig.head.rx, rig.head.cy + 3, 5, 8, { fill: ear.dark })))
  if (showHead) add('head', [path(headD, { fill: skinFill })])
  if (!mannequin && !flat) add('face', face.shapes)
  if (hat?.shadow && !flat) add('hat-shadow', [ellipse(CX, hat.shadow.cy, hat.shadow.rx, 9, { fill: '#4a2f2f', op: 0.3, soft: true })], 'head')
  if (hair.front) add('hair-front', [path(hair.front, { fill: hairColor })])
  if (outfit.glasses) add('glasses', buildGlasses(rig, outfit.glasses.item.style.kind, outfit.glasses.color, face))
  add('hat', hat?.shapes)
  if (outfit.headphones) add('headphones', buildHeadphones(rig, outfit.headphones.color, Boolean(hat)))

  return { layers, clips }
}
