import { useNavigate } from "react-router-dom";

export default function CareerCoach() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">AI Career Coach</h1>
      <p className="text-gray-700 text-center max-w-xl mb-8">
        Upload your resume, practice interviews, and get AI-powered feedback to improve your career confidence.
      </p>

      {/* 按钮区 */}
      <div className="flex gap-6">
        <button
          onClick={() => navigate("/resume-analyzer")}
          className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl shadow-md hover:bg-orange-600 transition"
        >
          AI Resume Analyzer
        </button>

        <button
          onClick={() => navigate("/mock-interview")}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl shadow-md hover:bg-blue-600 transition"
        >
          Mock Interview Simulator
        </button>
      </div>
    </div>
  );
}
