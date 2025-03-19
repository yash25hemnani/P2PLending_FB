import React, { useEffect, useRef, useState} from 'react'
import axios from 'axios'
import useAlert from '../hooks/useAlert'
import Alert from '../components/Alert'
import BookModal from '../components/BookModal'
import BookList from '../components/BookList'
import { useParams } from 'react-router-dom'
import RequestBookModal from '../components/RequestBookModal'

// Next Plan of acction
// 1. Show groups user are common in
// 2. If not in any common group, can't view.
// 3. If group in common, but in that group, the one being viewed is not a lender -> can't request a book

function ViewProfile() { 
    const {email} = useParams();

    useEffect(() => {
      console.log(email)
    }, [])
    

    const [showSection, setShowSection] = useState(1)
    const [isEditable, setIsEditable] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [userDetails, setUserDetails] = useState({username: '', email: '', bio: '', urlFront:'', urlSide: ''})
    const [commonGroups, setCommonGroups] = useState([])    
    const {alert, showAlert, hideAlert} = useAlert()

    const [listedBooks, setListedBooks] = useState([])
    const [lentBooks, setLentBooks] = useState([])
    const [borrowedBooks, setBorrowedBooks] = useState([])

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                let response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/user/view`, 
                    {email: email},
                    { withCredentials: true });
                
                if(response.data.status == 'passed') {
                    setUserDetails(
                        {
                            username: response.data.data.username, 
                            email: response.data.data.email, 
                            bio: response.data.data.bio, 
                            urlFront:response.data.data.urlFront,
                            urlSide:response.data.data.urlSide
                        }
                    )
                }
                
            } catch (error) {
                console.error(error);
            } 
        }

        fetchUserData()
    }, [])

    useEffect(() => {
        const getCommonGroups = async () => {
            try {
                let response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/group/get-common-groups`, 
                    {requestedUser: email},
                    { withCredentials: true });
                
                if(response.data.status == 'passed') {
                    console.log(response.data)
                    setCommonGroups(response.data.data)
                }
                
            } catch (error) {
                console.error(error);
            } 
        }

        getCommonGroups()
    }, [])
    
    
    useEffect(() => {
        const fetchAllBooks = async () => {
            try {
                let response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/book/fetch/all/viewing`, 
                    {bookOwner: email},
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
                response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/book/fetch/borrowed/viewing`, 
                    {borrower: email},
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

    // useEffect(() => {
    //   console.log(listedBooks)
    //   console.log(borrowedBooks)
    //   console.log(lentBooks)
    // }, [listedBooks, borrowedBooks, lentBooks])
    
    
  return (
    <section className='w-full lg:h-[85vh] lg:w-3/4 px-3 flex flex-col gap-2 lg:flex-row'>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:w-1/4 md:w-1/2 w-3/4 '>
            {alert.show && (<Alert text={alert.text} type={alert.type}/>)}
        </div>
        
        {/* Section - 1 */}
        <div className='flex flex-col gap-2 lg:w-3/6 lg:h-5/6'>
        <div className='flex lg:flex-row flex-col'>
                <div className="w-full h-full flex justify-center items-center border-black border-2 rounded-md hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] bg-[#FFA6F6]">
                    <figure className="w-[280px] h-full border-black border-b-2 py-3 px-2 flex justify-center items-center">
                        <img
                        src={import.meta.env.VITE_APP_BACKEND_URL + userDetails.urlFront}
                        alt="thumbnail"
                        className="w-[95%] h-full object-cover rounded-md border-2 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] "
                        />
                        
                    </figure>
                </div>
                <div className="w-full h-full flex justify-center items-center border-black border-2 rounded-md hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] bg-[#FFA6F6]">
                    <figure className="w-[280px]  h-full border-black border-b-2 py-3 px-2 flex justify-center items-center">
                        <img
                        src={import.meta.env.VITE_APP_BACKEND_URL + userDetails.urlSide}
                        alt="thumbnail"
                        className="w-[95%] h-full object-cover rounded-md border-2 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] "
                        />
                    </figure>
                </div>
            </div>
            {/* User Information */}
            <div className='lg:mb-4'>
                <div className="px-6 py-5 text-left h-full border-2 rounded-md bg-[#B8FF9F]">
                    <input className=
                        {`text-[32px] mb-2 w-full ${isEditable ? 'border-black border-2 active:shadow-[2px_2px_0px_rgba(0,0,0,1)]' : ''} p-1 focus:outline-none  rounded-md`}
                        placeholder="Name"
                        name='username'
                        readOnly={true}
                        value={userDetails.username}
                    />
                    <textarea rows={5} class=
                        {`text-s mb-2 w-full ${isEditable ? 'border-black border-2 active:shadow-[2px_2px_0px_rgba(0,0,0,1)]' : ''} p-1 focus:outline-none  rounded-md`}
                        name='bio'
                        placeholder="Bio"
                        readOnly={true}
                        value={userDetails.bio}
                    />
                    <h1 className='text-xl font-semibold flex gap-2 items-center'>
                        Common Groups:
                        <span className='font-normal text-lg'>
                            {commonGroups.length === 0 ? ' No Common Groups' : commonGroups.map((group) => (<div className='cursor-pointer bg-white w-auto rounded-md border-2 p-2'>
                                {group.groupName}
                            </div>))}
                        </span> 
                    </h1>
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
                            <button onClick={() => setIsModalVisible(true)} className="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center ">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.8425 24V0H13.1575V24H10.8425ZM0 13.1664V10.8336H24V13.1664H0Z" fill="black"/>
                                </svg>
                            </button>

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
                        {showSection == 2 && <BookList loopArray={lentBooks} sectionNumber={2} setLentBooks={setLentBooks}/>}
                        {showSection == 3 && <BookList loopArray={borrowedBooks} sectionNumber={3} />}
                    </div>

                </div>
            </div>
        </div>

    </section>
  )
}

export default ViewProfile