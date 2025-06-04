import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminSupervisors = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editSupervisor, setEditSupervisor] = useState(null);
  const [editForm, setEditForm] = useState({ Username: '', Email: '' });
  const [saving, setSaving] = useState(false);
  const [reportSupervisor, setReportSupervisor] = useState(null);
  const [reportText, setReportText] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const navigate = useNavigate();

  const fetchSupervisors = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await axios.get('/api/supervisors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSupervisors(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch supervisors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supervisor?')) return;
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await axios.delete(`/api/supervisors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSupervisors(supervisors.filter(sup => sup.supervisorId !== id));
    } catch (err) {
      alert('Failed to delete supervisor');
    }
  };

  const handleEdit = (sup) => {
    setEditSupervisor(sup);
    setEditForm({ Username: sup.Username, Email: sup.Email });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await axios.put(`/api/supervisors/${editSupervisor.supervisorId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSupervisors(supervisors.map(sup => sup.supervisorId === editSupervisor.supervisorId ? response.data.data : sup));
      setEditSupervisor(null);
    } catch (err) {
      alert('Failed to update supervisor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Supervisors</h1>
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
              <th className="py-2 px-4 border-b">Supervisor ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {supervisors.map((sup, idx) => (
              <tr key={sup.supervisorId || idx} className="border-b">
                <td className="py-2 px-4">{sup.supervisorId ?? 'N/A'}</td>
                <td className="py-2 px-4">{sup.Username ?? 'N/A'}</td>
                <td className="py-2 px-4">{sup.Email ?? 'N/A'}</td>
                <td className="py-2 px-4">
                  <button
                    className="bg-yellow-400 text-white px-3 py-1 rounded mr-2"
                    onClick={() => handleEdit(sup)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
                    onClick={() => { setReportSupervisor(sup); setReportText(''); setReportMessage(''); }}
                  >
                    Report
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(sup.supervisorId)}
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
      {editSupervisor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Supervisor</h2>
            <label className="block mb-2">Name</label>
            <input
              type="text"
              name="Username"
              value={editForm.Username}
              onChange={handleEditChange}
              className="w-full border px-3 py-2 mb-4 rounded"
            />
            <label className="block mb-2">Email</label>
            <input
              type="email"
              name="Email"
              value={editForm.Email}
              onChange={handleEditChange}
              className="w-full border px-3 py-2 mb-4 rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setEditSupervisor(null)}
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
      {reportSupervisor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Send Report to {reportSupervisor.Username}</h2>
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
                onClick={() => setReportSupervisor(null)}
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
                    await axios.post(`/api/supervisors/${reportSupervisor.supervisorId}/report`, { reportText }, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    setReportMessage('Report sent successfully!');
                    setTimeout(() => setReportSupervisor(null), 1200);
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

export default AdminSupervisors; 