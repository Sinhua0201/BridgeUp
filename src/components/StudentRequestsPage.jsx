import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
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
      setUsersLoaded(true); // ✅ 确保设置
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
          .map(([id, req]) => ({ id, ...req }));

        console.log("🎯 Filtered student requests:", studentRequests);
        setRequests(studentRequests);
        setRequestsLoaded(true);
      });
    });

    return () => unsubscribe();
  }, []);

  // ✅ Debug log
  useEffect(() => {
    console.log("📊 usersLoaded:", usersLoaded);
    console.log("📊 requestsLoaded:", requestsLoaded);
  }, [usersLoaded, requestsLoaded]);

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

  if (!usersLoaded || !requestsLoaded) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">My Mentorship Requests</h1>
        <p>Loading your requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">My Mentorship Requests</h1>

      {requests.length === 0 ? (
        <p className="text-gray-600">You haven’t made any requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const mentor = allUsers[req.mentorId];

            return (
              <div key={req.id} className="border p-4 rounded shadow">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {mentor?.fullName || "❗ Mentor not found"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {(mentor?.position || "") + " @ " + (mentor?.company || "")}
                    </p>
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
      )}
    </div>
  );
}
