import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import InternshipHub from "./pages/InternshipHub";
import MentorConnect from "./pages/MentorConnect";
import Challenges from "./pages/Challenges";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CareerCoach from "./pages/CareerCoach";
import GamifiedJourney from "./pages/GamifiedJourney";
import CareerInsights from "./pages/CareerInsights";
import CareerNavigator from "./pages/CareerNavigator";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import MockInterview from "./components/MockInterview";
import Profile from "./components/Profile";
import MentorSearchPage from "./components/MentorSearchPage";
import StudentRequestsPage from "./components/StudentRequestsPage";
import MentorRequestsPage from "./components/MentorRequestsPage";
import ChatPage from "./components/ChatPage";
import VideoCallPage from "./components/VideoCallPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ✅ 基础页面 */}
      <Route path="/" element={<Home />} />
      <Route path="/career" element={<CareerNavigator />} />
      <Route path="/internships" element={<InternshipHub />} />
      <Route path="/mentors" element={<MentorConnect />} />
      <Route path="/challenges" element={<Challenges />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/career-coach" element={<CareerCoach />} />
      <Route path="/gamified-journey" element={<GamifiedJourney />} />
      <Route path="/career-insights" element={<CareerInsights />} />
      <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
      <Route path="/mock-interview" element={<MockInterview/>} />  
      <Route path="/profile" element={<Profile/>} /> 
      <Route path="/mentor-search-page" element={<MentorSearchPage/>} /> 
      <Route path="/studentrequestspage" element={<StudentRequestsPage/>} /> 
      <Route path="/mentorrequestspage" element={<MentorRequestsPage/>} /> 
      <Route path="/chat/:requestId" element={<ChatPage />} />
      <Route path="/videocall/:requestId" element={<VideoCallPage />} />
      {/* ✅ 用户系统 */}
      <Route path="/login" element={<Login />} />

      {/* ❗ 404 页面（可选） */}
      <Route
        path="*"
        element={<div className="text-center mt-20 text-2xl font-bold">404 Page Not Found</div>}
      />
    </Routes>
  );
}
