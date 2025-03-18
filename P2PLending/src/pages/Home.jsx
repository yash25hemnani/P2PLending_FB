import React, {Suspense, useEffect, useState} from 'react'
import { Canvas } from '@react-three/fiber'
import Loader from '../components/Loader'
import LibraryGallery from '../models/LibraryGallery'
import { OrbitControls } from '@react-three/drei'; 
import Cat from '../models/Cat';
import Nebula from '../models/Nebula';
import Details from '../components/Details';
import SearchBar from '../components/SearchBar';
import { useSelector } from 'react-redux';
import useAlert from '../hooks/useAlert';
import Alert from '../components/Alert';
import { useNavigate } from 'react-router-dom';

function Home() {
    const [numElements, setNumElements] = useState(0)
    const baseRadius = 5;
    const radius = baseRadius + numElements * 0.6; 
    const cameraPositionZ = (radius * radius/6)

    const [isRotating, setIsRotating] = useState(false)
    const [currentUser, setCurrentUser] = useState(0)
    const [currentGroupName, setCurrentGroupName] = useState('')

    const currentGroupId = useSelector((state) => state.user.currentGroupId)
    const {alert, showAlert, hideAlert} = useAlert()
    const navigate = useNavigate()

    useEffect(() => {
      if(!currentGroupId){
        showAlert({text: "You need to select a group to view library!", type: "danger"})
        setTimeout(() => {
            navigate('/user/groups')
        }, 3000);
      }
    }, [currentGroupId])
    

    const [lendersList, setlendersList] = useState([])

    useEffect(() => {
      console.log(currentUser)
    }, [currentUser])
    

    // Creating the adjust size function and thus change position of camera as well
    const adjustLibraryGalleryForScreenSize = () => {
        let screenScale = null;
        let screenPosition = [-1, -5.7, -30];
        let rotation = [0, -0.04, 0]

        if(window.innerWidth < 768) {
            screenScale = [1,1,1];
        } else {
            screenScale = [1.15,1.15,1.15];
        }

        return [screenScale, screenPosition, rotation]
    }

    const [galleryScale, galleryPosition, galleryRotation] = adjustLibraryGalleryForScreenSize() 

    const adjustCatForScreenSize = () => {
        let screenScale = null;
        let catPositionZ = cameraPositionZ - 10;
        let screenPosition = [0, -5.5, catPositionZ];
        let rotation = [0, Math.PI/2, 0]

        if(window.innerWidth < 768) {
            screenScale = [0.006, 0.006, 0.006];
        } else {
            screenScale = [0.007, 0.007, 0.007];
        }

        return [screenScale, screenPosition, rotation]
    }

    const [catScale, catPosition, catRotation] = adjustCatForScreenSize() 

  return (

    <section className='w-full h-screen relative'>
        {alert.show && (<Alert {...alert}/>)}
        <div className='absolute lg:top-44 top-48 left-1/2 z-1 lg:w-1/4 md:w-1/2 w-3/4 transform -translate-x-1/2 -translate-y-2/5 h-auto max-h-[500px]'>
            <Details currentGroupId={currentGroupId} currentUser={currentUser} setCurrentGroupName={setCurrentGroupName} setNumElements={setNumElements}/>
        </div>
        {/* Setting up the canvas, with the camera */}
        <Canvas 
            className={`w-full h-screen bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grap'}`}
            // Default camera position is [0,0,5]
            camera={{near:0.1, far:1000, position: [0,0,cameraPositionZ]}}
        >
            {/* Implement Suspense and Loader */}
            <Suspense fallback={<Loader />}>
                {/* Implement Lightning */}
                <directionalLight position={[1,1,1]} intensity={2}/>
                <ambientLight intensity={0.5} />
                <hemisphereLight skyColor="#b1e1ff" groundColor="#000000" intensity={1}/>

                {/* <OrbitControls 
                    enableZoom={true} 
                    enablePan={true} 
                    // enableRotate={true} 
                    minDistance={5} 
                    maxDistance={500} 
                /> */}

                <Nebula isRotating={isRotating} />

                <LibraryGallery
                    NUM_ELEMENTS={numElements}
                    radius={radius}
                    galleryPosition={galleryPosition}
                    galleryScale={galleryScale}
                    galleryRotation={galleryRotation}
                    isRotating={isRotating}
                    setIsRotating={setIsRotating}
                    cameraPositionZ={cameraPositionZ}
                    setCurrentUser={setCurrentUser}
                />

                <Cat 
                    isRotating={isRotating}
                    position={catPosition}
                    rotation={catRotation}
                    scale={catScale}
                />
            </Suspense>
        </Canvas>
        <div className='absolute z-10 bottom-4 left-1/2 transform -translate-x-1/2'>
            <SearchBar currentGroupName={currentGroupName}/>
        </div>
    </section>
  )
}

export default Home