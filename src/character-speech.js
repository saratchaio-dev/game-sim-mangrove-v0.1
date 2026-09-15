/** Ephemeral character speech lines (Mali / Non / Ing) — UI-only; never persisted to save/localStorage. */

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

export function maliSpeechForFirstContract() {
  return 'รับงานแล้ว — ส่งภายใน 3 วันในเกม จะได้รางวัลและโบนัสต่อเนื่อง'
}

export function maliSpeechForFirstPerfect() {
  return 'Fit สมบูรณ์ครั้งแรก! คอมโบเริ่มสะสมแล้ว ปลูกให้เหมาะต่อเนื่องนะ'
}

export function maliSpeechForFirstCrab() {
  return 'ปูก้ามดาบตัวแรก! อ่าวเริ่มมีชีวิตแล้ว เก็บไว้ในสมุดสัตว์นะ'
}

export function nonSpeechForClean() {
  return 'ชายฝั่งโล่งขึ้นแล้ว — ขยะลดลง สัตว์กลับมาง่ายขึ้น'
}

export function nonSpeechForPatrol(eventTitle) {
  return eventTitle
    ? `แนวป้องกันพร้อมแล้ว — รอบถัดไปรับมือ ${eventTitle} ได้ดีขึ้น`
    : 'แนวป้องกันพร้อมแล้ว — พายุ/น้ำหนุนรอบถัดไปจะเบาลง'
}

export function nonSpeechForForecastPrep(eventTitle, damage) {
  if (eventTitle && Number.isFinite(damage)) {
    return `แนวป้องกันช่วยแล้ว — ${eventTitle} เสียหายน้อยลง (เหลือ −${damage})`
  }
  if (eventTitle) return `แนวป้องกันช่วยแล้ว — ${eventTitle} ส่งผลน้อยลง`
  return 'แนวป้องกันช่วยแล้ว — ความเสียหายจากเหตุการณ์ลดลง'
}

export function ingSpeechForSurvey() {
  return 'บันทึกถิ่นอาศัยแล้ว — ความหลากหลายของอ่าวชัดขึ้น'
}

export function createSpeech(speaker, text, actionId) {
  return {
    speaker,
    text,
    actionId,
    id: `${actionId}-${Date.now()}`,
  }
}

export function maliSpeechForTomorrowWait() {
  return 'พรุ่งนี้มีงานรอที่อ่าว — เปิดภาคสนามแล้วลุยต่อได้เลย'
}

export function ingSpeechForWildlifeDrip(name) {
  return `เจอ${name}แล้ว! บันทึกลงสมุดสัตว์นะ`
}

export function nonSpeechForWildlifeDrip(name) {
  return `ดูสิ — ${name}! อ่าวมีชีวิตขึ้นอีกแล้ว`
}


export function maliSpeechForStreak(streak, bestUpdated = false) {
  const n = Math.max(0, Number(streak) || 0)
  if (n <= 1) return 'เริ่มต่อเนื่องแล้ว — ส่งงานถัดไปให้ติดกันนะ'
  if (n === 2) return 'สองงานติด! โบนัสต่อเนื่องกำลังสะสม'
  if (n === 3) return 'สามงานติด! ทีมฟื้นฟูกำลังร้อนแรง'
  if (bestUpdated) return `สถิติใหม่ ${n} งานติด! ส่งมอบยอดเยี่ยมมาก`
  return `${n} งานติด! โบนัสต่อเนื่องเต็มกำลัง`
}

export function nonSpeechForStorm(eventTitle) {
  return eventTitle
    ? `รับมือ${eventTitle} แล้ว — ตรวจต้นอ่อนและซ่อมจุดอ่อนต่อได้เลย`
    : 'มรสุมผ่านไปแล้ว — ตรวจต้นอ่อนและซ่อมจุดอ่อนต่อได้เลย'
}

export function nonSpeechForKingtide(eventTitle) {
  return eventTitle
    ? `ผ่าน${eventTitle} มาแล้ว — แนวชายฝั่งยังอยู่ ดูแลรากต่อนะ`
    : 'น้ำหนุนผ่านไปแล้ว — แนวชายฝั่งยังอยู่ ดูแลรากต่อนะ'
}

export function ingSpeechForMrv(verifiedAmount) {
  const amount = Number(verifiedAmount)
  if (Number.isFinite(amount) && amount > 0) {
    const shown = Number.isInteger(amount) ? String(amount) : amount.toFixed(1)
    return `ออกเครดิตแล้ว ${shown} tCO₂e — ป่าพิสูจน์คุณค่าแล้ว`
  }
  return 'ออกเครดิต MRV แล้ว — ป่าพิสูจน์คุณค่าแล้ว'
}
