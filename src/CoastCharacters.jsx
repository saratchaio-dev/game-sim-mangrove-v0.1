import { memo } from 'react'
import WorkerCharacter from './WorkerCharacter.jsx'
import VillageLife from './VillageLife.jsx'
import { workerVariants } from './workerVariants.js'

const CoastCharacters = memo(function CoastCharacters({ action, target, storm=false, speech=null }) {
  return <group>
    {workerVariants.map((variant,index)=><WorkerCharacter key={variant.id} variant={variant} index={index} action={action} target={target} speech={speech} />)}
    <VillageLife action={action} storm={storm} />
  </group>
})
export default CoastCharacters
