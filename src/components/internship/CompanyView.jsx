import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import CreateInternship from './CreateInternship';
import ApplicationManagement from './ApplicationManagement';
import TaskBoard from './TaskBoard';

export default function CompanyView() {
  const [isCreating, setIsCreating] = useState(false);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('internships');
  const [selectedInternship, setSelectedInternship] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const internshipsRef = ref(db, 'internships');
    const companyInternshipsQuery = query(internshipsRef, orderByChild('companyId'), equalTo(currentUser.uid));

    const unsubscribe = onValue(companyInternshipsQuery, (snapshot) => {
      const data = snapshot.val();
      const loadedInternships = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setInternships(loadedInternships);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskTypeIcon = (taskType) => {
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
    return icons[taskType] || '📋';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Company Management Center</h2>
          <p className="text-gray-600">Manage your Micro-Internship projects and applications</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)} 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">+</span>
          Post New Project
        </button>
      </div>

      {isCreating && <CreateInternship onClose={() => setIsCreating(false)} />}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('internships')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'internships'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Internship List
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Applications
          </button>
          <button
            onClick={() => setActiveTab('taskboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'taskboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Task Board
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          {activeTab === 'internships' && (
            <div className="space-y-4">
              {internships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {internships.map(internship => (
                    <div key={internship.id} className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getTaskTypeIcon(internship.taskType)}</span>
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{internship.title}</h3>
                            <p className="text-sm text-gray-500">{internship.titleEn}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(internship.status)}`}>
                          {internship.status === 'open' ? 'Open' : 
                           internship.status === 'closed' ? 'Closed' : 
                           internship.status === 'in-progress' ? 'In Progress' : internship.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{internship.description}</p>
                      
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex justify-between">
                          <span>⏱️ Duration:</span>
                          <span className="font-medium">{internship.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>📍 Location:</span>
                          <span className="font-medium">{internship.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>👥 Students:</span>
                          <span className="font-medium">{internship.applications || 0}/{internship.maxStudents}</span>
                        </div>
                        {internship.isPaid && (
                          <div className="flex justify-between">
                            <span>💰 Compensation:</span>
                            <span className="font-medium text-green-600">{internship.compensation}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            Posted on {new Date(internship.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedInternship(internship);
                              setActiveTab('taskboard');
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View Tasks →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No internships posted yet</h3>
                  <p className="text-gray-600 mb-4">Start by posting your first Micro-Internship project</p>
                  <button 
                    onClick={() => setIsCreating(true)} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Post Project
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <ApplicationManagement />
          )}

          {activeTab === 'taskboard' && (
            <div className="space-y-4">
              {selectedInternship ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Task Board - {selectedInternship.title}</h3>
                    <button
                      onClick={() => setSelectedInternship(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Back to Internship List
                    </button>
                  </div>
                  <TaskBoard 
                    internshipId={selectedInternship.id} 
                    companyView={true}
                  />
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an internship to view tasks</h3>
                  <p className="text-gray-600">Please choose a project from the internship list to see its task board</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
