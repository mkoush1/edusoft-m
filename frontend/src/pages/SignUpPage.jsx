import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validatePassword, validateRole } from "../utils/validation";
import { signup, authService } from "../services/api";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    const roleError = validateRole(formData.role);
    if (roleError) {
      newErrors.role = roleError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const signupData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role.toLowerCase(),
      };

      let response;
      if (formData.role.toLowerCase() === 'supervisor') {
        response = await authService.supervisorSignup({
          fullName: signupData.name,
          email: signupData.email,
          password: signupData.password
        });
      } else {
        response = await signup(signupData);
      }

      if (response.token) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");

        navigate("/login");
      } else if (response.message && response.message.includes('verify your account')) {
        setErrors((prev) => ({
          ...prev,
          submit: response.message,
        }));
      } else {
        throw new Error("Signup failed. Please try again.");
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit:
          error.response?.data?.message || "Check your email to verify your account",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#592538] p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-4">
            <Link to="/">
              <img
                src="/eduSoft_logo.png"
                alt="EduSoft Logo"
                className="h-12 w-auto"
              />
            </Link>
            <Link to="/">
              <img src="/logo-02.png" alt="ASPU Logo" className="h-12 w-auto" />
            </Link>
            <span className="text-[#F7F4F3] text-3xl font-bold">EduSoft</span>
          </div>
          <div className="mt-16">
            <h2 className="text-[#F7F4F3] text-4xl font-light leading-tight">
              Join EduSoft Today!
            </h2>
            <p className="text-[#F7F4F3]/80 text-xl mt-6 leading-relaxed">
              Create your account to access soft skills assessments, track your
              progress, and unlock resources tailored to your learning journey.
            </p>
          </div>
          <Link to="/" className="block w-fit">
            <button className="mt-8 px-8 py-3 bg-white text-[#5B2333] rounded-full text-lg font-medium hover:bg-gray-100 transition-colors">
              Read More
            </button>
          </Link>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-[#592538] rounded-2xl p-8 w-full">
            <h1 className="text-[#F7F4F3] text-3xl font-bold mb-2">
              Create Account
            </h1>
            <p className="text-[#F7F4F3]/70 mb-8">
              Fill in the details below to get started with your learning
              journey.
            </p>

            {errors.submit && (
              <div className="mb-4 p-3 rounded bg-red-100/10">
                <p className="text-red-200 text-sm">{errors.submit}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="student">Student</option>
                  <option value="supervisor">Supervisor</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-200">{errors.role}</p>
                )}
              </div>

              {/* Full Name Input */}
              <div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-200">{errors.name}</p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-200">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                {errors.password && (
                  <div className="flex items-center gap-2 mt-1 p-2 bg-red-50 border border-red-200 rounded">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
                    <span className="text-sm text-red-700">{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-200">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-white text-[#5B2333] rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </button>

              <div className="text-center text-[#F7F4F3]">
                <span className="opacity-70">Already have an account? </span>
                <Link
                  to="/login"
                  className="font-medium text-[#F7F4F3] hover:underline"
                >
                  Log in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
