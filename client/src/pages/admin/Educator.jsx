import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../components/admin/Navbar'
import Sidebar from '../../components/admin/Sidebar'
import { assets } from '../../assets/assets'
import Footer from '../../components/admin/Footer'

const Educator = () => {
  return (
    <div className='text-default min-h-screen bg-white'>
      <Navbar />
      <div className='flex' >
        <Sidebar />
        <div className='flex-1'>
           {<Outlet/>}
        </div>
       
      </div>
      <Footer />
    </div>
  )
}

export default Educator