import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-[#592538] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">{title || 'Admin Dashboard'}</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => {
                localStorage.removeItem('adminToken');
                window.location.href = '/login';
              }}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout;
