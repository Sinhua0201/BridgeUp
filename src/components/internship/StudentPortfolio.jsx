import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';

export default function StudentPortfolio() {
  const [completedProjects, setCompletedProjects] = useState([]);
  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Load completed projects
    const applicationsRef = ref(db, 'applications');
    const completedQuery = query(applicationsRef, orderByChild('studentId'), equalTo(currentUser.uid));

    const unsubscribe = onValue(completedQuery, (snapshot) => {
      const data = snapshot.val();
      const completed = data ? Object.values(data).filter(app => app.status === 'completed') : [];
      setCompletedProjects(completed);
      
      // Generate badges based on completed projects
      generateBadges(completed);
      
      // Generate certificates
      generateCertificates(completed);
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateBadges = (projects) => {
    const newBadges = [];
    
    if (projects.length >= 1) {
      newBadges.push({
        id: 'first-project',
        name: 'Rookie Intern',
        description: 'Completed the first Micro-Internship project',
        icon: '🌟',
        color: 'bg-yellow-100 text-yellow-800'
      });
    }
    
    if (projects.length >= 3) {
      newBadges.push({
        id: 'silver-badge',
        name: 'Silver Intern',
        description: 'Completed 3 Micro-Internship projects',
        icon: '🥈',
        color: 'bg-gray-100 text-gray-800'
      });
    }
    
    if (projects.length >= 5) {
      newBadges.push({
        id: 'gold-badge',
        name: 'Gold Intern',
        description: 'Completed 5 Micro-Internship projects',
        icon: '🥇',
        color: 'bg-yellow-100 text-yellow-800'
      });
    }
    
    // Skill-based badges
    const skillCounts = {};
    projects.forEach(project => {
      if (project.taskType) {
        skillCounts[project.taskType] = (skillCounts[project.taskType] || 0) + 1;
      }
    });
    
    Object.entries(skillCounts).forEach(([skill, count]) => {
      if (count >= 2) {
        newBadges.push({
          id: `skill-${skill}`,
          name: `${skill} Expert`,
          description: `Completed ${count} projects in ${skill}`,
          icon: getSkillIcon(skill),
          color: 'bg-blue-100 text-blue-800'
        });
      }
    });
    
    setBadges(newBadges);
  };

  const generateCertificates = (projects) => {
    const newCertificates = projects.map(project => ({
      id: project.id,
      projectTitle: project.title || 'Micro-Internship Project',
      companyName: project.companyName || 'Company',
      completionDate: project.completedAt || new Date().toISOString(),
      taskType: project.taskType || 'General',
      certificateUrl: `#certificate-${project.id}`
    }));
    
    setCertificates(newCertificates);
  };

  const getSkillIcon = (skill) => {
    const icons = {
      'Marketing Plan': '📊',
      'Data Cleaning': '🧹',
      'Content Design': '🎨',
      'App/Website Testing': '🔍',
      'Market Research': '📈',
      'Social Media Management': '📱',
      'Data Analysis': '📊',
      'UI/UX Design': '🎨',
      'Translation': '🌐',
      'Customer Support': '💬'
    };
    return icons[skill] || '📋';
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">My Portfolio</h3>
        <p className="text-gray-600">Showcase your Micro-Internship achievements and skills</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-600">{completedProjects.length}</div>
          <div className="text-sm text-blue-700">Completed Projects</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-600">{badges.length}</div>
          <div className="text-sm text-green-700">Badges Earned</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-600">{certificates.length}</div>
          <div className="text-sm text-purple-700">Certificates</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-orange-600">
            {completedProjects.length > 0 ? Math.floor(completedProjects.length * 20) : 0}
          </div>
          <div className="text-sm text-orange-700">Experience Points</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSection('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection('projects')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'projects'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveSection('badges')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'badges'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Badges
          </button>
          <button
            onClick={() => setActiveSection('certificates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'certificates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Certificates
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-bold mb-4">Skills Overview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(
                completedProjects.reduce((acc, project) => {
                  const skill = project.taskType || 'General';
                  acc[skill] = (acc[skill] || 0) + 1;
                  return acc;
                }, {})
              ).map(([skill, count]) => (
                <div key={skill} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">{getSkillIcon(skill)}</div>
                  <div className="font-medium text-sm">{skill}</div>
                  <div className="text-xs text-gray-500">{count} project(s)</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'projects' && (
        <div className="space-y-4">
          {completedProjects.length > 0 ? (
            completedProjects.map((project, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">{getSkillIcon(project.taskType)}</span>
                    <div>
                      <h4 className="font-bold text-lg">{project.title || 'Micro-Internship Project'}</h4>
                      <p className="text-gray-600">{project.companyName || 'Company'}</p>
                      <p className="text-sm text-gray-500">
                        Completed on {new Date(project.completedAt || project.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Completed
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed projects yet</h3>
              <p className="text-gray-600">Start your first Micro-Internship to build your portfolio</p>
            </div>
          )}
        </div>
      )}

      {activeSection === 'badges' && (
        <div className="space-y-4">
          {badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-4xl mb-4">{badge.icon}</div>
                  <h4 className="font-bold text-lg mb-2">{badge.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">{badge.description}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                    Earned
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No badges yet</h3>
              <p className="text-gray-600">Complete projects to unlock achievement badges</p>
            </div>
          )}
        </div>
      )}

      {activeSection === 'certificates' && (
        <div className="space-y-4">
          {certificates.length > 0 ? (
            certificates.map((cert) => (
              <div key={cert.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">📜</div>
                    <div>
                      <h4 className="font-bold text-lg">{cert.projectTitle}</h4>
                      <p className="text-gray-600">{cert.companyName}</p>
                      <p className="text-sm text-gray-500">
                        Completed on {new Date(cert.completionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Download Certificate
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">📜</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
              <p className="text-gray-600">Certificates will be automatically generated after project completion</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
