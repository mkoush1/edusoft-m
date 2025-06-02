import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch users data
    axios.get('/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setUsers(response.data);
    })
    .catch(error => {
      console.error('Error fetching users:', error);
    });

    // Fetch assessments data
    axios.get('/api/assessments', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setAssessments(response.data);
    })
    .catch(error => {
      console.error('Error fetching assessments:', error);
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Users Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Users Management</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-lg font-medium">Total Users: {users.length}</h3>
            </div>
            <button
              onClick={() => navigate('/admin/users')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              View All Users
            </button>
          </div>
        </div>

        {/* Assessments Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Assessments Management</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-lg font-medium">Total Assessments: {assessments.length}</h3>
            </div>
            <button
              onClick={() => navigate('/admin/assessments')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              View All Assessments
            </button>
          </div>
        </div>

        {/* Assessment Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Assessment Management</h2>
          <button
            onClick={() => navigate('/admin/assessments')}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 mb-3"
          >
            Manage Assessments
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
