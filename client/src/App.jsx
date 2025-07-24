import React from 'react'
import { Route, Routes, useMatch} from 'react-router-dom'
import Home from './pages/users/Home'
import CoursesList from './pages/users/CourseList'
import CourseDetails from './pages/users/CourseDetails'
import MyEnrollments from './pages/users/MyEnrollments'
import Player from './pages/users/Player'
import Loading from './components/users/Loading'

import AddCourse from './pages/admin/AddCourse'
import Dashboard from './pages/admin/Dashboard'
import Educator from './pages/admin/Educator'
import MyCourse from './pages/admin/MyCourse'
import StudentsEnrolled from './pages/admin/StudentsEnrolled'
import Navbar from './components/users/Navbar'
import 'quill/dist/quill.snow.css' 
import {ToastContainer} from 'react-toastify'





const App = () => {

  const isEducatorRoute = useMatch('/educator/*')
  return (
    <div className='text-default min-h-screen bg-white'>
    <ToastContainer />
      {!isEducatorRoute && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course-list" element={<CoursesList />}/>
        <Route path="/course-list/:input" element={<CoursesList />}/>
        <Route path="/course/:id" element={<CourseDetails/>}/>
        <Route path="/my-enrollments" element={<MyEnrollments/>}/>
        <Route path="/player/:courseId" element={<Player/>}/>
        <Route path="/loading/:path" element={<Loading/>}/>


      <Route path="/educator" element={<Educator />}>
        <Route index element={<Dashboard />} />
        <Route path="myCourse" element={<MyCourse />} />
        <Route path="add-course" element={<AddCourse />} />
        <Route path="student-Enrolled" element={<StudentsEnrolled />} />
      </Route>



      </Routes>



      
    </div>
  )
}

export default App