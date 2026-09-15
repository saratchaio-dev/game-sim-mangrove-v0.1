import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('PlotWildlife gates crabs/fish/birds on journey.discovered ids', () => {
  const source = readFileSync(new URL('../src/MangroveWorld3DNatural.jsx', import.meta.url), 'utf8')
  assert.match(source, /function PlotWildlife/)
  assert.match(source, /discovered\.includes\('crab'\)/)
  assert.match(source, /discovered\.includes\('fish'\)/)
  assert.match(source, /discovered\.includes\('bird'\)/)
  assert.match(source, /name="plot-wildlife"/)
})

test('cliffhanger day-plan exposes forecast-tomorrow and contract-days-left hooks', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  assert.match(app, /day-plan-cliffhanger/)
  assert.match(app, /data-forecast-tomorrow/)
  assert.match(app, /data-contract-days-left/)
  assert.match(app, /mali-dawn-tip/)
  assert.match(app, /discovered=\{game\.journey\.discovered\}/)
})
