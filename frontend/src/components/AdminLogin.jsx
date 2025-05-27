import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const [redirecting, setRedirecting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Attempting login with:', { email, password: '****' });
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Login response:', response.data);
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminEmail', email);
      
      // Log successful login
      console.log('Login successful. Redirecting to admin dashboard...');
      
      // Redirect to admin dashboard with full path
      navigate('/admin/dashboard', {
        replace: true,
        state: { from: '/login' }
      });
      
      // Clear any previous error
      setError('');
      
      // Force a re-render to ensure the redirect happens
      setRedirecting(true);
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="bg-[#592538] rounded-2xl p-8 w-full max-w-md mx-auto">
      <h2 className="text-[#F7F4F3] text-3xl font-bold mb-4 text-center">
        Admin Login
      </h2>
      
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100/10 text-red-200">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-[#F7F4F3]/70 text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
            required
            placeholder="admin@gmail.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-[#F7F4F3]/70 text-sm font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
            required
            placeholder="Password"
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="w-3/4 py-3 bg-white text-[#5B2333] rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
