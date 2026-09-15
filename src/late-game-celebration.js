/** Late-game celebration triggers — presentation + one-shot journey flags. */
import { rankFor, RANKS } from './coast-progression.js'
import { habitatFor } from './restoration.js'

export function shouldCelebrateBay(game) {
  return habitatFor(game).score >= 100 && !game.journey?.celebratedBay
}

/** @returns {number} new rank level to celebrate, or 0 if none */
export function shouldCelebrateRank(game) {
  const level = rankFor(game.journey?.xp || 0).level
  const celebrated = Number.isFinite(game.journey?.celebratedRankLevel)
    ? game.journey.celebratedRankLevel
    : 1
  return level > celebrated ? level : 0
}

export function markBayCelebrated(game) {
  return { ...game, journey: { ...game.journey, celebratedBay: true } }
}

export function markRankCelebrated(game, level) {
  const capped = Math.max(1, Math.min(RANKS.length, Math.floor(Number(level) || 1)))
  return {
    ...game,
    journey: {
      ...game.journey,
      celebratedRankLevel: capped,
      celebratedMaxLegend: capped >= RANKS.length ? true : Boolean(game.journey.celebratedMaxLegend),
    },
  }
}

export function bayCelebrationNotice() {
  return 'อ่าวฟื้นเต็มร้อย! ถิ่นอาศัยสมบูรณ์ · ทีมชายฝั่งเฉลิมฉลอง'
}

export function rankCelebrationNotice(rankName, level) {
  if (level >= RANKS.length) {
    return `ขึ้นยศสูงสุด「${rankName}」แล้ว · มรดกป่าชายเลน`
  }
  return `ขึ้นยศ「${rankName}」แล้ว · ระดับ ${level}`
}
