import React from 'react'

function Confirm({text, setChoice}) {
  return (
    <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-300 border-2 rounded-md p-4 flex flex-col gap-2 '>
        <h1 className='text-xl font-semibold '>Delete Group</h1>
        <h2 className='font-bold'>{text}</h2>
        
        <div className='flex gap-2'>
            <button onClick={() => setChoice(true)} className='bg-red-200 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md border-2 p-2 cursor-pointer'>
                Confirm
            </button>
            <button onClick={() => setChoice(false)} className='bg-blue-200 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-md border-2 p-2 cursor-pointer'>
                Cancel
            </button>
        </div>
    </div>
  )
}

export default Confirm