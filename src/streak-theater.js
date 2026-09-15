/** Presentation tiers for contract delivery streaks — UI/speech only; no economy math. */

/**
 * @param {number} streak New streak value after a successful claim (previous + 1).
 * @param {{ bestUpdated?: boolean }} [opts]
 * @returns {{ tier: 'light'|'toast'|'strong'|'peak', toastExtra: string, speak: boolean }}
 */
export function streakTheaterFor(streak, { bestUpdated = false } = {}) {
  const n = Math.max(0, Number(streak) || 0)
  if (n <= 1) {
    return { tier: 'light', toastExtra: 'เริ่มต่อเนื่อง', speak: true }
  }
  if (n === 2) {
    return { tier: 'toast', toastExtra: '🔥 สองงานติด!', speak: true }
  }
  if (n === 3) {
    return { tier: 'strong', toastExtra: '🔥🔥 สามงานติด!', speak: true }
  }
  return {
    tier: 'peak',
    toastExtra: bestUpdated ? `🏆 สถิติใหม่ ${n} งานติด!` : `🔥🔥🔥 ${n} งานติด!`,
    speak: true,
  }
}
