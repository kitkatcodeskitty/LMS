import React, { useState, useEffect, useRef, useContext } from 'react'
import { nanoid } from 'nanoid'
import Quill from 'quill'
import axios from 'axios'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const UpdatePackagePopup = ({ course, onClose, onUpdate }) => {
  const { backendUrl, getToken, currency } = useContext(AppContext)
  const quillRef = useRef(null)
  const editorRef = useRef(null)

  // Course state
  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState('percentage')
  const [image, setImage] = useState(null) // New image to upload
  const [imagePreview, setImagePreview] = useState('') // For preview old or new

  // Chapters & lectures
  const [chapters, setChapters] = useState([])
  const [editingChapterId, setEditingChapterId] = useState(null) // chapter being edited inline
  const [chapterEditTitle, setChapterEditTitle] = useState('')
  
  // Description collapse state
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(false)
  const [isContentCollapsed, setIsContentCollapsed] = useState(false)

  // Lecture popup controls
  const [showLecturePopup, setShowLecturePopup] = useState(false)
  const [currentChapterId, setCurrentChapterId] = useState(null)
  const [editingLecture, setEditingLecture] = useState(null) // lecture being edited

  // Lecture form details
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  })

  // Loading states
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('')

  // Load initial course data when course prop changes
  useEffect(() => {
    if (!course) return
    
    setCourseTitle(course.courseTitle || '')
    setCoursePrice(course.coursePrice || 0)
    setDiscount(course.discount || 0)
    setDiscountType(course.discountType || 'percentage')
    
    // Load chapters and ensure they're expanded by default
    const loadedChapters = (course.courseContent || []).map(chapter => ({
      ...chapter,
      collapsed: false // Make sure chapters are expanded by default
    }))
    setChapters(loadedChapters)
    setImagePreview(course.courseThumbnail || '')

    // Initialize Quill editor with description
    if (editorRef.current) {
      if (!quillRef.current) {
        quillRef.current = new Quill(editorRef.current, { theme: 'snow' })
      }
      quillRef.current.root.innerHTML = course.courseDescription || ''
    }
  }, [course])

  // Chapter handlers
  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const newChapterTitle = prompt('Enter Chapter name:')
      if (newChapterTitle) {
        const newChapter = {
          chapterId: nanoid(),
          chapterTitle: newChapterTitle,
          chapterBanner: null,
          chapterContent: [],
          collapsed: false,
          chapterOrder:
            chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        }
        setChapters([...chapters, newChapter])
      }
    } else if (action === 'remove') {
      if (window.confirm('Are you sure you want to delete this chapter?')) {
        setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId))
      }
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      )
    } else if (action === 'edit') {
      const chapter = chapters.find((ch) => ch.chapterId === chapterId)
      if (chapter) {
        setEditingChapterId(chapterId)
        setChapterEditTitle(chapter.chapterTitle)
      }
    }
  }

  // Save edited chapter title inline
  const saveChapterEdit = () => {
    if (!chapterEditTitle.trim()) {
      console.error('Chapter title cannot be empty')
      return
    }
    setChapters(
      chapters.map((chapter) =>
        chapter.chapterId === editingChapterId
          ? { ...chapter, chapterTitle: chapterEditTitle }
          : chapter
      )
    )
    setEditingChapterId(null)
    setChapterEditTitle('')
  }

  // Cancel chapter editing
  const cancelChapterEdit = () => {
    setEditingChapterId(null)
    setChapterEditTitle('')
  }

  // Lecture handlers
  const handleLecture = (action, chapterId, lectureIndex = null) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId)
      setEditingLecture(null) // Adding new lecture
      setLectureDetails({
        lectureTitle: '',
        lectureDuration: '',
        lectureUrl: '',
        isPreviewFree: false,
      })
      setShowLecturePopup(true)
    } else if (action === 'edit') {
      const lectureToEdit = chapters
        .find((c) => c.chapterId === chapterId)
        ?.chapterContent[lectureIndex]

      if (lectureToEdit) {
        setCurrentChapterId(chapterId)
        setEditingLecture(lectureToEdit)
        setLectureDetails({ ...lectureToEdit }) // pre-fill form
        setShowLecturePopup(true)
      }
    } else if (action === 'remove') {
      if (window.confirm('Are you sure you want to delete this lecture?')) {
        setChapters((prevChapters) =>
          prevChapters.map((chapter) =>
            chapter.chapterId === chapterId
              ? {
                  ...chapter,
                  chapterContent: chapter.chapterContent.filter(
                    (_, index) => index !== lectureIndex
                  ),
                }
              : chapter
          )
        )
      }
    }
  }

  // Add or update lecture in chapters
  const addOrUpdateLecture = () => {
    if (!lectureDetails.lectureTitle.trim()) {
      console.error('Lecture title cannot be empty')
      return
    }

    if (editingLecture) {
      // Update existing lecture
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === currentChapterId) {
            const updatedContent = chapter.chapterContent.map((lecture) =>
              lecture.lectureId === editingLecture.lectureId
                ? { 
                    ...lectureDetails, 
                    lectureDuration: parseInt(lectureDetails.lectureDuration) || 0, // Convert to number
                    lectureId: editingLecture.lectureId, 
                    lectureOrder: lecture.lectureOrder 
                  }
                : lecture
            )
            return { ...chapter, chapterContent: updatedContent }
          }
          return chapter
        })
      )
    } else {
      // Add new lecture
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === currentChapterId) {
            const newLecture = {
              ...lectureDetails,
              lectureDuration: parseInt(lectureDetails.lectureDuration) || 0, // Convert to number
              lectureOrder:
                chapter.chapterContent.length > 0
                  ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
                  : 1,
              lectureId: nanoid(),
            }
            return {
              ...chapter,
              chapterContent: [...chapter.chapterContent, newLecture],
            }
          }
          return chapter
        })
      )
    }
    setShowLecturePopup(false)
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    })
    setEditingLecture(null)
  }

  // Close lecture popup
  const closeLecturePopup = () => {
    setShowLecturePopup(false)
    setEditingLecture(null)
  }

  // Submit handler for updating course
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setLoading(true)
    setUploadProgress(0)
    setUploadStatus('Preparing course data...')
    
    try {
      if (!courseTitle.trim()) {
        console.error('Course title cannot be empty')
        setLoading(false)
        setUploadStatus('')
        return
      }

      setUploadStatus('Validating course data...')
      setUploadProgress(20)

      // Validate and clean chapters data
      const cleanedChapters = chapters.map(chapter => {
        const cleanedChapter = {
          ...chapter,
          chapterOrder: parseInt(chapter.chapterOrder) || 1,
          chapterContent: chapter.chapterContent.map(lecture => ({
            ...lecture,
            lectureDuration: parseInt(lecture.lectureDuration) || 0,
            lectureOrder: parseInt(lecture.lectureOrder) || 1,
            isPreviewFree: Boolean(lecture.isPreviewFree)
          }))
        }
        
        // Handle chapterBanner - only include if it's a string (URL), not a File object
        if (chapter.chapterBanner && typeof chapter.chapterBanner === 'string') {
          cleanedChapter.chapterBanner = chapter.chapterBanner
        } else {
          // Remove chapterBanner if it's not a string (File objects will be handled separately)
          delete cleanedChapter.chapterBanner
        }
        
        return cleanedChapter
      })

      const courseData = {
        courseTitle: courseTitle.trim(),
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: parseFloat(coursePrice) || 0,
        discount: parseInt(discount) || 0,
        discountType,
        courseContent: cleanedChapters,
        // Include required fields from original course
        packageType: course.packageType || 'elite',
        courseLimit: parseInt(course.courseLimit) || 1,
        isPublished: Boolean(course.isPublished),
      }

      // Validate required fields
      if (!courseData.courseTitle) {
        console.error('Course title is required');
        setLoading(false);
        setUploadStatus('Course title is required');
        setUploadProgress(0);
        return;
      }

      if (!courseData.packageType || !['elite', 'creator', 'prime', 'master'].includes(courseData.packageType)) {
        console.error('Invalid package type:', courseData.packageType);
        setLoading(false);
        setUploadStatus('Invalid package type');
        setUploadProgress(0);
        return;
      }

      console.log('Sending course data:', courseData);
      console.log('Chapters count:', cleanedChapters.length);
      console.log('Full chapters data:', cleanedChapters);
      cleanedChapters.forEach((chapter, index) => {
        console.log(`Chapter ${index + 1}: ${chapter.chapterTitle} (${chapter.chapterContent.length} lectures)`);
        console.log(`  Chapter ID: ${chapter.chapterId}`);
        console.log(`  Chapter Order: ${chapter.chapterOrder}`);
        console.log(`  Chapter Banner: ${chapter.chapterBanner ? 'Has banner' : 'No banner'}`);
        chapter.chapterContent.forEach((lecture, lectureIndex) => {
          console.log(`    Lecture ${lectureIndex + 1}: ${lecture.lectureTitle} (ID: ${lecture.lectureId})`);
          console.log(`      Duration: ${lecture.lectureDuration} (type: ${typeof lecture.lectureDuration})`);
          console.log(`      Order: ${lecture.lectureOrder} (type: ${typeof lecture.lectureOrder})`);
        });
      });

      setUploadStatus('Preparing files for upload...')
      setUploadProgress(40)

      const formData = new FormData()
      formData.append('courseData', JSON.stringify(courseData))

      if (image) {
        formData.append('image', image)
      }

      // Add chapter banners
      chapters.forEach((chapter) => {
        if (chapter.chapterBanner && typeof chapter.chapterBanner !== 'string') {
          formData.append('chapterBanners', chapter.chapterBanner);
        }
      });

      setUploadStatus('Uploading course to server...')
      setUploadProgress(60)

      const token = await getToken()
      const { data } = await axios.put(
        `${backendUrl}/api/courses/update-course/${course._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(60 + (progress * 0.3)); // 60-90% for upload
          }
        }
      )

      setUploadStatus('Processing course data...')
      setUploadProgress(90)

      if (data.success) {
        setUploadStatus('Course updated successfully!')
        setUploadProgress(100)
        
        setTimeout(() => {
          console.log('Course updated successfully')
          onUpdate(data.data)
          onClose()
          setLoading(false)
          setUploadStatus('')
          setUploadProgress(0)
        }, 1000)
      } else {
        console.error('Update failed:', data.message || 'Unknown error')
        setLoading(false)
        setUploadStatus('Update failed: ' + (data.message || 'Unknown error'))
        setUploadProgress(0)
      }
    } catch (error) {
      console.error('Update error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Network error'
      console.error('Error details:', error.response?.data)
      
      // Log specific validation errors if they exist
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors)
        Object.keys(error.response.data.errors).forEach(field => {
          console.error(`  ${field}:`, error.response.data.errors[field].message)
        })
      }
      
      setLoading(false)
      setUploadStatus('Update failed: ' + errorMessage)
      setUploadProgress(0)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-white p-6 rounded max-w-4xl w-full max-h-[90vh] overflow-auto relative">
        <button
          className="absolute top-3 right-3 text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-2xl font-semibold mb-4">Update Course</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-gray-700">
          {/* Course Title */}
          <div className="flex flex-col gap-1">
            <label htmlFor="courseTitle" className="font-medium">
              Course Title
            </label>
            <input
              id="courseTitle"
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500"
              required
            />
          </div>

          {/* Course Description */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="font-medium">Course Description</label>
              <button
                type="button"
                onClick={() => setIsDescriptionCollapsed(!isDescriptionCollapsed)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <span>{isDescriptionCollapsed ? 'Show' : 'Hide'}</span>
                <span className={`transform transition-transform ${isDescriptionCollapsed ? 'rotate-0' : 'rotate-180'}`}>
                  ▼
                </span>
              </button>
            </div>
            {!isDescriptionCollapsed && (
              <div
                ref={editorRef}
                className="border border-gray-300 rounded min-h-[120px]"
                style={{ backgroundColor: 'white' }}
              ></div>
            )}
            {isDescriptionCollapsed && (
              <div className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded border">
                Description editor is collapsed. Click "Show" to edit.
              </div>
            )}
          </div>

          {/* Course Price and Thumbnail */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="coursePrice" className="font-medium">
                Course Price
              </label>
              <input
                id="coursePrice"
                type="number"
                value={coursePrice}
                onChange={(e) => setCoursePrice(e.target.value)}
                className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
                required
                min={0}
              />
            </div>

            <div className="flex md:flex-row flex-col items-center gap-3">
              <label
                className="font-medium cursor-pointer flex items-center gap-3"
                htmlFor="thumbnailImage"
              >
                Course Thumbnail
                <img src={assets.file_upload_icon} alt="" className="p-3 bg-blue-500 rounded" />
              </label>
              <input
                type="file"
                id="thumbnailImage"
                onChange={(e) => {
                  setImage(e.target.files[0])
                  setImagePreview(URL.createObjectURL(e.target.files[0]))
                }}
                accept="image/*"
                hidden
              />
              {imagePreview && (
                <img className="max-h-16 rounded" src={imagePreview} alt="Thumbnail preview" />
              )}
            </div>
          </div>

          {/* Discount */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <label htmlFor="discount" className="font-medium">
                Discount
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="outline-none py-1 px-2 rounded border border-gray-500 text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="amount">Amount ({currency || '$'})</option>
              </select>
            </div>
            <input
              id="discount"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              min={0}
              max={discountType === 'percentage' ? 100 : undefined}
              placeholder={discountType === 'percentage' ? '0' : '0.00'}
              className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
              required
            />
          </div>


          {/* Chapters List */}
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">
                    📚 Course Content Management
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Edit existing chapters and lectures, or add new ones. All changes will be saved when you click "Update Course".
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsContentCollapsed(!isContentCollapsed)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded transition-colors"
                >
                  <span>{isContentCollapsed ? 'Show' : 'Hide'}</span>
                  <span className={`transform transition-transform ${isContentCollapsed ? 'rotate-0' : 'rotate-180'}`}>
                    ▼
                  </span>
                </button>
              </div>
            </div>
            
            {!isContentCollapsed && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Chapters ({chapters.length})</h3>
                  <button
                    type="button"
                    onClick={() => handleChapter('add')}
                    className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition-colors font-medium"
                  >
                    ➕ Add New Chapter
                  </button>
                </div>
            
            {chapters.length === 0 && (
              <div className="text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg">
                No chapters yet. Click "Add Chapter" to get started.
              </div>
            )}

            {chapters.map((chapter, index) => (
              <div key={chapter.chapterId} className="bg-white border rounded-lg mb-4">
                <div className="flex justify-between items-center p-4 border-b">
                  <div className="flex items-center gap-2">
                    <img
                      src={assets.dropdown_icon}
                      onClick={() => handleChapter('toggle', chapter.chapterId)}
                      className={`cursor-pointer transition-all ${
                        chapter.collapsed ? '-rotate-90' : ''
                      }`}
                      width={14}
                      alt="Toggle Chapter"
                    />

                    {/* Editable Chapter Title */}
                    {editingChapterId === chapter.chapterId ? (
                      <>
                        <input
                          type="text"
                          value={chapterEditTitle}
                          onChange={(e) => setChapterEditTitle(e.target.value)}
                          className="border px-2 py-1 rounded"
                        />
                        <button
                          type="button"
                          onClick={saveChapterEdit}
                          className="ml-2 bg-green-500 text-white px-2 rounded"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelChapterEdit}
                          className="ml-1 bg-gray-300 px-2 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">
                          {index + 1}. {chapter.chapterTitle}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleChapter('edit', chapter.chapterId)}
                          className="ml-2 text-sm px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors font-medium"
                        >
                          ✏️ Edit
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">{chapter.chapterContent.length}</span>
                    <label htmlFor={`chapterBanner-${chapter.chapterId}`} className="flex items-center gap-2 cursor-pointer text-sm text-blue-600 hover:text-blue-800">
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
                    <button
                      type="button"
                      onClick={() => handleChapter('remove', chapter.chapterId)}
                      className="text-red-500 font-bold text-xl hover:bg-red-100 rounded px-2 py-1 transition-colors"
                      title="Delete Chapter"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {!chapter.collapsed && (
                  <div className="p-4">
                    {/* Chapter Banner Preview */}
                    {chapter.chapterBanner && (
                      <div className='mb-4'>
                        <p className='text-sm text-gray-600 mb-2'>Chapter Banner:</p>
                        <img
                          src={typeof chapter.chapterBanner === 'string' ? chapter.chapterBanner : URL.createObjectURL(chapter.chapterBanner)}
                          alt='Chapter banner preview'
                          className='max-h-32 w-full object-cover rounded-lg border'
                        />
                      </div>
                    )}
                    
                    {chapter.chapterContent.length === 0 ? (
                      <div className="text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg mb-4">
                        No lectures yet. Click "Add Lecture" to get started.
                      </div>
                    ) : (
                      <div className="space-y-2 mb-4">
                        {chapter.chapterContent.map((lecture, lectureIndex) => (
                          <div
                            key={lecture.lectureId}
                            className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3 flex-1">
                              {/* Lecture Details */}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 mb-1">
                                  {lectureIndex + 1}. {lecture.lectureTitle}
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div className="flex items-center gap-4">
                                    <span>⏱️ {lecture.lectureDuration} mins</span>
                                    {lecture.isPreviewFree ? (
                                      <span className="text-green-600 font-medium">🆓 Free Preview</span>
                                    ) : (
                                      <span className="text-blue-600 font-medium">💰 Paid Content</span>
                                    )}
                                  </div>
                                  {lecture.lectureUrl && (
                                    <div>
                                      <a
                                        href={lecture.lectureUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-500 hover:underline text-sm"
                                      >
                                        🔗 View Video
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 ml-4 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleLecture('edit', chapter.chapterId, lectureIndex)
                                }
                                className="text-sm px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors font-medium flex items-center gap-1"
                                title="Edit Lecture"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleLecture('remove', chapter.chapterId, lectureIndex)
                                }
                                className="text-sm px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium flex items-center gap-1"
                                title="Delete Lecture"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
                      onClick={() => handleLecture('add', chapter.chapterId)}
                    >
                      + Add Lecture to this Chapter
                    </button>
                  </div>
                )}
              </div>
            ))}
                </>
            )}
            
            {isContentCollapsed && (
              <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded border text-center">
                Course content management is collapsed. Click "Show" to edit chapters and lectures.
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-black text-white w-max py-2.5 px-8 rounded my-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={loading}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{loading ? 'Updating...' : 'Update Course'}</span>
          </button>
        </form>

        {/* Lecture Add/Edit Popup */}
        {showLecturePopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-60">
            <div className="bg-white text-gray-700 p-6 rounded relative w-full max-w-md">
              <h1 className="text-lg font-semibold mb-4">
                {editingLecture ? 'Edit Lecture' : 'Add Lecture'}
              </h1>

              <div className="mb-2">
                <label className="block mb-1">Lecture Title</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded py-1 px-2"
                  value={lectureDetails.lectureTitle}
                  onChange={(e) =>
                    setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })
                  }
                />
              </div>

              <div className="mb-2">
                <label className="block mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  className="mt-1 block w-full border rounded py-1 px-2"
                  value={lectureDetails.lectureDuration}
                  onChange={(e) =>
                    setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })
                  }
                />
              </div>

              <div className="mb-2">
                <label className="block mb-1">Lecture URL</label>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded py-1 px-2"
                  value={lectureDetails.lectureUrl}
                  onChange={(e) =>
                    setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })
                  }
                />
              </div>


              <div className="mb-2 flex items-center gap-2">
                <label>Is Preview Free?</label>
                <input
                  type="checkbox"
                  className="scale-125"
                  checked={lectureDetails.isPreviewFree}
                  onChange={(e) =>
                    setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })
                  }
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={addOrUpdateLecture}
                  type="button"
                  className="flex-grow bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {editingLecture ? 'Save' : 'Add'}
                </button>
                <button
                  onClick={closeLecturePopup}
                  type="button"
                  className="flex-grow bg-gray-300 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4">
              <div className="text-center">
                {/* Spinner */}
                <div className="w-16 h-16 border-4 border-gray-300 border-t-4 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                
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
      </div>
    </div>
  )
}

export default UpdatePackagePopup
