import { useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import Footer from "../../components/users/Footer";

const Login = () => {
  const { backendUrl, navigate, fetchUserData, fetchUserEnrolledCourses } = useContext(AppContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await axios.post(`http://localhost:5000/api/user/login`, form);

      localStorage.setItem("token", res.data.token);
      console.log("Login response:", res.data);

      try {
        await fetchUserData();
        await fetchUserEnrolledCourses();
        toast.success("Login successful");
        navigate("/");
      } catch (fetchErr) {
        console.error("Data fetch error after login:", fetchErr);
        toast.warning("Logged in, but failed to load data");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content grows to fill available space */}
      <main className="flex-grow flex items-center justify-center">
        <div className="login max-w-md w-full p-4 bg-white rounded shadow">
          <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
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
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white py-2 rounded font-semibold"
            >
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <h2 className="text-center mt-3">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-600 cursor-pointer underline"
            >
              Register
            </span>
          </h2>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
