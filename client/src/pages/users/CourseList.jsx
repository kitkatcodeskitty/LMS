import React, { useContext, useEffect , useState } from 'react'
import { AppContext } from '../../context/AppContext'
import SearchBar from '../../components/users/SearchBar';
import { useParams } from 'react-router-dom';
import CourseCard from '../../components/users/CourseCard';
import { assets } from '../../assets/assets';
import Footer from '../../components/users/Footer';

const PackageList = () => {
  const { navigate, allCourses } = useContext(AppContext);
  const {input} = useParams()
  const [filteredCourse, setFilteredCourse] = useState([])

  useEffect(()=>{
    if(allCourses && allCourses.length > 0){
      const tempCourses = allCourses.slice()

      input ? 
        setFilteredCourse(
          tempCourses.filter(
            item => item.courseTitle.toLowerCase().includes(input.toLowerCase())
          )
        )
      : setFilteredCourse(tempCourses)
    }
  },[allCourses,input])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <>
        <div className='relative md:px-36 px-8 pt-20 text-left'>
          {/* Header Section */}
          <div className='flex md:flex-row flex-col gap-6 items-start justify-between w-full mb-12'>
            <div className="space-y-2">
              <h1 className='text-5xl font-bold text-gray-800 leading-tight'>
                Package List
              </h1>
              <div className='flex items-center space-x-2 text-gray-500'>
                <span 
                  className='text-blue-600 cursor-pointer hover:text-blue-700 transition-colors duration-200 font-medium' 
                  onClick={()=>navigate('/')}
                > 
                  Home 
                </span>
                <span className="text-gray-400">/</span>
                <span className="font-medium">Package List</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <SearchBar data={input}/>
            </div>
          </div>

          {/* Search Results Indicator */}
          { input && (
            <div className='inline-flex items-center gap-4 px-6 py-3 bg-blue-50 border border-blue-200 rounded-full mt-8 -mb-8 text-blue-700 shadow-sm'>
              <span className="font-medium">Search Results for:</span>
              <span className="bg-blue-100 px-3 py-1 rounded-full font-semibold">{input}</span>
              <img 
                src={assets.cross_icon} 
                alt='Clear search' 
                className='cursor-pointer hover:bg-blue-200 p-1 rounded-full transition-colors duration-200' 
                onClick={()=>navigate('/packages-list')}
              />
            </div>
          )}

          {/* Results Count */}
          <div className="mb-8">
            <p className="text-gray-600 font-medium">
              {filteredCourse.length} package{filteredCourse.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Packages Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16'>
            {filteredCourse.map((course, index) => (
              <CourseCard key={course._id || index} course={course} />
            ))}
          </div>

          {/* Empty State */}
          {filteredCourse.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-gray-400">📦</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No packages found</h3>
              <p className="text-gray-500">
                {input ? `No packages match your search for "${input}"` : 'There are no packages available at the moment.'}
              </p>
            </div>
          )}
        </div>
        <Footer />
      </>
    </div>
  )
}

export default PackageList