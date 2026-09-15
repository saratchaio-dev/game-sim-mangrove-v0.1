import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitialGame } from '../src/game-data.js'
import { restoreGame } from '../src/coast-progression.js'
import { restoreExpedition, freshExpedition } from '../src/restoration.js'
import {
  DRIP_ACTIONS,
  DRIP_WEIGHTS,
  DRIP_CHANCE,
  eligibleDripPool,
  pickWeighted,
  tryWildlifeDrip,
} from '../src/wildlife-drip.js'

const forest = (count = 6, age = 6) => {
  const g = createInitialGame()
  g.plots = g.plots.map((p, i) => (i < count
    ? { ...p, species: p.tide === 'ต่ำ' ? 'sonneratia' : p.tide === 'สูง' ? 'avicennia' : 'rhizophora', age, health: 80 }
    : p))
  g.stats.planted = count
  g.biodiversity = 40
  return g
}

test('DRIP_ACTIONS and weights prefer crab > fish > bird > firefly', () => {
  assert.deepEqual(DRIP_ACTIONS, ['survey', 'patrol', 'clean'])
  assert.equal(DRIP_WEIGHTS.crab, 40)
  assert.equal(DRIP_WEIGHTS.fish, 30)
  assert.equal(DRIP_WEIGHTS.bird, 20)
  assert.equal(DRIP_WEIGHTS.firefly, 10)
  assert.equal(DRIP_CHANCE, 0.55)
  assert.ok(DRIP_WEIGHTS.crab > DRIP_WEIGHTS.fish)
  assert.ok(DRIP_WEIGHTS.fish > DRIP_WEIGHTS.bird)
  assert.ok(DRIP_WEIGHTS.bird > DRIP_WEIGHTS.firefly)
})

test('eligibleDripPool only includes test-passing undiscovered animals', () => {
  const empty = createInitialGame()
  assert.deepEqual(eligibleDripPool(empty), [])
  const crabs = forest(3, 1)
  crabs.biodiversity = 0
  assert.deepEqual(eligibleDripPool(crabs), ['crab'])
  crabs.journey.discovered = ['crab']
  assert.deepEqual(eligibleDripPool(crabs), [])
  const rich = forest(6, 6)
  assert.deepEqual(eligibleDripPool(rich).sort(), ['bird', 'crab', 'firefly', 'fish'])
})

test('pickWeighted favors higher weights among remaining via injectable rng', () => {
  const pool = ['crab', 'fish', 'bird', 'firefly']
  assert.equal(pickWeighted(pool, () => 0), 'crab')
  assert.equal(pickWeighted(pool, () => 0.39), 'crab')
  assert.equal(pickWeighted(pool, () => 0.4), 'fish')
  assert.equal(pickWeighted(pool, () => 0.69), 'fish')
  assert.equal(pickWeighted(pool, () => 0.7), 'bird')
  assert.equal(pickWeighted(pool, () => 0.89), 'bird')
  assert.equal(pickWeighted(pool, () => 0.9), 'firefly')
  assert.equal(pickWeighted(['fish', 'bird'], () => 0), 'fish')
  assert.equal(pickWeighted(['fish', 'bird'], () => 0.6), 'bird')
  assert.equal(pickWeighted([], () => 0), null)
})

test('tryWildlifeDrip unlocks one animal, grants reward+25 XP, sets dripDay', () => {
  const g = forest(6, 6)
  g.journey.discovered = []
  const coins = g.coins
  const xp = g.journey.xp
  const rolls = [0.1, 0] // pass chance, pick crab
  const rng = () => rolls.shift()
  const { game, unlocked } = tryWildlifeDrip(g, 'survey', rng)
  assert.equal(unlocked.id, 'crab')
  assert.deepEqual(game.journey.discovered, ['crab'])
  assert.equal(game.coins, coins + 35)
  assert.equal(game.journey.xp, xp + 25)
  assert.equal(game.expedition.dripDay, g.day)
  assert.notEqual(game, g)
})

test('once per day: dripDay blocks further unlocks same day', () => {
  const g = forest(6, 6)
  const first = tryWildlifeDrip(g, 'patrol', () => 0)
  assert.ok(first.unlocked)
  const second = tryWildlifeDrip(first.game, 'clean', () => 0)
  assert.equal(second.unlocked, null)
  assert.strictEqual(second.game, first.game)
})

test('4/4 discovered is silent', () => {
  const g = forest(6, 6)
  g.journey.discovered = ['crab', 'fish', 'bird', 'firefly']
  const { game, unlocked } = tryWildlifeDrip(g, 'survey', () => 0)
  assert.equal(unlocked, null)
  assert.strictEqual(game, g)
})

test('failed chance roll does not unlock or set dripDay', () => {
  const g = forest(6, 6)
  const { game, unlocked } = tryWildlifeDrip(g, 'survey', () => 0.9)
  assert.equal(unlocked, null)
  assert.strictEqual(game, g)
  assert.equal(game.expedition.dripDay, 0)
})

test('non-drip actions and empty eligible pool stay silent', () => {
  const g = forest(6, 6)
  assert.equal(tryWildlifeDrip(g, 'care', () => 0).unlocked, null)
  const bare = createInitialGame()
  assert.equal(tryWildlifeDrip(bare, 'clean', () => 0).unlocked, null)
})

test('freshExpedition and restoreExpedition persist dripDay', () => {
  assert.equal(freshExpedition().dripDay, 0)
  const restored = restoreExpedition({ dripDay: 4, crewDay: 4 }, 5)
  assert.equal(restored.dripDay, 4)
  const capped = restoreExpedition({ dripDay: 99 }, 5)
  assert.equal(capped.dripDay, 5)
  const g = createInitialGame()
  g.day = 5
  g.expedition.dripDay = 3
  const reloaded = restoreGame(JSON.parse(JSON.stringify(g)), createInitialGame())
  assert.equal(reloaded.expedition.dripDay, 3)
})
