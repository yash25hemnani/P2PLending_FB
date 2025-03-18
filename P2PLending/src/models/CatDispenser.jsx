import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import catDispenserScene from '../assets/3d/cat_dispenser.glb';
import { useFrame } from '@react-three/fiber';


const CatDispenser = ({isTyping, reset, setReset, ...props}) => {
  const catDispenserRef = useRef();
    const catDispenser = useGLTF(catDispenserScene)
    
    useEffect(() => {
      if(reset){
        catDispenserRef.current.rotation.y = 0;
        setReset(false)
      }
    }, [reset])

    useFrame((_, delta) => {
        if(isTyping) {
            catDispenserRef.current.rotation.y += 0.6 * delta;
        }
    })
    

    return (
        <mesh ref={catDispenserRef} position={[0, 0, 0]} {...props}>
            <primitive object={catDispenser.scene} />
        </mesh>
    );
}

export default CatDispenser;
