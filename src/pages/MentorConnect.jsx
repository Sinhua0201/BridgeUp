import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import MentorSearchPage from "../components/mentorconnect/MentorSearchPage";
import StudentRequestsPage from "../components/mentorconnect/StudentRequestsPage";
import MentorRequestsPage from "../components/mentorconnect/MentorRequestsPage";

export default function MentorConnect() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("search"); // "search" or "requests"

  // ✅ Get current user info and role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // ✅ Get user role from database
      const userRef = ref(db, `users/${currentUser.uid}`);
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          setUserRole(userData.role);
        }
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Mentor Connect</h1>
        <p className="text-gray-700 text-center mb-4">
          Please log in to access the mentor matching system
        </p>
        <p className="text-sm text-gray-500 text-center">
          Connect with industry mentors for valuable career advice
        </p>
      </div>
    );
  }

  // ✅ Student interface
  if (userRole === "student") {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Mentor Connect</h1>
          <p className="text-gray-700">
            Connect with industry mentors for valuable career advice
          </p>
        </div>

        {/* ✅ Student navigation tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("search")}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === "search"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              🔍 Search Mentors
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === "requests"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              📋 My Requests
            </button>
          </div>
        </div>

        {/* ✅ Content area */}
        {activeTab === "search" ? (
          <MentorSearchPage />
        ) : (
          <StudentRequestsPage />
        )}
      </div>
    );
  }

  // ✅ Mentor interface
  if (userRole === "mentor") {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Mentor Connect</h1>
          <p className="text-gray-700">
            Manage mentorship requests from students
          </p>
        </div>

        <MentorRequestsPage />
      </div>
    );
  }

  // ✅ Unknown role
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Mentor Connect</h1>
      <p className="text-gray-700 text-center mb-4">
        Unable to determine user role. Please contact administrator.
      </p>
    </div>
  );
}
