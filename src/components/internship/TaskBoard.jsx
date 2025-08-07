import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, query, orderByChild, equalTo, onValue, update } from 'firebase/database';

const TaskItem = ({ task }) => {
  const handleStatusChange = (newStatus) => {
    const taskRef = ref(db, `tasks/${task.id}`);
    update(taskRef, { status: newStatus }).catch(err => console.error(err));
  };

  return (
    <div className="bg-white p-3 rounded-md shadow-sm border">
      <p className="font-semibold text-gray-800">{task.title}</p>
      <div className="mt-2 pt-2 border-t flex justify-end space-x-2">
        {task.status === 'todo' && (
          <button onClick={() => handleStatusChange('doing')} className="text-xs text-blue-600 hover:underline">▶ Start</button>
        )}
        {task.status === 'doing' && (
          <>
            <button onClick={() => handleStatusChange('todo')} className="text-xs text-gray-600 hover:underline">◀ To Do</button>
            <button onClick={() => handleStatusChange('done')} className="text-xs text-green-600 hover:underline">✔ Done</button>
          </>
        )}
         {task.status === 'done' && (
            <button onClick={() => handleStatusChange('doing')} className="text-xs text-gray-600 hover:underline">◀ Redo</button>
        )}
      </div>
    </div>
  );
};

export default function TaskBoard({ internshipId, studentId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!internshipId || !studentId) return;
    const tasksRef = ref(db, 'tasks');
    const q = query(tasksRef, orderByChild('internshipStudentId'), equalTo(`${internshipId}_${studentId}`));

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      const loadedTasks = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setTasks(loadedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [internshipId, studentId]);

  const renderTasksByStatus = (status) => {
    const filteredTasks = tasks.filter(task => task.status === status);
    if (filteredTasks.length === 0) {
        let message = 'No tasks yet.';
        if(status === 'doing') message = 'No tasks in progress.';
        if(status === 'done') message = 'No tasks completed.';
        return <p className='text-sm text-center text-gray-500'>{message}</p>;
    }
    return filteredTasks.map(task => <TaskItem key={task.id} task={task} />);
  };

  if (loading) {
    return <p>Loading task board...</p>;
  }

  return (
    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="text-lg font-bold mb-4">Project Task Board</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-200 p-3 rounded-lg">
                <h5 className="font-bold mb-3 text-center">To Do</h5>
                <div className="space-y-3">{renderTasksByStatus('todo')}</div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
                <h5 className="font-bold mb-3 text-center">Doing</h5>
                <div className="space-y-3">{renderTasksByStatus('doing')}</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
                <h5 className="font-bold mb-3 text-center">Done</h5>
                <div className="space-y-3">{renderTasksByStatus('done')}</div>
            </div>
        </div>
    </div>
  );
}
