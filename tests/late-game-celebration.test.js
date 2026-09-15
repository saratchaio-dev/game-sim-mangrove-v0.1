import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitialGame } from '../src/game-data.js'
import { freshJourney, rankFor, RANKS, WILDLIFE, restoreGame, discoverWildlife } from '../src/coast-progression.js'
import {
  shouldCelebrateBay,
  shouldCelebrateRank,
  markBayCelebrated,
  markRankCelebrated,
  bayCelebrationNotice,
  rankCelebrationNotice,
} from '../src/late-game-celebration.js'
import { habitatFor } from '../src/restoration.js'
import { readFileSync } from 'node:fs'

const fullBay = () => {
  const g = createInitialGame()
  const species = ['rhizophora', 'avicennia', 'sonneratia']
  g.plots = g.plots.map((p, i) => ({
    ...p,
    species: species[i % 3],
    age: 6,
    health: 100,
    dead: false,
  }))
  g.stats.planted = 16
  g.biodiversity = 100
  g.coastal = 80
  return g
}

test('RANKS extend past xp:900 with three late-game titles', () => {
  assert.equal(RANKS.length, 8)
  assert.deepEqual(RANKS.slice(5).map((r) => ({ xp: r.xp, name: r.name })), [
    { xp: 1400, name: 'ผู้นำชุมชนชายฝั่ง' },
    { xp: 2100, name: 'สถาปนิกอ่าวมีชีวิต' },
    { xp: 3000, name: 'มรดกป่าชายเลน' },
  ])
  assert.equal(rankFor(900).level, 5)
  assert.ok(rankFor(900).progress < 100)
  assert.equal(rankFor(1400).name, 'ผู้นำชุมชนชายฝั่ง')
  assert.equal(rankFor(3000).level, 8)
  assert.equal(rankFor(3000).progress, 100)
  assert.equal(rankFor(3000).next, undefined)
})

test('freshJourney and restoreGame persist celebration flags', () => {
  const fresh = freshJourney()
  assert.equal(fresh.celebratedBay, false)
  assert.equal(fresh.celebratedMaxLegend, false)
  assert.equal(fresh.celebratedRankLevel, 1)
  const g = createInitialGame()
  g.journey.xp = 1500
  g.journey.celebratedBay = true
  g.journey.celebratedMaxLegend = false
  g.journey.celebratedRankLevel = 6
  const reloaded = restoreGame(JSON.parse(JSON.stringify(g)), createInitialGame())
  assert.equal(reloaded.journey.celebratedBay, true)
  assert.equal(reloaded.journey.celebratedRankLevel, 6)
  assert.equal(reloaded.journey.celebratedMaxLegend, false)
  // Legacy saves without flags adopt current rank so past levels are not re-celebrated.
  const legacy = createInitialGame()
  legacy.journey.xp = 900
  delete legacy.journey.celebratedBay
  delete legacy.journey.celebratedRankLevel
  delete legacy.journey.celebratedMaxLegend
  const migrated = restoreGame(JSON.parse(JSON.stringify(legacy)), createInitialGame())
  assert.equal(migrated.journey.celebratedBay, false)
  assert.equal(migrated.journey.celebratedRankLevel, rankFor(900).level)
})

test('bay celebration triggers once at habitat score 100', () => {
  const g = fullBay()
  assert.ok(habitatFor(g).score >= 100)
  assert.equal(shouldCelebrateBay(g), true)
  const marked = markBayCelebrated(g)
  assert.equal(marked.journey.celebratedBay, true)
  assert.equal(shouldCelebrateBay(marked), false)
  assert.match(bayCelebrationNotice(), /อ่าวฟื้นเต็มร้อย/)
})

test('rank celebration tracks celebratedRankLevel and max legend', () => {
  const g = createInitialGame()
  g.journey.xp = 100
  g.journey.celebratedRankLevel = 1
  assert.equal(shouldCelebrateRank(g), 2)
  const mid = markRankCelebrated(g, 2)
  assert.equal(mid.journey.celebratedRankLevel, 2)
  assert.equal(mid.journey.celebratedMaxLegend, false)
  assert.equal(shouldCelebrateRank(mid), 0)
  const maxed = markRankCelebrated({ ...g, journey: { ...g.journey, xp: 3000 } }, RANKS.length)
  assert.equal(maxed.journey.celebratedMaxLegend, true)
  assert.equal(maxed.journey.celebratedRankLevel, RANKS.length)
  assert.match(rankCelebrationNotice('มรดกป่าชายเลน', RANKS.length), /สูงสุด/)
})

test('wildlife set 2 has harder tests and higher rewards', () => {
  const ids = WILDLIFE.map((a) => a.id)
  assert.deepEqual(ids.slice(4), ['mudskipper', 'heron', 'kingfisher'])
  const set2 = WILDLIFE.filter((a) => ['mudskipper', 'heron', 'kingfisher'].includes(a.id))
  assert.ok(set2.every((a) => a.reward >= 110))
  const early = createInitialGame()
  early.plots = early.plots.map((p, i) => (i < 4
    ? { ...p, species: 'sonneratia', age: 6, health: 80 }
    : p))
  early.biodiversity = 30
  const found = discoverWildlife(early)
  assert.deepEqual(found.journey.discovered.sort(), ['bird', 'crab', 'firefly', 'fish'])
  assert.ok(!found.journey.discovered.includes('mudskipper'))
  const rich = fullBay()
  rich.coastal = 40
  rich.biodiversity = 60
  const all = discoverWildlife(rich)
  assert.equal(all.journey.discovered.length, WILDLIFE.length)
  assert.ok(all.journey.discovered.includes('mudskipper'))
  assert.ok(all.journey.discovered.includes('heron'))
  assert.ok(all.journey.discovered.includes('kingfisher'))
})

test('App wires late-game-celebration worldAction, speech, and journal /N', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  assert.match(app, /shouldCelebrateBay/)
  assert.match(app, /shouldCelebrateRank/)
  assert.match(app, /type: 'late-game-celebration'/)
  assert.match(app, /maliSpeechForBayCelebration/)
  assert.match(app, /ingSpeechForRankUp/)
  assert.match(app, /maliSpeechForMaxLegend/)
  assert.match(app, /discovered\.length\}\/\{WILDLIFE\.length\}/)
  assert.match(app, /data-late-game-celebration/)
})
