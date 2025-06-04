import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [reportUser, setReportUser] = useState(null);
  const [reportText, setReportText] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMessage, setReportMessage] = useState('');

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await axios.get('/api/users/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
      console.log('Fetched users:', response.data.users);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await axios.delete(`/api/users/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.userId !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await axios.put(`/api/users/students/${editUser.userId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u.userId === editUser.userId ? response.data.user : u));
      setEditUser(null);
    } catch (err) {
      alert('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Users</h1>
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
          onClick={() => navigate('/admin/dashboard')}
        >
          Return to Dashboard
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">User ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Soft Skill Score</th>
              <th className="py-2 px-4 border-b">Progress (%)</th>
              <th className="py-2 px-4 border-b">Assessments Completed</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user.userId || idx} className="border-b">
                <td className="py-2 px-4">{user.userId ?? "N/A"}</td>
                <td className="py-2 px-4">{user.name}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4">{user.softSkillScore ?? "N/A"}</td>
                <td className="py-2 px-4">{user.progress ?? "N/A"}</td>
                <td className="py-2 px-4">{user.totalAssessmentsCompleted ?? "N/A"}</td>
                <td className="py-2 px-4">
                  <button
                    className="bg-yellow-400 text-white px-3 py-1 rounded mr-2"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
                    onClick={() => { setReportUser(user); setReportText(''); setReportMessage(''); }}
                  >
                    Report
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(user.userId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <label className="block mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              className="w-full border px-3 py-2 mb-4 rounded"
            />
            <label className="block mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={editForm.email}
              onChange={handleEditChange}
              className="w-full border px-3 py-2 mb-4 rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setEditUser(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleEditSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Send Report to {reportUser.name}</h2>
            <textarea
              className="w-full border px-3 py-2 mb-4 rounded"
              rows={5}
              value={reportText}
              onChange={e => setReportText(e.target.value)}
              placeholder="Write your report here..."
            />
            {reportMessage && <div className="mb-2 text-center text-green-600">{reportMessage}</div>}
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setReportUser(null)}
                disabled={reportLoading}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={async () => {
                  setReportLoading(true);
                  setReportMessage('');
                  try {
                    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
                    await axios.post(`/api/users/students/${reportUser.userId}/report`, { reportText }, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    setReportMessage('Report sent successfully!');
                    setTimeout(() => setReportUser(null), 1200);
                  } catch (err) {
                    setReportMessage('Failed to send report.');
                  } finally {
                    setReportLoading(false);
                  }
                }}
                disabled={reportLoading || !reportText.trim()}
              >
                {reportLoading ? 'Sending...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 