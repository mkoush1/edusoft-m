import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const token = searchParams.get("token");
  const userType = searchParams.get("type") || "user";

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token, userType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      await authService.resetPassword(token, password, userType);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to reset password");
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
              Reset Your Password
            </h2>
            <p className="text-[#F7F4F3]/80 text-xl mt-6 leading-relaxed">
              Choose a strong password to secure
              <br />
              your account and continue your
              <br />
              learning journey with EduSoft.
            </p>
          </div>
          <Link to="/" className="block w-fit">
            <button className="mt-8 px-8 py-3 bg-white text-[#5B2333] rounded-full text-lg font-medium hover:bg-gray-100 transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-[#592538] rounded-2xl p-8 w-full">
            <h1 className="text-[#F7F4F3] text-3xl font-bold mb-2">
              Create New Password
            </h1>
            <p className="text-[#F7F4F3]/70 mb-8">
              Enter and confirm your new password
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-4 mb-2">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}
              {success && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="text-sm text-green-700">
                    Password reset successful! Redirecting to login...
                  </div>
                </div>
              )}

              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-white text-[#5B2333] rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Reset Password
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

export default ResetPassword;
