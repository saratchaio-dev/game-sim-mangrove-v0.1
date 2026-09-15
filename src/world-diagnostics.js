import { Raycaster, Vector2, Vector3 } from 'three'

// On-demand snapshots only. No scene traversal or raycasting in a frame callback.
export function installWorldDiagnostics({ gl, scene, camera, plotPositions, frames, resources, quality }) {
  const projected = new Vector3(), screen = new Vector2(), ray = new Raycaster()
  const read = () => {
    const actors = [], counts = { crew: 0, villagers: 0, wildlife: 0, boats: 0, drones: 0 }
    let meshNodes = 0, instanceCount = 0, shadowCasters = 0
    const effectiveVisibility = (object) => {
      for (let current = object; current; current = current.parent) if (!current.visible) return false
      return true
    }
    const beat = window.__coastBeat || null
    const beatOwnsParticle = Boolean(beat && Object.prototype.hasOwnProperty.call(beat, 'particleRoot'))
    let particleRoot = beatOwnsParticle ? beat.particleRoot : false
    let wildlifeShore = null
    const sceneryBatches = []
    scene.traverse((object) => {
      if (object.isInstancedMesh && object.userData?.sceneryBatch) {
        sceneryBatches.push({
          name: object.name || object.userData.batchName || 'batch',
          count: object.count,
        })
      }
      if (object.isMesh) {
        meshNodes += 1
        if (object.isInstancedMesh) instanceCount += object.count
        if (object.castShadow && effectiveVisibility(object)) shadowCasters += 1
      }
      // Named beat FX root when Visual does not publish particleRoot on __coastBeat.
      if (!beatOwnsParticle && (
        object.name === 'plant-care-particles' ||
        object.name === 'beat-particles' ||
        object.name === 'action-fx-plant' ||
        object.name === 'action-fx-care'
      )) particleRoot = true
      if (!/^(crew-|village-npc-|coast-(boat|crab-|fish-|bird-|drone))/.test(object.name)) return
      const actor = { name: object.name, position: object.position.toArray(),
        state: object.userData.workerState || object.userData.villageActivity,
        task: object.userData.workerTask,
        shoreCue: object.userData.shoreCue || null }
      if (object.name.startsWith('crew-')) {
        counts.crew += 1
        const head = object.getObjectByName('head')
        ;(head || object).getWorldPosition(projected).project(camera)
        ray.setFromCamera(screen.set(projected.x, projected.y), camera)
        actor.pickHits = ray.intersectObject(object, true).length
        actor.parts = []
        object.traverse((part) => { if (part.isMesh && part.name) actor.parts.push(part.name) })
      } else if (object.name.startsWith('village-npc-')) counts.villagers += 1
      else if (object.name === 'coast-boat') counts.boats += 1
      else if (object.name === 'coast-drone') counts.drones += 1
      else {
        counts.wildlife += 1
        if (object.userData.shoreCue && !wildlifeShore) wildlifeShore = object.userData.shoreCue
      }
      actors.push(actor)
    })
    const times = frames.samples.slice().sort((a, b) => a - b)
    const mean = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0
    return {
      calls: gl.info.render.calls, triangles: gl.info.render.triangles,
      meshNodes, instanceCount, shadowCasters, actors, actorCounts: counts,
      geometries: gl.info.memory.geometries, textures: gl.info.memory.textures,
      programs: gl.info.programs?.length || 0, sharedResources: resources.stats(),
      dpr: gl.getPixelRatio(), quality: quality.tier,
      frameMs: { mean, p50: times[Math.floor(times.length * .5)] || 0, p95: times[Math.floor(times.length * .95)] || 0 },
      fps: mean ? 1000 / mean : 0,
      heapUsedBytes: performance.memory?.usedJSHeapSize ?? null,
      camera: { position: camera.position.toArray(), zoom: camera.zoom },
      // Plant/care on-scene beat bag (qa only). Gameplay/Visual publish via window.__coastBeat.
      worldAction: beat?.worldAction ?? null,
      particleRoot,
      shoreCue: beat?.shoreCue ?? wildlifeShore ?? null,
      maliSpeech: beat?.maliSpeech ?? null,
      lighting: beat?.lighting ?? window.__coastMoodLighting ?? null,
      scenery: { batches: sceneryBatches, batchCount: sceneryBatches.length },
      wildlife: {
        crabs: actors.filter((a) => a.name.startsWith('coast-crab-')).length,
        birds: actors.filter((a) => a.name.startsWith('coast-bird-')).length,
        fish: actors.filter((a) => a.name.startsWith('coast-fish-')).length,
      },
      plotWildlife: Boolean(scene.getObjectByName('plot-wildlife')),
      hudCompact: beat?.hudCompact ?? null,
      photoMode: beat?.photoMode ?? false,
      plots: plotPositions.map(([x, z], index) => {
        projected.set(x, .65, z).project(camera)
        return { id: index + 1, x: (projected.x + 1) / 2 * gl.domElement.clientWidth,
          y: (1 - projected.y) / 2 * gl.domElement.clientHeight }
      }),
    }
  }
  window.__coastDiagnostics = read
  return () => { if (window.__coastDiagnostics === read) delete window.__coastDiagnostics }
}
