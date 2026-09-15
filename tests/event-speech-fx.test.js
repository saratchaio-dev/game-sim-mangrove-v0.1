import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/MangroveWorld3DNatural.jsx', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/living-coast.css', import.meta.url), 'utf8')
const diag = readFileSync(new URL('../src/world-diagnostics.js', import.meta.url), 'utf8')

test('ActionSceneBeat mounts event-speech-fx for event-speech worldAction', () => {
  assert.match(source, /function EventSpeechCue/)
  assert.match(source, /name="event-speech-fx"/)
  assert.match(source, /'event-speech'/)
  assert.match(source, /actionFx: 'event-speech'/)
})

test('shell vignette hooks storm kingtide mrv event-speech', () => {
  assert.match(app, /data-event-speech/)
  assert.match(app, /worldAction\?\.type === 'event-speech'/)
  assert.match(css, /event-speech-fade/)
  assert.match(css, /data-event-speech="storm"/)
  assert.match(css, /data-event-speech="kingtide"/)
  assert.match(css, /data-event-speech="mrv"/)
})

test('diagnostics expose eventSpeechFx', () => {
  assert.match(diag, /eventSpeechFx/)
  assert.match(diag, /event-speech-fx/)
})

test('event-speech cue does not regress streak drip or bird heading', () => {
  assert.match(source, /streak-theater-fx/)
  assert.match(source, /wildlife-unlock-fx/)
  assert.match(source, /kinds\.includes\(action\.type\)/)
  const bird = source.slice(source.indexOf('function Bird('), source.indexOf('function Wildlife('))
  assert.match(bird, /Math\.atan2\(vx, vz\) - Math\.PI \/ 2/)
})

test('event-speech eventId allowlist is storm|kingtide|mrv only on shell', () => {
  assert.match(app, /\['storm', 'kingtide', 'mrv'\]\.includes\(worldAction\.eventId\)/)
})
