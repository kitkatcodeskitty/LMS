import React, { useEffect, useState, useRef, useContext } from 'react';
import { nanoid } from 'nanoid';
import Quill from 'quill';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';

const AddCourse = () => {
  const { backendUrl, getToken, currency } = useContext(AppContext);
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  });

  // Chapter handlers (add, remove, toggle)
  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter name:');
      if (title) {
        const newChapter = {
          chapterId: nanoid(),
          chapterTitle: title,
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
    try {
      if (!image) {
        toast.error('Please upload a course thumbnail');
        return;
      }

      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: parseFloat(coursePrice),
        discount: parseInt(discount),
        discountType,
        courseContent: chapters,
      };

      const formData = new FormData();
      formData.append('courseData', JSON.stringify(courseData)); 
      formData.append('image', image);

      const token = await getToken();
      const { data } = await axios.post(`http://localhost:5000/api/admin/add-course`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', 
        },
      });

      if (data.success) {
        toast.success('Course added successfully');
        setCourseTitle('');
        setCoursePrice(0);
        setDiscount(0);
        setDiscountType('percentage');
        setImage(null);
        setChapters([]);
        quillRef.current.root.innerHTML = '';
      } else {
        toast.error(data.message || 'Failed to add course');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while adding the course');
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: 'snow' });
    }
  }, []);

  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-4 max-w-md w-full text-gray-500'
      >
        {/* Course Title */}
        <div className='flex flex-col gap-1'>
          <p>Course Title</p>
          <input
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type='text'
            placeholder='Type here'
            className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500'
            required
          />
        </div>

        {/* Course Description (Quill editor) */}
        <div className='flex flex-col gap-1'>
          <p>Course Description</p>
          <div ref={editorRef}></div>
        </div>

        {/* Course Price and Thumbnail */}
        <div className='flex items-center justify-between flex-wrap'>
          <div className='flex flex-col gap-1'>
            <p>Course Price</p>
            <input
              onChange={(e) => setCoursePrice(e.target.value)}
              value={coursePrice}
              type='number'
              placeholder='0'
              className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'
              required
            />
          </div>

          <div className='flex md:flex-row flex-col items-center gap-3'>
            <p>Course Thumbnail</p>
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
              className='outline-none py-1 px-2 rounded border border-gray-500 text-sm'
            >
              <option value='percentage'>Percentage (%)</option>
              <option value='amount'>Amount ({currency || '$'})</option>
            </select>
          </div>
          <input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            type='number'
            placeholder={discountType === 'percentage' ? '0' : '0.00'}
            min={0}
            max={discountType === 'percentage' ? 100 : undefined}
            className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'
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
                <span className='text-gray-500'>{chapter.chapterContent.length}</span>
                <img
                  src={assets.cross_icon}
                  onClick={() => handleChapter('remove', chapter.chapterId)}
                  alt='Remove Chapter'
                  className='cursor-pointer'
                />
              </div>

              {!chapter.collapsed && (
                <div className='p-4'>
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
              <div className='bg-white text-gray-700 p-4 rounded relative w-full max-w-80'>
                <h1 className='text-lg font-semibold mb-4'>Add Lecture</h1>

                <div className='mb-2'>
                  <p>Lecture Title</p>
                  <input
                    type='text'
                    className='mt-1 block w-full border rounded py-1 px-2'
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
                    className='mt-1 block w-full border rounded py-1 px-2'
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
                    className='mt-1 block w-full border rounded py-1 px-2'
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

        <button type='submit' className='bg-black text-white w-max py-2.5 px-8 rounded my-4'>
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddCourse;
