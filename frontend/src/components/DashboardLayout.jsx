import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { FiMenu, FiX, FiUser, FiBarChart2 } from "react-icons/fi";

// Create a context for user data
export const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const DashboardLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const savedData = localStorage.getItem("userData");
    return savedData ? JSON.parse(savedData) : {};
  });
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);
  const location = useLocation();

  // Update user data when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedData = localStorage.getItem("userData");
      if (savedData) {
        setUser(JSON.parse(savedData));
      }
    };

    // Listen for changes to localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Initial load
    handleStorageChange();
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Update local storage when user data changes
  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      localStorage.setItem("userData", JSON.stringify(user));
    }
  }, [user]);
  
  const updateUser = (newUserData) => {
    setUser(prev => ({
      ...prev,
      ...newUserData
    }));
  };

  // Close sidebar when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    
    handleRouteChange();
  }, [location]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth >= 768) return;
      
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("userType");
      localStorage.removeItem("userId");
      navigate("/login");
    }, 500);
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
    <div className="min-h-screen bg-[#FDF8F8] flex">
      {/* Mobile Menu Button */}
      <button
        ref={menuButtonRef}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#592538] text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <FiX className="w-6 h-6" />
        ) : (
          <FiMenu className="w-6 h-6" />
        )}
      </button>
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" />
      )}

      {/* Sidebar with mobile responsiveness */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64`}
      >
        <Sidebar onNavigate={() => window.innerWidth < 768 && setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <FiBarChart2 className="h-6 w-6 text-[#592538]" />
              <h1 className="text-xl sm:text-2xl font-semibold text-[#592538]">
                {title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-right">
                <p className="font-medium text-gray-900">{user?.name || user?.email || "User"}</p>
                <p className="text-xs text-gray-500">{user?.role || "Student"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300 text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {children}
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
    </UserContext.Provider>
  );
};

export default DashboardLayout;
