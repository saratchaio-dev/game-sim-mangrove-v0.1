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
  maliSpeechForBayCelebration,
  maliSpeechForMaxLegend,
  nonSpeechForClean,
  nonSpeechForPatrol,
  nonSpeechForForecastPrep,
  ingSpeechForSurvey,
  ingSpeechForWildlifeDrip,
  nonSpeechForWildlifeDrip,
  nonSpeechForStorm,
  nonSpeechForKingtide,
  ingSpeechForMrv,
  ingSpeechForRankUp,
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

test('Non storm and kingtide resolve lines include event title when provided', () => {
  assert.equal(
    nonSpeechForStorm('มรสุมกำลังเข้า'),
    'รับมือมรสุมกำลังเข้า แล้ว — ตรวจต้นอ่อนและซ่อมจุดอ่อนต่อได้เลย',
  )
  assert.equal(
    nonSpeechForStorm(),
    'มรสุมผ่านไปแล้ว — ตรวจต้นอ่อนและซ่อมจุดอ่อนต่อได้เลย',
  )
  assert.equal(
    nonSpeechForStorm(''),
    'มรสุมผ่านไปแล้ว — ตรวจต้นอ่อนและซ่อมจุดอ่อนต่อได้เลย',
  )
  assert.equal(
    nonSpeechForKingtide('น้ำทะเลหนุนสูงผิดปกติ'),
    'ผ่านน้ำทะเลหนุนสูงผิดปกติ มาแล้ว — แนวชายฝั่งยังอยู่ ดูแลรากต่อนะ',
  )
  assert.equal(
    nonSpeechForKingtide(),
    'น้ำหนุนผ่านไปแล้ว — แนวชายฝั่งยังอยู่ ดูแลรากต่อนะ',
  )
})

test('Ing MRV line includes verified amount when provided', () => {
  assert.equal(ingSpeechForMrv(8.4), 'ออกเครดิตแล้ว 8.4 tCO₂e — ป่าพิสูจน์คุณค่าแล้ว')
  assert.equal(ingSpeechForMrv(12), 'ออกเครดิตแล้ว 12 tCO₂e — ป่าพิสูจน์คุณค่าแล้ว')
  assert.equal(ingSpeechForMrv(), 'ออกเครดิต MRV แล้ว — ป่าพิสูจน์คุณค่าแล้ว')
  assert.equal(ingSpeechForMrv(0), 'ออกเครดิต MRV แล้ว — ป่าพิสูจน์คุณค่าแล้ว')
})

test('late-game bay and rank speech lines are fixed Thai strings', () => {
  assert.equal(maliSpeechForBayCelebration(), 'อ่าวฟื้นเต็มร้อย! ป่าชายเลนกลับมามีชีวิตสมบูรณ์แล้ว')
  assert.equal(ingSpeechForRankUp('ผู้นำชุมชนชายฝั่ง'), 'ขึ้นยศ「ผู้นำชุมชนชายฝั่ง」แล้ว — อ่าวจดจำทุกก้าวของทีมเรา')
  assert.equal(maliSpeechForMaxLegend('มรดกป่าชายเลน'), '「มรดกป่าชายเลน」— มรดกของอ่าวอยู่กับเราแล้ว ดูแลต่อไปนะ')
})

