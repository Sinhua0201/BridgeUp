import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { ref, push, set } from 'firebase/database';

export default function CreateInternship({ onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [taskType, setTaskType] = useState('Frontend');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const currentUser = auth.currentUser;

    if (!title || !description || !duration) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const internshipsRef = ref(db, 'internships');
      const newInternshipRef = push(internshipsRef);
      await set(newInternshipRef, {
        companyId: currentUser.uid,
        title,
        description,
        duration,
        taskType,
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      setError('Failed to create internship. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Post a New Internship</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Internship Title" className="w-full border p-2 rounded" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full border p-2 rounded" rows="4"></textarea>
          <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g., 2-4 weeks" className="w-full border p-2 rounded" />
          <select value={taskType} onChange={e => setTaskType(e.target.value)} className="w-full border p-2 rounded">
            <option>Frontend</option>
            <option>Backend</option>
            <option>Full Stack</option>
            <option>UI/UX Design</option>
            <option>Data Science</option>
          </select>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300">
              {loading ? 'Posting...' : 'Post Internship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
