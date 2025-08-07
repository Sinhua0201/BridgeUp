import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import CreateInternship from './CreateInternship';
import ApplicationManagement from './ApplicationManagement';

export default function CompanyView() {
  const [isCreating, setIsCreating] = useState(false);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Internship Postings</h2>
        <button 
          onClick={() => setIsCreating(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          + Post New Internship
        </button>
      </div>

      {isCreating && <CreateInternship onClose={() => setIsCreating(false)} />}

      {loading ? (
        <p>Loading internships...</p>
      ) : internships.length > 0 ? (
        <div className="space-y-4 bg-white p-4 rounded-lg shadow">
          {internships.map(internship => (
            <div key={internship.id} className="p-4 border rounded-md">
              <h3 className="font-bold text-lg">{internship.title}</h3>
              <p className="text-gray-600">{internship.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-5">You have not posted any internships yet.</p>
      )}

      <ApplicationManagement />
    </div>
  );
}
