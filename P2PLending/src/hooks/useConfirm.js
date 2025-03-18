import React, { useState } from 'react'

function useConfirm() {
    // I need a varaible to - show and hide confirm and then two more variables to get the selected answer and also the confirmation message
    const [confirm, setConfirm] = useState({show: false, text:'', next:null})

    const showConfirm = (text, next) => setConfirm({show:true, text:text, next:next})
    const hideConfirm = () => setConfirm({show:false, text:''})

    const setChoice = (choice) => {
        if(choice) {
            confirm.next()
        }

        hideConfirm()
    }



  return {confirm,  showConfirm, setChoice, hideConfirm}
}

export default useConfirm