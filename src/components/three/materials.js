import * as THREE from 'three'

const std = (color, roughness = 0.6, metalness = 0, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra })

/** Shared PBR materials — created once so every mesh reuses the same GPU program/uniforms. */
export const M = {
  wall: std('#ECE8E2', 0.9),
  wallCap: std('#1B2030', 0.55, 0.2),
  plinth: std('#121722', 0.45, 0.35),
  floorOak: std('#C29A72', 0.55),
  floorTile: std('#D9D5CE', 0.28, 0.05),
  floorWalnut: std('#7A5A44', 0.5),
  floorAsh: std('#B59C82', 0.6),

  fabricSlate: std('#5A6475', 0.95),
  fabricSlateLight: std('#6B7588', 0.95),
  fabricCharcoal: std('#3D4352', 0.95),
  fabricTerracotta: std('#C2703D', 0.9),
  fabricCream: std('#E9DCC4', 0.92),
  fabricSage: std('#9CAF88', 0.92),
  fabricDusk: std('#7C8DA6', 0.9),
  linen: std('#F4F1EB', 0.85),
  rugSand: std('#CDBFA6', 1),
  rugStone: std('#A8A39B', 1),
  rugInk: std('#2F3646', 1),

  walnut: std('#6B4A35', 0.45),
  oak: std('#C9A27A', 0.5),
  lightOak: std('#DDD3C4', 0.55),
  marble: std('#F2F0EB', 0.22, 0.02),
  cabinetNavy: std('#273142', 0.42, 0.08),
  metalBlack: std('#1C2029', 0.32, 0.65),
  steel: std('#C9CED6', 0.24, 0.9),
  brass: std('#C9A86A', 0.28, 0.9),
  ceramic: std('#E8E4DC', 0.35),
  blackGlass: std('#07090D', 0.08, 0.6),
  screenOff: std('#05070B', 0.12, 0.4),
  plasticWhite: std('#EEF0F3', 0.4),
  leaf: std('#4E7A4C', 0.75),
  leafDark: std('#3A5E3B', 0.8),
  pot: std('#2A2F3A', 0.6, 0.1),
  glass: new THREE.MeshStandardMaterial({
    color: '#A9D6FF',
    roughness: 0.04,
    metalness: 0.25,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  }),
}

const BOOK_COLORS = ['#C2703D', '#3B4A63', '#9CAF88', '#E9DCC4', '#7C8DA6', '#D9A441', '#5B3A4E', '#2F6F73']
export const bookMaterials = BOOK_COLORS.map((c) => std(c, 0.8))
