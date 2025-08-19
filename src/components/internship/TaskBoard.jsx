import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { ref, query, orderByChild, equalTo, onValue, update, push, set } from 'firebase/database';
import AddTaskForm from './AddTaskForm';

const TaskItem = ({ task, onStatusChange, companyView = false, onAssignStudent }) => {
  const [students, setStudents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    if (task.students) {
      const studentIds = Object.keys(task.students);
      Promise.all(
        studentIds.map(id =>
          fetch(`https://console.firebase.google.com/project/bridgeup-f79f1/database/bridgeup-f79f1-default-rtdb/data/~2F/users/${id}`).then(res => res.json())
        )
      ).then(studentData => setStudents(studentData));
    }
  }, [task.students]);

  const handleStatusChange = (newStatus) => {
    const taskRef = ref(db, `tasks/${task.id}`);
    update(taskRef, { status: newStatus }).catch(err => console.error(err));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="font-semibold text-gray-800 mb-1">{task.title}</p>
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          {task.dueDate && (
            <p className="text-xs text-gray-500">
              Due date: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          {companyView && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
              Assign Student
            </button>
          )}
          <div className="flex space-x-1">
            {task.status === 'todo' && (
              <button
                onClick={() => handleStatusChange('doing')}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
              >
                ▶ Start
              </button>
            )}
            {task.status === 'doing' && (
              <>
                <button
                  onClick={() => handleStatusChange('todo')}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                >
                  ◀ To Do
                </button>
                <button
                  onClick={() => handleStatusChange('done')}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                >
                  ✔ Complete
                </button>
              </>
            )}
            {task.status === 'done' && (
              <button
                onClick={() => handleStatusChange('doing')}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
              >
                ◀ Restart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Assigned Students */}
      {students.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Assigned students:</p>
          <div className="flex flex-wrap gap-1">
            {students.map((student, index) => (
              <span
                key={index}
                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
              >
                {student.name || student.email}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Assign Student Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Assign Student to Task</h3>
            <p className="text-sm text-gray-600 mb-4">Select the student(s) to assign to this task</p>
            {/* Student selection logic would go here */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle assignment
                  setShowAssignModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TaskBoard({ internshipId, studentId, companyView = false }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!internshipId) return;

    const tasksRef = ref(db, 'tasks');
    let q;

    if (companyView) {
      // Company view: show all tasks for this internship
      q = query(tasksRef, orderByChild('internshipId'), equalTo(internshipId));
    } else {
      // Student view: show tasks assigned to this student
      q = query(tasksRef, orderByChild('internshipStudentId'), equalTo(`${internshipId}_${studentId}`));
    }

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      const loadedTasks = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setTasks(loadedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [internshipId, studentId, companyView]);

  const renderTasksByStatus = (status) => {
    let filteredTasks = tasks.filter(task => task.status === status);

    if (filter !== 'all') {
      filteredTasks = filteredTasks.filter(task => {
        // Add additional filtering logic here if needed
        return true;
      });
    }

    if (filteredTasks.length === 0) {
      let message = 'No tasks yet';
      if (status === 'doing') message = 'No tasks in progress';
      if (status === 'done') message = 'No completed tasks';
      return (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
      );
    }

    return filteredTasks.map(task => (
      <TaskItem
        key={task.id}
        task={task}
        companyView={companyView}
      />
    ));
  };

  const getStatusStats = () => {
    const todo = tasks.filter(t => t.status === 'todo').length;
    const doing = tasks.filter(t => t.status === 'doing').length;
    const done = tasks.filter(t => t.status === 'done').length;
    return { todo, doing, done };
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading task board...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xl font-bold text-gray-800">Project Task Board</h4>
          <p className="text-sm text-gray-600">Manage project progress and task assignments</p>
        </div>
        {companyView && (
          <button
            onClick={() => setShowAddTask(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <span className="mr-2">+</span>
            Add Task
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
          <div className="text-sm text-gray-500">To Do</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.doing}</div>
          <div className="text-sm text-blue-500">In Progress</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{stats.done}</div>
          <div className="text-sm text-green-500">Completed</div>
        </div>
      </div>

      {/* Task Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h5 className="font-bold mb-4 text-center text-gray-700">📋 To Do</h5>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {renderTasksByStatus('todo')}
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="font-bold mb-4 text-center text-blue-700">🔄 In Progress</h5>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {renderTasksByStatus('doing')}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h5 className="font-bold mb-4 text-center text-green-700">✅ Completed</h5>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {renderTasksByStatus('done')}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskForm
          internshipId={internshipId}
          onClose={() => setShowAddTask(false)}
        />
      )}
    </div>
  );
}
