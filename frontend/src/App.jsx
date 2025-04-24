import React from 'react'

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login1 from './Pages/Login/Login1'
import Login2 from './Pages/Login/Login2'
import Home from './Pages/Home/Home'
import Reg1 from './Pages/Register/Reg1'
import Reg2 from './Pages/Register/Reg2'
import Visits from './Pages/Visits/Visists'
import DoctorDetails from './Pages/Doctor/DoctorDetails'
import Client from './Pages/Client/Client'

import DoctorAddClient from './Pages/Client/DoctorAddClient'
import HospitalAddClient from './Pages/Client/HospitalAddClient'

const App = () => {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login1/>}/>
      <Route path="/otp-login" element={<Login2/>}/>
      <Route path="/home" element={<Home/>}/>
      <Route path='/register' element={<Reg1/>}/>
      <Route path='/otp-register' element={<Reg2/>}/>
      <Route path='/visits' element={<Visits/>} />
      <Route path='/doctor/:id' element={<DoctorDetails/>} />
      <Route path='/client' element={<Client/>} />
      <Route path='/addDocClient' element={<DoctorAddClient/>} />
      <Route path='/addHosClient' element={<HospitalAddClient/>} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App