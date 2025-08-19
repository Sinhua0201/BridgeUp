import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { ref, query, orderByChild, equalTo, onValue, update } from 'firebase/database';
import TaskBoard from './TaskBoard';
import AddTaskForm from './AddTaskForm';

// Reusable hook to get user data
const useUserData = (userId) => {
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    if (!userId) return;
    const userRef = ref(db, `users/${userId}`);
    const unsubscribe = onValue(userRef, (snapshot) => setUserData(snapshot.val()));
    return () => unsubscribe();
  }, [userId]);
  return userData;
};

const ApplicationItem = ({ application, internshipTitle }) => {
  const studentData = useUserData(application.studentId);
  const [showProject, setShowProject] = useState(false);

  const handleUpdateStatus = (status) => {
    const applicationRef = ref(db, `applications/${application.id}`);
    update(applicationRef, { status })
      .catch(err => console.error("Failed to update status: ", err));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      default: return status;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-xl">👤</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">
              {studentData ? studentData.fullName : 'Loading...'}
            </p>
            <p className="text-sm text-gray-500">
              Applied for: <span className="font-medium text-blue-600">{internshipTitle}</span>
            </p>
            <p className="text-xs text-gray-400">
              Applied on: {new Date(application.appliedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`font-semibold text-sm px-3 py-1 rounded-full ${getStatusColor(application.status)}`}>
            {getStatusText(application.status)}
          </span>
          {application.status === 'pending' && (
            <div className="flex space-x-2">
              <button 
                onClick={() => handleUpdateStatus('approved')} 
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
              <button 
                onClick={() => handleUpdateStatus('rejected')} 
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            </div>
          )}
          {(application.status === 'approved' || application.status === 'in_progress') && (
            <button 
              onClick={() => setShowProject(!showProject)} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
            >
              {showProject ? 'Hide Project' : 'Manage Project'}
            </button>
          )}
        </div>
      </div>

      {showProject && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="mb-4">
            <h5 className="text-lg font-semibold text-gray-800 mb-2">Project Task Management</h5>
            <p className="text-sm text-gray-600">Assign and manage tasks for the student</p>
          </div>
          <TaskBoard 
            internshipId={application.internshipId} 
            studentId={application.studentId}
            companyView={true}
          />
        </div>
      )}

      {application.status === 'completed' && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🏆</span>
              <span className="text-sm text-green-700">Project Completed!</span>
            </div>
            <div className="flex space-x-2">
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                Generate Certificate
              </button>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                Write Recommendation Letter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ApplicationManagement() {
  const [applicationsByInternship, setApplicationsByInternship] = useState({});
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
    const companyApplicationsQuery = query(applicationsRef, orderByChild('companyId'), equalTo(currentUser.uid));

    const unsubscribe = onValue(companyApplicationsQuery, (snapshot) => {
      const applicationsData = snapshot.val();
      if (!applicationsData) {
        setApplicationsByInternship({});
        setStats({ total: 0, pending: 0, approved: 0, completed: 0, rejected: 0 });
        setLoading(false);
        return;
      }

      const loadedApplications = Object.keys(applicationsData).map(key => ({ id: key, ...applicationsData[key] }));

      // Calculate stats
      const newStats = {
        total: loadedApplications.length,
        pending: loadedApplications.filter(app => app.status === 'pending').length,
        approved: loadedApplications.filter(app => app.status === 'approved').length,
        completed: loadedApplications.filter(app => app.status === 'completed').length,
        rejected: loadedApplications.filter(app => app.status === 'rejected').length
      };
      setStats(newStats);

      const fetchTitlesAndGroup = async () => {
        const grouped = {};
        for (const app of loadedApplications) {
          const internshipRef = ref(db, `internships/${app.internshipId}`);
          const internshipSnap = await new Promise(resolve => onValue(internshipRef, resolve, { onlyOnce: true }));
          const internshipTitle = internshipSnap.val()?.title || 'Unknown Internship';
          if (!grouped[internshipTitle]) {
            grouped[internshipTitle] = [];
          }
          grouped[internshipTitle].push(app);
        }
        setApplicationsByInternship(grouped);
        setLoading(false);
      };

      fetchTitlesAndGroup();
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Application Management</h3>
        <p className="text-gray-600">Manage student applications and project progress</p>
      </div>

      {/* Stats */}
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
      {Object.keys(applicationsByInternship).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(applicationsByInternship).map(([internshipTitle, applications]) => (
            <div key={internshipTitle} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg text-indigo-700">{internshipTitle}</h4>
                <span className="text-sm text-gray-500">
                  {applications.length} Application(s)
                </span>
              </div>
              <div className="space-y-4">
                {applications.map(app => (
                  <ApplicationItem key={app.id} application={app} internshipTitle={internshipTitle} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600 mb-4">Post more Micro-Internship projects to attract students</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Post New Project
          </button>
        </div>
      )}
    </div>
  );
}
