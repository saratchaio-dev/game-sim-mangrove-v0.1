import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('ActionSceneBeat mounts streak-theater-fx for streak-theater worldAction', () => {
  const source = readFileSync(new URL('../src/MangroveWorld3DNatural.jsx', import.meta.url), 'utf8')
  assert.match(source, /function StreakTheaterFx/)
  assert.match(source, /name="streak-theater-fx"/)
  assert.match(source, /action\.type !== 'streak-theater'/)
  assert.match(source, /actionFx: 'streak-theater'/)
})

test('shell exposes data-streak-theater vignette hook', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../src/living-coast.css', import.meta.url), 'utf8')
  assert.match(app, /data-streak-theater/)
  assert.match(css, /streak-theater-fade/)
})
