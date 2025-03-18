import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import './index.css'
import Layout from './layout.jsx'
import Home from './pages/Home.jsx'
import Help from './pages/Help.jsx'
import UserProfile from './pages/UserProfile.jsx'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import UserGroups from './pages/UserGroups.jsx'
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./app/store.js"
import ViewProfile from './pages/ViewProfile.jsx'
import Requests from './pages/Requests.jsx'


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route path='/' element={<Layout />}>
      <Route path='' element={<Home />} />
      <Route path='help' element={<Help />} />
      <Route path='user/profile' element={<UserProfile />} />
      <Route path='user/view/:email' element={<ViewProfile />} />
      <Route path='user/groups' element={<UserGroups />} />
      <Route path='requests' element={<Requests />} />
    </Route>

    <Route path='/signup' element={<Signup />} />
    <Route path='/login' element={<Login />} />
  </>
  )
)


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />  
      </PersistGate>

    </Provider>
  </StrictMode>,
)
