import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Object3D, StaticDrawUsage } from 'three'
import { useWorldResources } from './WorldResources.jsx'

const noRaycast = () => null

// Only non-interactive scenery belongs here. Plot colliders, joint rigs and props
// with independent motion stay separate. Transforms/colors are uploaded once.
export const SceneryBatch = memo(function SceneryBatch({
  items, shape = 'box', args = [1, 1, 1], geometry: suppliedGeometry,
  material: suppliedMaterial, roughness = 1, flatShading = false,
  basic = false, opacity = 1, castShadow = false, receiveShadow = true,
  name = 'scenery-batch',
}) {
  const count = items?.length || 0
  const resources = useWorldResources()
  const geometry = suppliedGeometry || resources.geometry(shape, args)
  const material = suppliedMaterial || resources.material({
    color: '#ffffff', ...(basic ? {} : { roughness, flatShading }),
    transparent: opacity < 1, opacity, depthWrite: opacity === 1,
  }, basic ? 'basic' : 'standard')
  const scratch = useRef({ transform: new Object3D(), color: new Color() })
  const mesh = useMemo(() => {
    if (count <= 0) return null
    const result = new InstancedMesh(geometry, material, count)
    result.instanceMatrix.setUsage(StaticDrawUsage)
    result.matrixAutoUpdate = false
    result.frustumCulled = true
    result.raycast = noRaycast
    result.userData.sceneryBatch = true
    result.userData.batchName = name
    result.userData.batchCount = count
    return result
  }, [geometry, material, count, name])

  useLayoutEffect(() => {
    if (!mesh || count <= 0) return
    const { transform, color } = scratch.current
    items.forEach((item, index) => {
      transform.position.fromArray(item.position || [0, 0, 0])
      transform.rotation.set(...(item.rotation || [0, 0, 0]))
      if (Array.isArray(item.scale)) transform.scale.fromArray(item.scale)
      else transform.scale.setScalar(item.scale ?? 1)
      transform.updateMatrix()
      mesh.setMatrixAt(index, item.matrix || transform.matrix)
      mesh.setColorAt(index, color.set(item.color || '#ffffff'))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.userData.sceneryBatch = true
    mesh.userData.batchName = name
    mesh.userData.batchCount = count
    mesh.computeBoundingBox()
    mesh.computeBoundingSphere()
    // Shader wind moves only the blade tips; keep frustum bounds conservative.
    if (mesh.boundingSphere) mesh.boundingSphere.radius += .08
    mesh.updateMatrixWorld(true)
  }, [items, mesh, count, name])
  // R3F never auto-disposes primitives. Do not pass dispose={null}: in fiber 8
  // that prop overwrites InstancedMesh.dispose and breaks count-change cleanup.
  useEffect(() => () => { mesh?.dispose() }, [mesh])
  if (!mesh) return null
  return <primitive object={mesh} name={name} castShadow={castShadow}
    receiveShadow={receiveShadow} />
})

export const GrassPatch = memo(function GrassPatch({ items, name = 'grass-patch' }) {
  const resources = useWorldResources()
  if (!items?.length) return null
  return <SceneryBatch items={items} geometry={resources.grassGeometry()}
    material={resources.grassMaterial()} name={name} receiveShadow />
})
