import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/MangroveWorld3DNatural.jsx', import.meta.url), 'utf8')

test('PlotWildlife gates crabs/fish/birds/fireflies on journey.discovered ids', () => {
  assert.match(source, /function PlotWildlife/)
  assert.match(source, /discovered\.includes\('crab'\)/)
  assert.match(source, /discovered\.includes\('fish'\)/)
  assert.match(source, /discovered\.includes\('bird'\)/)
  assert.match(source, /discovered\.includes\('firefly'\)/)
  assert.match(source, /name="plot-wildlife"/)
})

test('Day 15 visibility: fish on mudline, larger birds/fireflies, any living plot', () => {
  assert.match(source, /y \+ 0\.28/)
  assert.match(source, /Keep fish on the mud\/waterline/)
  assert.match(source, /scale=\{plotScale \* 1\.45\}/)
  assert.match(source, /scale=\{plotScale \* 1\.55\}/)
  assert.match(source, /size=\{6\.5\}/)
  assert.match(source, /fireflyPlots = discovered\.includes\('firefly'\) \? livingPlots/)
  assert.doesNotMatch(source, /species === 'sonneratia'.*firefly|firefly.*sonneratia/)
})

test('cliffhanger day-plan exposes forecast-tomorrow and contract-days-left hooks', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  assert.match(app, /data-forecast-tomorrow/)
  assert.match(app, /data-contract-days-left/)
  assert.match(app, /discovered=\{game\.journey\.discovered\}/)
})
