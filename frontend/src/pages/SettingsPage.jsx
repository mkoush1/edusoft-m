import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout, { UserContext } from "../components/DashboardLayout";
import axios from "axios";
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiUpload, 
  FiCheck, 
  FiX, 
  FiEye, 
  FiEyeOff, 
  FiCheckCircle,
  FiEdit2,
  FiSave,
  FiKey,
  FiShield
} from "react-icons/fi";
import { FaUserCircle, FaLock, FaEnvelope } from "react-icons/fa";

// Password strength indicator component
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  
  const getStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (pwd.match(/[a-z]+/)) strength += 1;
    if (pwd.match(/[A-Z]+/)) strength += 1;
    if (pwd.match(/[0-9]+/)) strength += 1;
    if (pwd.match(/[!@#$%^&*(),.?":{}|<>]+/)) strength += 1;
    return strength;
  };

  const strength = getStrength(password);
  const strengthText = [
    'Very Weak',
    'Weak',
    'Fair',
    'Good',
    'Strong'
  ][strength - 1] || '';

  return (
    <div className="mt-1">
      <div className="flex items-center text-xs text-gray-500">
        <span>Password strength: </span>
        <span className={`ml-1 font-medium ${
          strength <= 1 ? 'text-red-500' : 
          strength <= 3 ? 'text-yellow-500' : 'text-green-500'
        }`}>
          {strengthText}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div 
          className={`h-full rounded-full ${
            strength <= 1 ? 'bg-red-500 w-1/5' : 
            strength === 2 ? 'bg-yellow-500 w-2/5' :
            strength === 3 ? 'bg-yellow-500 w-3/5' :
            strength === 4 ? 'bg-green-500 w-4/5' : 
            'bg-green-600 w-full'
          }`}
        ></div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user: contextUser, updateUser } = useContext(UserContext);
  const [userData, setUserData] = useState({
    name: contextUser?.name || "",
    email: contextUser?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with user data from context
  useEffect(() => {
    if (contextUser) {
      setUserData(prev => ({
        ...prev,
        name: contextUser.name || "",
        email: contextUser.email || ""
      }));
      setLoading(false);
    }
  }, [contextUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    if (userData.newPassword && userData.newPassword !== userData.confirmPassword) {
      setError("New passwords do not match");
      setIsSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const updateData = {
        name: userData.name,
        email: userData.email,
      };

      if (userData.newPassword) {
        updateData.currentPassword = userData.currentPassword;
        updateData.newPassword = userData.newPassword;
      }

      const response = await axios.put(
        "http://localhost:5000/api/users/profile", 
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the context with new user data
      updateUser({
        name: userData.name,
        email: userData.email
      });

      if (userData.newPassword) {
        setSuccess("Password updated successfully. Logging out...");
        setTimeout(() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }, 1500);
        return;
      }

      setSuccess("Profile updated successfully");
      setUserData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Account Settings">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-[#f3e8f2] rounded-full mb-4"></div>
            <div className="h-4 bg-[#f3e8f2] rounded w-48 mb-2"></div>
            <div className="h-4 bg-[#f3e8f2] rounded w-32"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Account Settings">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex items-center">
              <FiX className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
            <div className="flex items-center">
              <FiCheck className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              <p className="mt-1 text-sm text-gray-500">Update your account's profile information and email address.</p>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-8">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUserCircle className={`h-5 w-5 ${userData.name ? 'text-purple-500' : 'text-gray-400'} transition-colors duration-200`} />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 group-hover:border-purple-300"
                        placeholder="Full Name"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <FiEdit2 className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        readOnly
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        placeholder="Email"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <FiLock className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <input
                      type="hidden"
                      id="email"
                      name="email"
                      value={userData.email}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Update Password</h2>
              <p className="mt-1 text-sm text-gray-500">Ensure your account is using a long, random password to stay secure.</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`h-5 w-5 ${userData.currentPassword ? 'text-purple-500' : 'text-gray-400'} transition-colors duration-200`} />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={userData.currentPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 group-hover:border-purple-300"
                    placeholder="Current Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center group/eye"
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400 group-hover/eye:text-purple-500 transition-colors duration-200" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400 group-hover/eye:text-purple-500 transition-colors duration-200" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiKey className={`h-5 w-5 ${userData.newPassword ? 'text-purple-500' : 'text-gray-400'} transition-colors duration-200`} />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={userData.newPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 group-hover:border-purple-300"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center group/eye"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400 group-hover/eye:text-purple-500 transition-colors duration-200" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400 group-hover/eye:text-purple-500 transition-colors duration-200" />
                    )}
                  </button>
                </div>
                {userData.newPassword && <PasswordStrength password={userData.newPassword} />}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiShield className={`h-5 w-5 ${userData.confirmPassword ? 'text-purple-500' : 'text-gray-400'} transition-colors duration-200`} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={userData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2.5 border ${
                      userData.newPassword && userData.confirmPassword && userData.newPassword !== userData.confirmPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500 bg-gray-50'
                    } rounded-lg focus:ring-2 transition-all duration-200 group-hover:border-purple-300`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center group/eye"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400 group-hover/eye:text-purple-500 transition-colors duration-200" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400 group-hover/eye:text-purple-500 transition-colors duration-200" />
                    )}
                  </button>
                </div>
                {userData.newPassword && userData.confirmPassword && userData.newPassword !== userData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#592538] transition-colors"
            >
              Logout
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="group relative inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px] overflow-hidden"
            >
              <span className={`flex items-center transition-all duration-200 ${isSaving ? 'opacity-0' : 'opacity-100'}`}>
                <FiSave className="mr-2 h-4 w-4 text-white group-hover:animate-bounce" />
                Save Changes
              </span>
              {isSaving && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
