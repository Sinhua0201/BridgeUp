import React from 'react';
import InternshipList from './InternshipList';
import StudentDashboard from './StudentDashboard';

export default function StudentView() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Dashboard</h2>
      <StudentDashboard />
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">Available Internships</h2>
        <InternshipList />
      </div>
    </div>
  );
}
