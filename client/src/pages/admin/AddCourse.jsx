import React, { useState, useEffect, useContext, useRef } from 'react';
import { nanoid } from 'nanoid';
import Quill from 'quill';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { getPackageDefaultPrice, getPackageDefaultDescription } from '../../constants/packages';

const AddPackage = () => {
  const { backendUrl, getToken, currency } = useContext(AppContext);
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState('');
  const [packageType, setPackageType] = useState('elite'); // Changed default to elite
  const [coursePrice, setCoursePrice] = useState(1000); // Changed default to 1000
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [existingPackageTypes, setExistingPackageTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  });

  // Auto-fill price and description when package type changes
  useEffect(() => {
    if (packageType) {
      const defaultPrice = getPackageDefaultPrice(packageType);
      const defaultDescription = getPackageDefaultDescription(packageType);
      
      setCoursePrice(defaultPrice);
      if (quillRef.current) {
        quillRef.current.root.innerHTML = defaultDescription;
      }
    }
  }, [packageType]);

  // Fetch existing package types
  const fetchExistingPackageTypes = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/courses/existing-package-types`);
      if (data.success) {
        setExistingPackageTypes(data.existingPackageTypes);
      }
    } catch (error) {
      console.error('Error fetching existing package types:', error);
    }
  };

  // Available package type options
  const packageTypeOptions = [
    { value: 'elite', label: 'Elite Package (1 Course)' },
    { value: 'creator', label: 'Creator Package (3 Courses)' },
    { value: 'prime', label: 'Prime Package (4 Courses)' },
    { value: 'master', label: 'Master Package (6 Courses)' }
  ];

  // Get course limit based on package type
  const getCourseLimitByPackageType = (packageType) => {
    switch (packageType) {
      case 'elite': return 1;
      case 'creator': return 3;
      case 'prime': return 4;
      case 'master': return 6;
      default: return 1;
    }
  };

  // Chapter handlers (add, remove, toggle)
  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter name:');
      if (title) {
        const newChapter = {
          chapterId: nanoid(),
          chapterTitle: title,
          chapterBanner: null,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      );
    }
  };

  // Lecture handlers (add, remove)
  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === 'remove') {
      setChapters((prevChapters) =>
        prevChapters.map((chapter) =>
          chapter.chapterId === chapterId
            ? {
                ...chapter,
                chapterContent: chapter.chapterContent.filter((_, index) => index !== lectureIndex),
              }
            : chapter
        )
      );
    }
  };

  // Add lecture to chapter
  const addLecture = () => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder:
              chapter.chapterContent.length > 0
                ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
                : 1,
            lectureId: nanoid(),
          };
          return {
            ...chapter,
            chapterContent: [...chapter.chapterContent, newLecture],
          };
        }
        return chapter;
      })
    );
    setShowPopup(false);
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    });
  };

    // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if the selected package type already exists
    if (existingPackageTypes.includes(packageType)) {
      console.error(`${packageType.charAt(0).toUpperCase() + packageType.slice(1)} package already exists! Please choose a different package type.`);
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    setUploadStatus('Preparing course data...');
    
    try {
      if (!image) {
        console.error('Please upload a package thumbnail');
        setLoading(false);
        setUploadStatus('');
        return;
      }
      
      // Debug: Check image details
      console.log('Image details:', {
        name: image.name,
        size: image.size,
        type: image.type,
        lastModified: image.lastModified
      });

      setUploadStatus('Creating course structure...');
      setUploadProgress(20);

      const courseData = {
        courseTitle,
        packageType,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: parseFloat(coursePrice),
        courseLimit: getCourseLimitByPackageType(packageType),
        discount: parseInt(discount),
        discountType,
        courseContent: chapters,
      };

      setUploadStatus('Preparing files for upload...');
      setUploadProgress(40);

      const formData = new FormData();
      formData.append('courseData', JSON.stringify(courseData)); 
      formData.append('image', image);
      
      // Debug: Check if image is being sent
      console.log('Image being sent:', image);
      console.log('FormData image:', formData.get('image'));

      // Add chapter banners
      chapters.forEach((chapter, chapterIndex) => {
        if (chapter.chapterBanner) {
          formData.append(`chapterBanners`, chapter.chapterBanner);
        }
      });

      setUploadStatus('Uploading course to server...');
      setUploadProgress(60);

      const token = await getToken();
      const { data } = await axios.post(`${backendUrl}/api/admin/add-course`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', 
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(60 + (progress * 0.3)); // 60-90% for upload
        }
      });

      setUploadStatus('Processing course data...');
      setUploadProgress(90);

      if (data.success) {
        setUploadStatus('Course uploaded successfully!');
        setUploadProgress(100);
        
        // Show success modal
        setTimeout(() => {
          setShowSuccessModal(true);
          setLoading(false);
          setUploadStatus('');
          setUploadProgress(0);
          
          // Reset form
          setCourseTitle('');
          setPackageType('elite');
          setCoursePrice(1000);
          setDiscount(0);
          setDiscountType('percentage');
          setImage(null);
          setChapters([]);
          quillRef.current.root.innerHTML = '';
          // Refresh existing package types after successful creation
          fetchExistingPackageTypes();
        }, 1000);
      } else {
        console.error(data.message || 'Failed to add package');
        setLoading(false);
        setUploadStatus('Upload failed: ' + (data.message || 'Unknown error'));
        setUploadProgress(0);
      }
    } catch (error) {
      console.error(error.message || 'An error occurred while adding the package');
      setLoading(false);
      setUploadStatus('Upload failed: ' + (error.message || 'Network error'));
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: 'snow' });
    }
    // Fetch existing package types on component mount
    fetchExistingPackageTypes();
  }, [backendUrl]);

  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-4 max-w-4xl w-full text-gray-500'
      >
                 {/* Package Title */}
         <div className='flex flex-col gap-1'>
           <p>Package Title</p>
          <input
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type='text'
            placeholder='Type here'
            className='outline-none md:py-3 py-2 px-4 rounded border border-gray-500 w-full'
            required
          />
        </div>

        {/* Package Type Selection */}
        <div className='flex flex-col gap-1'>
          <p>Package Type</p>
          <select
            value={packageType}
            onChange={(e) => setPackageType(e.target.value)}
            className='outline-none md:py-3 py-2 px-4 rounded border border-gray-500 w-full'
            required
          >
            {packageTypeOptions.map((option) => {
              const isDisabled = existingPackageTypes.includes(option.value);
              return (
                <option 
                  key={option.value} 
                  value={option.value}
                  disabled={isDisabled}
                  style={{ 
                    color: isDisabled ? '#ccc' : 'inherit',
                    backgroundColor: isDisabled ? '#f5f5f5' : 'inherit'
                  }}
                >
                  {option.label} {isDisabled ? '(Already exists)' : ''}
                </option>
              );
            })}
          </select>
          {existingPackageTypes.length > 0 && (
            <p className='text-sm text-gray-600 mt-1'>
              Existing packages: {existingPackageTypes.map(type => 
                type.charAt(0).toUpperCase() + type.slice(1)
              ).join(', ')}
            </p>
          )}

        </div>

        {/* Course Limit (Auto-filled) */}
        <div className='flex flex-col gap-1'>
          <p>Course Limit</p>
          <input
            value={getCourseLimitByPackageType(packageType)}
            type='number'
            readOnly
            className='outline-none md:py-3 py-2 w-40 px-4 rounded border border-gray-300 bg-gray-50 cursor-not-allowed'
          />
        </div>

        {/* Package Description (Quill editor) */}
        <div className='flex flex-col gap-1'>
          <p>Package Description</p>
          <div ref={editorRef}></div>
        </div>

                 {/* Package Price and Thumbnail */}
        <div className='flex items-center justify-between flex-wrap'>
          <div className='flex flex-col gap-1'>
                            <p>Package Price ({currency || 'Rs'})</p>
            <input
              onChange={(e) => setCoursePrice(e.target.value)}
              value={coursePrice}
              type='number'
              placeholder='0'
              className='outline-none md:py-3 py-2 w-40 px-4 rounded border border-gray-500'
              required
            />
          </div>

          <div className='flex md:flex-row flex-col items-center gap-3'>
                         <p>Package Thumbnail</p>
            <label htmlFor='thumbnailImage' className='flex items-center gap-3 cursor-pointer'>
              <img src={assets.file_upload_icon} alt='' className='p-3 bg-blue-500 rounded' />
              <input
                type='file'
                id='thumbnailImage'
                onChange={(e) => setImage(e.target.files[0])}
                accept='image/*'
                hidden
              />
              <img
                className='max-h-10'
                src={image ? URL.createObjectURL(image) : null}
                alt='Thumbnail preview'
              />
            </label>
          </div>
        </div>

        {/* Discount % */}
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-3'>
            <p>Discount</p>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className='outline-none py-2 px-3 rounded border border-gray-500 text-sm'
            >
              <option value='percentage'>Percentage (%)</option>
                              <option value='amount'>Amount ({currency || 'Rs'})</option>
            </select>
          </div>
          <input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            type='number'
            placeholder={discountType === 'percentage' ? '0' : '0.00'}
            min={0}
            max={discountType === 'percentage' ? 100 : undefined}
            className='outline-none md:py-3 py-2 w-36 px-4 rounded border border-gray-500'
            required
          />
        </div>

        {/* Chapters List */}
        <div>
          {chapters.map((chapter, index) => (
            <div key={chapter.chapterId} className='bg-white border rounded-lg mb-4'>
              <div className='flex justify-between items-center p-4 border-b'>
                <div className='flex items-center'>
                  <img
                    src={assets.dropdown_icon}
                    onClick={() => handleChapter('toggle', chapter.chapterId)}
                    className={`mr-2 cursor-pointer transition-all ${
                      chapter.collapsed ? '-rotate-90' : ''
                    }`}
                    width={14}
                    alt='Toggle Chapter'
                  />
                  <span className='font-semibold'>
                    {index + 1}. {chapter.chapterTitle}
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='text-gray-500'>{chapter.chapterContent.length}</span>
                  <label htmlFor={`chapterBanner-${chapter.chapterId}`} className='flex items-center gap-2 cursor-pointer text-sm text-blue-600 hover:text-blue-800'>
                    <img src={assets.file_upload_icon} alt='' className='w-4 h-4' />
                    {chapter.chapterBanner ? 'Change Banner' : 'Add Banner'}
                    <input
                      type='file'
                      id={`chapterBanner-${chapter.chapterId}`}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setChapters(chapters.map(ch => 
                            ch.chapterId === chapter.chapterId 
                              ? { ...ch, chapterBanner: file }
                              : ch
                          ));
                        }
                      }}
                      accept='image/*'
                      hidden
                    />
                  </label>
                  <img
                    src={assets.cross_icon}
                    onClick={() => handleChapter('remove', chapter.chapterId)}
                    alt='Remove Chapter'
                    className='cursor-pointer'
                  />
                </div>
              </div>

              {!chapter.collapsed && (
                <div className='p-4'>
                  {/* Chapter Banner Preview */}
                  {chapter.chapterBanner && (
                    <div className='mb-4'>
                      <p className='text-sm text-gray-600 mb-2'>Chapter Banner:</p>
                      <img
                        src={URL.createObjectURL(chapter.chapterBanner)}
                        alt='Chapter banner preview'
                        className='max-h-32 w-full object-cover rounded-lg border'
                      />
                    </div>
                  )}
                  
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div
                      key={lecture.lectureId}
                      className='flex justify-between items-center mb-2'
                    >
                      <span>
                        {lectureIndex + 1}. {lecture.lectureTitle} - {lecture.lectureDuration} mins -{' '}
                        <a
                          href={lecture.lectureUrl}
                          target='_blank'
                          rel='noreferrer'
                          className='text-blue-500'
                        >
                          Link
                        </a>{' '}
                        - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                      </span>
                      <img
                        src={assets.cross_icon}
                        alt='Remove Lecture'
                        className='cursor-pointer'
                        onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)}
                      />
                    </div>
                  ))}
                  <div
                    className='inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2'
                    onClick={() => handleLecture('add', chapter.chapterId)}
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}

          <div
            className='flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer'
            onClick={() => handleChapter('add')}
          >
            + Add Chapter
          </div>

          {/* Popup for adding lecture */}
          {showPopup && (
            <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
              <div className='bg-white text-gray-700 p-6 rounded relative w-full max-w-lg'>
                <h1 className='text-lg font-semibold mb-4'>Add Lecture</h1>

                <div className='mb-2'>
                  <p>Lecture Title</p>
                  <input
                    type='text'
                    className='mt-1 block w-full border rounded py-2 px-3'
                    value={lectureDetails.lectureTitle}
                    onChange={(e) =>
                      setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })
                    }
                  />
                </div>

                <div className='mb-2'>
                  <p>Duration (minutes)</p>
                  <input
                    type='number'
                    className='mt-1 block w-full border rounded py-2 px-3'
                    value={lectureDetails.lectureDuration}
                    onChange={(e) =>
                      setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })
                    }
                  />
                </div>

                <div className='mb-2'>
                  <p>Lecture URL</p>
                  <input
                    type='text'
                    className='mt-1 block w-full border rounded py-2 px-3'
                    value={lectureDetails.lectureUrl}
                    onChange={(e) =>
                      setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })
                    }
                  />
                </div>

                <div className='mb-2'>
                  <p>Is Preview Free?</p>
                  <input
                    type='checkbox'
                    className='mt-1 scale-125'
                    checked={lectureDetails.isPreviewFree}
                    onChange={(e) =>
                      setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })
                    }
                  />
                </div>


                <button
                  onClick={addLecture}
                  type='button'
                  className='w-full bg-blue-400 text-white px-4 py-2 rounded'
                >
                  Add
                </button>

                <img
                  onClick={() => setShowPopup(false)}
                  src={assets.cross_icon}
                  className='absolute top-4 right-4 w-4 cursor-pointer'
                  alt='Close popup'
                />
              </div>
            </div>
          )}
        </div>

        <button 
          type='submit' 
          className='bg-black text-white w-max py-2.5 px-8 rounded my-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
          disabled={loading}
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          <span>{loading ? 'Uploading...' : 'ADD'}</span>
        </button>
      </form>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4">
            <div className="text-center">
              {/* Animated Spinner */}
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              
              {/* Status Text */}
              <p className="text-lg font-medium text-gray-900 mb-2">
                {uploadStatus}
              </p>
              
              {/* Progress Percentage */}
              <p className="text-sm text-gray-600">
                {Math.round(uploadProgress)}% Complete
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Success Message */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Course Uploaded Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              Your course has been created and is ready for students to purchase.
            </p>
            
            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-gray-100 text-gray-700 py-2 px-8 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPackage;
