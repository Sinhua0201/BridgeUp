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
            <p className="text-gray-700">Please log in to access the Micro-Internship Hub.</p>
            {/* Optionally, you can add a login button here that opens the LoginModal */}
        </div>
    );
  }

  return (
    <div className="container mx-auto p-5">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">🎯 Micro-Internship Hub</h1>
        <p className="text-lg text-gray-600 mb-4">
          Virtual Internship Platform – Gain real industry experience from home
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center">
            <span className="mr-2">🇲🇾</span>
            Supports students from Sabah & Sarawak to participate remotely
          </span>
          <span className="flex items-center">
            <span className="mr-2">🌐</span>
            Task descriptions available in English & Chinese
          </span>
          <span className="flex items-center">
            <span className="mr-2">🏆</span>
            Receive digital certificates & recommendation letters upon completion
          </span>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-3 text-blue-700">⏳ Short-term Projects</h3>
          <p className="text-gray-600">2–4 weeks online, flexible scheduling</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-3 text-green-700">📋 Diverse Tasks</h3>
          <p className="text-gray-600">Marketing, data management, content design, app testing</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-3 text-purple-700">🏅 Achievement System</h3>
          <p className="text-gray-600">Badges, levels, and portfolio showcase</p>
        </div>
      </div>

      {/* Main Content */}
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
