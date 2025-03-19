import axios from 'axios'
import React, { useState } from 'react'

function GroupCard({onClick, groupDetails, isAdmin, showConfirm, setJoinedGroups, showAlert, hideAlert}) {

    const deleteGroup =  async (groupId) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/group/delete`,
            {groupId: groupId},    
            { withCredentials: true });

            showAlert({text:response.data.message, type:response.data.type})

            setJoinedGroups((prev) => prev.filter((element) => element._id !== groupId))

            setTimeout(() => {
                hideAlert()
            }, 3000);
            
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <div className='flex flex-col gap-2' onClick={onClick}>
        <div className='bg-white rounded-md p-2 border-2 flex flex-col gap-2 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] '>
            {/* For Book Details */}
            <div className='flex flex-row justify-between items-center '>
                <div>
                    <h1 className='font-semibold text-xl text-wrap'>
                        {groupDetails.groupName}
                    </h1>
                    <p className='text-wrap'>
                        {groupDetails.groupBio}
                    </p>
                    <p className='text-wrap'>
                        Created By - {groupDetails.createdBy.username}
                        <span className='text-green-700 px-2'>
                            {isAdmin ? '(You)' : ''}
                        </span>
                    </p>
                </div>
                <div className='flex flex-col gap-2'>
                    {/* <button class="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center ">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                    </button> */}
                    {isAdmin && (<button 
                    onClick={() => showConfirm("Are you sure you want to delete this group?", () => {
                        deleteGroup(groupDetails._id)
                    })} 
                    
                    className="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center ">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                    </button>)}
                    
                </div>
            </div>
        </div>
    </div>
  )
}

export default GroupCard