import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import catScene from '../assets/3d/cat.glb'
// To create animated groups
import { a } from '@react-spring/three'

const Cat = ({isRotating, ...props}) => {
  const ref = useRef()
  const { nodes, materials, animations } = useGLTF(catScene)
  const { actions } = useAnimations(animations, ref)

  // console.log(animations) // To see available animations
  // Scene named animation available

  useEffect(() => {
      
    if(isRotating) {
      actions['Scene'].play();
    } else {
      actions['Scene'].stop();
    }
  }, [isRotating])

  
  

  return (
    <group ref={ref} {...props} >
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="0df7f1c552db41979cdb0b8efba99edffbx" rotation={[Math.PI / 2, 0, 0]}>
            <group name="Object_2">
              <group name="RootNode">
                <group name="Rig" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
                  <group name="Object_5">
                    <primitive object={nodes._rootJoint} />
                    <skinnedMesh
                      name="Object_43"
                      geometry={nodes.Object_43.geometry}
                      material={materials.Mat_Gradient}
                      skeleton={nodes.Object_43.skeleton}
                    />
                    <group name="Object_42" rotation={[-Math.PI / 2, 0, 0]} scale={100} />
                  </group>
                </group>
                <group name="Cat" rotation={[-Math.PI / 2, 0, 0]} scale={100} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

export default Cat