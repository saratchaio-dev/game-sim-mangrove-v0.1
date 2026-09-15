import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/MangroveWorld3DNatural.jsx', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const diag = readFileSync(new URL('../src/world-diagnostics.js', import.meta.url), 'utf8')

test('ActionSceneBeat mounts wildlife-unlock-fx for wildlife-drip worldAction', () => {
  assert.match(source, /name="wildlife-unlock-fx"/)
  assert.match(source, /action\.type !== 'wildlife-drip'/)
  assert.match(source, /actionFx: 'wildlife-drip'/)
  assert.match(source, /DiscoverSpark/)
})

test('Gameplay drip worldAction type stays wildlife-drip with Ing/Non speech', () => {
  assert.match(app, /type: 'wildlife-drip'/)
  assert.match(app, /wildlife-drip-new/)
  assert.match(app, /data-wildlife-drip/)
  assert.match(app, /speakCharacter\('ing', ingSpeechForWildlifeDrip/)
  assert.match(app, /speakCharacter\('non', nonSpeechForWildlifeDrip/)
  assert.match(app, /tryWildlifeDrip\(afterCrew, key\)/)
  assert.match(app, /DRIP_ACTIONS\.includes\(key\)/)
})

test('diagnostics expose wildlifeUnlockFx for QA', () => {
  assert.match(diag, /wildlifeUnlockFx/)
  assert.match(diag, /wildlife-unlock-fx/)
})

test('drip FX does not regress plant/care ActionSceneBeat or bird heading', () => {
  assert.match(source, /action\.type !== 'plant' && action\.type !== 'care' && action\.type !== 'wildlife-drip'/)
  const bird = source.slice(source.indexOf('function Bird('), source.indexOf('function Wildlife('))
  assert.match(bird, /Math\.atan2\(vx, vz\) - Math\.PI \/ 2/)
  assert.doesNotMatch(bird, /rotation\.y = -t \+ Math\.PI \/ 2/)
})
