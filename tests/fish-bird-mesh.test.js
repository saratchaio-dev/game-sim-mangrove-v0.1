import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/MangroveWorld3DNatural.jsx', import.meta.url), 'utf8')

test('Fish keeps API and gains multi-part low-poly silhouette', () => {
  assert.match(source, /function Fish\(\{ position, color = '#ffd166', seed = 0, scale = 0\.65, roam = 1\.2, alwaysAnimate = false \}\)/)
  assert.match(source, /name=\{`coast-fish-\$\{seed\}`\}/)
  assert.match(source, /ref=\{tail\}/)
  assert.ok((source.match(/function Fish[\s\S]*?function Bird/) || [''])[0].split('<mesh').length >= 6)
})

test('Bird keeps API and gains head/neck/beak wing groups', () => {
  assert.match(source, /function Bird\(\{ seed = 0, plantCue = null, center = null, scale = 0\.7, roam = 5\.5, alwaysAnimate = false, height = 7\.2 \}\)/)
  assert.match(source, /name=\{`coast-bird-\$\{seed\}`\}/)
  assert.match(source, /ref=\{leftWing\}/)
  assert.match(source, /ref=\{rightWing\}/)
  assert.match(source, /coneGeometry args=\{\[0\.025, 0\.12, 5\]\}/)
})
