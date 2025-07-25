import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from '../../context/AppContext';
import { useUser } from '@clerk/clerk-react';

const Registration = () => {
  const location = useLocation();
  const { allCourses } = useContext(AppContext);
  const { user } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
  const [courseId, setCourseId] = useState("");
  const [file, setFile] = useState(null);
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    if (location?.state?.courseId) {
      setCourseId(location.state.courseId);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !courseId || !email || !transactionId) {
      alert("Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("courseId", courseId);
    formData.append("bill", file);
    formData.append("transaction_id", transactionId);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        alert("Registration successful!");
        setFile(null);
        setTransactionId("");
        setName("");
      } else {
        const errorData = await response.json();
        alert("Registration failed: " + errorData.message);
      }
    } catch (err) {
      console.error("Error during registration:", err);
      alert("Error submitting form.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Course Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Select Course</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
          >
            <option value="">-- Select Course --</option>
            {allCourses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Transaction ID</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="e.g. TXN123456"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Upload Bill Receipt</label>
          <input
            type="file"
            className="w-full border px-3 py-2 rounded"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Registration;
