import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-[#592538] text-white h-full overflow-y-auto">
      <div className="p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-6 sm:mb-8">
          <img
            src="/eduSoft_logo.png"
            alt="EduSoft Logo"
            className="h-8 sm:h-10 w-auto"
          />
          <img
            src="/logo-02.png"
            alt="ASPU Logo"
            className="h-8 sm:h-10 w-auto"
          />
        </div>
        <nav className="space-y-1 sm:space-y-2">
          <Link
            to="/dashboard"
            className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-lg ${
              isActive("/dashboard") ? "bg-white/10" : "hover:bg-white/10"
            }`}
          >
            <span className="text-lg sm:text-xl">📊</span>
            <span className="text-sm sm:text-base">Dashboard</span>
          </Link>
          <Link
            to="/assessments"
            className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-lg ${
              isActive("/assessments") ? "bg-white/10" : "hover:bg-white/10"
            }`}
          >
            <span className="text-lg sm:text-xl">📝</span>
            <span className="text-sm sm:text-base">Assessments</span>
          </Link>
          <Link
            to="/progress"
            className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-lg ${
              isActive("/progress") ? "bg-white/10" : "hover:bg-white/10"
            }`}
          >
            <span className="text-lg sm:text-xl">📈</span>
            <span className="text-sm sm:text-base">Progress</span>
          </Link>
          <Link
            to="/recommendations"
            className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-lg ${
              isActive("/recommendations") ? "bg-white/10" : "hover:bg-white/10"
            }`}
          >
            <span className="text-lg sm:text-xl">📚</span>
            <span className="text-sm sm:text-base">Recommendations</span>
          </Link>
          <Link
            to="/settings"
            className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-lg ${
              isActive("/settings") ? "bg-white/10" : "hover:bg-white/10"
            }`}
          >
            <span className="text-lg sm:text-xl">⚙️</span>
            <span className="text-sm sm:text-base">Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
