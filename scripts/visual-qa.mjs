import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
// CI installs Playwright without saving it as an app dependency.
const { chromium } = await import(process.env.QA_PLAYWRIGHT_MODULE || 'playwright')
const outputDir = process.env.QA_OUTPUT || 'visual-qa'
const saveKey = 'mangrove-bay-3d-save-v2'
let server
if (process.env.QA_LOCAL_SERVER === '1') {
  const { createServer } = await import('vite')
  server = await createServer({ server: { host: '127.0.0.1', port: 5173 }, logLevel: 'error' })
  await server.listen()
}
await fs.mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({
  headless: true,
  ...(process.env.QA_BROWSER_PATH ? { executablePath: process.env.QA_BROWSER_PATH } : {}),
  args: ['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],
})
const errors = []
const report = { viewports: [], checks: [], errors }
const check = (name) => { report.checks.push(name); console.log(`PASS ${name}`) }
const state = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), saveKey)
async function open(viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 })
  page.on('pageerror', (e) => errors.push(e.stack || e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.addInitScript(() => localStorage.setItem('mangrove-bay-3d-help-seen','1'))
  await page.goto(`${process.env.QA_URL || 'http://127.0.0.1:5173'}/?qa=1`)
  await page.waitForFunction(() => window.__coastDiagnostics?.().actors.length >= 4)
  const lighting0 = await assertLighting(page)
  assert.ok(['day', 'golden', 'storm'].includes(lighting0.preset))
  assert.equal(typeof lighting0.tideOffset, 'number')
  const forecast0 = await page.evaluate(async () => {
    const day = JSON.parse(localStorage.getItem('mangrove-bay-3d-save-v2')).day
    // Inline the same rules as forecastFor for assert without bundling.
    return {
      day,
      golden: day % 6 >= 3,
      tideOffset: [-0.1, 0, 0.14, 0.03][(day - 1) % 4],
      expectedPreset: (day % 6 >= 3) ? 'golden' : 'day',
    }
  })
  assert.equal(lighting0.tideOffset, forecast0.tideOffset, 'lighting.tideOffset must match forecast')
  assert.equal(lighting0.preset, forecast0.expectedPreset, 'clear weather preset follows golden/day from forecast')
  check('mood lighting publishes lighting.preset/sky/fog/tideOffset on diagnostics')
  assert.equal(typeof (await page.evaluate(() => window.__coastDiagnostics()?.wildlifeUnlockFx)), 'boolean',
    'diagnostics.wildlifeUnlockFx must be published for drip FX QA')
  check('diagnostics publish wildlifeUnlockFx for wildlife-drip beat')
  const scenery = await page.evaluate(() => window.__coastDiagnostics().scenery)
  assert.ok(scenery?.batchCount > 0, 'scenery batches should be present')
  assert.ok(scenery.batches.some((b) => b.name === 'sky-clouds'), 'clouds should be instanced as sky-clouds')
  check('scenery batching publishes scenery.batches including sky-clouds')

  await page.evaluate(() => document.fonts.ready)
  return page
}
async function shot(page,name) {
  await page.screenshot({ path: `${outputDir}/${name}.png` })
}
async function layout(page) {
  return page.evaluate(() => {
    const inspect = (selector) => {
      const e = document.querySelector(selector), r=e.getBoundingClientRect()
      return { selector, x:r.x, y:r.y, width:r.width, height:r.height, visible:getComputedStyle(e).display !== 'none' }
    }
    return { viewport: { width:innerWidth, height:innerHeight }, overflow: document.documentElement.scrollWidth > innerWidth,
      elements:['.top-hud','.left-stack','.plant-dock','.utility-rail','.notice-toast'].map(inspect) }
  })
}
async function workerState(page,index,wanted) {
  await page.waitForFunction(({index,wanted}) => window.__coastDiagnostics().actors.some(a => a.name === `crew-${index}` && a.state === wanted),{index,wanted},{timeout:45000})
  await page.waitForTimeout(700) // Let the joint blend settle before the pose screenshot.
  await shot(page,`worker-${wanted}`)
  check(`successful action reaches the ${wanted} pose in the live scene`)
}
async function endDay(page) {
  await page.getByRole('button',{name:'จบวันนี้',exact:true}).click()
  await page.waitForSelector('.day-plan-cliffhanger, [data-forecast-tomorrow]', { timeout: 15000 })
  const cliff = await page.evaluate(() => {
    const modal = document.querySelector('.day-plan-cliffhanger') || document.querySelector('.day-plan-modal')
    const forecast = modal?.getAttribute('data-forecast-tomorrow')
      || document.querySelector('[data-forecast-tomorrow]')?.getAttribute('data-forecast-tomorrow')
      || document.querySelector('[data-forecast-tomorrow]')?.textContent?.trim()
      || null
    const daysLeftAttr = modal?.getAttribute('data-contract-days-left')
      ?? document.querySelector('[data-contract-days-left]')?.getAttribute('data-contract-days-left')
    const maliTip = document.querySelector('.mali-dawn-tip, .day-plan-cliffhanger [data-character-speech="mali"]')
    return {
      forecast: forecast && String(forecast).trim() ? String(forecast).trim() : null,
      daysLeft: daysLeftAttr === '' || daysLeftAttr == null ? null : String(daysLeftAttr),
      maliTip: Boolean(maliTip?.textContent?.trim()),
    }
  })
  assert.ok(cliff.forecast, `end-day cliffhanger must expose forecast-tomorrow; got ${JSON.stringify(cliff)}`)
  assert.ok(cliff.daysLeft != null || cliff.maliTip,
    `end-day must show contract-days-left or Mali dawn tip; got ${JSON.stringify(cliff)}`)
  const keys = await page.evaluate(() => Object.keys(localStorage))
  assert.ok(!keys.some((key) => /cliffhanger|forecast-tomorrow|dawn-tip/i.test(key)),
    `cliffhanger must not add save keys; got ${keys.join(',')}`)
  await page.getByRole('button',{name:/ยืนยันจบวัน/}).click()
  const g=await state(page)
  if(g.event) {
    await page.locator('.choice-list button:not(:disabled)').last().click()
    assert.equal((await state(page)).event,null)
  }
}
async function selectPlot(page,id) {
  await page.getByRole('button',{name:'เปิดแผนที่แปลง',exact:true}).click()
  await page.locator('.plot-picker button').nth(id-1).click()
}
async function toastStatus(page) {
  assert.equal(await page.locator('.notice-toast').getAttribute('role'), 'status')
}
async function maliSpeechText(page) {
  return page.evaluate(() => {
    const fromDiag = window.__coastDiagnostics()?.maliSpeech
    if (typeof fromDiag === 'string' && fromDiag.trim()) return fromDiag.trim()
    const el = document.querySelector('[data-character-speech="mali"], .mali-speech, [data-mali-speech]')
    const text = el?.textContent?.replace(/\s+/g, ' ').trim() || ''
    if (!text) return null
    if (/มะลิ|ปลูก|ดูแล|บำรุง|plant|care|maintain/i.test(text)) return text
    return null
  })
}
async function waitMaliSpeech(page) {
  await page.waitForFunction(() => {
    const fromDiag = window.__coastDiagnostics()?.maliSpeech
    if (typeof fromDiag === 'string' && fromDiag.trim()) return true
    const el = document.querySelector('[data-character-speech="mali"], .mali-speech, [data-mali-speech]')
    const text = el?.textContent?.replace(/\s+/g, ' ').trim() || ''
    return /มะลิ|ปลูก|ดูแล|บำรุง|plant|care|maintain/i.test(text)
  }, null, { timeout: 45000 })
  return maliSpeechText(page)
}
async function assertNoSpeechSaveKeys(page) {
  const keys = await page.evaluate(() => Object.keys(localStorage))
  assert.ok(keys.includes('mangrove-bay-3d-save-v2'), 'canonical save key must remain')
  assert.ok(!keys.some((key) => /speech|mali-speech|ephemeral-speech|plant-care-speech/i.test(key)),
    `speech must not introduce a new save key; got ${keys.join(',')}`)
  const save = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), saveKey)
  for (const banned of ['maliSpeech', 'speech', 'particleRoot', 'particles', 'shoreCue', 'worldAction']) {
    assert.ok(!(banned in save), `${banned} must not persist in the save blob`)
  }
}

