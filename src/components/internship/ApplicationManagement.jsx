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

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">{studentData ? studentData.fullName : 'Loading...'}</p>
          <p className="text-sm text-gray-500">Applied for: <span className="font-medium">{internshipTitle}</span></p>
        </div>
        <div className="flex items-center space-x-3">
          {application.status === 'pending' ? (
            <>
              <button onClick={() => handleUpdateStatus('approved')} className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600">Approve</button>
              <button onClick={() => handleUpdateStatus('rejected')} className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600">Reject</button>
            </>
          ) : (
            <p className={`font-semibold text-sm capitalize px-3 py-1 rounded-full ${application.status === 'approved' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
              {application.status}
            </p>
          )}
          {application.status === 'approved' && (
            <button onClick={() => setShowProject(!showProject)} className="px-3 py-1 bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-600">
              {showProject ? 'Hide Project' : 'Manage Project'}
            </button>
          )}
        </div>
      </div>
      {showProject && (
        <div className="mt-4 border-t pt-4">
          <TaskBoard internshipId={application.internshipId} studentId={application.studentId} />
          <AddTaskForm internshipId={application.internshipId} studentId={application.studentId} />
        </div>
      )}
    </div>
  );
};

export default function ApplicationManagement() {
  const [applicationsByInternship, setApplicationsByInternship] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const applicationsRef = ref(db, 'applications');
    const companyApplicationsQuery = query(applicationsRef, orderByChild('companyId'), equalTo(currentUser.uid));

    const unsubscribe = onValue(companyApplicationsQuery, (snapshot) => {
      const applicationsData = snapshot.val();
      if (!applicationsData) {
        setApplicationsByInternship({});
        setLoading(false);
        return;
      }

      const loadedApplications = Object.keys(applicationsData).map(key => ({ id: key, ...applicationsData[key] }));

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
    return <p className="text-center py-5">Loading applications...</p>;
  }

  return (
    <div className="mt-10">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Internship Applications</h3>
      {Object.keys(applicationsByInternship).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(applicationsByInternship).map(([internshipTitle, applications]) => (
            <div key={internshipTitle}>
              <h4 className="font-bold text-lg text-indigo-700 mb-2">{internshipTitle}</h4>
              <div className="space-y-3">
                {applications.map(app => (
                  <ApplicationItem key={app.id} application={app} internshipTitle={internshipTitle} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10 bg-gray-50 rounded-md">You have not received any applications yet.</p>
      )}
    </div>
  );
}
