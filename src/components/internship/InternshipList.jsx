import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { ref, onValue, query, orderByChild, equalTo, set, push } from 'firebase/database';

const useCompanyData = (companyId) => {
  const [companyName, setCompanyName] = useState('Loading...');
  useEffect(() => {
    if (!companyId) return;
    const userRef = ref(db, `users/${companyId}`);
    onValue(userRef, (snapshot) => {
      setCompanyName(snapshot.val()?.fullName || 'Unknown Company');
    }, { onlyOnce: true });
  }, [companyId]);
  return companyName;
};

const InternshipCard = ({ internship, onApply, hasApplied }) => {
  const companyName = useCompanyData(internship.companyId);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <h3 className="text-xl font-bold text-blue-700">{internship.title}</h3>
      <p className="text-sm text-gray-500 mb-2">Posted by: {companyName}</p>
      <p className="text-gray-700 mb-1">{internship.description}</p>
      <p className="text-sm text-gray-600"><span className="font-semibold">Duration:</span> {internship.duration}</p>
      <p className="text-sm text-gray-600"><span className="font-semibold">Task Type:</span> {internship.taskType}</p>
      <div className="text-right mt-4">
        <button 
          onClick={() => onApply(internship.id, internship.companyId)}
          disabled={hasApplied}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {hasApplied ? 'Applied' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
};

export default function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const internshipsRef = ref(db, 'internships');
    const openInternshipsQuery = query(internshipsRef, orderByChild('status'), equalTo('open'));

    const unsubscribeInternships = onValue(openInternshipsQuery, (snapshot) => {
      const data = snapshot.val();
      setInternships(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
      setLoading(false);
    });

    if (currentUser) {
      const applicationsRef = ref(db, 'applications');
      const studentApplicationsQuery = query(applicationsRef, orderByChild('studentId'), equalTo(currentUser.uid));
      const unsubscribeApplications = onValue(studentApplicationsQuery, (snapshot) => {
        const data = snapshot.val();
        const ids = new Set(data ? Object.values(data).map(app => app.internshipId) : []);
        setAppliedIds(ids);
      });
      return () => {
        unsubscribeInternships();
        unsubscribeApplications();
      };
    }

    return () => unsubscribeInternships();
  }, [currentUser]);

  const handleApply = (internshipId, companyId) => {
    if (!currentUser) {
      alert('Please log in to apply.');
      return;
    }
    const applicationsRef = ref(db, 'applications');
    const newApplicationRef = push(applicationsRef);
    set(newApplicationRef, {
      studentId: currentUser.uid,
      internshipId,
      companyId,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      studentInternshipId: `${currentUser.uid}_${internshipId}`
    });
  };

  if (loading) return <p>Loading available internships...</p>;

  return (
    <div className="space-y-4">
      {internships.length > 0 ? (
        internships.map(internship => (
          <InternshipCard 
            key={internship.id} 
            internship={internship} 
            onApply={handleApply} 
            hasApplied={appliedIds.has(internship.id)}
          />
        ))
      ) : (
        <p className="text-center text-gray-500 py-5">No open internships at the moment. Please check back later.</p>
      )}
    </div>
  );
}
