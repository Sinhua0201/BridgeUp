import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, update } from "firebase/database";

export default function MentorRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // ✅ 获取所有用户（用来显示 student 的资料）
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const users = snapshot.val() || {};
      setAllUsers(users);
    });
  }, []);

  // ✅ 获取当前 mentor 的请求
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
          .map(([id, req]) => ({ id, ...req }));
        setRequests(mentorRequests);
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, []);

  // ✅ 更新请求状态（接受 / 拒绝）
  const handleUpdateStatus = async (requestId, newStatus) => {
    const reqRef = ref(db, `requests/${requestId}`);
    await update(reqRef, { status: newStatus });
  };

  // ✅ 显示状态颜色
  const statusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">Mentorship Requests</h1>
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Mentorship Requests</h1>

      {requests.length === 0 && (
        <p className="text-gray-600">No requests yet.</p>
      )}

      <div className="space-y-4">
        {requests.map((req) => {
          const student = allUsers[req.studentId];
          return (
            <div key={req.id} className="border p-4 rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {student?.fullName || "Unknown Student"}
                  </h3>
                  <p className="text-sm text-gray-600">{student?.email}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${statusColor(req.status)}`}
                >
                  {req.status}
                </span>
              </div>

              <p className="text-sm mb-1">
                <strong>Request Type:</strong> {req.type}
              </p>

              {req.message && (
                <p className="text-sm text-gray-700">
                  <strong>Message:</strong> {req.message}
                </p>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Sent on {new Date(req.createdAt).toLocaleString()}
              </p>

              {/* ✅ Action buttons (only when pending) */}
              {req.status === "pending" && (
                <div className="mt-3 flex space-x-3">
                  <button
                    onClick={() => handleUpdateStatus(req.id, "accepted")}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(req.id, "rejected")}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    ❌ Reject
                  </button>
                </div>
              )}

              {/* ✅ Chat Button (only when accepted) */}
              {req.status === "accepted" && (
                <div className="mt-3">
                  <Link
                    to={`/chat/${req.id}`}
                    className="inline-block text-blue-600 hover:underline text-sm"
                  >
                    💬 Open Chat
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
