import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import useAlert from '../hooks/useAlert'
import Alert from '../components/Alert'
import Confirm from '../components/Confirm'
import useConfirm from '../hooks/useConfirm'

function Requests() {
    const [receivedRequests, setReceivedRequests] = useState([])
    const [sentRequests, setSentRequests] = useState([])
    const userData = useSelector((state) => state.user.userData)
    const {alert, showAlert, hideAlert} = useAlert()
    const {confirm, showConfirm, setChoice, hideConfirm} = useConfirm()

    useEffect(() => {
      const getReceivedRequests = async () => {
        try {
            const response = await axios.get('http://localhost:3000/book/request/received', {withCredentials: true})

            if(response.data.status === 'passed'){
                console.log(response.data.data)
                setReceivedRequests(response.data.data)
            }
        } catch (error) {
            console.log(error)
        }
      }

      getReceivedRequests()
    }, [])

    useEffect(() => {
      const getSentRequests = async () => {
        try {
            const response = await axios.get('http://localhost:3000/book/request/sent', {withCredentials: true})

            if(response.data.status === 'passed'){
                console.log(response.data.data)
                setSentRequests(response.data.data)
            }
        } catch (error) {
            console.log(error)
        }
      }

      getSentRequests()
    }, [])

    const deleteRequest = async (listName, bookId, userEmail) => {
        const toSendEmail = listName === "received" ?  userEmail : userData.email
        try {
            const response =  await axios.post('http://localhost:3000/book/request/remove',
             {bookId, userEmail: toSendEmail},
             {withCredentials:true})
          
            if(response.data.status == 'passed'){
                
                if(listName == "sent") {
                    // Get the the book that was updated and remoce it
                    setSentRequests((prevRequests) =>
                        prevRequests.filter((book) =>
                          book._id !== bookId
                        )
                      );
                }
                if(listName == "received") {
                    // Get the the book that was updated
                    setReceivedRequests((prevRequests) =>
                        prevRequests.map((book) =>
                            book._id === bookId
                            ? { ...book, requests: book.requests.filter((request) => request.userEmail !== userEmail) }
                            : book
                        )
                      );
                }

                showAlert({text: response.data.message, type: response.data.type})
                setTimeout(() => {
                    hideAlert()
                }, 3000);
            }
        
        } catch (error) {
            console.log(error)
        }
    }

    const approveRequest = async (bookId, userEmail, expectedReturnDate) => {
        try {
            const response =  await axios.post('http://localhost:3000/book/request/approve',
             {bookId, userEmail, expectedReturnDate},
             {withCredentials:true})
          
            if(response.data){
                showAlert({text: response.data.message, type: response.data.type})
                setTimeout(() => {
                    hideAlert()
                }, 3000);

                if(response.data.status == 'passed'){
                    // Since we are resetting the requests array to empty, we can remove all the elements with the same book id
                    setReceivedRequests((prevRequests) => prevRequests.filter((book) => book._id !== bookId))
                }
            }
        
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <section className='w-full lg:w-3/4 flex gap-2 lg:flex-row flex-col justify-center lg:items-start items-center'>
        {alert.show && (<Alert text={alert.text} type={alert.type}/>)}
        {confirm.show && (<Confirm text={confirm.text} setChoice={setChoice}/>)}

        <div className="lg:w-1/2 w-[95vw] h-full border-black border-2 rounded-md hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-[#FFA6F6]">
            <div className="block cursor-pointer">
                <article className="w-full h-full flex flex-col gap-2">
                    <div className="px-6 py-5 text-left h-full">
                        <h1 className="text-[30px] mb-4 text-nowrap">Received Requests ({receivedRequests.length})</h1>
                        {receivedRequests.length === 0 ? 'No Requests Received' : (
                            receivedRequests.map((book, index) => (
                                book.requests.map((request, bookIndex) => (
                                    <div key={index} className='bg-white rounded-md p-2 flex items-center justify-between border-2 gap-2'>
                                        <div>
                                            <h1 className='text-xl font-semibold'>{book.bookName}</h1>
                                            <p><span className='font-semibold'>Requested By</span>: {request.userEmail}</p>
                                            <p><span className='font-semibold'>Date Suggested</span>: {request.suggestedReturnDate}</p>
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <button onClick={() => approveRequest(book._id, request.userEmail, request.suggestedReturnDate)} class="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                                            </button>
                                            <button onClick={() => showConfirm("Are you sure you want to delete?", () => deleteRequest("received", book._id, request.userEmail))} class="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                ) )
                            ))
                        )}
                    </div>
                </article>
            </div>
        </div>
        <div className="lg:w-1/2 w-[95vw]  h-full border-black border-2 rounded-md hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-[#FFA6F6]">
            <div className="block">
                <article className="w-full h-full">
                    <div className="px-6 py-5 text-left h-full flex flex-col gap-2">
                    <h1 className="text-[30px] mb-4 text-nowrap">Sent Requests ({sentRequests.length})</h1>
                        {sentRequests.length === 0 ? 'No Requests Sent' : (
                            sentRequests.map((book, index) => (
                                <div key={index} className='bg-white rounded-md p-2 flex items-center justify-between border-2 gap-2'>
                                    <div>
                                        <h1 className='text-xl font-semibold'>{book.bookName}</h1>
                                        <p><span className='font-semibold'>Owner</span>: {book.bookOwner}</p>
                                        <p><span className='font-semibold'>Date Suggested</span>: {book.requests.filter((element) => element.userEmail === userData.email).map((req) => req.suggestedReturnDate)}</p>
                                    </div>
                                    <div>
                                        <button onClick={() => showConfirm("Are you sure you want to delete?", () => deleteRequest("sent", book._id))} class="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    
                    </div>
                </article>
            </div>
        </div>
    </section>
  )
}

export default Requests