import axios from 'axios'
import React, { useState } from 'react'
import useAlert from '../hooks/useAlert'
import Alert from './Alert'

function GroupModal({setIsModalVisible}) {
    const [groupData, setGroupData] = useState({groupName: '', groupBio: ''})
    const [isLoading, setIsLoading] = useState(false)
    const {alert, showAlert, hideAlert} = useAlert()

    const handleChange = (event) => {
        setGroupData({...groupData, [event.target.name] : event.target.value})
    }

    const createGroup = async () => {
        if (groupData.groupName === '' || groupData.groupBio === ''){
            showAlert({text:'All Fields are Required', type:'danger'})
            setTimeout(() => {
                hideAlert()
            }, 3000);
            return;
        }
        setIsLoading(true)
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/group/create`,
            {groupName: groupData.groupName, groupBio: groupData.groupBio},    
            { withCredentials: true });

            console.log(response.data)
            
            if(response.data.status === 'passed'){
                showAlert({text: response.data.message, type:response.data.type})
                setGroupData({groupName: '', groupBio: ''})
                setTimeout(() => {
                    hideAlert()
                    setIsModalVisible(false)
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
        <h1 className='text-xl font-semibold '>Add Group</h1>
        <input className=
        "border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
        name='groupName'
        placeholder="Enter Group Name"
        value={groupData.groupName}
        onChange={handleChange}
        />
        <textarea className=
            "border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
            name='groupBio'
            placeholder="Enter Group Bio"
            value={groupData.groupBio}
            onChange={handleChange}
        />
        <div className='flex gap-2'>
            <button onClick={createGroup} className='bg-yellow-200 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md border-2 p-2 cursor-pointer'>
                {isLoading ? 'Adding...':'Create Group'}
            </button>
            <button onClick={() => setIsModalVisible(false)} className='bg-red-200 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md border-2 p-2 cursor-pointer'>
                Cancel
            </button>
        </div>
    </div>
  )
}

export default GroupModal