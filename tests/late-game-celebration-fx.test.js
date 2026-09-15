import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/MangroveWorld3DNatural.jsx', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/living-coast.css', import.meta.url), 'utf8')
const diag = readFileSync(new URL('../src/world-diagnostics.js', import.meta.url), 'utf8')

test('ActionSceneBeat mounts late-game-celebration-fx', () => {
  assert.match(source, /name="late-game-celebration-fx"/)
  assert.match(source, /'late-game-celebration'/)
  assert.match(source, /actionFx: 'late-game-celebration'/)
  assert.match(source, /DiscoverSpark/)
})

test('shell exposes data-late-game-celebration vignette hook', () => {
  assert.match(app, /data-late-game-celebration/)
  assert.match(app, /worldAction\?\.type === 'late-game-celebration'/)
  assert.match(css, /late-game-celebration-fade/)
  assert.match(css, /data-late-game-celebration="rank"/)
  assert.match(css, /data-late-game-celebration="max-legend"/)
})

test('diagnostics expose lateGameCelebrationFx for QA', () => {
  assert.match(diag, /lateGameCelebrationFx/)
  assert.match(diag, /late-game-celebration-fx/)
})
