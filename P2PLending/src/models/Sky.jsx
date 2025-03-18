import { useGLTF } from '@react-three/drei'
import React, { useRef } from 'react'
import skyScene from '../assets/3d/sky.glb'
import { useFrame } from '@react-three/fiber'

function Sky() {
    const sky = useGLTF(skyScene)
    const skyRef = useRef();


  return (
    <mesh ref={skyRef}>
        <primitive object={sky.scene} />
    </mesh>
  )
}

export default Sky