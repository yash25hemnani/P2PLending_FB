import React, {Suspense, useEffect, useState} from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import CatDispenser from '../models/CatDispenser'
import Loader from '../components/Loader'
import emailjs from '@emailjs/browser';
import useAlert from '../hooks/useAlert';
import Alert from '../components/Alert';
import axios from 'axios';
import { sign } from 'three/tsl';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setUserData } from '../features/user/userSlice';
import { NavLink } from 'react-router-dom';

function Signup() {
    const dispatch = useDispatch()
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
    
    

    const [isTyping, setIsTyping] = useState(false)
    const [emailValid, setEmailValid] = useState(null);
    const [passwordMatch, setPasswordMatch] = useState(false)
    const [showOTP, setShowOTP] = useState(false)
    // Global OTP
    const [OTP, setOTP] = useState(null)


    // Using the alert hook
    const {alert, showAlert, hideAlert} = useAlert();

    const [formData, setFormData] = useState({email:'', username:'', password:'', confirm:'', otp:''})
    const [reset, setReset] = useState(false)

    const handleChange = (event) => {
        setIsTyping(true)
        setFormData({...formData, [event.target.name]: event.target.value})
    }

    // Use effect checking for valid email
    useEffect(() => {
        const isValidEmail = (email) => {
            if (email == ''){
                return true;
            }
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return emailRegex.test(email);
        }

        setEmailValid(isValidEmail(formData.email));
    }, [formData.email])
    
    // Use effect checking for password match
    useEffect(() => {
        const isPasswordMatch = (password, confirm) => {
            if (formData.password === ''){
                return true;
            }
    
            if(formData.password === formData.confirm){
                return true;
            }
            return false;
        }
        
        setPasswordMatch(isPasswordMatch(formData.password, formData.confirm))

    }, [formData.password, formData.confirm])

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

    
    // Sending email for OTP Verification
    const sendEmailForVerification = (formData) => {
        const randomOTP = Math.floor(100000 + Math.random() * 900000);
        setOTP(randomOTP)
        console.log(randomOTP)
        console.log(formData.email)
        emailjs
        .send(
            import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID, 
            {
                // Form data to send
                from_name: "Yash Hemnani",
                to_name: formData.username,
                from_email: "yashhemnani8504@gmail.com",
                to_email: formData.email,
                message: `You OTP is ${randomOTP}`
            },
            import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY,
        )
        .then(
            () => {
                setShowOTP(true)
                showAlert({show:true, text:"OTP Sent Successfully!", type:'success'})
                setTimeout(() => {
                    hideAlert()
                }, 3000);
            },
            (error) => {
                showAlert({show:true, text:"OTP Send Failed!", type:'danger'})
            },
        );
    }

    const checkEmailExistence = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/user/check-existence`, {
                email: formData.email
            }, { withCredentials: true });
            
            if (response.data.status == 'passed'){
                sendEmailForVerification(formData)
            }

          } catch (error) {
            console.error('Error:', error);
          }
    }

    const signupUser = async(formData) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/user/signup`, {
                username: formData.username,
                email: formData.email,
                password: formData.password
            }, { withCredentials: true });
            
            if (response.data.status == 'passed'){
                const userData = {
                    username: response.data.data.username,
                    email: response.data.data.email,
                    contact: response.data.data.contact,
                    bio: response.data.data.bio,
                    url: response.data.data.url
                }
                console.log(userData)
                dispatch(setUserData(userData))
                navigate('/')
            } else {
                showAlert(response.data.message , response.data.type)
                setTimeout(() => {
                    hideAlert()
                }, 3000);
            }

        } catch (error) {
        console.error('Error:', error);
        }
    }
    
    const verifyOTP = () => {
        if(OTP == formData.otp) {
            showAlert({show:true, text:"OTP Verified! Signing You In...", type:'success'})
            setTimeout(() => {
                hideAlert()
            }, 3000);

            signupUser(formData)
            
        } else {
            showAlert({show:true, text:"OTP Verification Failed!", type:'danger'})
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
                <h1 className="text-[32px] font-semibold">Sign Up</h1>
                <div className='w-full flex flex-col gap-2'>
                    <input class=
                        "w-full border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
                        placeholder="you@example.com"
                        name='email'
                        value={formData.email}
                        onInput={handleChange}
                        onBlur={() => setIsTyping(false)}
                    />
                    {!emailValid && (<p className='text-red-700'>Please select a valid email!</p>)}
                    <input class=
                        "w-full border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
                        placeholder="Your Name"
                        name='username'
                        value={formData.username}
                        onInput={handleChange}
                        onBlur={() => setIsTyping(false)}

                    />
                    <input type='password' class=
                        "w-full border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
                        placeholder="Password"
                        name='password'
                        value={formData.password}
                        onInput={handleChange}
                        onBlur={() => setIsTyping(false)}
                    />
                    <input type='password' class=
                        "w-full border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
                        placeholder="Confirm Password"
                        name='confirm'
                        value={formData.confirm}
                        onInput={handleChange}
                        onBlur={() => setIsTyping(false)}
                    />
                    {!passwordMatch && (<p className='text-red-700'>Passwords do not match!</p>)}

                    {showOTP && (<input class=
                        "w-full border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
                        placeholder="Enter OTP"
                        name='otp'
                        value={formData.otp}
                        onInput={handleChange}
                        onBlur={() => setIsTyping(false)}

                    />)}
                </div>
                <div className='flex gap-2'>
                    {!showOTP && (<button onClick={checkEmailExistence} className="h-12 border-black border-2 p-5 bg-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md flex justify-center items-center"
                    >
                        Sign Up
                    </button>)}
                    {showOTP && (<button onClick={verifyOTP} className="h-12 border-black border-2 p-5 bg-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md flex justify-center items-center"
                    >
                        Verify
                    </button>)}
                    <button className="h-12 border-black border-2 p-5 bg-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md flex justify-center items-center"
                    onClick={() => setReset(true)}
                    >
                        Reset Cat
                    </button>
                </div>
            <h1>Already have an account? <NavLink className="text-blue-800 underline" to="/login">Log In</NavLink></h1>
            </div>
        </div>
    </section>
  )
}

export default Signup