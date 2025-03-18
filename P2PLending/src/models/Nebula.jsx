import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { a } from '@react-spring/three';
import nebulaScene from '../assets/3d/nebula.glb'
import { useFrame } from '@react-three/fiber';

const Nebula = ({isRotating }) => {
    const nebulaRef = useRef();
    const nebula = useGLTF(nebulaScene)
    // console.log("Nebula scene:", nebula)
    // console.log("Nebula Loaded:", nebula.scene);

    useFrame((_, delta) => {
        if(isRotating) {
            nebulaRef.current.rotation.y += 0.15 * delta;
        }
    })


    return (
        <mesh ref={nebulaRef} position={[0, 0, 0]} scale={[50, 50, 50]}>
            <primitive object={nebula.scene} />
        </mesh>
    );
}

export default Nebula;
