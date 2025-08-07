import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";

export default function StudentRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [requestsLoaded, setRequestsLoaded] = useState(false);

  // ✅ Load all users (mentors & students)
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      if (users) {
        setAllUsers(users);
      } else {
        console.warn("⚠️ No users found in DB.");
        setAllUsers({});
      }
      setUsersLoaded(true);
    });
  }, []);

  // ✅ Load current student's mentorship requests
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.warn("⚠️ User not logged in.");
        setRequestsLoaded(true);
        return;
      }

      const studentId = user.uid;
      console.log("✅ Logged in as studentId:", studentId);

      const requestsRef = ref(db, "requests");
      onValue(requestsRef, (snapshot) => {
        const data = snapshot.val() || {};
        console.log("📦 All requests from DB:", data);

        const studentRequests = Object.entries(data)
          .filter(([_, req]) => req.studentId === studentId)
          .map(([id, req]) => ({ id, ...req }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by time

        console.log("🎯 Filtered student requests:", studentRequests);
        setRequests(studentRequests);
        setRequestsLoaded(true);
      });
    });

    return () => unsubscribe();
  }, []);

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

  if (!usersLoaded || !requestsLoaded) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 My Mentorship Requests</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 My Mentorship Requests</h2>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No requests sent yet</h3>
          <p className="text-gray-500 mb-4">Start searching for mentors and send your first mentorship request!</p>
          <Link
            to="/mentor-connect"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔍 Search Mentors
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const mentor = allUsers[req.mentorId];

            return (
              <div key={req.id} className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {mentor?.fullName || "❗ Mentor not found"}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColor(req.status)}`}
                      >
                        {statusIcon(req.status)} {req.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {mentor?.position && mentor?.company 
                        ? `${mentor.position} @ ${mentor.company}`
                        : "Position information not provided"
                      }
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
                      <strong>Your Message:</strong><br/>
                      {req.message}
                    </p>
                  </div>
                )}

                {req.mentorResponse && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Mentor Response:</strong><br/>
                      {req.mentorResponse}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Sent on: {new Date(req.createdAt).toLocaleString()}
                  </div>

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
                        ⭐ Rate Mentor
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
    </div>
  );
}
