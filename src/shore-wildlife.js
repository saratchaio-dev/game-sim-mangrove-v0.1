/** Pure habitat → shore wildlife / undergrowth counts. Scene-only; no economy. */

function defaultPseudo(seed) {
  const value = Math.sin(seed * 999.91 + 17.21) * 43758.5453
  return value - Math.floor(value)
}

export function wildlifePresence({ living = 0, mature = 0, stage = 0, communityLevel = 0 } = {}) {
  const habitatBoost = Math.max(0, Math.min(3, stage | 0))
  const crabs = Math.min(8, Math.max(0, Math.floor(living / 2.5) + habitatBoost))
  const fish = Math.min(9, Math.max(0, Math.floor(living / 2) + Math.max(0, habitatBoost - 1)))
  const birds = Math.min(5, Math.max(0,
    Math.floor(mature / 2) + (communityLevel >= 2 ? 1 : 0) + (habitatBoost >= 2 ? 1 : 0)))
  return { crabs, fish, birds }
}

export function undergrowthItems(stage = 0, pseudo = defaultPseudo) {
  const level = Math.max(0, Math.min(3, stage | 0))
  const bushes = Array.from({ length: level * 5 }, (_, i) => ({
    position: [
      -11 + pseudo(i * 4.1 + 3) * 21,
      0.52,
      -8.4 + pseudo(i * 6.7 + 9) * 12,
    ],
    scale: 0.45 + pseudo(i * 2.9) * 0.55,
    color: i % 2 ? '#4f8f4a' : '#367a52',
  }))
  const ferns = Array.from({ length: level * 4 }, (_, i) => ({
    position: [
      -10.2 + pseudo(i * 5.5 + 11) * 19,
      0.48,
      -7.6 + pseudo(i * 3.3 + 17) * 11,
    ],
    scale: 0.3 + pseudo(i * 7.1) * 0.4,
    rotation: [0, pseudo(i * 8.2) * Math.PI, 0],
    color: i % 3 ? '#6db05a' : '#458a4f',
  }))
  return { bushes, ferns }
}

export function protectionFlagItems(active) {
  if (!active) return { posts: [], flags: [] }
  const xs = [-7, -3, 1, 5]
  return {
    posts: xs.map((x) => ({ position: [x, 0.75, -9.5], color: '#887252' })),
    flags: xs.map((x) => ({
      position: [x + 0.15, 1.13, -9.5],
      color: '#eec866',
    })),
  }
}

/** Gate plot fauna by journal discovery ids (set 1 + set 2 boosts). */
export function plotWildlifeForDiscovery(discovered = []) {
  const ids = Array.isArray(discovered) ? discovered : []
  const showMudskipper = ids.includes('mudskipper')
  const showHeron = ids.includes('heron')
  const showKingfisher = ids.includes('kingfisher')
  return {
    showCrabs: ids.includes('crab'),
    showFish: ids.includes('fish'),
    showBirds: ids.includes('bird'),
    showFireflies: ids.includes('firefly'),
    showMudskipper,
    showHeron,
    showKingfisher,
    crabBoost: showMudskipper ? 2 : 0,
    fishBoost: showKingfisher ? 1 : 0,
    birdBoost: (showHeron ? 1 : 0) + (showKingfisher ? 1 : 0),
  }
}
