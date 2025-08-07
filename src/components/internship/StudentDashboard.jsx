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

  if (!internship) return <div className="bg-gray-50 p-4 rounded-lg animate-pulse">Loading application details...</div>;

  const statusStyles = {
    pending: 'bg-yellow-200 text-yellow-800',
    approved: 'bg-green-200 text-green-800',
    rejected: 'bg-red-200 text-red-800',
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-bold text-lg">{internship.title}</h4>
          <p className={`text-sm font-semibold capitalize px-2 py-0.5 rounded-full inline-block ${statusStyles[application.status]}`}>
            {application.status}
          </p>
        </div>
        {application.status === 'approved' && (
          <button 
            onClick={() => setShowTasks(!showTasks)}
            className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
          >
            {showTasks ? 'Hide Project' : 'View Project'}
          </button>
        )}
      </div>
      {showTasks && application.status === 'approved' && (
        <div className="mt-4 border-t pt-4">
          <TaskBoard internshipId={application.internshipId} studentId={application.studentId} />
        </div>
      )}
    </div>
  );
};

export default function StudentDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const applicationsRef = ref(db, 'applications');
    const q = query(applicationsRef, orderByChild('studentId'), equalTo(currentUser.uid));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      const loadedApps = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setApplications(loadedApps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading your applications...</p>;

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-4">My Applications</h3>
      {applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map(app => <ApplicationStatusCard key={app.id} application={app} />)}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-5">You haven't applied to any internships yet.</p>
      )}
    </div>
  );
}
