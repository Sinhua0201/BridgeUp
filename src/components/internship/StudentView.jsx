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
        <h2 className="text-3xl font-bold text-gray-800 mb-2">学生中心</h2>
        <p className="text-gray-600">管理您的 Micro-Internship 项目和成就</p>
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
            📊 我的项目
          </button>
          <button
            onClick={() => setActiveTab('internships')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'internships'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🔍 寻找项目
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'portfolio'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🏆 我的作品集
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
            <h3 className="text-xl font-bold text-gray-800 mb-2">🎯 找到适合您的 Micro-Internship</h3>
            <p className="text-gray-600 mb-4">
              选择您感兴趣的项目类型，获得真实行业经验，建立您的专业作品集
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="font-medium">市场企划</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🧹</div>
                <div className="font-medium">数据整理</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🎨</div>
                <div className="font-medium">内容设计</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🔍</div>
                <div className="font-medium">应用测试</div>
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
