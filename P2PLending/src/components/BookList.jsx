import React, { useEffect, useState } from 'react'
import useAlert from '../hooks/useAlert'
import Alert from './Alert'
import axios from 'axios'
import { useSelector } from 'react-redux'
import RequestBookModal from './RequestBookModal'
import useConfirm from '../hooks/useConfirm'
import Confirm from '../components/Confirm'


function BookList({loopArray, sectionNumber, setListedBooks = null, setLentBooks = null}) {
    const {alert, showAlert, hideAlert} = useAlert()
    const temp = useSelector((state) => state.user.userData)
    const [userDetails, setUserDetails] = useState({...temp})
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [currentBook, setCurrentBook] = useState({
        bookId: '',
        bookName: '',
        bookOwner: ''
    })

    const {confirm, showConfirm, setChoice, hideConfirm} = useConfirm()
    const [editBookId, setEditBookId] = useState('')
    const [editBookData, setEditBookData] = useState({bookName: '', bookAuthor: ''})

    const handleBookChange = (event) => {
        console.log(event.target.value)
        setEditBookData({...editBookData, [event.target.name]: event.target.value})
    }

    const deleteBook = async (bookId) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/book/delete`, {
                bookId: bookId
            }, {withCredentials: true})
    
            console.log(response.data)
            if(response.data){
                showAlert({text: response.data.message, type:response.data.type})

                if(response.data.status == 'passed'){
                    setListedBooks((prevBooks) => prevBooks.filter((book) => book._id !== bookId))
                }

                setTimeout(() => {
                    hideAlert()
                    setIsModalVisible(false)
                }, 3000);

            }
        } catch (error) {
            console.log(error)
        }
    }

    const shelveBook = async (bookId) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/book/shelve`, {
                bookId: bookId
            }, {withCredentials: true})
    
            console.log(response.data)
            if(response.data){
                showAlert({text: response.data.message, type:response.data.type})
                setTimeout(() => {
                    hideAlert()
                }, 3000);

                if(response.data.status == 'passed'){
                    setLentBooks((prevBooks) => prevBooks.filter((book) => book._id !== bookId))
                }

            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleRequestClick = (bookId) => {
        console.log(bookId)
        setIsModalVisible(true)
        console.log("Loop Array")
        console.log(loopArray)
        const current = loopArray.filter((book) => book._id === bookId)
        console.log(current[0].bookName)
        setCurrentBook({
            bookId: current[0]._id,
            bookName: current[0].bookName,
            bookOwner: current[0].bookOwner
        })
    }

    useEffect(() => {
      console.log(currentBook)
    }, [currentBook])
    

    const handleEditClick = (bookId, bookName, bookAuthor) => {
        setEditBookId(bookId)
        setEditBookData({
            bookName: bookName,
            bookAuthor: bookAuthor
        })
    }

    const handleSaveClick = async (bookId) => {
        try {
            setEditBookId('')
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/book/update`, {
                // Have to send group id and updated fields
                bookId: bookId,
                updatedFields: {...editBookData}
            }, { withCredentials: true });
            
            console.log(response.data)
            setIsEditable(false)

            if(response.data.status == 'passed'){
                showAlert({text: response.data.message, type:response.data.type})

                setListedBooks((prevBooks) =>
                    prevBooks.map((book) =>
                        book._id === bookId ? { ...editBookData, ...book } : book
                    )
                )             
                
                setTimeout(() => {
                    hideAlert()
                }, 3000);
            }
            
        } catch (error) {
            console.error(error);
        } 
    }

    return (
        <>
            {alert.show && (<Alert text={alert.text} type={alert.type} />)}
            {confirm.show && (<Confirm text={confirm.text} setChoice={setChoice} />)}
            {isModalVisible && (<RequestBookModal currentBook={currentBook} setIsModalVisible={setIsModalVisible} />)}
            
          {loopArray.length === 0 ? (
            <div className='bg-white rounded-md p-2 border-2 flex flex-col gap-2 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] '>
                Nothing to Show
            </div>
          ) : (
            loopArray.map((book, index) => (
                <div key={index} className='bg-white rounded-md p-2 border-2 flex flex-col gap-2 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] '>
                    {/* For Book Details */}
                    <div className='flex flex-row justify-between items-center flex-wrap overflow-x-hidden'>
                        <div className='flex flex-col gap-0.5'>
                            <label className='font-semibold text-xl text-wrap flex gap-1'>
                                Book: 
                                <input 
                                    className={`font-semibold text-xl text-wrap px-1 ${book._id === editBookId ? 'border-2 rounded-md' : ''}`} 
                                    value={book._id === editBookId ? editBookData.bookName : book.bookName} 
                                    disabled={!(book._id === editBookId)}
                                    name='bookName'
                                    onChange={handleBookChange}
                                />
                            </label>
                            <label className='flex gap-1'>
                                Author:
                                <input 
                                    className={`text-wrap px-1 ${book._id === editBookId ? 'border-2 rounded-md' : ''}`} 
                                    value={book._id === editBookId ? editBookData.bookAuthor : book.bookAuthor} 
                                    disabled={!(book._id === editBookId)}
                                    name='bookAuthor'
                                    onChange={handleBookChange}
                                />
                            </label>
                        </div>
                        <div className='flex flex-col gap-2'>
                            {/* Edit Button */}
                            {book.bookOwner === userDetails.email && sectionNumber != 2 && (
                            <>
                                {book._id === editBookId 
                                ? (
                                    <button onClick={() => handleSaveClick(book._id)} class="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center ">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                                    </button>
                                ) 
                                : (
                                    <button onClick={() => handleEditClick(book._id, book.bookName, book.bookAuthor)} class="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center ">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                                    </button>
                                ) }

                                {/* Delete Button */}
                                <button onClick={() => showConfirm("Are you sure you want to delete?", () => deleteBook(book._id))} className="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center ">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                                </button>
                            
                            </>)}

                            {book.bookOwner === userDetails.email && sectionNumber == 2 && (<><button onClick={() => shelveBook(book._id)} class="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center ">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-200v-400h80v264l464-464 56 56-464 464h264v80H200Z"/></svg>
                            </button></>)}
                            
                            {/* Request Book */}
                            {book.requests.some((request) => request.userEmail === userDetails.email) ? (
                                'Requested'
                            ) : (
                                book.bookOwner !== userDetails.email && (
                                    <button
                                        onClick={() => handleRequestClick(book._id)}
                                        className="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="24px"
                                            viewBox="0 -960 960 960"
                                            width="24px"
                                            fill="#000000"
                                        >
                                            <path d="M480-160v-80h120l180-240-180-240H160v200H80v-200q0-33 23.5-56.5T160-800h440q19 0 36 8.5t28 23.5l216 288-216 288q-11 15-28 23.5t-36 8.5H480Zm-10-320ZM200-120v-120H80v-80h120v-120h80v120h120v80H280v120h-80Z" />
                                        </svg>
                                    </button>
                                )
                            )}

                            
                            
                        </div>
                    </div>
                    {/* For Borrower Details */}
                    {sectionNumber == 2 && (<div className='border-t-2 border-black'>
                        <h1 className='font-semibold text-wrap'>
                            Borrower: <span className='font-bold'>{book.lentTo}</span>
                        </h1>
                        <p className='text-wrap'>
                            Expected Return Date: <span>{book.expectedReturnDate}</span>
                        </p>
            
                    </div>)}
                </div>
              ))
          )}
        </>
      )
}

export default BookList