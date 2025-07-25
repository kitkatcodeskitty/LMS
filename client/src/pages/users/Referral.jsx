import React, { useState, useContext, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { AppContext } from '../../context/AppContext';  // your context where courses come from

const Referral = () => {
  const { user } = useUser();
  const { allCourses } = useContext(AppContext);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLinkCourseList, setCopiedLinkCourseList] = useState(false);
  const [copiedLinkRegistration, setCopiedLinkRegistration] = useState(false);

  if (!user) return <div className="text-center mt-10 text-red-600">Please log in to see your referral code.</div>;

  const email = user.primaryEmailAddress?.emailAddress || '';
  const referralCode = email.split('@')[0];

  // Construct referral links dynamically
  const referralLinkCourseList = `http://localhost:5173/course-list?affiliate_code=${referralCode}`;
  const referralLinkRegistration = `http://localhost:5173/registration?affiliate_code=${referralCode}${selectedCourseId ? `&course_id=${selectedCourseId}` : ''}`;

  const copyText = (text, setCopied) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => alert('Failed to copy. Please copy manually.'));
  };

  useEffect(() => {
    // Reset copied states on course change
    setCopiedLinkRegistration(false);
  }, [selectedCourseId]);

  return (
    <div style={{ maxWidth: '450px', margin: '3rem auto', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Your Referral Info</h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '.5rem' }}>Referral Code:</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input 
            type="text" 
            readOnly 
            value={referralCode} 
            style={{ flexGrow: 1, padding: '0.5rem', fontSize: '1.1rem' }} 
          />
          <button
            onClick={() => copyText(referralCode, setCopiedCode)}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            {copiedCode ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

     
      {/* Referral link to course list page */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '.5rem' }}>Referral Link (Course List):</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="text"
            readOnly
            value={referralLinkCourseList}
            style={{ flexGrow: 1, padding: '0.5rem', fontSize: '1rem' }}
          />
          <button
            onClick={() => copyText(referralLinkCourseList, setCopiedLinkCourseList)}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            {copiedLinkCourseList ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
 {/* Course selection dropdown */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '.5rem' }}>Select Course (optional):</label>
        <select
          style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">-- All Courses --</option>
          {allCourses && allCourses.length > 0 ? (
            allCourses.map(course => (
              <option key={course._id || course.courseId} value={course._id || course.courseId}>
                {course.courseTitle}
              </option>
            ))
          ) : (
            <option disabled>No courses available</option>
          )}
        </select>
      </div>

      {/* Referral link to registration page with optional course */}
      <div>
        <label style={{ display: 'block', marginBottom: '.5rem' }}>Referral Link (Registration):</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="text"
            readOnly
            value={referralLinkRegistration}
            style={{ flexGrow: 1, padding: '0.5rem', fontSize: '1rem' }}
          />
          <button
            onClick={() => copyText(referralLinkRegistration, setCopiedLinkRegistration)}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
            disabled={!selectedCourseId} // optional: disable if no course selected
            title={selectedCourseId ? '' : 'Select a course to copy registration link'}
          >
            {copiedLinkRegistration ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Referral;
