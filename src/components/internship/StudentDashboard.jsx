import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import TaskBoard from './TaskBoard';

const useInternshipData = (internshipId) => {
  const [internship, setInternship] = useState(null);
  useEffect(() => {
    if (!internshipId) return;
    const internshipRef = ref(db, `internships/${internshipId}`);
    const unsubscribe = onValue(internshipRef, (snapshot) => setInternship(snapshot.val()));
    return () => unsubscribe();
  }, [internshipId]);
  return internship;
};

const ApplicationStatusCard = ({ application }) => {
  const internship = useInternshipData(application.internshipId);
  const [showTasks, setShowTasks] = useState(false);

  if (!internship) return (
    <div className="bg-gray-50 p-6 rounded-lg animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800'
  };

  const statusText = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    in_progress: 'In Progress'
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
    <div className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <span className="text-3xl mr-4">{getTaskTypeIcon(internship.taskType)}</span>
          <div>
            <h4 className="font-bold text-lg text-gray-800">{internship.title}</h4>
            <p className="text-sm text-gray-600 mb-1">{internship.titleEn}</p>
            <p className={`text-sm font-semibold px-3 py-1 rounded-full inline-block ${statusStyles[application.status]}`}>
              {statusText[application.status]}
            </p>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>Applied on</div>
          <div>{new Date(application.appliedAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div className="flex items-center">
          <span className="mr-2">⏱️</span>
          <span className="font-medium">{internship.duration}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">📍</span>
          <span className="font-medium">{internship.location}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">📋</span>
          <span className="font-medium">{internship.taskType}</span>
        </div>
        {internship.isPaid && (
          <div className="flex items-center">
            <span className="mr-2">💰</span>
            <span className="font-medium text-green-600">{internship.compensation}</span>
          </div>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4">{internship.description}</p>

      {(application.status === 'approved' || application.status === 'in_progress') && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Project Progress</span>
            <button 
              onClick={() => setShowTasks(!showTasks)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
            >
              {showTasks ? 'Hide Tasks' : 'View Tasks'}
            </button>
          </div>
          {showTasks && (
            <div className="mt-4">
              <TaskBoard 
                internshipId={application.internshipId} 
                studentId={application.studentId} 
              />
            </div>
          )}
        </div>
      )}

      {application.status === 'completed' && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🏆</span>
              <span className="text-sm text-gray-600">Project Completed!</span>
            </div>
            <div className="flex space-x-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                Download Certificate
              </button>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                View Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function StudentDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    rejected: 0
  });

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const applicationsRef = ref(db, 'applications');
    const q = query(applicationsRef, orderByChild('studentId'), equalTo(currentUser.uid));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      const loadedApps = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setApplications(loadedApps);
      
      // Calculate stats
      const newStats = {
        total: loadedApps.length,
        pending: loadedApps.filter(app => app.status === 'pending').length,
        approved: loadedApps.filter(app => app.status === 'approved').length,
        completed: loadedApps.filter(app => app.status === 'completed').length,
        rejected: loadedApps.filter(app => app.status === 'rejected').length
      };
      setStats(newStats);
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-700">Total Applications</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-yellow-700">Pending</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-green-700">Approved</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
          <div className="text-sm text-purple-700">Completed</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-red-700">Rejected</div>
        </div>
      </div>

      {/* Applications */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">My Applications</h3>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map(app => (
              <ApplicationStatusCard key={app.id} application={app} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-4">Start applying to your first Micro-Internship project</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Browse Projects
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
