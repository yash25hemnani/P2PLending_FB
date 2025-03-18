import React from 'react'
import axios from 'axios'
import Alert from './Alert'
import useAlert from '../hooks/useAlert'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

function RequestBookModal({bookId, setIsModalVisible}) {
    const {alert, showAlert, hideAlert} = useAlert()
    const [isLoading, setIsLoading] = useState(false)
    const [date, setDate] = useState('')
    const location = useLocation()

    const handleDateChange = (event) => {
        let date = new Date(event.target.value)
        date = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`
        setDate(event.target.value)
    }

    const addRequest = async () => {
        console.log(bookId)
        try {
            const response = await axios.post("http://localhost:3000/book/request", {
                bookId: bookId,
                suggestedReturnDate: date
            }, {withCredentials: true})
    
            console.log(response.data)
            if(response.data){
                showAlert({text: response.data.message, type:response.data.type})

                setTimeout(() => {
                    hideAlert()
                    setIsModalVisible(false)
                }, 3000);

            }
        } catch (error) {
            console.log(error)
        }
    }


    

  return (
    <div className={`absolute top-1/2 left-1/2 w-3/4 ${location.pathname !== '/' ? 'lg:w-1/4':''} transform -translate-x-1/2 -translate-y-1/2 bg-green-200 border-2 rounded-md p-4 flex flex-col gap-2 `}>
        {alert.show && (<Alert text={alert.text} type={alert.type} />)}
        <h1 className='text-xl font-semibold '>Request Book</h1>
        <input type='date' className=
        "border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
        name='bookName'
        placeholder="Enter Book Name"
        onInput={handleDateChange}
        />

        <div className='flex gap-2'>
            <button onClick={addRequest} className='bg-yellow-200 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md border-2 p-2 cursor-pointer'>
                {isLoading ? 'Requesting...':'Request Book'}
            </button>
            <button onClick={() => setIsModalVisible(false)} className='bg-red-200 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md border-2 p-2 cursor-pointer'>
                Cancel
            </button>
        </div>
    </div>
  )
}

export default RequestBookModal