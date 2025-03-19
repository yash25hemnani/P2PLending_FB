import React, { useState } from 'react'

function SearchBar({currentGroupName = '', lendersList, setCurrentUser, setGalleryRotation}) {
    const [clicked, setClicked] = useState(false)
    const [query, setQuery] = useState('')

    const handleSearch = (event) => {
        setQuery(event.target.value)

        const indexOfUser = lendersList.findIndex((lender) =>
            lender.userEmail.toLowerCase().includes(event.target.value.toLowerCase())
        )

        
        setCurrentUser(indexOfUser)
        console.log((indexOfUser/(lendersList.length))*2 *Math.PI)
        setGalleryRotation([0, (indexOfUser/(lendersList.length))*2 *Math.PI, 0])


    }

  return ( //bg-[#ad33ef]
    <div className='flex justify-center items-center gap-2 bg-[#efd933] py-1 px-2 border-2 rounded-4xl hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] min-w-0 '>
        <div  onClick={() => setClicked(!clicked)}  className='bg-yellow-200 rounded-full p-2 border-2 cursor-pointer active:shadow-[2px_2px_0px_rgba(0,0,0,1)]'>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
        </div>
        {clicked && (
            <div className="h-full border-black rounded-md ">
                <input className=
                    "lg:w-96 md:w-96 border-black border-2 p-2.5 pl-5 focus:outline-none focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white active:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-full"
                    placeholder="Search Something"
                    value={query}
                    onInput={handleSearch}
                />
            </div>
        )}
        {currentGroupName !== '' && !clicked && (<div className='font-semibold'>
            {currentGroupName}
        </div>)}
    </div>
  )
}

export default SearchBar