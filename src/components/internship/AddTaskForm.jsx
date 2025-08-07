import React, { useState } from 'react';
import { db } from '../../firebase';
import { ref, push, set } from 'firebase/database';

export default function AddTaskForm({ internshipId, studentId }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const tasksRef = ref(db, 'tasks');
      const newTaskRef = push(tasksRef);
      await set(newTaskRef, {
        title,
        internshipId,
        studentId,
        status: 'todo', // Default status
        createdAt: new Date().toISOString(),
        internshipStudentId: `${internshipId}_${studentId}`, // For querying
      });
      setTitle(''); // Clear input after successful submission
    } catch (err) {
      console.error(err);
      setError('Failed to add task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex items-start space-x-2">
      <div className="flex-grow">
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-md px-3 py-2" 
          placeholder="Add a new task for the student"
          required 
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <button 
        type="submit" 
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  );
}
