import React, { useState } from 'react';
import InternshipList from './InternshipList';
import StudentDashboard from './StudentDashboard';
import StudentPortfolio from './StudentPortfolio';

export default function StudentView() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Student Center</h2>
        <p className="text-gray-600">Manage your Micro-Internship projects and achievements</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 justify-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 My Projects
          </button>
          <button
            onClick={() => setActiveTab('internships')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'internships'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🔍 Find Projects
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'portfolio'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🏆 My Portfolio
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <StudentDashboard />
        </div>
      )}

      {activeTab === 'internships' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-2">🎯 Find the Right Micro-Internship for You</h3>
            <p className="text-gray-600 mb-4">
              Choose projects that match your interests, gain real-world industry experience, and build your professional portfolio.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="font-medium">Marketing Plan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🧹</div>
                <div className="font-medium">Data Cleaning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🎨</div>
                <div className="font-medium">Content Design</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🔍</div>
                <div className="font-medium">App/Website Testing</div>
              </div>
            </div>
          </div>
          <InternshipList />
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <StudentPortfolio />
        </div>
      )}
    </div>
  );
}
