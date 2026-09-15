import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const [app, css] = await Promise.all([
  readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/living-coast.css', import.meta.url), 'utf8'),
])

test('App toggles hud-compact from a mobile/coarse media query', () => {
  assert.match(app, /max-width:\s*900px/)
  assert.match(app, /hud-compact/)
  assert.match(app, /data-hud-compact/)
  assert.match(app, /hudCompact/)
})

test('compact HUD CSS keeps usable touch targets and denser chrome', () => {
  assert.match(css, /\.game3d-shell\.hud-compact\s+\.utility-rail button[\s\S]*?min-width:\s*40px/)
  assert.match(css, /\.game3d-shell\.hud-compact\s+\.plant-dock[\s\S]*?height:\s*68px/)
  assert.match(css, /\.game3d-shell\.hud-compact\s+\.left-stack/)
  assert.match(css, /\.game3d-shell\.hud-compact\s+\.notice-toast/)
})
