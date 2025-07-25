import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { UserButton, useUser } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'

const Navbar = () => {
  const { user } = useUser()
  const navigate = useNavigate()

  return (
    <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3 '>
      <Link to='/'>
        <img  src={assets.logo} alt='Logo' className='w-2/12 lg:w-23  cursor-pointer' />
      </Link>
      <div className='flex items-center gap-5 text-gray-500 relative'>
        <p>Hi! {user ? user.fullName : 'Developers'}</p>
        {user ? (
          <UserButton />
        ) : (
          <img
            className='w-8 h-8 rounded-full'
            src={assets.profile_img}
            alt='Default profile'
          />
        )}
      </div>
    </div>
  )
}

export default Navbar
