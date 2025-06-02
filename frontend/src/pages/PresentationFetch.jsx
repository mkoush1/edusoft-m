import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";

const PresentationFetch = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(
        "http://localhost:5000/api/assessments/presentation/admin-videos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVideos(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError(err.message || "Failed to fetch videos");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.delete(
        `http://localhost:5000/api/assessments/presentation/admin-videos/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh the videos list
      await fetchVideos();
    } catch (err) {
      console.error("Error deleting video:", err);
      setError(err.message || "Failed to delete video");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Presentation Videos">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#592538] text-xl">Loading videos...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Presentation Videos">
        <div className="flex items-center justify-center h-64">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#592538] mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Presentation Videos Test Page">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#592538]">
            Presentation Videos
          </h1>
        </div>

        {videos.length === 0 ? (
          <p className="text-gray-600">No videos found.</p>
        ) : (
          <div className="space-y-6">
            {videos.map((video, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-[#592538]">
                    Question {video.questionId}
                  </h3>
                  <button
                    onClick={() => handleDelete(video._id)}
                    disabled={deleting}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
                <p className="text-gray-600 mb-2">
                  Submitted by: {video.username || 'Unknown User'}
                </p>
                <p className="text-gray-600 mb-2">
                  Submitted: {new Date(video.submittedAt).toLocaleString()}
                </p>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full h-full"
                    src={video.videoPath}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PresentationFetch;
