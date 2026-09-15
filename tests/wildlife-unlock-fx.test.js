import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('wildlife unlock beat mounts DiscoverSpark as wildlife-unlock-fx', () => {
  const source = readFileSync(new URL('../src/MangroveWorld3DNatural.jsx', import.meta.url), 'utf8')
  assert.match(source, /function WildlifeUnlockBeat/)
  assert.match(source, /name="wildlife-unlock-fx"/)
  assert.match(source, /function DiscoverSpark/)
})

test('App pulses wildlifeUnlock and highlights journal entry', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  assert.match(app, /setWildlifeUnlock/)
  assert.match(app, /wildlifeUnlock=\{wildlifeUnlock\}/)
  assert.match(app, /just-unlocked/)
  assert.match(app, /data-wildlife-unlock/)
})
