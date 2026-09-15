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

test('stylized Fish/Bird meshes keep coast-* names and richer silhouette parts', () => {
  assert.match(source, /name=\{`coast-fish-\$\{seed\}`\}/)
  assert.match(source, /name=\{`coast-bird-\$\{seed\}`\}/)
  assert.match(source, /Stylized mangrove egret/)
  assert.match(source, /const fin =/)
  assert.match(source, /const beak =/)
  assert.match(source, /const wing =/)
  // Motion/API props must remain for plot wildlife + shore cue.
  assert.match(source, /function Fish\(\{ position, color = '#ffd166', seed = 0, scale = 0\.65, roam = 1\.2, alwaysAnimate = false \}\)/)
  assert.match(source, /function Bird\(\{ seed = 0, plantCue = null, center = null, scale = 0\.7, roam = 5\.5, alwaysAnimate = false, height = 7\.2 \}\)/)
})

test('Bird heading faces velocity (beak forward, not backward)', () => {
  const source = readFileSync(new URL('../src/MangroveWorld3DNatural.jsx', import.meta.url), 'utf8')
  const bird = source.slice(source.indexOf('function Bird('), source.indexOf('function Wildlife('))
  assert.match(bird, /Math\.atan2\(vx, vz\) - Math\.PI \/ 2/)
  assert.doesNotMatch(bird, /rotation\.y = -t \+ Math\.PI \/ 2/)
})
