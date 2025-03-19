import React, { useState } from 'react'
import useAlert from '../hooks/useAlert'
import axios from 'axios'
import Alert from './Alert'

function BookModal({setIsModalVisible, setListedBooks}) {
    const [bookData, setBookData] = useState({bookName: '', bookAuthor: '', bookCategory: ''})
    const [isLoading, setIsLoading] = useState(false)
    const {alert, showAlert, hideAlert} = useAlert()


    const handleChange = (event) => {
        console.log(event.target.value)
        setBookData({...bookData, [event.target.name] : event.target.value})
    }

    const createBook = async () => {
        if (bookData.bookName === '' || bookData.bookAuthor === '' || bookData.bookCategory === ''){
            showAlert({text:'All Fields are Required', type:'danger'})
            setTimeout(() => {
                hideAlert()
            }, 3000);
            return;
        }
        setIsLoading(true)
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/book/create`,
            {bookName: bookData.bookName, bookAuthor: bookData.bookAuthor, bookCategory: bookData.bookCategory},    
            { withCredentials: true });

            console.log(response.data)
            
            if(response.data.status === 'passed'){
                showAlert({text: response.data.message, type:response.data.type})
                setBookData({bookName: '', bookAuthor: '', bookCategory: ''})
                setListedBooks((prevBooks) => [...prevBooks, response.data.book])
                
                setTimeout(() => {
                    hideAlert()
                    // setIsModalVisible(false) // Let user hide themselves
                }, 3000);
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <div className='bg-green-200 border-2 rounded-md p-4 flex flex-col gap-2 '>
        {alert.show && (<Alert text={alert.text} type={alert.type} />)}
        <h1 className='text-xl font-semibold '>Add Book</h1>
        <input className=
        "border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
        name='bookName'
        placeholder="Enter Book Name"
        value={bookData.bookName}
        onInput={handleChange}
        />
        <input className=
        "border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
        name='bookAuthor'
        placeholder="Enter Book Author"
        value={bookData.bookAuthor}
        onInput={handleChange}
        />
        <input className=
        "border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
        name='bookCategory'
        placeholder="Enter Book Category"
        value={bookData.bookCategory}
        onInput={handleChange}
        />

        <div className='flex gap-2'>
            <button onClick={createBook} className='bg-yellow-200 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md border-2 p-2 cursor-pointer'>
                {isLoading ? 'Adding...':'Create Book'}
            </button>
            <button onClick={() => setIsModalVisible(false)} className='bg-red-200 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md border-2 p-2 cursor-pointer'>
                Cancel
            </button>
        </div>
    </div>
  )
}

export default BookModal