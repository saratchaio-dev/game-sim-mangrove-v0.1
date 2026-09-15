import test from 'node:test'
import assert from 'node:assert/strict'
import { cliffhangerFor } from '../src/dawn-cliffhanger.js'
import { maliSpeechForTomorrowWait } from '../src/character-speech.js'
import { createInitialGame } from '../src/game-data.js'
import { acceptContract, forecastFor } from '../src/restoration.js'
import { EVENTS } from '../src/game-data.js'

function baseGame(overrides = {}) {
  return { ...createInitialGame(), ...overrides }
}

test('cliffhanger without contract: forecast label + Mali tip', () => {
  const game = baseGame({ day: 1 })
  const cliff = cliffhangerFor(game)
  assert.equal(cliff.hasContract, false)
  assert.equal(cliff.contractDaysLeft, null)
  assert.equal(cliff.maliTip, maliSpeechForTomorrowWait())
  assert.equal(typeof cliff.tomorrowLabel, 'string')
  assert.ok(cliff.tomorrowLabel.length > 0)
  // Day 1 → tomorrow day 2 is not an event day (events on multiples of 5)
  assert.equal(cliff.tomorrowLabel, forecastFor(2).tide)
})

test('cliffhanger with active contract: days left, no Mali tip', () => {
  let game = baseGame({ day: 2, coins: 500 })
  // Plant enough / unlock so cleanup contract is available
  game = acceptContract(game, 'cleanup')
  assert.ok(game.expedition.contract, 'contract accepted')
  const cliff = cliffhangerFor(game)
  assert.equal(cliff.hasContract, true)
  assert.equal(cliff.maliTip, null)
  assert.equal(cliff.contractDaysLeft, 3) // deadline = day+2 → daysLeft = 3
  assert.match(String(cliff.contractDaysLeft), /^\d+$/)
})

test('cliffhanger tomorrowLabel uses event title when tomorrow is event day', () => {
  const game = baseGame({ day: 4 }) // tomorrow = 5 = event day
  const cliff = cliffhangerFor(game)
  const forecast = forecastFor(4)
  assert.equal(forecast.eventDay, 5)
  const title = EVENTS.find((e) => e.id === forecast.eventId)?.title
  assert.equal(cliff.tomorrowLabel, title)
})

test('maliSpeechForTomorrowWait is the locked tip string', () => {
  assert.equal(
    maliSpeechForTomorrowWait(),
    'พรุ่งนี้มีงานรอที่อ่าว — เปิดภาคสนามแล้วลุยต่อได้เลย',
  )
})
