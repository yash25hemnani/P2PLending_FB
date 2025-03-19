import React, { useEffect, useState } from 'react'
import axios from 'axios'

function Notifications() {
    const [notificationsList, setNotificationsList] = useState([])

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/notification/fetch`, {withCredentials: true})
        
                console.log(response.data)
                if(response.data.status == 'passed'){
                    setNotificationsList(response.data.data)
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchNotifications()
    }, [])

    const handleDelete = async (notificationId) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/notification/delete`,{
                notificationId
            }, {withCredentials: true})
    
            console.log(response.data)
            if(response.data.status == 'passed'){
                notificationsList.filter((notification) => notification._id !== notificationId)
            }
        } catch (error) {
            console.log(error)
        }
    }
    

  return (
    <section className='w-full lg:w-3/4 h-max-[95vh] lg:flex lg:justify-center overflow-y-auto px-3 flex flex-col gap-2 lg:flex-row'>
       <div className='bg-yellow-200 rounded-md p-4 w-3/4 flex flex-col gap-2'>
            <h1 className='font-semibold text-2xl'>Notifications</h1>
            {notificationsList.length === 0 ? ('Nothing to Show') : (
                notificationsList.map((notification) => (
                    <div className='bg-white rounded-md p-2 border-2 flex justify-between items-center gap-2 flex-wrap'>
                        <h1 className='text-lg font-semibold lg:max-w-4/5 p-2 text-wrap '>
                            {notification.message}
                        </h1>
                        <button 
                            onClick={() => handleDelete(notification._id)}
                            className="h-12 border-black border-2 p-3 bg-red-200 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-full flex justify-center items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                        </button>
                    </div>
                ))
            )}
        </div> 
    </section>
  )
}

export default Notifications