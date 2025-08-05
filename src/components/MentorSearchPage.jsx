import { useEffect, useState } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { auth, db } from "../firebase";

export default function MentorSearchPage() {
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestType, setRequestType] = useState("Career Chat");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ 获取所有导师资料
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const mentorList = Object.entries(data || {})
        .filter(([_, user]) => user.role === "mentor")
        .map(([uid, user]) => ({ uid, ...user }));
      setMentors(mentorList);
    });
  }, []);

  // ✅ 搜索过滤
  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.company.toLowerCase().includes(search.toLowerCase()) ||
      mentor.position.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ 发送请求
  const sendRequest = async () => {
    const studentId = auth.currentUser?.uid;
    if (!studentId || !selectedMentor) return;

    const requestRef = push(ref(db, "requests"));
    await set(requestRef, {
      studentId,
      mentorId: selectedMentor.uid,
      type: requestType,
      message,
      status: "pending",
      createdAt: new Date().toISOString()
    });

    setSuccess("Request sent successfully!");
    setSelectedMentor(null);
    setMessage("");
    setRequestType("Career Chat");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Find a Mentor</h1>

      {/* ✅ 搜索框 */}
      <input
        type="text"
        placeholder="Search by company or position"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border px-4 py-2 rounded mb-6"
      />

      {/* ✅ 搜索结果 */}
      {filteredMentors.map((mentor) => (
        <div key={mentor.uid} className="border p-4 rounded mb-4 shadow">
          <h3 className="font-semibold text-lg">{mentor.fullName}</h3>
          <p className="text-sm text-gray-700">
            {mentor.position} @ {mentor.company}
          </p>
          <button
            onClick={() => setSelectedMentor(mentor)}
            className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Request Mentorship
          </button>
        </div>
      ))}

      {/* ✅ 请求对话框 */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Request Guidance from {selectedMentor.fullName}
            </h2>

            <label className="block mb-2 text-sm font-medium">Select Request Type</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            >
              <option>Career Chat</option>
              <option>Resume Review</option>
              <option>Mock Interview</option>
            </select>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Optional message..."
              className="w-full border px-3 py-2 rounded mb-4"
              rows={4}
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedMentor(null)}
                className="text-gray-500 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={sendRequest}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 成功信息 */}
      {success && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow">
          {success}
        </div>
      )}
    </div>
  );
}
