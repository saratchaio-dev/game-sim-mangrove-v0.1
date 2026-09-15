import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveLightingMood, LIGHTING_PRESETS } from '../src/mood-lighting.js'

test('storm and kingtide resolve to storm preset over golden', () => {
  assert.equal(resolveLightingMood({ weather: 'storm', golden: true }).preset, 'storm')
  assert.equal(resolveLightingMood({ weather: 'kingtide', golden: true }).preset, 'storm')
})

test('golden day without storm uses golden; plain day uses day', () => {
  assert.equal(resolveLightingMood({ weather: null, golden: true }).preset, 'golden')
  assert.equal(resolveLightingMood({ weather: undefined, golden: false }).preset, 'day')
  assert.equal(resolveLightingMood({}).preset, 'day')
})

test('tideOffset is published and biases intensity without changing preset', () => {
  const calm = resolveLightingMood({ golden: false, tideOffset: 0 })
  const high = resolveLightingMood({ golden: false, tideOffset: 0.14 })
  assert.equal(calm.preset, 'day')
  assert.equal(high.preset, 'day')
  assert.equal(high.tideOffset, 0.14)
  assert.ok(high.dir > calm.dir)
  assert.equal(calm.sky, LIGHTING_PRESETS.day.sky)
  assert.equal(high.fog, LIGHTING_PRESETS.day.fog)
})
