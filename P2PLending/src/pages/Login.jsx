import React, {Suspense, useEffect, useState} from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import CatDispenser from '../models/CatDispenser'
import Loader from '../components/Loader'
import emailjs from '@emailjs/browser';
import useAlert from '../hooks/useAlert';
import Alert from '../components/Alert';
import axios from 'axios';
import { sign } from 'three/tsl';
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setUserData } from '../features/user/userSlice';

function Login() {

    const dispatch = useDispatch()
    const [isTyping, setIsTyping] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/user/auth/check`, { withCredentials: true });
                console.log(response.data)
                if(response.data.isAuthenticated === true) {
                    navigate('/')
                }
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
            }
        };

        checkAuth();
    }, [])
    
    
    // Using the alert hook
    const {alert, showAlert, hideAlert} = useAlert();

    const [formData, setFormData] = useState({email:'', password:''})
    const [reset, setReset] = useState(false)

    useEffect(() => {
      console.log(formData)
    }, [formData])
    

    const handleChange = (event) => {
        setIsTyping(true)
        setFormData({...formData, [event.target.name]: event.target.value})
    }

    const adjustDispenserForScreenSize = () => {
        let screenScale = null;
        let screenPosition = null;
        let rotation = [0, 0, 0]

        if(window.innerWidth < 768) {
            screenScale = [1.1,1.1,1.1];
            screenPosition = [0, 0, 0]
        } else {
            screenScale = [1.2, 1.2, 1.2];
            screenPosition = [0, 0, 0]
        }

        return [screenScale, screenPosition, rotation]
    }

    const [dispensertScale,dispensertPosition, dispenserRotation] = adjustDispenserForScreenSize() 

    const logInUser = async() => {
        console.log(formData.email)
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/user/login`, {
                email: formData.email,
                password: formData.password
            },
            { withCredentials: true });
            
            if (response.data.status == 'passed'){
                
                const userData = {
                    username: response.data.data.username,
                    email: response.data.data.email,
                    contact: response.data.data.contact,
                    bio: response.data.data.bio,
                    urlFront: response.data.data.urlFront,
                    urlSide: response.data.data.urlSide
                }
                console.log(userData)
                dispatch(setUserData(userData))
                navigate('/')
            } else {
                console.log(response.data)
            }

        } catch (error) {
            console.error('Error:', error);
            showAlert({ text: error.response.data.message, type: 'danger' });
            setTimeout(() => {
                hideAlert()
            }, 3000);
        }
    }
    

  return (
    <section className='w-full h-screen flex flex-col justify-center items-center lg:flex-row gap-2 lg:gap-0'>
        {/* Showing alert */}
        {alert.show && <Alert {...alert} />}

        <div className='w-full h-2/5 lg:h-3/4'>
            <Canvas
                camera={{near:0.1, far:1000,}}
            >
                <Suspense fallback={<Loader />}>
                    {/* Implement Lightning */}
                    <directionalLight position={[1,1,1]} intensity={2}/>
                    <ambientLight intensity={0.5} />
                    <hemisphereLight skyColor="#b1e1ff" groundColor="#000000" intensity={1}/>

                    <CatDispenser
                        scale={dispensertScale}
                        position={dispensertPosition}
                        rotation={dispenserRotation}
                        isTyping={isTyping}
                        reset={reset}
                        setReset={setReset}
                    />

                </Suspense>
            </Canvas>
        </div>

        <div className='w-full flex justify-center items-center p-4'>
            <div className="w-full lg:w-3/4 px-6 py-5 text-left h-full border-2 rounded-md bg-yellow-200 flex flex-col gap-2">
                <h1 className="text-[32px] font-semibold">Log In</h1>
                <div className='w-full flex flex-col gap-2'>
                    <input class=
                        "w-full border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
                        placeholder="you@example.com"
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => setIsTyping(false)}
                    />
                    
                    <input type='password' class=
                        "w-full border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
                        placeholder="Password"
                        name='password'
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => setIsTyping(false)}
                    />
                    
                </div>
                <div className='flex gap-2'>
                    <button onClick={logInUser} className="h-12 border-black border-2 p-5 bg-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md flex justify-center items-center"
                    >
                        Log In
                    </button>
                    <button className="h-12 border-black border-2 p-5 bg-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md flex justify-center items-center"
                    onClick={() => setReset(true)}
                    >
                        Reset Cat
                    </button>
                </div>
                <h1>Don't have an account? <NavLink className="text-blue-800 underline" to="/signup">Sign Up</NavLink></h1>
            </div>
        </div>
    </section>
  )
}

export default Login