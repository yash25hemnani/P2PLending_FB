    import React, { useEffect } from 'react'
    import { Canvas, useFrame, useThree } from "@react-three/fiber";
    import { useRef, useState } from "react";
    import { a, useSpring } from "@react-spring/three";
    import { OrbitControls } from "@react-three/drei";
    import Library from './Library';
    import * as THREE from 'three'


    // Constant number of elements

    // Get the rotation of each library element
    function LibraryGallery({NUM_ELEMENTS, radius, galleryPosition, galleryScale, galleryRotation, isRotating, setIsRotating, cameraPositionZ, setCurrentUser}) {
        

        const groupRef = useRef();
        const [index, setIndex] = useState(0)

        const {gl, viewport} = useThree()
        const lastX = useRef(0);
        const rotationSpeed = useRef(0)
        const dampingFactor = 0.4;

        const handlePointerDown = (e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsRotating(true)
    
            const clientX = e.touches ? e.touches[0] : e.clientX
            lastX.current = clientX
        }

        const handlePointerUp = (e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsRotating(false);
        }

        useEffect(() => {
          groupRef.current.rotation.y = galleryRotation[1]
          // console.log(galleryRotation[1])
        }, [galleryRotation])
        

        const handlePointerMove = (e) => {
            e.stopPropagation();
            e.preventDefault();

            if(isRotating) {
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;

                const delta = (clientX - lastX.current) / viewport.width;
                
                // Setting the rotation equal to delta
                groupRef.current.rotation.y = ((groupRef.current.rotation.y + delta * 0.05 * Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

                // console.log(groupRef.current.children)
                lastX.current = clientX;

                const cameraVector = new THREE.Vector3(0,0,cameraPositionZ);
              
                let minDistance = Infinity;
                let elementWithMinDistance = null;
                groupRef.current.children.forEach((element, index) => {
                  // groupRef.current.children.position -> relative positon of child element to parent, thus it doesnt change
                  let elementWorldPos = new THREE.Vector3();  // Create a new Vector3 for each element
                  element.getWorldPosition(elementWorldPos);  // Get world position

                  let distance = elementWorldPos.distanceTo(cameraVector); // Calculate distance, the smallest of all distances is the element in front of us
                  
                  // Assign the index with smallest distance
                  if (distance < minDistance) {  // If we find a smaller distance
                    minDistance = distance;
                    elementWithMinDistance = index; // Store the index of the closest element
                  }
                });

                // console.log(elementWithMinDistance, Math.floor(minDistance))
                if (Math.floor(minDistance) === 30 || Math.floor(minDistance) === 27 || Math.floor(minDistance) === 29){ // For medium and lower screens - 30 and for larger - 27
                  setCurrentUser(elementWithMinDistance)
                } else {
                  setCurrentUser(null)
                }

                rotationSpeed.current = delta * 0.1 * Math.PI;
            }
        }

        const handleKeyDown = (e) => {
            if(e.key === 'ArrowLeft') {
              if(!isRotating) {
                setIsRotating(true);
              }
              groupRef.current.rotation.y = ((groupRef.current.rotation.y + 0.005 * Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

              const cameraVector = new THREE.Vector3(0,0,cameraPositionZ);
              
              let minDistance = Infinity;
              let elementWithMinDistance = null;
              groupRef.current.children.forEach((element, index) => {
                // groupRef.current.children.position -> relative positon of child element to parent, thus it doesnt change
                let elementWorldPos = new THREE.Vector3();  // Create a new Vector3 for each element
                element.getWorldPosition(elementWorldPos);  // Get world position

                let distance = elementWorldPos.distanceTo(cameraVector); // Calculate distance, the smallest of all distances is the element in front of us
                
                // Assign the index with smallest distance
                if (distance < minDistance) {  // If we find a smaller distance
                  minDistance = distance;
                  elementWithMinDistance = index; // Store the index of the closest element
                } 
                
              });

              console.log(minDistance)
              // console.log(elementWithMinDistance, Math.floor(minDistance))
              if (Math.floor(minDistance) === 30 || Math.floor(minDistance) === 27 || Math.floor(minDistance) === 29){ // For medium and lower screens - 30 and for larger - 27
                console.log("Element with min distance " + elementWithMinDistance)
                setCurrentUser(elementWithMinDistance)
              } else {
                setCurrentUser(null)
              }

              rotationSpeed.current = 0.0125
            } else if (e.key === 'ArrowRight'){
              if(!isRotating) {
                setIsRotating(true);
              }
              groupRef.current.rotation.y = ((groupRef.current.rotation.y - 0.005 * Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

              const cameraVector = new THREE.Vector3(0,0,cameraPositionZ);
              
              let minDistance = Infinity;
              let elementWithMinDistance = null;
              groupRef.current.children.forEach((element, index) => {
                // groupRef.current.children.position -> relative positon of child element to parent, thus it doesnt change
                let elementWorldPos = new THREE.Vector3();  // Create a new Vector3 for each element
                element.getWorldPosition(elementWorldPos);  // Get world position

                let distance = elementWorldPos.distanceTo(cameraVector); // Calculate distance, the smallest of all distances is the element in front of us
                
                // Assign the index with smallest distance
                if (distance < minDistance) {  // If we find a smaller distance
                  minDistance = distance;
                  elementWithMinDistance = index; // Store the index of the closest element
                }
              });

              console.log(minDistance)
              // console.log(elementWithMinDistance, Math.floor(minDistance))
              if (Math.floor(minDistance) === 30 || Math.floor(minDistance) === 27 || Math.floor(minDistance) === 29){ // For medium and lower screens - 30 and for larger - 27
                console.log("Element with min distance " + elementWithMinDistance)
                setCurrentUser(elementWithMinDistance)
              } else {
                setCurrentUser(null)
              }

              rotationSpeed.current = -0.0125
            }
          }
      
          const handleKeyUp = (e) => {
            if(e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              setIsRotating(false)
            }
          }

        useFrame(() => {
            if(!isRotating){
                rotationSpeed.current *= dampingFactor;  // Slow it down if not rotating

                if(Math.abs(rotationSpeed.current) < 0.001) {
                    rotationSpeed.current = 0
                }

                groupRef.current.rotation.y += rotationSpeed.current
            } else {
                const rotation = groupRef.current.rotation.y;
                // Keeping Rotation in Normalized Range
                const normalizedRotation =
                ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

                // We can use this if we need popups
            }
        })


        useEffect(() => {
            const canvas = gl.domElement;
      
            canvas.addEventListener('pointerdown', handlePointerDown)
            canvas.addEventListener('pointerup', handlePointerUp)
            canvas.addEventListener('pointermove', handlePointerMove)
            document.addEventListener('keydown', handleKeyDown)
            document.addEventListener('keyup', handleKeyUp)
      
            return () => {
              canvas.removeEventListener('pointerdown', handlePointerDown)
              canvas.removeEventListener('pointerup', handlePointerUp)
              canvas.removeEventListener('pointermove', handlePointerMove)
              document.removeEventListener('keydown', handleKeyDown)
              document.removeEventListener('keyup', handleKeyUp)
            }
            
          }, [gl, handlePointerDown, handlePointerUp, handlePointerMove])

    return (
        <a.group ref={groupRef} position={galleryPosition} scale={galleryScale} rotation={galleryRotation}>
        {Array.from({ length: NUM_ELEMENTS }).map((_, i) => {
            const angle = (i / NUM_ELEMENTS) * Math.PI * 2;
            const x = Math.sin(angle) * radius * radius/6;
            const z = Math.cos(angle) * radius * radius/6;
            const libraryRotation = [0, angle - 5.5, 0]

            return (
            <mesh key={i} position={[x, 0, z]} onClick={() => setIndex(i)}>
                <Library 
                    rotation={libraryRotation}
                />
            </mesh>
            );
        })}
        </a.group>
    )
    }

    export default LibraryGallery


    