import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const [app, css] = await Promise.all([
  readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/living-coast.css', import.meta.url), 'utf8'),
])

test('photo mode exposes chrome, data attribute, and P-key toggle', () => {
  assert.match(app, /data-photo-mode/)
  assert.match(app, /photo-mode-chrome/)
  assert.match(app, /photo-mode-title/)
  assert.match(app, /event\.key === 'p' \|\| event\.key === 'P'/)
  assert.match(app, /data-title-brand="mangrove-bay"/)
})

test('photo mode CSS frames the bay without blocking the exit control', () => {
  assert.match(css, /\.photo-mode-chrome/)
  assert.match(css, /\.photo-mode-title/)
  assert.match(css, /\.photo-exit[\s\S]*?pointer-events:\s*auto/)
  assert.match(css, /\.photo-mode\s+\.game-ui\s*\{\s*display:\s*none/)
})
