import test from 'node:test'
import assert from 'node:assert/strict'
import { streakTheaterFor } from '../src/streak-theater.js'

test('streakTheaterFor maps new streak to tier, toastExtra, and speak', () => {
  assert.deepEqual(streakTheaterFor(1), { tier: 'light', toastExtra: 'เริ่มต่อเนื่อง', speak: true })
  assert.deepEqual(streakTheaterFor(2), { tier: 'toast', toastExtra: '🔥 สองงานติด!', speak: true })
  assert.deepEqual(streakTheaterFor(3), { tier: 'strong', toastExtra: '🔥🔥 สามงานติด!', speak: true })
  assert.equal(streakTheaterFor(4).tier, 'peak')
  assert.equal(streakTheaterFor(4).speak, true)
  assert.match(streakTheaterFor(4).toastExtra, /4/)
  assert.match(streakTheaterFor(5, { bestUpdated: true }).toastExtra, /สถิติใหม่/)
  assert.ok(!streakTheaterFor(5).toastExtra.includes('สถิติใหม่'))
})

test('streakTheaterFor treats non-positive as light tier', () => {
  assert.equal(streakTheaterFor(0).tier, 'light')
  assert.equal(streakTheaterFor(null).tier, 'light')
})
