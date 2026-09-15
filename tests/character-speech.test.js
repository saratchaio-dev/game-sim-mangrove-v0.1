import test from 'node:test'
import assert from 'node:assert/strict'
import {
  SPEECH_MS,
  maliSpeechForPlant,
  maliSpeechForCrewCare,
  maliSpeechForPlotCare,
  maliSpeechForFirstContract,
  maliSpeechForFirstPerfect,
  maliSpeechForFirstCrab,
  maliSpeechForTomorrowWait,
  maliSpeechForStreak,
  nonSpeechForClean,
  nonSpeechForPatrol,
  nonSpeechForForecastPrep,
  ingSpeechForSurvey,
  ingSpeechForWildlifeDrip,
  nonSpeechForWildlifeDrip,
  createSpeech,
} from '../src/character-speech.js'

test('plant fit lines match Mali copy for perfect vs imperfect sites', () => {
  assert.equal(maliSpeechForPlant(2), 'พอดีเลย — รากจะตั้งตัวเร็วที่นี่')
  assert.equal(maliSpeechForPlant(1), 'ปลูกได้ แต่ดินกับน้ำยังไม่สุด ดูแลใกล้ๆ นะ')
  assert.equal(maliSpeechForPlant(0), 'ปลูกได้ แต่ดินกับน้ำยังไม่สุด ดูแลใกล้ๆ นะ')
})

test('crew care and plot care lines are fixed Thai strings', () => {
  assert.equal(maliSpeechForCrewCare(), 'สามต้นที่อ่อนแอที่สุดฟื้นขึ้นแล้ว')
  assert.equal(maliSpeechForPlotCare(), 'แปลงนี้แข็งแรงขึ้นแล้ว')
})

test('first-contract and first-perfect Mali lines are fixed Thai strings', () => {
  assert.equal(maliSpeechForFirstContract(), 'รับงานแล้ว — ส่งภายใน 3 วันในเกม จะได้รางวัลและโบนัสต่อเนื่อง')
  assert.equal(maliSpeechForFirstPerfect(), 'Fit สมบูรณ์ครั้งแรก! คอมโบเริ่มสะสมแล้ว ปลูกให้เหมาะต่อเนื่องนะ')
})

test('Non patrol line includes event title when provided', () => {
  assert.equal(
    nonSpeechForPatrol('มรสุมกำลังเข้า'),
    'แนวป้องกันพร้อมแล้ว — รอบถัดไปรับมือ มรสุมกำลังเข้า ได้ดีขึ้น',
  )
  assert.equal(
    nonSpeechForPatrol(),
    'แนวป้องกันพร้อมแล้ว — พายุ/น้ำหนุนรอบถัดไปจะเบาลง',
  )
  assert.equal(
    nonSpeechForPatrol(''),
    'แนวป้องกันพร้อมแล้ว — พายุ/น้ำหนุนรอบถัดไปจะเบาลง',
  )
})

test('Ing survey line is a fixed Thai string', () => {
  assert.equal(ingSpeechForSurvey(), 'บันทึกถิ่นอาศัยแล้ว — ความหลากหลายของอ่าวชัดขึ้น')
})


test('Non cleanup and forecast-prep lines are fixed Thai strings', () => {
  assert.equal(nonSpeechForClean(), 'ชายฝั่งโล่งขึ้นแล้ว — ขยะลดลง สัตว์กลับมาง่ายขึ้น')
  assert.equal(
    nonSpeechForForecastPrep('มรสุมกำลังเข้า', 7),
    'แนวป้องกันช่วยแล้ว — มรสุมกำลังเข้า เสียหายน้อยลง (เหลือ −7)',
  )
  assert.equal(
    nonSpeechForForecastPrep(),
    'แนวป้องกันช่วยแล้ว — ความเสียหายจากเหตุการณ์ลดลง',
  )
})

test('first crab Mali celebration line is a fixed Thai string', () => {
  assert.equal(maliSpeechForFirstCrab(), 'ปูก้ามดาบตัวแรก! อ่าวเริ่มมีชีวิตแล้ว เก็บไว้ในสมุดสัตว์นะ')
})

test('createSpeech returns plain ephemeral data with no save coupling', () => {
  assert.equal(SPEECH_MS, 3500)
  const speech = createSpeech('mali', maliSpeechForPlotCare(), 'plot-care')
  assert.equal(speech.speaker, 'mali')
  assert.equal(speech.text, 'แปลงนี้แข็งแรงขึ้นแล้ว')
  assert.equal(speech.actionId, 'plot-care')
  assert.match(speech.id, /^plot-care-\d+$/)
  assert.deepEqual(Object.keys(speech).sort(), ['actionId', 'id', 'speaker', 'text'])
  assert.equal(JSON.parse(JSON.stringify(speech)).text, speech.text)
  assert.equal('localStorage' in speech, false)
  assert.equal('save' in speech, false)
  assert.equal('game' in speech, false)
  const non = createSpeech('non', nonSpeechForPatrol('น้ำทะเลหนุนสูงผิดปกติ'), 'patrol')
  assert.equal(non.speaker, 'non')
  assert.match(non.id, /^patrol-\d+$/)
})

test('tomorrow-wait Mali tip is a fixed Thai string', () => {
  assert.equal(
    maliSpeechForTomorrowWait(),
    'พรุ่งนี้มีงานรอที่อ่าว — เปิดภาคสนามแล้วลุยต่อได้เลย',
  )
})

test('wildlife drip speech lines name the animal in Thai', () => {
  assert.equal(ingSpeechForWildlifeDrip('ปูก้ามดาบ'), 'เจอปูก้ามดาบแล้ว! บันทึกลงสมุดสัตว์นะ')
  assert.equal(nonSpeechForWildlifeDrip('ฝูงปลาวัยอ่อน'), 'ดูสิ — ฝูงปลาวัยอ่อน! อ่าวมีชีวิตขึ้นอีกแล้ว')
})

test('maliSpeechForStreak returns Thai lines by streak tier', () => {
  assert.equal(maliSpeechForStreak(1), 'เริ่มต่อเนื่องแล้ว — ส่งงานถัดไปให้ติดกันนะ')
  assert.equal(maliSpeechForStreak(2), 'สองงานติด! โบนัสต่อเนื่องกำลังสะสม')
  assert.equal(maliSpeechForStreak(3), 'สามงานติด! ทีมฟื้นฟูกำลังร้อนแรง')
  assert.equal(maliSpeechForStreak(4), '4 งานติด! โบนัสต่อเนื่องเต็มกำลัง')
  assert.equal(maliSpeechForStreak(6, true), 'สถิติใหม่ 6 งานติด! ส่งมอบยอดเยี่ยมมาก')
})
