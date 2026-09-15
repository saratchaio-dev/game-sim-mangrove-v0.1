import test from 'node:test'
import assert from 'node:assert/strict'
import { wildlifePresence, undergrowthItems, protectionFlagItems, plotWildlifeForDiscovery } from '../src/shore-wildlife.js'
import { readFileSync } from 'node:fs'

test('wildlife presence scales with living trees and habitat stage', () => {
  assert.deepEqual(wildlifePresence({ living: 0, mature: 0, stage: 0 }), { crabs: 0, fish: 0, birds: 0 })
  const early = wildlifePresence({ living: 3, mature: 0, stage: 0 })
  assert.equal(early.crabs, 1)
  assert.equal(early.fish, 1)
  const restored = wildlifePresence({ living: 12, mature: 6, stage: 3, communityLevel: 2 })
  assert.ok(restored.crabs >= 5 && restored.crabs <= 8)
  assert.ok(restored.fish >= 5 && restored.fish <= 9)
  assert.ok(restored.birds >= 3 && restored.birds <= 5)
  assert.ok(restored.crabs > early.crabs)
})

test('undergrowth densifies with habitat stage and stays empty at stage 0', () => {
  assert.deepEqual(undergrowthItems(0), { bushes: [], ferns: [] })
  const mid = undergrowthItems(2)
  assert.equal(mid.bushes.length, 10)
  assert.equal(mid.ferns.length, 8)
  assert.ok(mid.bushes.every((item) => Array.isArray(item.position) && item.position.length === 3))
  assert.ok(mid.ferns.every((item) => Array.isArray(item.rotation)))
})

test('protection flags batch four posts only when active', () => {
  assert.deepEqual(protectionFlagItems(false), { posts: [], flags: [] })
  const active = protectionFlagItems(true)
  assert.equal(active.posts.length, 4)
  assert.equal(active.flags.length, 4)
})

test('SceneryBatch skips empty instances and keeps static draw usage', () => {
  const source = readFileSync(new URL('../src/SceneryBatch.jsx', import.meta.url), 'utf8')
  assert.match(source, /count <= 0/)
  assert.match(source, /matrixAutoUpdate = false/)
  assert.match(source, /StaticDrawUsage/)
  assert.match(source, /if \(!mesh\) return null/)
})

test('plotWildlifeForDiscovery gates fauna by journal ids', () => {
  assert.deepEqual(plotWildlifeForDiscovery([]), {
    showCrabs: false, showFish: false, showBirds: false, showFireflies: false,
  })
  assert.deepEqual(plotWildlifeForDiscovery(['crab']), {
    showCrabs: true, showFish: false, showBirds: false, showFireflies: false,
  })
  assert.deepEqual(plotWildlifeForDiscovery(['crab', 'fish', 'bird', 'firefly']), {
    showCrabs: true, showFish: true, showBirds: true, showFireflies: true,
  })
  assert.deepEqual(plotWildlifeForDiscovery(undefined), {
    showCrabs: false, showFish: false, showBirds: false, showFireflies: false,
  })
})
