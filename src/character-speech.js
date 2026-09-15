/** Ephemeral Mali speech lines — UI-only; never persisted to save/localStorage. */

export const SPEECH_MS = 3500

export function maliSpeechForPlant(fit) {
  return fit === 2
    ? 'พอดีเลย — รากจะตั้งตัวเร็วที่นี่'
    : 'ปลูกได้ แต่ดินกับน้ำยังไม่สุด ดูแลใกล้ๆ นะ'
}

export function maliSpeechForCrewCare() {
  return 'สามต้นที่อ่อนแอที่สุดฟื้นขึ้นแล้ว'
}

export function maliSpeechForPlotCare() {
  return 'แปลงนี้แข็งแรงขึ้นแล้ว'
}

export function createSpeech(speaker, text, actionId) {
  return {
    speaker,
    text,
    actionId,
    id: `${actionId}-${Date.now()}`,
  }
}
