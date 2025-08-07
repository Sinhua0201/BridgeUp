import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import CompanyView from '../components/internship/CompanyView';
import StudentView from '../components/internship/StudentView';

export default function InternshipHub() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        const userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data && data.role) {
            setUserRole(data.role);
          }
          setLoading(false);
        });
      } else {
        // No user is signed in.
        setCurrentUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  // If user is not logged in, show a message
  if (!currentUser) {
    return (
        <div className="text-center p-10 bg-gray-100 rounded-lg shadow-md max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-700">Please log in to access the Internship Hub.</p>
            {/* Optionally, you can add a login button here that opens the LoginModal */}
        </div>
    );
  }

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-3xl font-bold mb-6">Micro-Internship Hub</h1>
      {userRole === 'company' && <CompanyView />}
      {userRole === 'student' && <StudentView />}
      {/* Add other roles like mentor if needed */}
      {!userRole && (
        <div className="text-center p-10">
            <p>Your role is not set. Please contact support.</p>
        </div>
      )}
    </div>
  );
}
