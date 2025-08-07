import { useEffect, useState } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { auth, db } from "../../firebase";

export default function MentorSearchPage() {
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestType, setRequestType] = useState("Career Chat");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [filterExpertise, setFilterExpertise] = useState("");
  const [filterCompany, setFilterCompany] = useState("");

  // ✅ Get all mentor profiles
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

  // ✅ Search and filter
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = 
      mentor.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      mentor.position?.toLowerCase().includes(search.toLowerCase()) ||
      mentor.company?.toLowerCase().includes(search.toLowerCase());
    
    const matchesExpertise = !filterExpertise || 
      mentor.expertise?.toLowerCase().includes(filterExpertise.toLowerCase());
    
    const matchesCompany = !filterCompany || 
      mentor.company?.toLowerCase().includes(filterCompany.toLowerCase());
    
    return matchesSearch && matchesExpertise && matchesCompany;
  });

  // ✅ Send request
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

    setSuccess("✅ Request sent successfully!");
    setSelectedMentor(null);
    setMessage("");
    setRequestType("Career Chat");
    setTimeout(() => setSuccess(""), 3000);
  };

  // ✅ Get company list for filtering
  const companies = [...new Set(mentors.map(m => m.company).filter(Boolean))];
  const expertiseAreas = [...new Set(mentors.map(m => m.expertise).filter(Boolean))];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">🔍 Search Mentors</h2>
        
        {/* ✅ Search and filter area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by mentor name, position, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={filterExpertise}
            onChange={(e) => setFilterExpertise(e.target.value)}
            className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Expertise Areas</option>
            {expertiseAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Companies</option>
            {companies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Found {filteredMentors.length} mentors
        </p>
      </div>

      {/* ✅ Mentor list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <div key={mentor.uid} className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{mentor.fullName}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  {mentor.position} @ {mentor.company}
                </p>
                {mentor.expertise && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {mentor.expertise}
                  </span>
                )}
              </div>
            </div>

            {mentor.bio && (
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {mentor.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {mentor.skills && mentor.skills.split(',').map((skill, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {skill.trim()}
                </span>
              ))}
            </div>

            <button
              onClick={() => setSelectedMentor(mentor)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📩 Request Mentorship
            </button>
          </div>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No mentors found</p>
          <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria</p>
        </div>
      )}

      {/* ✅ Request dialog */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Request Mentorship from {selectedMentor.fullName}
            </h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Mentor Info:</strong><br/>
                {selectedMentor.position} @ {selectedMentor.company}
                {selectedMentor.expertise && <><br/><strong>Expertise:</strong> {selectedMentor.expertise}</>}
              </p>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Select Mentorship Type
              </label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Career Chat">💬 Career Chat</option>
                <option value="Resume Review">📄 Resume Review</option>
                <option value="Mock Interview">🎤 Mock Interview</option>
                <option value="Industry Insights">💡 Industry Insights</option>
                <option value="Project Guidance">🚀 Project Guidance</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Additional Details (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your specific needs or questions..."
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedMentor(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendRequest}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Request
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
