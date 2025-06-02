import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConfirmEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('Confirming your email...');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        let res;
        let userEndpointFailed = false;
        try {
          console.log('Trying user confirmation endpoint...');
          res = await axios.get(`/api/auth/user/confirm-email/${token}`);
          console.log('User confirmation endpoint response:', res.data);
          // If the response does not contain a user, treat as failure
          if (!res.data?.user) {
            userEndpointFailed = true;
            throw new Error('User endpoint returned no user');
          }
        } catch (userErr) {
          userEndpointFailed = true;
          console.log('User confirmation endpoint failed:', userErr?.response?.data || userErr.message);
        }
        if (userEndpointFailed) {
          try {
            console.log('Trying supervisor confirmation endpoint...');
            res = await axios.get(`/api/auth/supervisor/confirm-email/${token}`);
            console.log('Supervisor confirmation endpoint response:', res.data);
          } catch (supErr) {
            console.log('Supervisor confirmation endpoint failed:', supErr?.response?.data || supErr.message);
            throw supErr;
          }
        }
        setMessage(res.data.message);
        setSuccess(true);
        setEmail(res.data.user?.email || '');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        const isInvalidOrExpired = err.response?.data?.message?.includes('Invalid or expired') || err.response?.data?.message?.includes('invalid or has already been used');
        setMessage(
          isInvalidOrExpired
            ? 'This confirmation link is invalid or has already been used. Redirecting to login...'
            : (err.response?.data?.message || 'Email confirmation failed. Try again.')
        );
        setSuccess(false);
        // Try to extract email from query param if present
        const params = new URLSearchParams(window.location.search);
        setEmail(params.get('email') || '');
        if (isInvalidOrExpired) {
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      }
    };
    if (token) confirmEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Email Confirmation</h1>
        <p className={success ? 'text-green-600' : 'text-red-600'}>{message}</p>
        <button
          className="mt-6 px-6 py-2 bg-[#592538] text-white rounded hover:bg-[#7a3450]"
          onClick={() => navigate('/login')}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default ConfirmEmail; 