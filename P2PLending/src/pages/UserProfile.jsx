import React, {Suspense, useEffect, useRef, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setUserData } from '../features/user/userSlice'
import axios from 'axios'
import useAlert from '../hooks/useAlert'
import Alert from '../components/Alert'
import BookModal from '../components/BookModal'
import BookList from '../components/BookList'
import { useParams } from 'react-router-dom'


function UserProfile() { 
    const dispatch = useDispatch()
    const {email} = useParams();

    useEffect(() => {
      console.log(email)
    }, [])
    

    const [showSection, setShowSection] = useState(1)
    const [isEditable, setIsEditable] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const temp = useSelector((state) => state.user.userData)
    const [userDetails, setUserDetails] = useState({...temp})
    const fileFrontRef = useRef()
    const fileSideRef = useRef()
    
    const {alert, showAlert, hideAlert} = useAlert()

    const [listedBooks, setListedBooks] = useState([])
    const [lentBooks, setLentBooks] = useState([])
    const [borrowedBooks, setBorrowedBooks] = useState([])

    const handleChange = (event) => {
        setUserDetails({...userDetails, [event.target.name]:event.target.value})
    }
    

    const saveDetailChange = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/user/update`, {
                // Have to send group id and updated fields
                updatedFields: {...userDetails}
            }, { withCredentials: true });
            
            console.log(response.data)
            setIsEditable(false)

            if(response.data.status == 'passed'){
                showAlert({text: response.data.message, type:response.data.type})
                setTimeout(() => {
                    hideAlert()
                }, 3000);
            }
            
        } catch (error) {
            console.error(error);
        } 
    } 

    const handleFrontButtonClick = () => {
        fileFrontRef.current.click();
    }

    const handleSideButtonClick = () => {
        fileSideRef.current.click();
    }

    
    const uploadFrontFile = async (selectedFile) => {
        if(!selectedFile) {
            showAlert({text:"File is required", type:"danger"})
        }
        
        console.log(selectedFile)
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/user/upload/mug/front`, {
                email: userDetails.email,
                file: selectedFile
            },{
                withCredentials: true,  
                headers: {
                    "Content-Type": "multipart/form-data"
                }}
            )
            
            if(response.data.status == 'passed'){
                const updatedUserDetails = { ...userDetails, urlFront: response.data.data };
                
                setUserDetails(updatedUserDetails); 
                dispatch(setUserData(updatedUserDetails)); 
                showAlert({text: response.data.message, type: response.data.type})
                setTimeout(() => {
                    hideAlert()
                }, 3000);
            }

        } catch (error) {
            console.log(error)
        }
    }
    
    const uploadSideFile = async (selectedFile) => {
        if(!selectedFile) {
            showAlert({text:"File is required", type:"danger"})
        }
        
        console.log(selectedFile)
        
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/user/upload/mug/side`, {
                email: userDetails.email,
                file: selectedFile
            },{
                withCredentials: true,  
                headers: {
                    "Content-Type": "multipart/form-data"
                }}
            )
            
            if(response.data.status == 'passed'){
                const updatedUserDetails = { ...userDetails, urlSide: response.data.data };

                setUserDetails(updatedUserDetails); 
                dispatch(setUserData(updatedUserDetails)); 
            }

        } catch (error) {
            console.log(error)
        }
    }

    const handleFileFrontChange = (event) => {
        const selectedFile = event.target.files[0];
        uploadFrontFile(selectedFile); 
    }

    const handleFileSideChange = (event) => {
        const selectedFile = event.target.files[0];
        uploadSideFile(selectedFile); 
    }
    
    useEffect(() => {
        const fetchAllBooks = async () => {
            try {
                let response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/book/fetch/all`, 
                    { withCredentials: true });
                
                console.log(response.data)

                // Divide books in twp categories - as this function only gets the book created by user
                // 1. Listed Books - status == available
                // 2. Lent Books - status == lent
                let tempListedBookArray = []
                let tempLentBookArray = []
                response.data.data.map((book) => {
                    if (book.status == 'available'){
                        tempListedBookArray.push(book)
                    } else {
                        tempLentBookArray.push(book)
                    }
                })

                setListedBooks(tempListedBookArray)
                setLentBooks(tempLentBookArray)
                
                // Getting the borrowed books
                response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/book/fetch/borrowed`, 
                    { withCredentials: true });
                
                console.log(response.data)

                let tempBorrowedBookArray = []
                response.data.data.map((book) => {
                    tempBorrowedBookArray.push(book)
                })

                setBorrowedBooks(tempBorrowedBookArray)
                
            } catch (error) {
                console.error(error);
            } 
        }

        fetchAllBooks()
    }, [])

    useEffect(() => {
      console.log(listedBooks)
      console.log(borrowedBooks)
      console.log(lentBooks)
    }, [listedBooks, borrowedBooks, lentBooks])
    
    
  return (
    <section className='w-full lg:h-[85vh] lg:w-3/4 px-3 flex flex-col gap-2 lg:flex-row'>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:w-1/4 md:w-1/2 w-3/4 '>
            {alert.show && (<Alert text={alert.text} type={alert.type}/>)}
            {isModalVisible && (<BookModal setIsModalVisible={setIsModalVisible} setListedBooks={setListedBooks}/>)}
        </div>
        
        {/* Section - 1 */}
        <div className='flex flex-col gap-2 lg:w-3/6 lg:h-5/6'>
            <div className='flex lg:flex-row flex-col'>
                <div className="w-full h-full  flex justify-center items-center border-black border-2 rounded-md hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] bg-[#FFA6F6]">
                    <figure className="w-[280px] h-full border-black border-b-2 py-3 px-2 flex justify-center items-center">
                        <img
                        src={"http://localhost:3000/" + userDetails.urlFront}
                        alt="thumbnail"
                        className="w-[95%] h-full object-cover rounded-md border-2 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] "
                        />
                        
                    </figure>
                </div>
                <div className="w-full h-full  flex justify-center items-center border-black border-2 rounded-md hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] bg-[#FFA6F6]">
                    <figure className="w-[280px]  h-full border-black border-b-2 py-3 px-2 flex justify-center items-center">
                        <img
                        src={"http://localhost:3000/" + userDetails.urlSide}
                        alt="thumbnail"
                        className="w-[95%] h-full object-cover rounded-md border-2 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] "
                        />
                    </figure>
                </div>
            </div>
            {/* User Information */}
            <div className=' lg:mb-4'>
                <div className="px-6 py-5 text-left h-full border-2 rounded-md bg-[#B8FF9F]">
                    <input className=
                        {`text-[32px] mb-2 w-full ${isEditable ? 'border-black border-2 active:shadow-[2px_2px_0px_rgba(0,0,0,1)]' : ''} p-1 focus:outline-none  rounded-md`}
                        placeholder="Name"
                        name='username'
                        readOnly={!isEditable}
                        value={userDetails.username}
                        onChange={handleChange}
                    />
                    <textarea rows={5} class=
                        {`text-s mb-2 w-full ${isEditable ? 'border-black border-2 active:shadow-[2px_2px_0px_rgba(0,0,0,1)]' : ''} p-1 focus:outline-none  rounded-md`}
                        name='bio'
                        placeholder="Bio"
                        readOnly={!isEditable}
                        value={userDetails.bio}
                        onChange={handleChange}
                    />

                    {/* File Upload */}
                    <input className='hidden' ref={fileFrontRef} type="file" name="uploadFile" onChange={handleFileFrontChange} />

                    {/* File Upload */}
                    <input className='hidden' ref={fileSideRef} type="file" name="uploadFile" onChange={handleFileSideChange} />

                    <div className='flex gap-2'>
                        {/* Edit Button */}
                        {isEditable ? (
                            <button 
                                onClick={saveDetailChange} 
                                className="h-12 border-black border-2 p-3 bg-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-full flex justify-center items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsEditable(true)} 
                                className="h-12 border-black border-2 p-3 bg-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-full flex justify-center items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                                    <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                                </svg>
                            </button>
                        )}
                        {/* Change Image Button 1 */}
                        <button onClick={handleFrontButtonClick} className="h-12 border-black border-2 p-3 bg-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-full flex justify-center items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M479.94-258.09q75.78 0 128.88-53.04 53.09-53.04 53.09-128.81 0-75.78-53.04-128.88-53.04-53.09-128.81-53.09-75.78 0-128.88 53.04-53.09 53.04-53.09 128.81 0 75.78 53.04 128.88 53.04 53.09 128.81 53.09Zm.06-86.21q-40.33 0-68.01-27.69Q384.3-399.67 384.3-440q0-40.33 27.69-68.01Q439.67-535.7 480-535.7q40.33 0 68.01 27.69Q575.7-480.33 575.7-440q0 40.33-27.69 68.01Q520.33-344.3 480-344.3ZM162.87-111.87q-37.78 0-64.39-26.61t-26.61-64.39v-474.26q0-37.78 26.61-64.39t64.39-26.61H281.7l77.34-80h241.92l77.34 80h118.83q37.78 0 64.39 26.61t26.61 64.39v474.26q0 37.78-26.61 64.39t-64.39 26.61H162.87Zm0-91h634.26v-474.26H638.72l-75.63-80H397.63l-77.06 80h-157.7v474.26ZM480-440Z"/></svg>
                        </button>
                        {/* Change Image Button 2 */}
                        <button onClick={handleSideButtonClick} className="h-12 border-black border-2 p-3 bg-white hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-full flex justify-center items-center -rotate-90"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M479.94-258.09q75.78 0 128.88-53.04 53.09-53.04 53.09-128.81 0-75.78-53.04-128.88-53.04-53.09-128.81-53.09-75.78 0-128.88 53.04-53.09 53.04-53.09 128.81 0 75.78 53.04 128.88 53.04 53.09 128.81 53.09Zm.06-86.21q-40.33 0-68.01-27.69Q384.3-399.67 384.3-440q0-40.33 27.69-68.01Q439.67-535.7 480-535.7q40.33 0 68.01 27.69Q575.7-480.33 575.7-440q0 40.33-27.69 68.01Q520.33-344.3 480-344.3ZM162.87-111.87q-37.78 0-64.39-26.61t-26.61-64.39v-474.26q0-37.78 26.61-64.39t64.39-26.61H281.7l77.34-80h241.92l77.34 80h118.83q37.78 0 64.39 26.61t26.61 64.39v474.26q0 37.78-26.61 64.39t-64.39 26.61H162.87Zm0-91h634.26v-474.26H638.72l-75.63-80H397.63l-77.06 80h-157.7v474.26ZM480-440Z"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/*  Section - Listed Books */}
        <div className='lg:w-3/6 lg:h-full overflow-y-auto '>
            <div className='mb-4'>
                <div className="px-6 py-5 text-left h-full border-2 rounded-md bg-yellow-200 flex flex-col gap-2 ">
                    <div className='flex justify-between items-center'>
                        <h1 className="text-[32px] mb-1">
                            {showSection === 1 ? 'Listed Books' : '' }
                            {showSection === 2 ? 'Lent Books' : '' }
                            {showSection === 3 ? 'Borrowed Books' : '' }
                        </h1>
                        <div className='flex gap-2'>
                            {/* Add Book Button */}
                            {!email ? (<button onClick={() => setIsModalVisible(true)} className="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center ">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.8425 24V0H13.1575V24H10.8425ZM0 13.1664V10.8336H24V13.1664H0Z" fill="black"/>
                                </svg>
                            </button>) : ''}

                            {/*  Show Listed */}
                            <button onClick={() => setShowSection(1)} className={`border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center font-bold text-lg ${showSection === 1? 'shadow-[3px_3px_0px_rgba(0,0,0,1)] ' : ''}`}>
                                1
                            </button>
                            {/*  Show Lent */}
                            <button onClick={() => setShowSection(2)} className={`border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center font-bold text-lg ${showSection === 2? 'shadow-[3px_3px_0px_rgba(0,0,0,1)] ' : ''}`}>
                                2
                            </button>
                            {/*  Show Borrowed */}
                            <button onClick={() => setShowSection(3)} className={`border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center font-bold text-lg ${showSection === 3? 'shadow-[3px_3px_0px_rgba(0,0,0,1)] ' : ''}`}>
                                3   
                            </button>
                        </div>
                    </div>
                    {/* Book List */}
                    
                    <div className='flex flex-col gap-2'>
                        {showSection == 1 && <BookList loopArray={listedBooks} sectionNumber={1} setListedBooks={setListedBooks}/>}
                        {showSection == 2 && <BookList loopArray={lentBooks} sectionNumber={2} />}
                        {showSection == 3 && <BookList loopArray={borrowedBooks} sectionNumber={3} />}
                    </div>

                </div>
            </div>
        </div>

    </section>
  )
}

export default UserProfile