async function assertLighting(page, { preset, tideOffset } = {}) {
  await page.waitForFunction(() => window.__coastDiagnostics?.()?.lighting?.preset, null, { timeout: 15000 })
  const lighting = await page.evaluate(() => window.__coastDiagnostics().lighting)
  if (preset) assert.equal(lighting.preset, preset, `lighting.preset should be ${preset}`)
  assert.ok(lighting.sky && lighting.fog, 'lighting.sky/fog must be present')
  assert.equal(lighting.sky, lighting.fog, 'fog/sky should share the mood color on this pass')
  if (tideOffset != null) assert.equal(lighting.tideOffset, tideOffset)
  return lighting
}

async function waitWorldAction(page, type) {
  await page.waitForFunction((wanted) => window.__coastDiagnostics()?.worldAction?.type === wanted, type, { timeout: 15000 })
}
async function waitParticleCycle(page) {
  await page.waitForFunction(() => {
    const value = window.__coastDiagnostics()?.particleRoot
    return value === true || value?.mounted === true
  }, null, { timeout: 20000 })
  await page.waitForFunction(() => {
    const value = window.__coastDiagnostics()?.particleRoot
    return value === false || value == null || value?.mounted === false
  }, null, { timeout: 30000 })
}
async function assertShoreCue(page, { expectActive }) {
  const shoreCue = await page.evaluate(() => window.__coastDiagnostics()?.shoreCue ?? null)
  if (expectActive) {
    assert.ok(shoreCue && (shoreCue.active === true || shoreCue.source === 'plant' || shoreCue === true),
      `plant beat must expose shoreCue; got ${JSON.stringify(shoreCue)}`)
  } else {
    assert.ok(!shoreCue || shoreCue.active === false || shoreCue === null,
      `care beat must not touch wildlife shoreCue; got ${JSON.stringify(shoreCue)}`)
  }
}

