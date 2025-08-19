import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { ref, push, set } from 'firebase/database';

export default function CreateInternship({ onClose }) {
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [duration, setDuration] = useState('2-4 weeks');
  const [taskType, setTaskType] = useState('Marketing Plan');
  const [maxStudents, setMaxStudents] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const [compensation, setCompensation] = useState('');
  const [location, setLocation] = useState('Remote');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const taskTypes = [
    'Marketing Plan',
    'Data Cleaning', 
    'Content Design',
    'App/Website Testing',
    'Market Research',
    'Social Media Management',
    'Data Analysis',
    'UI/UX Design',
    'Translation',
    'Customer Support'
  ];

  const locations = [
    'Remote',
    'Kuala Lumpur',
    'Penang', 
    'Johor Bahru',
    'Kota Kinabalu',
    'Kuching',
    'Malacca',
    'Ipoh',
    'Alor Setar',
    'Kuantan'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const currentUser = auth.currentUser;

    if (!title || !description || !duration) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const internshipsRef = ref(db, 'internships');
      const newInternshipRef = push(internshipsRef);
      await set(newInternshipRef, {
        companyId: currentUser.uid,
        title,
        titleEn: titleEn || title,
        description,
        descriptionEn: descriptionEn || description,
        duration,
        taskType,
        maxStudents: parseInt(maxStudents),
        isPaid,
        compensation: isPaid ? compensation : '',
        location,
        status: 'open',
        createdAt: new Date().toISOString(),
        type: 'micro-internship',
        applications: 0,
        completedCount: 0
      });
      onClose();
    } catch (err) {
      setError('Failed to create micro-internship. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create Micro-Internship</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title (Chinese) *
              </label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g., Social Media Marketing (Chinese)" 
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title (English)
              </label>
              <input 
                type="text" 
                value={titleEn} 
                onChange={e => setTitleEn(e.target.value)} 
                placeholder="e.g., Social Media Marketing Plan" 
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description (Chinese) *
              </label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Detailed project description, requirements, and expected outcomes (Chinese)..." 
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                rows="4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description (English)
              </label>
              <textarea 
                value={descriptionEn} 
                onChange={e => setDescriptionEn(e.target.value)} 
                placeholder="Detailed project description, requirements, and expected outcomes..." 
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                rows="4"
              />
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Duration *
              </label>
              <select 
                value={duration} 
                onChange={e => setDuration(e.target.value)} 
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1-2 weeks">1-2 weeks</option>
                <option value="2-4 weeks">2-4 weeks</option>
                <option value="4-6 weeks">4-6 weeks</option>
                <option value="6-8 weeks">6-8 weeks</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type *
              </label>
              <select 
                value={taskType} 
                onChange={e => setTaskType(e.target.value)} 
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {taskTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Number of Students
              </label>
              <input 
                type="number" 
                value={maxStudents} 
                onChange={e => setMaxStudents(e.target.value)} 
                min="1" 
                max="10"
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={isPaid} 
                  onChange={e => setIsPaid(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Provide Compensation</span>
              </label>
              {isPaid && (
                <input 
                  type="text" 
                  value={compensation} 
                  onChange={e => setCompensation(e.target.value)} 
                  placeholder="e.g., RM 500" 
                  className="flex-1 border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              )}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex justify-end space-x-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {loading ? 'Posting...' : 'Create Micro-Internship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
