/** Chance-based wildlife journal drip from crew survey / patrol / clean. */
import { WILDLIFE } from './coast-progression.js'

export const DRIP_ACTIONS = ['survey', 'patrol', 'clean']
export const DRIP_WEIGHTS = { crab: 40, fish: 30, bird: 20, firefly: 10, mudskipper: 8, heron: 5, kingfisher: 3 }
export const DRIP_CHANCE = 0.55

export function eligibleDripPool(game) {
  const discovered = game?.journey?.discovered
  const known = Array.isArray(discovered) ? discovered : []
  return WILDLIFE
    .filter((animal) => !known.includes(animal.id) && animal.test(game))
    .map((animal) => animal.id)
}

export function pickWeighted(pool, rng = Math.random) {
  if (!pool?.length) return null
  const weights = pool.map((id) => DRIP_WEIGHTS[id] || 0)
  const total = weights.reduce((sum, w) => sum + w, 0)
  if (total <= 0) return pool[0]
  let roll = rng() * total
  for (let i = 0; i < pool.length; i += 1) {
    roll -= weights[i]
    if (roll < 0) return pool[i]
  }
  return pool[pool.length - 1]
}

export function tryWildlifeDrip(game, actionKey, rng = Math.random) {
  if (!DRIP_ACTIONS.includes(actionKey)) return { game, unlocked: null }
  if (game.expedition?.dripDay === game.day) return { game, unlocked: null }
  if ((game.journey?.discovered?.length || 0) >= WILDLIFE.length) return { game, unlocked: null }
  const pool = eligibleDripPool(game)
  if (!pool.length) return { game, unlocked: null }
  if (rng() >= DRIP_CHANCE) return { game, unlocked: null }
  const id = pickWeighted(pool, rng)
  const animal = WILDLIFE.find((a) => a.id === id)
  if (!animal) return { game, unlocked: null }
  return {
    game: {
      ...game,
      coins: game.coins + animal.reward,
      journey: {
        ...game.journey,
        xp: game.journey.xp + 25,
        discovered: [...game.journey.discovered, animal.id],
      },
      expedition: { ...game.expedition, dripDay: game.day },
    },
    unlocked: animal,
  }
}
