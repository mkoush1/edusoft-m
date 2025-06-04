import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AssessmentManagement = () => {
  const [assessments, setAssessments] = useState([]);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    type: '',
    description: '',
    questions: []
  });
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/assessments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Loaded assessments:', response.data);
      setAssessments(response.data);
    } catch (error) {
      console.error('Error loading assessments:', error.response?.data || error.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        return;
      }

      // Prepare assessment data with the correct fields
      const assessmentData = {
        title: newAssessment.title,
        description: newAssessment.description,
        category: newAssessment.type,
        image: '/default-assessment.jpg',
        duration: 30
      };

      console.log('Creating assessment:', assessmentData);

      await axios.post('http://localhost:5000/api/assessments', assessmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNewAssessment({
        title: '',
        type: '',
        description: '',
        questions: []
      });
      loadAssessments();
    } catch (error) {
      console.error('Error creating assessment:', error.response?.data || error.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAssessment) return;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        return;
      }

      // Prepare assessment data with the correct fields
      const assessmentData = {
        title: selectedAssessment.title,
        description: selectedAssessment.description,
        category: selectedAssessment.category,
        image: selectedAssessment.image || '/default-assessment.jpg',
        duration: selectedAssessment.duration || 30
      };

      console.log('Updating assessment:', assessmentData);

      await axios.put(`http://localhost:5000/api/assessments/${selectedAssessment._id}`, assessmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setEditing(false);
      setSelectedAssessment(null);
      loadAssessments();
    } catch (error) {
      console.error('Error updating assessment:', error.response?.data || error.message);
    }
  };

  const handleDelete = async (assessmentId) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        return;
      }

      console.log('Deleting assessment:', assessmentId);

      await axios.delete(`http://localhost:5000/api/assessments/${assessmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      loadAssessments();
    } catch (error) {
      console.error('Error deleting assessment:', error.response?.data || error.message);
    }
  };

  const handleEdit = (assessment) => {
    setSelectedAssessment(assessment);
    setEditing(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Assessment Management</h1>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="px-4 py-2 bg-gray-100 text-[#592538] rounded-lg hover:bg-gray-200 transition duration-300"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Create New Assessment Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Assessment</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={newAssessment.title}
              onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={newAssessment.type}
              onChange={(e) => setNewAssessment({ ...newAssessment, type: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Assessment Type</option>
              <option value="leadership">Leadership</option>
              <option value="problem-solving">Problem Solving</option>
              <option value="presentation">Presentation</option>
              <option value="teamwork">Team Work</option>
              <option value="adaptability">Adaptability and Flexibility</option>
              <option value="communication">Communication</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newAssessment.description}
              onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>
          <button
            onClick={handleCreate}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Create Assessment
          </button>
        </form>
      </div>

      {/* Assessment List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Assessments</h2>
        {assessments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No assessments found. Create your first assessment above.</p>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div key={assessment._id} className="bg-gray-50 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{assessment.title}</h3>
                    <p className="text-sm text-gray-600">Category: {assessment.category}</p>
                    <p className="text-sm text-gray-600">Duration: {assessment.duration} minutes</p>
                    <p className="text-sm text-gray-600 mt-2">{assessment.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(assessment)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assessment._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Assessment Modal */}
      {editing && selectedAssessment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Assessment</h2>
            <label className="block mb-2">Title</label>
            <input
              type="text"
              value={selectedAssessment.title}
              onChange={e => setSelectedAssessment({ ...selectedAssessment, title: e.target.value })}
              className="w-full border px-3 py-2 mb-4 rounded"
            />
            <label className="block mb-2">Type</label>
            <select
              value={selectedAssessment.category}
              onChange={e => setSelectedAssessment({ ...selectedAssessment, category: e.target.value })}
              className="w-full border px-3 py-2 mb-4 rounded"
            >
              <option value="">Select Assessment Type</option>
              <option value="leadership">Leadership</option>
              <option value="problem-solving">Problem Solving</option>
              <option value="presentation">Presentation</option>
              <option value="teamwork">Team Work</option>
              <option value="adaptability">Adaptability and Flexibility</option>
              <option value="communication">Communication</option>
            </select>
            <label className="block mb-2">Description</label>
            <textarea
              value={selectedAssessment.description}
              onChange={e => setSelectedAssessment({ ...selectedAssessment, description: e.target.value })}
              className="w-full border px-3 py-2 mb-4 rounded"
              rows={3}
            />
            <label className="block mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={selectedAssessment.duration}
              onChange={e => setSelectedAssessment({ ...selectedAssessment, duration: Number(e.target.value) })}
              className="w-full border px-3 py-2 mb-4 rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => { setEditing(false); setSelectedAssessment(null); }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentManagement;
