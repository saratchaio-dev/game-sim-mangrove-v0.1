import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('ActionSceneBeat mounts wildlife-unlock-fx for wildlife-drip worldAction', () => {
  const source = readFileSync(new URL('../src/MangroveWorld3DNatural.jsx', import.meta.url), 'utf8')
  assert.match(source, /function DiscoverSpark/)
  assert.match(source, /name="wildlife-unlock-fx"/)
  assert.match(source, /action\.type !== 'wildlife-drip'/)
  assert.match(source, /actionFx: 'wildlife-drip'/)
})

test('Gameplay drip worldAction type stays wildlife-drip', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  assert.match(app, /type: 'wildlife-drip'/)
  assert.match(app, /wildlife-drip-new/)
})
