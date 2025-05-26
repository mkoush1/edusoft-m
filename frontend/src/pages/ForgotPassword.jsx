import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("user");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetUrl("");
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email, userType);
      if (response.resetUrl) {
        setResetUrl(response.resetUrl);
      }
      setMessage(
        "Password reset email sent. Please check your email for instructions."
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while processing your request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#592538] p-12 flex-col justify-between">
        <div>
          <div className="flex items-center">
            <Link to="/">
              <img
                src="/eduSoft_logo.png"
                alt="EduSoft Logo"
                className="h-12 w-auto"
              />
            </Link>
            <Link to="/">
              <img src="/logo-02.png" alt="ASU Logo" className="h-12 w-auto" />
            </Link>
            <span className="text-[#F7F4F3] text-3xl font-bold ml-4">
              EduSoft
            </span>
          </div>
          <div className="mt-16">
            <h2 className="text-[#F7F4F3] text-4xl font-light leading-tight">
              Forgot your password?
            </h2>
            <p className="text-[#F7F4F3]/80 text-xl mt-6 leading-relaxed">
              No worries! Enter your email and user type to receive a password
              reset link and regain access to your learning journey.
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
              Reset Your Password
            </h1>
            <p className="text-[#F7F4F3]/70 mb-8">
              Enter your email and user type to receive a reset link.
            </p>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
              {message && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="text-sm text-green-700">{message}</div>
                  {resetUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Click the link below to reset your password:
                      </p>
                      <a
                        href={resetUrl}
                        className="text-sm text-blue-600 hover:text-blue-500 break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {resetUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}
              <div>
                <select
                  id="userType"
                  name="userType"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="user">Student</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-[#5B2333] rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <div className="text-center text-[#F7F4F3]">
                <Link
                  to="/login"
                  className="font-medium text-[#F7F4F3] hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
