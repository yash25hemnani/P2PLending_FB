import axios from 'axios'
import { groupBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import BookList from './BookList'

const DetailBox = ({name, handleLoadClick, bookOwner, description, isLoadingBooks, booksLentByEach}) => {
  
    return (
        <div className="w-full h-full border-black border-2 rounded-md hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] bg-white">
            <article className="w-full h-full">
                <div className="px-6 py-5 text-left h-full">
                    <h1 className="text-[32px] mb-4">{name}</h1>
                    <p className="text-md mb-4 line-clamp-4 text-blue-500 font-bold">
                        <NavLink to={`/user/view/${bookOwner}`}>Visit Profile</NavLink>
                    </p>
                    <div className='flex gap-2'>
                      {<button onClick={() => handleLoadClick(bookOwner)} className="h-12 border-black border-2 p-5 bg-yellow-200 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md flex justify-center items-center"
                      >
                          {isLoadingBooks ? 'Loading...' : 'Load'}
                      </button>}

                      {/* {(bookOwner in booksLentByEach) ? booksLentByEach[bookOwner].map((book) => book.bookName) : ''} */}

                    </div>

                    <div className='max-h-[200px] flex flex-col overflow-y-auto mt-2 gap-2'>
                      {(bookOwner in booksLentByEach) ? <BookList loopArray={booksLentByEach[bookOwner]} sectionNumber={1}/> : ''}
                    </div>
                </div>
            </article>
        </div>
      )
}


function Details({currentGroupId, currentUser, setCurrentGroupName, setNumElements}) {
  const [lendersList, setLendersList] = useState([])
  const [listedBooks, setListedBooks] = useState([])
  const [isLoadingBooks, setIsLoadingBooks] = useState(false)
  const [emailToLoad, setEmailToLoad] = useState('')

  const loadBooks = async () => {
    try {
      let response = await axios.post("http://localhost:3000/book/fetch/all/viewing", 
          {bookOwner: emailToLoad},
          { withCredentials: true });
      
      console.log(response.data)

      let tempListedBookArray = []
      response.data.data.map((book) => {
          if (book.status == 'available'){
              tempListedBookArray.push(book)
          } 
      })

      setListedBooks(tempListedBookArray)     

      if(tempListedBookArray.length !== 0){
        setBooksLentByEach((prevState) => ({
          ...prevState,
          [emailToLoad]: tempListedBookArray,
        }))
        setIsLoadingBooks(false)
        setEmailToLoad('')
      }
      
    } catch (error) {
        console.error(error);
        setIsLoadingBooks(false)
        setEmailToLoad('')
    } 
  }

  const handleLoadClick = (bookOwner) => {
    setIsLoadingBooks(true)
    setEmailToLoad(bookOwner)
    loadBooks()
  }




    useEffect(() => {
      const fetchLenders = async () => {
        try {
          const response = await axios.post("http://localhost:3000/group/fetch/one", {
              groupId: currentGroupId
          }, {withCredentials: true})
  
          console.log(response.data)
          if(response.data.status === 'passed'){
            // Set the current group name
            setCurrentGroupName(response.data.data.groupName)
            const members = response.data.data.members; //Fetch the memebers
            setNumElements(members.length)
            const lenders = members.filter((member) => member.role === 'lender' ||  member.role === 'admin') // Filter the lenders
            setLendersList(lenders)
            console.log(lenders)
          }
      } catch (error) {
          console.log(error)
      }
      }

      fetchLenders()
    }, [])

    

    
    const [booksLentByEach, setBooksLentByEach] = useState(
      lendersList.reduce((acc, lender) => {
        acc[lender.userEmail] = []
        return acc
      }, {})
    )

    useEffect(() => {
      
  
      if(isLoadingBooks && emailToLoad != ''){
        loadBooks()
      }
    }, [isLoadingBooks, emailToLoad])

    useEffect(() => {
      Object.keys(booksLentByEach).forEach((key) => console.log(booksLentByEach[key]))
    }, [booksLentByEach])
    

    const renderContent = lendersList.reduce((acc, lender, index) => {
      acc[index] = (
        <DetailBox
          key={index}
          name={lender.username}
          handleLoadClick={handleLoadClick}
          isLoadingBooks={isLoadingBooks}
          booksLentByEach={booksLentByEach}
          bookOwner={lender.userEmail}
        />
      )
      return acc
    }, {})
    

    return (
        renderContent[currentUser] || null
    )
}

export default Details