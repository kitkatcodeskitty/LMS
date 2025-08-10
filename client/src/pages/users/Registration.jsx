import { useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import Footer from "../../components/users/Footer";

const Register = () => {
  const { backendUrl, navigate, setUserData, setIsEducator } = useContext(AppContext);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    formData.append("email", form.email);
    formData.append("password", form.password);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      setSubmitting(true);
      const { data } = await axios.post(`${backendUrl}/api/user/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitting(false);

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        setUserData(data.user);
        setIsEducator(data.user.isAdmin || false);

        toast.success("Registration successful! You are now logged in.");
        navigate("/");
      } else {
        toast.error("Registration succeeded but no token received.");
      }
    } catch (err) {
      setSubmitting(false);
      toast.error(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content grows */}
      <main className="flex-grow flex items-center justify-center">
        <div className="register max-w-md w-full p-4 bg-white rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Register</h2>
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="First Name"
              required
              className="border p-2 rounded"
            />
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              required
              className="border p-2 rounded"
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              type="email"
              required
              className="border p-2 rounded"
            />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="border p-2 rounded"
            />
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Profile Image (optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white py-2 rounded font-semibold"
            >
              {submitting ? "Registering..." : "Register"}
            </button>
            <h2 className="text-center mt-3">
              Already have an Account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-blue-600 cursor-pointer underline"
              >
                Login in
              </span>
            </h2>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
