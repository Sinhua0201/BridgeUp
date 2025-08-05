import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, deleteUser } from "firebase/auth";
import { ref, get, update, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ✅ 讀取使用者資料
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const snapshot = await get(ref(db, "users/" + currentUser.uid));
          if (snapshot.exists()) {
            const data = snapshot.val();
            setFullName(data.fullName || "");
            setEmail(data.email || "");
            setRole(data.role || "student");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
        navigate("/"); // ✅ 沒有登入就導回首頁
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // ✅ 更新使用者資料
  const handleUpdate = async () => {
    if (!user) return;

    try {
      await update(ref(db, "users/" + user.uid), {
        fullName,
        role,
      });
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("❌ Failed to update profile.");
    }
  };

  // ✅ 刪除使用者帳號（刪除 DB + Auth）
  const handleDelete = async () => {
    if (!user) return;

    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete your account? This action cannot be undone."
    );

    if (confirmDelete) {
      try {
        // 刪除 Realtime Database 資料
        await remove(ref(db, "users/" + user.uid));

        // 刪除 Firebase Auth 帳號
        await deleteUser(user);

        alert("✅ Account deleted successfully!");
        navigate("/");
      } catch (err) {
        console.error("Error deleting account:", err);
        alert("❌ Failed to delete account.");
      }
    }
  };

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-24 bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-4 text-purple-700">My Profile</h2>

      <div className="space-y-4">
        {/* ✅ Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mt-1"
          />
        </div>

        {/* ✅ Email (只能看，不能改) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full border rounded-md px-3 py-2 mt-1 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* ✅ Role (Student / Mentor) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mt-1"
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
          </select>
        </div>

        {/* ✅ Save Button */}
        <button
          onClick={handleUpdate}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Save Changes
        </button>

        {/* ✅ Delete Account */}
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
        >
          Delete Account
        </button>

        {message && <p className="text-center mt-2">{message}</p>}
      </div>
    </div>
  );
}
