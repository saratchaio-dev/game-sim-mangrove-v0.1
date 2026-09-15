import test from 'node:test'
import assert from 'node:assert/strict'
import {
  SPEECH_MS,
  maliSpeechForPlant,
  maliSpeechForCrewCare,
  maliSpeechForPlotCare,
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
})
