import React, { useState } from 'react'
import axios from 'axios'
import Alert from './Alert'
import useAlert from '../hooks/useAlert'
import { useSelector } from 'react-redux'

function CodeModal({currentGroup, setIsCodeModalVisible, setJoinedGroups, notJoinedGroups, setNotJoinedGroups, setCurrentGroup}) {
    const {alert, showAlert, hideAlert} = useAlert()
    const [groupCode, setGroupCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const userData = useSelector((state) => state.user.userData)

    const handleChange = (event) => {
        setGroupCode(event.target.value)
    }

    const joinGroup = async () => {
        console.log(currentGroup.groupId)
        try {
            setIsLoading(true)
            const response = await axios.post("http://localhost:3000/group/join", {
                groupId: currentGroup.groupId,
                groupCode: groupCode,
            }, { withCredentials: true });
            
            if(response.data.status){
                showAlert({text: response.data.message, type:response.data.type})
                setTimeout(() => {
                    hideAlert()
                }, 3000);

                // Once this is done, if status is passed, we will manipulate the arrays in fronend too
                if(response.data.status == 'passed'){
                    const newlyJoined = notJoinedGroups.find((group) => group._id === currentGroup.groupId)
                    setNotJoinedGroups((prevGroup) => prevGroup.filter((group) =>  group._id !== currentGroup.groupId))
                    setJoinedGroups((prevGroup) => [...prevGroup, newlyJoined])
                }

                setIsCodeModalVisible(false)
                setCurrentGroup((prevDetails) => ({
                    ...prevDetails,
                    isMember: true,
                    isLender: false,
                    readers: [...prevDetails.readers, userData.email]
                }));
                
            }
            
        } catch (error) {
            console.error(error);
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
        name='groupCode'
        placeholder="Enter Group Name"
        value={groupCode}
        onChange={handleChange}
        />

        <div className='flex gap-2'>
            <button onClick={joinGroup} className='bg-yellow-200 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md border-2 p-2 cursor-pointer'>
                {isLoading ? 'Joining...':'Join'}
            </button>
            <button onClick={() => setIsCodeModalVisible(false)} className='bg-red-200 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md border-2 p-2 cursor-pointer'>
                Cancel
            </button>
        </div>
    </div>
  )
}

export default CodeModal