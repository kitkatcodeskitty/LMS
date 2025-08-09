import React, { useState, useEffect, useRef, useContext } from 'react'
import uniqid from 'uniqid'
import Quill from 'quill'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const UpdateCoursePopup = ({ course, onClose, onUpdate }) => {
  const { backendUrl, getToken } = useContext(AppContext)
  const quillRef = useRef(null)
  const editorRef = useRef(null)

  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(null) // New image to upload
  const [imagePreview, setImagePreview] = useState('') // For preview old or new
  const [chapters, setChapters] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const [currentChapterId, setCurrentChapterId] = useState(null)

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  })

  // Initialize form with course data on mount or course change
  useEffect(() => {
    if (!course) return
    setCourseTitle(course.courseTitle || '')
    setCoursePrice(course.coursePrice || 0)
    setDiscount(course.discount || 0)
    setChapters(course.courseContent || [])
    setImagePreview(course.courseThumbnail || '')

    if (editorRef.current && course.courseDescription) {
      if (!quillRef.current) {
        quillRef.current = new Quill(editorRef.current, { theme: 'snow' })
        quillRef.current.root.innerHTML = course.courseDescription
      } else {
        quillRef.current.root.innerHTML = course.courseDescription
      }
    }
  }, [course])

  // Chapter handlers (add, remove, toggle)
  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter name:')
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder:
            chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        }
        setChapters([...chapters, newChapter])
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId))
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      )
    }
  }

  // Lecture handlers (add, remove)
  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId)
      setShowPopup(true)
    } else if (action === 'remove') {
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
            lectureId: uniqid(),
          }
          return {
            ...chapter,
            chapterContent: [...chapter.chapterContent, newLecture],
          }
        }
        return chapter
      })
    )
    setShowPopup(false)
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!courseTitle.trim()) {
        toast.error('Course title cannot be empty')
        return
      }

      // Build courseData object
      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: parseFloat(coursePrice),
        discount: parseInt(discount),
        courseContent: chapters,
      }

      const formData = new FormData()
      formData.append('courseData', JSON.stringify(courseData))

      // Append image only if new image selected
      if (image) {
        formData.append('image', image)
      }

      const token = await getToken()
      const { data } = await axios.put(
        `${backendUrl}/api/course/update-course/${course._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (data.success) {
        toast.success('Course updated successfully')
        onUpdate(data.data) // send updated course back to parent
        onClose()
      } else {
        toast.error(data.message || 'Failed to update course')
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while updating the course')
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
            <label className="font-medium">Course Description</label>
            <div
              ref={editorRef}
              className="border border-gray-300 rounded min-h-[120px]"
              style={{ backgroundColor: 'white' }}
            ></div>
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
              <label className="font-medium cursor-pointer flex items-center gap-3" htmlFor="thumbnailImage">
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

          {/* Discount % */}
          <div className="flex flex-col gap-1">
            <label htmlFor="discount" className="font-medium">
              Discount %
            </label>
            <input
              id="discount"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              min={0}
              max={100}
              className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
              required
            />
          </div>

          {/* Chapters List */}
          <div>
            {chapters.map((chapter, index) => (
              <div key={chapter.chapterId} className="bg-white border rounded-lg mb-4">
                <div className="flex justify-between items-center p-4 border-b">
                  <div className="flex items-center">
                    <img
                      src={assets.dropdown_icon}
                      onClick={() => handleChapter('toggle', chapter.chapterId)}
                      className={`mr-2 cursor-pointer transition-all ${
                        chapter.collapsed ? '-rotate-90' : ''
                      }`}
                      width={14}
                      alt="Toggle Chapter"
                    />
                    <span className="font-semibold">
                      {index + 1}. {chapter.chapterTitle}
                    </span>
                  </div>
                  <span className="text-gray-500">{chapter.chapterContent.length}</span>
                  <img
                    src={assets.cross_icon}
                    onClick={() => handleChapter('remove', chapter.chapterId)}
                    alt="Remove Chapter"
                    className="cursor-pointer"
                  />
                </div>

                {!chapter.collapsed && (
                  <div className="p-4">
                    {chapter.chapterContent.map((lecture, lectureIndex) => (
                      <div
                        key={lecture.lectureId}
                        className="flex justify-between items-center mb-2"
                      >
                        <span>
                          {lectureIndex + 1}. {lecture.lectureTitle} - {lecture.lectureDuration} mins -{' '}
                          <a
                            href={lecture.lectureUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500"
                          >
                            Link
                          </a>{' '}
                          - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                        </span>
                        <img
                          src={assets.cross_icon}
                          alt="Remove Lecture"
                          className="cursor-pointer"
                          onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)}
                        />
                      </div>
                    ))}
                    <div
                      className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2"
                      onClick={() => handleLecture('add', chapter.chapterId)}
                    >
                      + Add Lecture
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Popup for adding lecture */}
            {showPopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="bg-white text-gray-700 p-4 rounded relative w-full max-w-80">
                  <h1 className="text-lg font-semibold mb-4">Add Lecture</h1>

                  <div className="mb-2">
                    <p>Lecture Title</p>
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
                    <p>Duration (minutes)</p>
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
                    <p>Lecture URL</p>
                    <input
                      type="text"
                      className="mt-1 block w-full border rounded py-1 px-2"
                      value={lectureDetails.lectureUrl}
                      onChange={(e) =>
                        setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-2">
                    <p>Is Preview Free?</p>
                    <input
                      type="checkbox"
                      className="mt-1 scale-125"
                      checked={lectureDetails.isPreviewFree}
                      onChange={(e) =>
                        setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })
                      }
                    />
                  </div>

                  <button
                    onClick={addLecture}
                    type="button"
                    className="w-full bg-blue-400 text-white px-4 py-2 rounded"
                  >
                    Add
                  </button>

                  <img
                    onClick={() => setShowPopup(false)}
                    src={assets.cross_icon}
                    className="absolute top-4 right-4 w-4 cursor-pointer"
                    alt="Close popup"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-black text-white w-max py-2.5 px-8 rounded my-4"
          >
            Update Course
          </button>
        </form>
      </div>
    </div>
  )
}

export default UpdateCoursePopup
