import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, update } from "firebase/database";

export default function MentorRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Get all users (to display student information)
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const users = snapshot.val() || {};
      setAllUsers(users);
    });
  }, []);

  // ✅ Get current mentor's requests
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) return;

      setUser(currentUser);
      const mentorId = currentUser.uid;

      const requestsRef = ref(db, "requests");
      onValue(requestsRef, (snapshot) => {
        const data = snapshot.val() || {};
        const mentorRequests = Object.entries(data)
          .filter(([_, req]) => req.mentorId === mentorId)
          .map(([id, req]) => ({ id, ...req }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by time
        setRequests(mentorRequests);
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, []);

  // ✅ Update request status (accept / reject)
  const handleUpdateStatus = async (requestId, newStatus) => {
    const reqRef = ref(db, `requests/${requestId}`);
    const updateData = { 
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    
    if (responseMessage.trim()) {
      updateData.mentorResponse = responseMessage;
    }
    
    await update(reqRef, updateData);
    
    setSuccess(`✅ Request ${newStatus === 'accepted' ? 'accepted' : 'rejected'}`);
    setSelectedRequest(null);
    setResponseMessage("");
    setTimeout(() => setSuccess(""), 3000);
  };

  // ✅ Display status colors
  const statusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "accepted":
        return "✅";
      case "rejected":
        return "❌";
      case "completed":
        return "🎉";
      default:
        return "❓";
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case "Career Chat":
        return "💬";
      case "Resume Review":
        return "📄";
      case "Mock Interview":
        return "🎤";
      case "Industry Insights":
        return "💡";
      case "Project Guidance":
        return "🚀";
      default:
        return "📋";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 Mentorship Requests</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 Mentorship Requests</h2>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No requests received yet</h3>
          <p className="text-gray-500">When students send you mentorship requests, they will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const student = allUsers[req.studentId];
            return (
              <div key={req.id} className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {student?.fullName || "Unknown Student"}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor(req.status)}`}
                      >
                        {statusIcon(req.status)} {req.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {student?.email || "Email not provided"}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{getRequestTypeIcon(req.type)} {req.type}</span>
                      <span>📅 {new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {req.message && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Student Message:</strong><br/>
                      {req.message}
                    </p>
                  </div>
                )}

                {req.mentorResponse && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Your Response:</strong><br/>
                      {req.mentorResponse}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Received on: {new Date(req.createdAt).toLocaleString()}
                  </div>

                  {/* ✅ Action buttons (only when pending) */}
                  {req.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        💬 Respond to Request
                      </button>
                    </div>
                  )}

                  {/* ✅ Chat Button (only when accepted) */}
                  {req.status === "accepted" && (
                    <div className="flex gap-2">
                      <Link
                        to={`/chat/${req.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        💬 Start Chat
                      </Link>
                      <Link
                        to={`/video-call/${req.id}`}
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        🎥 Video Call
                      </Link>
                    </div>
                  )}

                  {req.status === "completed" && (
                    <div className="flex gap-2">
                      <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        📊 View Rating
                      </button>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        📝 View Record
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Response dialog */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Respond to Student Request
            </h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Student:</strong> {allUsers[selectedRequest.studentId]?.fullName || "Unknown Student"}<br/>
                <strong>Request Type:</strong> {selectedRequest.type}<br/>
                {selectedRequest.message && (
                  <>
                    <strong>Student Message:</strong> {selectedRequest.message}
                  </>
                )}
              </p>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Your Response (Optional)
              </label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Give the student some advice or arrangements..."
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setResponseMessage("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedRequest.id, "rejected")}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                ❌ Reject
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedRequest.id, "accepted")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                ✅ Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Success message */}
      {success && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {success}
        </div>
      )}
    </div>
  );
}
