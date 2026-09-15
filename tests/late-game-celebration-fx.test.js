import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/MangroveWorld3DNatural.jsx', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/living-coast.css', import.meta.url), 'utf8')
const diag = readFileSync(new URL('../src/world-diagnostics.js', import.meta.url), 'utf8')

test('ActionSceneBeat mounts late-game-celebration-fx', () => {
  assert.match(source, /function LateGameCelebrationFx/)
  assert.match(source, /name="late-game-celebration-fx"/)
  assert.match(source, /'late-game-celebration'/)
  assert.match(source, /actionFx: 'late-game-celebration'/)
})

test('shell vignette hooks living-coast rank-up prestige', () => {
  assert.match(app, /data-late-game-celebration/)
  assert.match(app, /worldAction\?\.type === 'late-game-celebration'/)
  assert.match(css, /late-game-celebration-fade/)
  assert.match(css, /data-late-game-celebration="living-coast"/)
  assert.match(css, /data-late-game-celebration="rank-up"/)
  assert.match(css, /data-late-game-celebration="prestige"/)
})

test('diagnostics expose lateGameCelebrationFx', () => {
  assert.match(diag, /lateGameCelebrationFx/)
  assert.match(diag, /late-game-celebration-fx/)
})

test('late-game celebration does not regress prior beats or bird heading', () => {
  assert.match(source, /kinds\.includes\(action\.type\)/)
  assert.match(source, /streak-theater-fx/)
  assert.match(source, /event-speech-fx/)
  assert.match(source, /wildlife-unlock-fx/)
  assert.match(source, /action\.type !== 'late-game-celebration'/)
  const bird = source.slice(source.indexOf('function Bird('), source.indexOf('function Wildlife('))
  assert.match(bird, /Math\.atan2\(vx, vz\) - Math\.PI \/ 2/)
})
