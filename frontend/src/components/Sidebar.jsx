import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FiHome,
  FiFileText,
  FiTrendingUp,
  FiBookOpen,
  FiUser,
  FiLogOut,
  FiChevronRight
} from "react-icons/fi";
import { FaPuzzlePiece, FaLightbulb } from "react-icons/fa";
import { BsGraphUp } from "react-icons/bs";

const Sidebar = ({ onNavigate }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { 
      path: "/dashboard", 
      icon: <FiHome className="group-hover:text-white transition-colors" />, 
      label: "Dashboard" 
    },
    { 
      path: "/assessments", 
      icon: <FaPuzzlePiece className="group-hover:text-purple-300 transition-colors" />, 
      label: "Assessments" 
    },
    { 
      path: "/progress", 
      icon: <BsGraphUp className="group-hover:text-blue-300 transition-colors" />, 
      label: "Progress" 
    },
    { 
      path: "/recommendations", 
      icon: <FaLightbulb className="group-hover:text-yellow-300 transition-colors" />, 
      label: "Recommendations" 
    },
    { 
      path: "/settings", 
      icon: <FiUser className="group-hover:text-pink-300 transition-colors" />, 
      label: "Profile" 
    },
  ];

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userType");
    window.location.href = "/login";
  };

  return (
    <div className="w-72 bg-gradient-to-b from-[#4a1f3d] to-[#2d1128] text-white h-screen flex flex-col border-r border-white/10 shadow-xl">
      {/* Logo Section */}
      <div className="p-6 pb-2">
        <div className="flex items-center space-x-3">
          <img
            src="/eduSoft_logo.png"
            alt="EduSoft Logo"
            className="h-14 w-auto drop-shadow-lg"
          />
          <div className="h-10 w-px bg-white/20 mx-2"></div>
          <img
            src="/logo-02.png"
            alt="ASPU Logo"
            className="h-10 w-auto drop-shadow"
          />
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-bold text-white">EduSoft</h2>
          <p className="text-xs text-white/60">Learning Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto pt-4 pb-6">
        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive(item.path) 
                  ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
              onClick={onNavigate}
            >
              <div className="flex items-center">
                <span className="text-lg mr-3 group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
              <FiChevronRight className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive(item.path) ? 'opacity-100' : ''}`} />
            </Link>
          ))}
        </nav>
      </div>

      {/* User & Logout */}
      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-white/90 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200"
        >
          <div className="flex items-center">
            <FiLogOut className="w-5 h-5 mr-3 group-hover:animate-pulse" />
            <span>Logout</span>
          </div>
          <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