try {
  const page=await open({width:1440,height:900})
  await shot(page,'desktop-initial')
  const before = await page.evaluate(()=>window.__coastDiagnostics())
  await page.waitForTimeout(1500)
  const after = await page.evaluate(()=>window.__coastDiagnostics())
  for(const actor of before.actors.filter(a=>a.name.startsWith('crew-')||a.name==='coast-boat')) {
    assert.notDeepEqual(after.actors.find(a=>a.name===actor.name).position,actor.position,`${actor.name} must move`)
  }
  report.render = { calls:after.calls, triangles:after.triangles, actorCount:after.actors.length }
  for(const actor of after.actors.filter(a=>a.name.startsWith('crew-'))) {
    assert.equal(actor.pickHits,0,'worker must not intercept plot rays')
    for(const part of ['head','neck','torso','shoulder','upper-arm','forearm','hand','hips','thigh','knee','shin','boot-toe'])assert.ok(actor.parts.includes(part),`${actor.name} missing ${part}`)
  }
  check('articulated body parts exist and rays through workers have zero worker hits')
  check('three articulated characters and the boat move in the live scene')
  await page.getByRole('button',{name:'เปิดแผนภาคสนาม',exact:true}).click()
  await shot(page,'desktop-planning')
  await page.locator('.contract-offers button').filter({hasText:'รากใหม่'}).click()
  await page.locator('[data-crew="clean"]').click()
  assert.equal((await state(page)).expedition.counters.clean,1)
  assert.equal(await page.locator('[data-crew="clean"]').isDisabled(),true)
  await page.waitForSelector('[data-character-speech="non"][data-speech-action="cleanup"]', { timeout: 10000 })
  check('Non ephemeral speech appears after cleanup')
  await page.getByRole('button',{name:'ปิดแผนภาคสนาม',exact:true}).click()
  await workerState(page,1,'cleanup')
  check('accepting a contract and doing fieldwork persists and blocks double rewards')

  // Real canvas raycasting selects an empty plot without spending coins.
  const projected=(await page.evaluate(()=>window.__coastDiagnostics())).plots.find(p=>p.id===5)
  const beforeSelect=await state(page)
  await page.mouse.click(projected.x,projected.y)
  await page.waitForSelector('.confirm-plant')
  assert.equal((await state(page)).coins,beforeSelect.coins)
  await shot(page,'desktop-plot-preview')
  await page.locator('.confirm-plant').click()
  assert.equal((await state(page)).plots[4].species,'rhizophora')
  // Plant/care on-scene beat — Gameplay/Visual prerequisites on __coastDiagnostics()
  // (merged from window.__coastBeat, plus named scene roots):
  //   worldAction: { type:'plant'|'care', plotId?, id? } | null  (App mirrors under ?qa=1)
  //   particleRoot: boolean | { mounted:boolean }  // true while beat FX root is mounted
  //   shoreCue: { active:true, source:'plant' } | null | true  // ONLY during plant beat
  //   maliSpeech: string | null  // optional; DOM [data-character-speech=mali] also accepted
//   particle scene roots: action-fx-plant | action-fx-care (Visual)
//   wildlife userData.shoreCue after plant only
  // Pose names: actors[].state|task must be plant | maintain (care → maintain via workerTask).
  await waitWorldAction(page, 'plant')
  assert.equal((await page.evaluate(() => window.__coastDiagnostics().worldAction.type)), 'plant')
  await toastStatus(page)
  const plantSpeech = await waitMaliSpeech(page)
  assert.ok(plantSpeech, 'Mali ephemeral speech must appear after plant')
  await assertNoSpeechSaveKeys(page)
  await workerState(page,0,'plant')
  await waitParticleCycle(page)
  await assertShoreCue(page, { expectActive: true })
  check('plant on-scene beat: worldAction, toast status, Mali speech, plant pose, particles, shore cue')
  // Plant the rest through the keyboard-accessible map.
  await page.locator('.species-tool').nth(2).click()
  await selectPlot(page,1); await page.locator('.confirm-plant').click()
  await page.locator('.species-tool').nth(1).click()
  await selectPlot(page,11); await page.locator('.confirm-plant').click()
  await page.locator('.mission-card button').click()
  await page.locator('.restoration-card .field-plan-button').click()
  assert.equal((await state(page)).expedition.completed,1)
  check('canvas preview, three species, mission reward and restoration delivery work together')
  await page.getByRole('button',{name:'เปิดแผนภาคสนาม',exact:true}).click()
  await page.locator('[data-crew="care"]').click()
  await waitWorldAction(page, 'care')
  assert.equal((await page.evaluate(() => window.__coastDiagnostics().worldAction.type)), 'care')
  await toastStatus(page)
  await assertShoreCue(page, { expectActive: false })
  await page.getByRole('button',{name:'ปิดแผนภาคสนาม',exact:true}).click()
  const careSpeech = await waitMaliSpeech(page)
  assert.ok(careSpeech, 'Mali ephemeral speech must appear after care')
  await assertNoSpeechSaveKeys(page)
  await workerState(page,0,'maintain')
  // Pose must be maintain, never a literal "care" pose name on Mali.
  const mali = await page.evaluate(() => window.__coastDiagnostics().actors.find((a) => a.name === 'crew-0'))
  assert.ok(mali.state === 'maintain' || mali.task === 'maintain')
  assert.notEqual(mali.state, 'care')
  assert.notEqual(mali.task, 'care')
  await waitParticleCycle(page)
  await assertShoreCue(page, { expectActive: false })
  check('care on-scene beat: worldAction care, toast status, Mali speech, maintain pose, particles, no shore cue')
  // Selection details must remain usable at tablet width.
  await selectPlot(page,4)
  const funds=(await state(page)).coins
  await page.locator('.soil-action').click()
  assert.equal((await state(page)).coins,funds-40)
  assert.equal((await state(page)).plots[3].prepared,true)
  await page.reload();await page.waitForFunction(()=>window.__coastDiagnostics)
  assert.equal((await state(page)).plots[3].prepared,true)
  await page.waitForFunction(() => window.__coastDiagnostics?.().actors.length >= 4)
  assert.equal(await maliSpeechText(page), null, 'reload must drop ephemeral Mali speech')
  assert.equal(await page.evaluate(() => window.__coastDiagnostics()?.maliSpeech ?? null), null)
  await assertNoSpeechSaveKeys(page)
  check('soil improvement and contract completion survive reload')
  check('Mali speech is ephemeral: absent after reload and never stored under a new save key')

  // One More Dawn cliffhanger on the end-day panel (asserted inside endDay).
  await endDay(page)
  check('end-day cliffhanger shows forecast-tomorrow and contract-days-left or Mali tip')
  for(let i=0;i<5;i++) await endDay(page)
  assert.equal((await state(page)).day,7)
  assert.equal((await state(page)).plots.filter(p=>p.species&&p.age>=6).length,3)
  await page.getByRole('button',{name:'เปิดแผนภาคสนาม',exact:true}).click()
  assert.equal(await page.locator('[data-crew="survey"]').isEnabled(),true)
  await page.locator('[data-crew="survey"]').click()
  await page.waitForSelector('[data-character-speech="ing"][data-speech-action="survey"]', { timeout: 10000 })
  check('Ing ephemeral speech appears after survey')
  await page.getByRole('button',{name:'ปิดแผนภาคสนาม',exact:true}).click()
  await workerState(page,2,'inspect')
  check('growth, forecast storm resolution and habitat-driven survey unlock succeed')
  await page.getByRole('button',{name:'เปิดเศรษฐกิจ',exact:true}).click()
  await page.locator('.carbon-panel .primary-game-button').click()
  const verified=await state(page)
  assert.equal(verified.estimatedCarbon,0)
  assert.ok(verified.credits>0)
  await workerState(page,2,'mrv')
  await page.locator('.market-actions button').last().click()
  assert.ok((await state(page)).coins>verified.coins)
  await page.getByRole('button',{name:'ปิดเศรษฐกิจ',exact:true}).click()
  check('earned carbon can be verified and sold through the collapsed economy panel')
  await page.getByRole('button',{name:'โหมดชมวิว',exact:true}).click()
  assert.equal(await page.locator('.game-ui').isVisible(),false)
  await page.waitForFunction(() => {
    const shell = document.querySelector('.game3d-shell')
    return shell?.getAttribute('data-photo-mode') === 'true'
  }, null, { timeout: 10000 })
  const photoDiag = await page.evaluate(() => {
    const shell = document.querySelector('.game3d-shell')
    const brand = document.querySelector('[data-title-brand]')
    return {
      dataPhoto: shell?.getAttribute('data-photo-mode'),
      classPhoto: shell?.classList.contains('photo-mode') === true,
      titleBrand: brand?.getAttribute('data-title-brand') || null,
      photoMode: window.__coastDiagnostics?.()?.photoMode ?? window.__coastBeat?.photoMode ?? null,
      chrome: Boolean(document.querySelector('.photo-mode-chrome')),
    }
  })
  assert.equal(photoDiag.dataPhoto, 'true', 'data-photo-mode must be true in photo mode')
  assert.ok(photoDiag.classPhoto, 'shell must have photo-mode class')
  assert.equal(photoDiag.titleBrand, 'mangrove-bay', 'data-title-brand must be mangrove-bay')
  assert.equal(photoDiag.photoMode, true, 'diagnostics.photoMode must be true')
  assert.ok(photoDiag.chrome, 'photo-mode-chrome must be present')
  check('photo mode exposes data-photo-mode, title brand, and diagnostics.photoMode')
  await shot(page,'desktop-photo')
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('.game-ui').isVisible(),true)
  const photoOff = await page.evaluate(() => ({
    dataPhoto: document.querySelector('.game3d-shell')?.getAttribute('data-photo-mode'),
    photoMode: window.__coastDiagnostics?.()?.photoMode ?? window.__coastBeat?.photoMode ?? null,
  }))
  assert.equal(photoOff.dataPhoto, 'false')
  assert.equal(photoOff.photoMode, false)
  check('photo mode hides HUD and Escape restores play')
  await shot(page,'desktop-played')

  const played=await state(page)
  for(const viewport of [{width:1440,height:900},{width:1024,height:768},{width:768,height:1024},{width:390,height:844}]) {
    await page.setViewportSize(viewport)
    // Phone/tablet widths ≤900 must engage compact HUD chrome.
    if (viewport.width <= 900) {
      await page.waitForFunction(() => {
        const shell = document.querySelector('.game3d-shell')
        return shell?.classList.contains('hud-compact') || shell?.getAttribute('data-hud-compact') === 'true'
      }, null, { timeout: 10000 })
      const compact = await page.evaluate(() => {
        const shell = document.querySelector('.game3d-shell')
        return {
          classCompact: shell?.classList.contains('hud-compact') === true,
          dataCompact: shell?.getAttribute('data-hud-compact') === 'true',
          diag: window.__coastDiagnostics?.()?.hudCompact ?? window.__coastBeat?.hudCompact ?? null,
        }
      })
      assert.ok(compact.classCompact || compact.dataCompact,
        `viewport ${viewport.width} must expose .hud-compact or data-hud-compact=true; got ${JSON.stringify(compact)}`)
      assert.equal(compact.diag, true, `diagnostics/__coastBeat.hudCompact must be true at width ${viewport.width}`)
      check(`compact HUD active at viewport width ${viewport.width}`)
    }
    const l=await layout(page)
    assert.equal(l.overflow,false)
    for(const e of l.elements.filter(e=>e.visible)) {
      assert.ok(e.x>=-1 && e.y>=-1 && e.x+e.width<=viewport.width+1 && e.y+e.height<=viewport.height+1,`viewport overflow: ${e.selector} ${JSON.stringify(e)}`)
    }
    const dock=l.elements.find(e=>e.selector==='.plant-dock'), rail=l.elements.find(e=>e.selector==='.utility-rail')
    const overlap = dock.x<rail.x+rail.width && dock.x+dock.width>rail.x && dock.y<rail.y+rail.height && dock.y+dock.height>rail.y
    assert.equal(overlap,false,'toolbars must not overlap')
    await shot(page,`layout-${viewport.width}`)
    await page.getByRole('button',{name:'เปิดแผนภาคสนาม',exact:true}).click()
    await shot(page,`planning-${viewport.width}`)
    await page.getByRole('button',{name:'ปิดแผนภาคสนาม',exact:true}).click()
    await selectPlot(page,1)
    const detail=await page.locator('.selected-plot-card').boundingBox()
    assert.ok(detail.x>=0 && detail.y>=0 && detail.x+detail.width<=viewport.width+1)
    await shot(page,`selection-${viewport.width}`)
    await page.getByRole('button',{name:'ปิดรายละเอียด',exact:true}).click()
    report.viewports.push(l)
  }
  check('desktop, landscape tablet, portrait tablet and phone controls stay inside viewport without overlapping toolbars')

  // Established habitat is a documented fixture, not the source of core-loop success.
  const developed={...played,day:24,coins:1800,biodiversity:75,community:55,coastal:65,
    journey:{...played.journey,sandbox:true},upgrades:{nursery:2,mrv:2,community:2},
    plots:played.plots.map((p,i)=>({...p,species:p.tide==='สูง'?'avicennia':i%2?'rhizophora':'sonneratia',age:8,health:95,dead:false})),stats:{...played.stats,planted:16}}
  await page.evaluate(({key,g})=>localStorage.setItem(key,JSON.stringify(g)),{key:saveKey,g:developed})
  await page.setViewportSize({width:1440,height:900});await page.reload()
  await page.waitForFunction(()=>window.__coastDiagnostics?.().actors.length>4)
  await shot(page,'desktop-restored')
  const animals1=await page.evaluate(()=>window.__coastDiagnostics())
  await page.waitForTimeout(1200)
  const animals2=await page.evaluate(()=>window.__coastDiagnostics())
  for(const animal of animals1.actors.filter(a=>/coast-crab|coast-fish/.test(a.name))) assert.notDeepEqual(animals2.actors.find(a=>a.name===animal.name).position,animal.position)
  report.restoredRender={calls:animals2.calls,triangles:animals2.triangles,actorCount:animals2.actors.length}
  check('restored habitat adds wildlife whose positions animate')
  // Empty journal must stay quiet; 4/4 discovered must mount crab/fish/bird (fish above mudline).
  await page.evaluate((key) => {
    const g = JSON.parse(localStorage.getItem(key))
    g.journey = { ...(g.journey || {}), discovered: [], sandbox: true }
    localStorage.setItem(key, JSON.stringify(g))
  }, saveKey)
  await page.reload()
  await page.waitForFunction(() => window.__coastDiagnostics?.()?.actors?.length >= 4)
  const emptyPlot = await page.evaluate(() => {
    const d = window.__coastDiagnostics()
    return {
      plotWildlife: d.plotWildlife,
      crabs: d.actors.filter((a) => a.name.startsWith('coast-crab-')).length,
      fish: d.actors.filter((a) => a.name.startsWith('coast-fish-')).length,
      birds: d.actors.filter((a) => a.name.startsWith('coast-bird-')).length,
    }
  })
  await page.evaluate((key) => {
    const g = JSON.parse(localStorage.getItem(key))
    g.journey = { ...(g.journey || {}), discovered: ['crab', 'fish', 'bird', 'firefly'], sandbox: true }
    localStorage.setItem(key, JSON.stringify(g))
  }, saveKey)
  await page.reload()
  await page.waitForFunction(() => window.__coastDiagnostics?.()?.actors?.length >= 4)
  await page.waitForFunction(() => window.__coastDiagnostics?.()?.plotWildlife === true, null, { timeout: 20000 })
  const fullPlot = await page.evaluate(() => {
    const d = window.__coastDiagnostics()
    const fish = d.actors.filter((a) => a.name.startsWith('coast-fish-'))
    return {
      plotWildlife: d.plotWildlife,
      crabs: d.actors.filter((a) => a.name.startsWith('coast-crab-')).length,
      fish: fish.length,
      birds: d.actors.filter((a) => a.name.startsWith('coast-bird-')).length,
      fishMinY: fish.length ? Math.min(...fish.map((a) => a.position[1])) : null,
    }
  })
  assert.equal(fullPlot.plotWildlife, true, 'plot-wildlife group must mount when journal has fauna')
  assert.ok(fullPlot.crabs > emptyPlot.crabs, `4/4 must show more crabs than empty journal; empty=${JSON.stringify(emptyPlot)} full=${JSON.stringify(fullPlot)}`)
  assert.ok(fullPlot.fish > 0, `4/4 must spawn coast-fish actors; got ${JSON.stringify(fullPlot)}`)
  assert.ok(fullPlot.birds > 0, `4/4 must spawn coast-bird actors; got ${JSON.stringify(fullPlot)}`)
  assert.ok(fullPlot.fishMinY == null || fullPlot.fishMinY > 0.05,
    `plot fish must sit above mudline (not buried); fishMinY=${fullPlot.fishMinY}`)
  check('discovered journal empty is quiet; 4/4 mounts crab/fish/bird above mudline')
  // Developed habitat must publish numeric wildlife counts via diagnostics.
  const wildlife = animals2.wildlife ?? (await page.evaluate(() => window.__coastDiagnostics()?.wildlife ?? null))
  assert.ok(wildlife, 'diagnostics.wildlife must be published for developed habitat')
  assert.equal(typeof wildlife.crabs, 'number', 'wildlife.crabs must be a number')
  assert.equal(typeof wildlife.birds, 'number', 'wildlife.birds must be a number')
  assert.equal(typeof wildlife.fish, 'number', 'wildlife.fish must be a number')
  assert.ok(wildlife.crabs + wildlife.fish + wildlife.birds > 0,
    `developed habitat wildlife counts must be > 0; got ${JSON.stringify(wildlife)}`)
  check('restored habitat diagnostics.wildlife has crabs/birds/fish counts > 0')
  // Recorded forecast changes the scene and the actual decision.
  // Golden day without weather event (day 4 → golden, tideOffset 0.03).
  await page.evaluate((key)=>{const g=JSON.parse(localStorage.getItem(key));g.day=4;g.event=null;localStorage.setItem(key,JSON.stringify(g))},saveKey)
  await page.reload()
  await page.waitForFunction(() => window.__coastDiagnostics?.()?.actors?.length >= 4)
  await page.waitForFunction(() => window.__coastDiagnostics?.()?.lighting?.preset)
  await assertLighting(page, { preset: 'golden', tideOffset: 0.03 })
  check('golden forecast maps to lighting.preset golden with matching sky/fog/tideOffset')
  // Storm overrides golden.
  await page.evaluate((key)=>{const g=JSON.parse(localStorage.getItem(key));g.day=25;g.event={id:'storm'};localStorage.setItem(key,JSON.stringify(g))},saveKey)
  await page.reload();await page.waitForSelector('.event-modal')
  await page.waitForFunction(() => window.__coastDiagnostics?.()?.lighting?.preset)
  await shot(page,'desktop-storm')
  await assertLighting(page, { preset: 'storm' })
  check('storm weather maps to lighting.preset storm with matching sky/fog')
  await page.locator('.choice-list button').last().click()
  assert.equal((await state(page)).event,null)
  check('a saved weather event rehydrates and resolves')
  assert.deepEqual(errors,[],'browser console/page errors')
  check('no browser console errors or unhandled page errors')
} finally {
  await fs.writeFile(`${outputDir}/qa-report.json`,JSON.stringify(report,null,2))
  await browser.close()
  await server?.close()
}
