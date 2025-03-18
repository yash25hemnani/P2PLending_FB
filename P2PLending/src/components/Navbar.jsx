import React, { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { clearUserData } from '../features/user/userSlice'

function Navbar() {
    const [isAbsolute, setIsAbsolute] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [numberOfRequests, setNumberOfRequests] = useState(0)
    const userData = useSelector((state) => state.user.userData)
    

    const logoutUser = async() => {
        // Why Do You Need withCredentials: true?
        // 1. Allows sending and receiving cookies in cross-origin (CORS) requests.
        // 2. Needed for authentication, especially when using JWT in cookies.
        // 3. Ensures cookies are included in API requests, enabling session persistence.
        try {
            const response = await axios.post("http://localhost:3000/user/logout", {}, { withCredentials: true });
            dispatch(clearUserData())
            navigate('/login')
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (location.pathname === '/') {
            setIsAbsolute(true);
        } else {
            setIsAbsolute(false);
        }
    }, [location.pathname]);

  return (
    <header className={`${isAbsolute ? 'absolute' : ''} z-10 w-full lg:w-3/4 p-3 bg-transparent flex justify-between items-center`}>
        <div className='flex gap-2'>
            <NavLink to="/" className="w-auto h-10 p-2 rounded-md bg-white items-center justify-center flex font-bold  border-black border-2 shadow-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] ">
                <p className='text-yellow-500'>{userData.username}</p>
            </NavLink>
        </div>

        <button className="lg:hidden text-white text-2xl bg-yellow-200 p-2 rounded-full hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
            ):(
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
            )}
        </button>

        <nav className={`absolute lg:static top-16 right-2 md:w-1/3 w-1/2 h-auto lg:w-auto rounded-md bg-yellow-200 border-2 lg:p-2 p-5 transition-all duration-300 ease-in-out hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] ${isOpen ? 'flex' : 'hidden'} flex-col lg:flex-row lg:flex gap-3 font-medium`}>
                

            {/* <NavLink to="/help" className={`${({isActive}) => isActive ? 'text-yellow-400' : 'text-yellow-200'} bg-white border-2 rounded-md lg:p-1  lg:px-2 p-2 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] `}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/></svg>
            </NavLink> */}
            <NavLink to="/requests" className={`${({isActive}) => isActive ? 'text-yellow-400' : 'text-yellow-200'} bg-white border-2 rounded-md lg:p-1  lg:px-2 p-2 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] `}>
                Requests
            </NavLink>
            <NavLink to="/user/groups" className={`${({isActive}) => isActive ? 'text-yellow-400' : 'text-yellow-200'} bg-white border-2 rounded-md lg:p-1  lg:px-2 p-2 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] `}>
                Groups
            </NavLink>
            <NavLink to="/user/profile" className={`${({isActive}) => isActive ? 'text-yellow-400' : 'text-yellow-200'} bg-white border-2 rounded-md lg:p-1  lg:px-2 p-2 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] `}>
                Profile
            </NavLink>
            <div onClick={logoutUser} className={`${({isActive}) => isActive ? 'text-yellow-400' : 'text-yellow-200'} bg-white border-2 rounded-md lg:p-1 lg:px-2 p-2 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] `}>
                Logout
            </div>
        </nav>
    </header>
  )
}

export default Navbar