import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createInitialGame } from '../src/game-data.js'
import { claimContract } from '../src/restoration.js'

test('claimContract reward path stays in restoration.js without theater coupling', () => {
  const source = readFileSync(new URL('../src/restoration.js', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /streak-theater/)
  assert.doesNotMatch(source, /streakTheaterFor/)
  assert.doesNotMatch(source, /maliSpeechForStreak/)
  assert.match(source, /function claimContract/)
})

test('claimContract does not persist theater presentation fields on game state', () => {
  const g = createInitialGame()
  const next = claimContract(g)
  assert.ok(!('streakTheater' in next))
  assert.ok(!('toastExtra' in next))
  assert.ok(!('streakBanner' in next))
})
