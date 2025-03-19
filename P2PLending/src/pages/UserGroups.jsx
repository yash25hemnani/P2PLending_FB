import React, { useState, useEffect } from 'react'
import GroupModal from '../components/GroupModal'
import axios from 'axios'
import GroupCard from '../components/GroupCard'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import useConfirm from '../hooks/useConfirm'
import Confirm from '../components/Confirm'
import useAlert from '../hooks/useAlert'
import Alert from '../components/Alert'
import CodeModal from '../components/CodeModal'
import { setCurrentGroupId } from '../features/user/userSlice'


function UserGroups() {
    const navigate = useNavigate()
    const [showJoined, setShowJoined] = useState(true)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isCodeModalVisible, setIsCodeModalVisible] = useState(false)
    const [joinedGroups, setJoinedGroups] = useState([])
    const [notJoinedGroups, setNotJoinedGroups] = useState([])
    const [showDetails, setShowDetails] = useState(false)
    const [isEditable, setIsEditable] = useState(false)
    const [currentGroup, setCurrentGroup] = useState({
        groupId: '',
        groupName:'',
        groupBio:'',
        groupCode: '',
        createdBy: '',
        readers: [],
        lenders: [],
        isAdmin: null,
        isMember: null,
        isLender: null,
    })
    const userData = useSelector((state) => state.user.userData)
    const dispatch = useDispatch()
    const [query, setQuery] = useState('')

    const {alert, showAlert, hideAlert} = useAlert()

    const {confirm, showConfirm, setChoice, hideConfirm} = useConfirm()
    
    const handleGroupClick = (id) => {
        setShowDetails(true)
        console.log(joinedGroups)
        console.log(notJoinedGroups)
        console.log(id)
        let selectedGroup = [];
        if (showJoined) {
            selectedGroup = joinedGroups.find((current) => current._id === id);
        } else {
            selectedGroup = notJoinedGroups.find((current) => current._id === id);
        }

        // Manipulate the currentGroup to get members - readers and lenders
        console.log(selectedGroup.members)

        let tempLenderArray = [];
        let tempReaderArray = [];
        let isAdmin = false
        let isMember = false
        let isLender = false

        selectedGroup.members.forEach(element => {
            // Check for Admin
            if (element.userEmail == userData.email && element.role == 'admin') {
                isAdmin = true;
            }

            if(element.role == 'lender' || element.role == 'admin'){
                if (element.userEmail == userData.email) {
                    isMember = true;
                    isLender = true;
                }
                tempLenderArray.push(element.userEmail)
            } else {
                if (element.userEmail == userData.email) {
                    isMember = true;
                }
                tempReaderArray.push(element.userEmail)
            }
        });

        setCurrentGroup({
            groupId: selectedGroup._id,
            groupName: selectedGroup.groupName,
            groupBio: selectedGroup.groupBio,
            groupCode: selectedGroup.groupCode,
            createdBy: selectedGroup.createdBy,
            readers: tempReaderArray,
            lenders:tempLenderArray,
            isAdmin: isAdmin,
            isMember: isMember,
            isLender: isLender,
        }) 
    }

    const enableEdit = () => {
        setIsEditable(!isEditable)
    }

    const handleDetailChange = (event) => {
        setCurrentGroup({...currentGroup, [event.target.name]:event.target.value})
    }

    const saveDetailChange = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/group/update`, {
                // Have to send group id and updated fields
                groupId: currentGroup.groupId,
                updatedFields: {...currentGroup}
            }, { withCredentials: true });
            
            console.log(response.data)
            setIsEditable(false)

            if(response.data.status == 'passed'){
                showAlert({text: response.data.message, type:response.data.type})
                setTimeout(() => {
                    hideAlert()
                }, 3000);

                const updatedGroups = joinedGroups.map((element) => {
                    if(element._id === currentGroup.groupId){
                        return currentGroup
                    }

                    return element
                })

                console.log(updatedGroups)

                setJoinedGroups(updatedGroups)
            }
            
        } catch (error) {
            console.error(error);
        } 
    } 


    const  promoteToLender = async () => {
        console.log(currentGroup.groupId)
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/group/promote`, {
                groupId: currentGroup.groupId,
            }, { withCredentials: true });
            
            if(response.data.status == 'passed'){
                // We are performing on logged in user
                const removeFromReader = currentGroup.readers.filter((item) => item != userData.email)
                setCurrentGroup({
                    ...currentGroup,
                    "isLender": false,
                    "readers": removeFromReader,
                    "lenders": [...currentGroup.lenders, userData.email]
                })

                showAlert({text: response.data.message, type:response.data.type})
                setTimeout(() => {
                    hideAlert()
                }, 3000);
            }
            
        } catch (error) {
            console.error(error);
        } 
    }

    const revertToReader = async () => {
        console.log(currentGroup.groupId)
        try {
            const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/group/revert`, {
                groupId: currentGroup.groupId,
            }, { withCredentials: true });
            
            if(response.data.status == 'passed'){
                // We are performing on logged in user
                const removeFromLender = currentGroup.lenders.filter((item) => item != userData.email)
                setCurrentGroup({
                    ...currentGroup,
                    "isLender": false,
                    "lenders": removeFromLender,
                    "readers": [...currentGroup.readers, userData.email]
                })
                showAlert({text: response.data.message, type:response.data.type})
                setTimeout(() => {
                    hideAlert()
                }, 3000);

            }
            
        } catch (error) {
            console.error(error);
        } 
    }
    
    useEffect(() => {
        console.log(currentGroup)
    }, [currentGroup])

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/user/auth/check`, { withCredentials: true });
                console.log(response.data)
                if(!response.data.isAuthenticated) {
                    navigate('/login')
                }
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                
            }
        };

        checkAuth();
    }, [])

    useEffect(() => {
        console.log(joinedGroups)
      }, [])
    
    
    useEffect(() => {
      const getJoinedGroups = async () => {
        try {
            const response =  await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/group/fetch/joined`, {withCredentials:true})
          
            setJoinedGroups(response.data.data)
        
        } catch (error) {
            console.log(error)
        }
    }
    
    getJoinedGroups()
    }, [])
    
    useEffect(() => {
        const getNotJoinedGroups = async () => {
          try {
              const response =  await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/group/fetch/not-joined`, {withCredentials:true})
            
              setNotJoinedGroups(response.data.data)
          
          } catch (error) {
              console.log(error)
          }
      }
      
      getNotJoinedGroups()
      }, [])

    const removeMember = async (listName, groupId, removeEmail) => {
        console.log("Group Id: " + groupId)
        try {
            const response =  await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/group/remove-member`,
             {groupId, removeEmail},
             {withCredentials:true})
          
            if(response.data.status == 'passed'){
                const updatedList = currentGroup[listName].filter((item) => item != removeEmail)
                setCurrentGroup({
                    ...currentGroup,
                    [listName]: updatedList
                })
                showAlert({text: response.data.message, type: response.data.type})
                setTimeout(() => {
                    hideAlert()
                }, 3000);
            }
        
        } catch (error) {
            console.log(error)
        }
    }

    const handleLibraryClick = (groupId) => {
        dispatch(setCurrentGroupId(groupId))
        navigate('/')
    }

    const handleSearch = (event) => {
        setQuery(event.target.value)
    }


  return (
    <section className='w-full lg:h-[99vh] lg:w-3/4 px-3 flex flex-col gap-2 lg:flex-row '>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lg:w-1/4 md:w-1/2 w-3/4 '>
            {alert.show && (<Alert text={alert.text} type={alert.type}/>)}
            {confirm.show && (<Confirm text={confirm.text} setChoice={setChoice}/>)}
            {isModalVisible && (<GroupModal setIsModalVisible={setIsModalVisible} />)}
            {isCodeModalVisible && (<CodeModal currentGroup={currentGroup} setIsCodeModalVisible={setIsCodeModalVisible} setJoinedGroups={setJoinedGroups} notJoinedGroups={notJoinedGroups} setNotJoinedGroups={setNotJoinedGroups} setCurrentGroup={setCurrentGroup}/>)}

        </div>
        <div className='flex flex-col gap-2 lg:w-3/6 lg:h-5/6'>
            <div className={`flex ${showDetails ? 'not-lg:hidden':''} flex-col gap-2 w-full h-auto overflow-y-auto border-black border-2 rounded-md hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] bg-[#FFA6F6] p-3`}>
                <input class=
                    "w-full bg-white border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-full"
                    placeholder="Search Something"
                    onInput={handleSearch}
                    value={query}
                />

                {showJoined && (<div className="px-6 py-5 text-left h-full border-2 rounded-md bg-yellow-200 flex flex-col gap-2 overflow-y-auto">
                    <div className='flex justify-between items-center'>
                        <h1 className="text-[32px] mb-1">Joined Groups</h1>
                        <div className='flex gap-2'>
                            <button onClick={() => setIsModalVisible(true)} class="border-black border-2 rounded-md bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] px-2 flex justify-center items-center cursor-pointer">
                                Add Group
                            </button>
                            <button onClick={() => setShowJoined(false)} class="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg>
                            </button>
                        </div>
                    </div>
                    {/* Book List */}
                    
                    {joinedGroups.length === 0 ? 'No Groups Joined!' : (
                        joinedGroups
                        .filter((group) =>
                            group.groupName.toLowerCase().includes(query.toLowerCase())
                        )
                        .map((group, index) => (
                            // Define the Delete and Edit here
                            <GroupCard 
                                onClick={() => handleGroupClick(group._id)} 
                                key={group._id} 
                                groupDetails={group}  
                                isAdmin={group.createdBy.email === userData.email} 
                                showConfirm={showConfirm} 
                                setJoinedGroups={setJoinedGroups}
                                showAlert={showAlert}
                                hideAlert={hideAlert}
                            />
                                
                            // userData
                        ))
                    )}
                    
                </div>)}

                {!showJoined && (<div className="px-6 py-5 text-left h-full border-2 rounded-md bg-yellow-200 flex flex-col gap-2 overflow-y-auto">
                    <div className='flex justify-between items-center'>
                        <h1 className="text-[32px] mb-1">Join a Group</h1>
                        <div className='flex gap-2'>
                            <button onClick={() => setShowJoined(!showJoined)} className="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/></svg>
                            </button>
                            
                        </div>
                    </div>
                    {/* Book List */}
                    
                    {notJoinedGroups.length === 0 ? 'No Groups Joined!' : (
                        notJoinedGroups
                        .filter((group) =>
                            group.groupName.toLowerCase().includes(query.toLowerCase())
                        )
                        .map((group, index) => (
                            // Define the Delete and Edit here
                            <GroupCard 
                                onClick={() => handleGroupClick(group._id)} 
                                key={group._id} 
                                groupDetails={group}  
                                isAdmin={group.createdBy.email === userData.email} 
                                showConfirm={showConfirm} 
                                setJoinedGroups={setJoinedGroups}
                                showAlert={showAlert}
                                hideAlert={hideAlert}
                                isMember={false}
                            />
                                
                            // userData
                        ))
                    )}

                </div>)}
            </div>
        </div>

        <div className={`${showDetails ? 'block':'hidden'} lg:block lg:w-3/6 lg:h-5/6`}>
            <div className='mb-4 h-full'>
                {showDetails && (<div className="px-6 py-5 text-left h-full border-2 rounded-md bg-yellow-200 flex flex-col gap-2 overflow-auto">
                    <div className='flex justify-between items-cente overflow-x-autor flex-wrap'>
                        <h1 className="text-[32px] mb-1">Group Details</h1>
                        <div className='flex gap-2'>
                            {currentGroup?.createdBy?.email === userData?.email && (<button class="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                            </button>)}
                            {currentGroup?.createdBy?.email === userData?.email && (
                                isEditable ? (
                                    <button 
                                        onClick={saveDetailChange} 
                                        className="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center cursor-pointer"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditable(true)} 
                                        className="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center cursor-pointer"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                                            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                                        </svg>
                                    </button>
                                )
                            )}

                            {/* Join Button */}
                            {!currentGroup.isMember && (
                                <button onClick={() => setIsCodeModalVisible(true)} className="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                   <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M434.5-434.5H191.87v-91H434.5v-242.63h91v242.63h242.63v91H525.5v242.63h-91V-434.5Z"/></svg>
                                </button>
                            )}
                            
                            {/* Promote to Lender Button */}
                            {currentGroup.isMember && !currentGroup.isLender && (<button onClick={promoteToLender} class="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M274.5-151.87v-91h411v91h-411Zm160-171v-321.26L336-546.39l-63.65-63.65L480-817.7l207.65 207.66L624-546.39l-98.5-97.74v321.26h-91Z"/></svg>
                            </button>)}
                            
                            {/* Revert to Reader Button */}
                            {currentGroup.isMember && currentGroup.isLender && (<button onClick={revertToReader} class="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M434.5-808.13v481.98L215.76-544.89 151.87-480 480-151.87 808.13-480l-63.89-64.89L525.5-326.15v-481.98h-91Z"/></svg>
                            </button>)}

                            {/* Visit Library Button */}
                            {currentGroup.isMember && (<button onClick={() => handleLibraryClick(currentGroup.groupId)} class="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M191.87-107.8v-649.33q0-37.78 26.61-64.39t64.39-26.61h394.26q37.78 0 64.39 26.61t26.61 64.39v649.33L480-231.15 191.87-107.8Zm91-138.5L480-330.87l197.13 84.57v-510.83H282.87v510.83Zm0-510.83h394.26-394.26Z"/></svg>
                            </button>)}
                            {/* Hide Details Button */}
                            <button onClick={() => setShowDetails(false)} class="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
                            </button>
                        </div>
                    </div>
                    {currentGroup?.createdBy?.email === userData?.email && (<label className='flex flex-col'>
                        Group Code
                        <input class=
                        "bg-white border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
                        placeholder="Group Name"
                        name='groupName'
                        value={currentGroup.groupCode}
                        readOnly={true}
                        />
                    </label>)}
                    <label className='flex flex-col'>
                        Group Name
                        <input class=
                        "bg-white border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
                        placeholder="Group Name"
                        name='groupName'
                        value={currentGroup.groupName}
                        onChange={handleDetailChange}
                        readOnly={!isEditable}
                        />
                    </label>
                    <label className='flex flex-col'>
                        Group Bio
                        <textarea rows={4} class=
                        "bg-white border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
                        placeholder="Group Bio"
                        name='groupBio'
                        value={currentGroup.groupBio}
                        onChange={handleDetailChange}
                        readOnly={!isEditable}
                        />
                    </label>
                    <label onClick={() => navigate(`/user/view/${currentGroup.createdBy.email}`)} className='flex flex-col'>
                        Owner
                        <input  class=
                        "bg-white border-black border-2 p-2.5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md"
                        placeholder="Group Owner"
                        value={currentGroup.createdBy.email}
                        disabled
                        />
                    </label>
                    <label className='flex flex-col gap-2'>
                        Lenders
                        { 
                            currentGroup.lenders.length === 0 ? (<div className='bg-white border-2 rounded-md p-3'>
                                No Lenders Yet!
                            </div>) : (currentGroup.lenders.map((email) => (
                                <div key={email} className='bg-white flex justify-between items-center border-2 rounded-md p-3 flex-wrap'>
                                <div className='font-semibold text-md flex gap-2 flex-wrap'>
                                    <h1 className='cursor-pointer hover:underline text-wrap' onClick={() => email === userData.email ? navigate(`/user/profile`) : navigate(`/user/view/${email}`)}>
                                        {email} {email === currentGroup.createdBy.email ? '(admin)' : ''}
                                    </h1>
                                </div>
                                <div className='flex gap-2'>
                                    {currentGroup.createdBy.email === userData.email && email !== userData.email ? 
                                    (<button onClick={() => showConfirm("Are you sure you want to remove?", () => removeMember("lenders", currentGroup.groupId, email))} className="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center ">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>
                                    </button>)
                                     : ''}
                                </div>
                                </div>)
                            ))
                        }
                    </label>
                    <label className='flex flex-col gap-2'>
                        Readers
                        { 
                            currentGroup.readers.length === 0 ? (<div className='bg-white border-2 rounded-md p-3'>
                                No Readers Yet!
                            </div>) : (currentGroup.readers.map((email) => (
                                <div key={email} className='bg-white flex justify-between items-center border-2 rounded-md p-3'>
                                <div className='font-semibold text-md flex gap-2'>
                                <h1 className='cursor-pointer hover:underline' onClick={() => email === userData.email ? navigate(`/user/profile`) : navigate(`/user/view/${email}`)}>
                                        {email}
                                    </h1>
                                    <h2>
                                        {email === currentGroup.createdBy.email ? '(admin)' : ''}
                                    </h2>
                                </div>
                                <div className='flex gap-2'>
                                    {currentGroup.createdBy.email === userData.email ? 
                                    (<button onClick={() => showConfirm("Are you sure you want to remove?", () => removeMember("readers",currentGroup.groupId, email))} className="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] w-8 h-8 flex justify-center items-center ">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>
                                    </button>)
                                     : ''}
                                </div>
                                </div>)
                            ))
                        }
                    </label>
                </div>)}

                {!showDetails && (<div className="px-6 py-5 text-left h-full border-2 rounded-md bg-yellow-200 flex flex-col justify-center items-center">
                    <button class="border-black border-2 rounded-full bg-[#FFA6F6] hover:bg-[#fa8cef] active:bg-[#f774ea] p-4 flex justify-center items-center ">
                        <svg xmlns="http://www.w3.org/2000/svg" height="44px" viewBox="0 -960 960 960" width="44px" fill="#000000"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg>   
                    </button>
                    <h1 className='font-semibold'>Click a Group to View Details!</h1>
                </div>)}
            </div>
        </div>
    </section>
  )
}

export default UserGroups