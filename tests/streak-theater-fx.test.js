import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/MangroveWorld3DNatural.jsx', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/living-coast.css', import.meta.url), 'utf8')
const diag = readFileSync(new URL('../src/world-diagnostics.js', import.meta.url), 'utf8')

test('ActionSceneBeat mounts streak-theater-fx for streak-theater worldAction', () => {
  assert.match(source, /name="streak-theater-fx"/)
  assert.match(source, /action\.type !== 'streak-theater'/)
  assert.match(source, /actionFx: 'streak-theater'/)
  assert.match(source, /userData=\{\{ actionFx: 'streak-theater', streak/)
})

test('shell exposes data-streak-theater vignette hook by streak tier', () => {
  assert.match(app, /data-streak-theater/)
  assert.match(app, /worldAction\?\.type === 'streak-theater'/)
  assert.match(css, /streak-theater-fade/)
  assert.match(css, /data-streak-theater="3"/)
  assert.match(css, /data-streak-theater="4"/)
})

test('diagnostics expose streakTheaterFx for QA', () => {
  assert.match(diag, /streakTheaterFx/)
  assert.match(diag, /streak-theater-fx/)
})

test('streak theater does not regress drip, plant/care, or bird heading', () => {
  assert.match(source, /wildlife-drip/)
  assert.match(source, /action\.type !== 'plant' && action\.type !== 'care'/)
  const bird = source.slice(source.indexOf('function Bird('), source.indexOf('function Wildlife('))
  assert.match(bird, /Math\.atan2\(vx, vz\) - Math\.PI \/ 2/)
  assert.doesNotMatch(bird, /rotation\.y = -t \+ Math\.PI \/ 2/)
})
