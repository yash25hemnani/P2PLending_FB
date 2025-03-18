import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userData: null,
    currentGroupId: null
}

export const userSlice = createSlice({
    name: 'user', // Keep this same as the key in whitelist!!!
    initialState,
    reducers: {
        setUserData: (state, action) => {
            console.log(action.payload)
            state.userData = action.payload
        },
        clearUserData: (state) => {
            state.userData = null
        },
        setCurrentGroupId: (state, action) => {
            state.currentGroupId = action.payload
        }
    }
})

// Export actions
export const {setUserData, clearUserData, setCurrentGroupId} = userSlice.actions

// Export Reducer
export default userSlice.reducer