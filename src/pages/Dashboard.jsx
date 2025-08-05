import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { 
  TrendingUp, Users, Building2, GraduationCap, 
  Download, Filter, Calendar, MapPin, Star,
  Briefcase, Award, Target, Globe, FileText,
  BarChart3, Activity
} from "lucide-react";

export default function Dashboard() {
  const [userRole, setUserRole] = useState("government"); // student, company, university, government
  const [timeRange, setTimeRange] = useState("6months");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - 在实际应用中这些会来自API
  const studentTrends = [
    { industry: "Technology", students: 2847, growth: 15.3 },
    { industry: "Finance", students: 1932, growth: 8.7 },
    { industry: "Healthcare", students: 1654, growth: 12.1 },
    { industry: "E-commerce", students: 1423, growth: 22.5 },
    { industry: "Gaming", students: 987, growth: 18.9 },
    { industry: "Green Energy", students: 756, growth: 35.2 },
    { industry: "AI/ML", students: 612, growth: 45.8 },
    { industry: "Cybersecurity", students: 498, growth: 28.4 }
  ];

  const skillDemand = [
    { skill: "Python", demand: 85, growth: 12 },
    { skill: "SQL", demand: 78, growth: 8 },
    { skill: "Figma", demand: 72, growth: 25 },
    { skill: "React", demand: 69, growth: 18 },
    { skill: "Data Analysis", demand: 66, growth: 15 },
    { skill: "ESG Knowledge", demand: 45, growth: 67 },
    { skill: "Blockchain", demand: 38, growth: 55 },
    { skill: "Cloud Computing", demand: 34, growth: 42 }
  ];

  const universityPerformance = [
    { university: "Universiti Malaya", students: 1250, completion: 87, rating: 4.6 },
    { university: "Universiti Teknologi Malaysia", students: 1100, completion: 85, rating: 4.5 },
    { university: "Universiti Kebangsaan Malaysia", students: 950, completion: 82, rating: 4.4 },
    { university: "Universiti Sains Malaysia", students: 890, completion: 89, rating: 4.7 },
    { university: "Universiti Putra Malaysia", students: 780, completion: 84, rating: 4.3 }
  ];

  const monthlyTrends = [
    { month: "Jan", applications: 1200, completions: 980, satisfaction: 4.2 },
    { month: "Feb", applications: 1350, completions: 1150, satisfaction: 4.3 },
    { month: "Mar", applications: 1500, completions: 1280, satisfaction: 4.4 },
    { month: "Apr", applications: 1650, completions: 1420, satisfaction: 4.5 },
    { month: "May", applications: 1800, completions: 1580, satisfaction: 4.6 },
    { month: "Jun", applications: 1950, completions: 1720, satisfaction: 4.7 }
  ];

  const talentPool = [
    { name: "Sarah Ahmad", university: "UM", skills: ["Python", "AI"], rating: 4.9, projects: 12 },
    { name: "Li Wei Chen", university: "UTM", skills: ["React", "UI/UX"], rating: 4.8, projects: 8 },
    { name: "Rajesh Kumar", university: "UKM", skills: ["Data Science", "SQL"], rating: 4.7, projects: 15 },
    { name: "Nurul Aina", university: "USM", skills: ["Cybersecurity", "Cloud"], rating: 4.8, projects: 10 }
  ];

  const myDigitalMetrics = {
    totalParticipants: 15420,
    skillsCertified: 8765,
    industryPlacements: 3421,
    governmentTarget: 20000,
    completion: 77.1
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const exportReport = () => {
    // Mock PDF export functionality
    alert(`Exporting ${userRole} report for ${timeRange}...`);
  };

  const RoleSelector = () => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Select Your Role</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { role: "government", label: "Government / MDEC", icon: Building2 },
          { role: "university", label: "University", icon: GraduationCap },
          { role: "company", label: "Company", icon: Briefcase },
          { role: "student", label: "Student", icon: Users }
        ].map(({ role, label, icon: Icon }) => (
          <button
            key={role}
            onClick={() => setUserRole(role)}
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all ${
              userRole === role 
                ? 'bg-blue-50 border-blue-500 text-blue-700' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon size={16} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const OverviewMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">15,420</p>
            <p className="text-sm text-green-600">+12.3% vs last period</p>
          </div>
          <Users className="text-blue-500" size={24} />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Active Companies</p>
            <p className="text-2xl font-bold text-gray-900">1,247</p>
            <p className="text-sm text-green-600">+8.7% vs last period</p>
          </div>
          <Building2 className="text-green-500" size={24} />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Micro-Internships</p>
            <p className="text-2xl font-bold text-gray-900">8,932</p>
            <p className="text-sm text-green-600">+23.1% vs last period</p>
          </div>
          <Award className="text-purple-500" size={24} />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold text-gray-900">84.2%</p>
            <p className="text-sm text-green-600">+5.4% vs last period</p>
          </div>
          <Target className="text-orange-500" size={24} />
        </div>
      </div>
    </div>
  );

  const StudentTrendsChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Student Industry Preferences</h3>
        <TrendingUp className="text-green-500" size={20} />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={studentTrends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="industry" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              name === 'students' ? `${value} students` : `${value}% growth`,
              name === 'students' ? 'Student Count' : 'Growth Rate'
            ]}
          />
          <Bar dataKey="students" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const SkillDemandChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Skills in Demand</h3>
        <Activity className="text-blue-500" size={20} />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={skillDemand}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <PolarRadiusAxis domain={[0, 100]} />
          <Radar name="Demand" dataKey="demand" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );

  const UniversityPerformanceTable = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">University Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">University</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Active Students</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Completion Rate</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {universityPerformance.map((uni, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{uni.university}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-600">{uni.students.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {uni.completion}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="text-yellow-400 fill-current" size={14} />
                    <span className="text-sm font-medium text-gray-900">{uni.rating}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TalentPoolSection = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Talent Pool</h3>
        <Award className="text-purple-500" size={20} />
      </div>
      <div className="space-y-4">
        {talentPool.map((talent, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {talent.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-gray-900">{talent.name}</p>
                <p className="text-sm text-gray-600">{talent.university}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">
                <Star className="text-yellow-400 fill-current" size={14} />
                <span className="text-sm font-medium">{talent.rating}</span>
              </div>
              <p className="text-xs text-gray-600">{talent.projects} projects</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MyDigitalIntegration = () => (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">MyDigital Integration</h3>
        <Globe size={24} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{myDigitalMetrics.totalParticipants.toLocaleString()}</p>
          <p className="text-sm opacity-90">Total Participants</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{myDigitalMetrics.skillsCertified.toLocaleString()}</p>
          <p className="text-sm opacity-90">Skills Certified</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{myDigitalMetrics.industryPlacements.toLocaleString()}</p>
          <p className="text-sm opacity-90">Industry Placements</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{myDigitalMetrics.completion}%</p>
          <p className="text-sm opacity-90">Target Achievement</p>
        </div>
      </div>
    </div>
  );

  const MonthlyTrendsChart = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={monthlyTrends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="applications" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
          <Area type="monotone" dataKey="completions" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Career Insights Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive analytics for career development ecosystem</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
              <button 
                onClick={exportReport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Role Selector */}
        <RoleSelector />

        {/* Main Content based on role */}
        {userRole === "government" && (
          <div className="space-y-6">
            <OverviewMetrics />
            <MyDigitalIntegration />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StudentTrendsChart />
              <SkillDemandChart />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyTrendsChart />
              <UniversityPerformanceTable />
            </div>
          </div>
        )}

        {userRole === "university" && (
          <div className="space-y-6">
            <OverviewMetrics />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StudentTrendsChart />
              <SkillDemandChart />
            </div>
            <TalentPoolSection />
            <MonthlyTrendsChart />
          </div>
        )}

        {userRole === "company" && (
          <div className="space-y-6">
            <OverviewMetrics />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TalentPoolSection />
              <UniversityPerformanceTable />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkillDemandChart />
              <MonthlyTrendsChart />
            </div>
          </div>
        )}

        {userRole === "student" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Career Insights</h2>
              <p className="text-gray-600">Discover trending industries, in-demand skills, and career opportunities based on market data.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StudentTrendsChart />
              <SkillDemandChart />
            </div>
            <MonthlyTrendsChart />
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <div className="text-center text-sm text-gray-600">
            <p>Powered by MyDigital Initiative | TalentCorp Malaysia | Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}