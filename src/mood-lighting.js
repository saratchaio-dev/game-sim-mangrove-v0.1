/** Day / golden / storm mood presets for the coastal scene lighting pass. */

export const LIGHTING_PRESETS = {
  day: {
    preset: 'day',
    sky: '#94d2d4',
    fog: '#94d2d4',
    ambient: 0.62,
    hemiSky: '#e3fbfa',
    hemiGround: '#5f684c',
    hemi: 1.25,
    dirColor: '#fff6df',
    dir: 2.2,
    sun: [14, 22, 9],
  },
  golden: {
    preset: 'golden',
    sky: '#b6c8ba',
    fog: '#b6c8ba',
    ambient: 0.58,
    hemiSky: '#ffe7bb',
    hemiGround: '#5f684c',
    hemi: 1.25,
    dirColor: '#ffde9e',
    dir: 2.4,
    sun: [14, 22, 9],
  },
  storm: {
    preset: 'storm',
    sky: '#84a9b5',
    fog: '#84a9b5',
    ambient: 0.48,
    hemiSky: '#c5d5d8',
    hemiGround: '#4a5548',
    hemi: 1.05,
    dirColor: '#d7e0e2',
    dir: 1.15,
    sun: [14, 22, 9],
  },
}

/** Resolve assertable lighting mood from existing weather / forecast hooks. */
export function resolveLightingMood({ weather, golden = false, tideOffset = 0 } = {}) {
  const storm = weather === 'storm' || weather === 'kingtide'
  const preset = storm ? 'storm' : golden ? 'golden' : 'day'
  const base = LIGHTING_PRESETS[preset]
  const tide = Number.isFinite(tideOffset) ? tideOffset : 0
  // Soft tide bias on fill + key light only — do not move the sun.
  const bias = tide * 0.18
  return {
    ...base,
    ambient: base.ambient + bias * 0.35,
    dir: Math.max(0.35, base.dir + bias),
    tideOffset: tide,
  }
}
