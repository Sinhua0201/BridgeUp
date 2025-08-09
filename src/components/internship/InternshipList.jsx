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
  const [showEnglish, setShowEnglish] = useState(false);

  const getTaskTypeIcon = (taskType) => {
    const icons = {
      'Marketing Plan': '📊',
      'Data Cleaning': '🧹',
      'Content Design': '🎨',
      'App/Website Testing': '🔍',
      'Market Research': '📈',
      'Social Media Management': '📱',
      'Data Analysis': '📊',
      'UI/UX Design': '🎨',
      'Translation': '🌐',
      'Customer Support': '💬'
    };
    return icons[taskType] || '📋';
  };

  const getLocationIcon = (location) => {
    if (location === 'Remote') return '🌐';
    if (location.includes('Kota Kinabalu') || location.includes('Kuching')) return '🏔️';
    return '🏢';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <span className="text-3xl mr-4">{getTaskTypeIcon(internship.taskType)}</span>
          <div>
            <h3 className="text-xl font-bold text-blue-700">
              {showEnglish ? (internship.titleEn || internship.title) : internship.title}
            </h3>
            <p className="text-sm text-gray-500">Posted by: {companyName}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={() => setShowEnglish(!showEnglish)}
            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
          >
            {showEnglish ? '中文' : 'English'}
          </button>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            {internship.applications || 0}/{internship.maxStudents} 学生
          </span>
        </div>
      </div>

      <p className="text-gray-700 mb-4">
        {showEnglish ? (internship.descriptionEn || internship.description) : internship.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center">
          <span className="mr-2">⏱️</span>
          <span className="font-medium">{internship.duration}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">{getLocationIcon(internship.location)}</span>
          <span className="font-medium">{internship.location}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">📋</span>
          <span className="font-medium">{internship.taskType}</span>
        </div>
        {internship.isPaid && (
          <div className="flex items-center">
            <span className="mr-2">💰</span>
            <span className="font-medium text-green-600">{internship.compensation}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          发布于 {new Date(internship.createdAt).toLocaleDateString()}
        </div>
        <button 
          onClick={() => onApply(internship.id, internship.companyId)}
          disabled={hasApplied}
          className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {hasApplied ? '已申请' : '立即申请'}
        </button>
      </div>
    </div>
  );
};

export default function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    taskType: 'all',
    location: 'all',
    duration: 'all',
    isPaid: false
  });
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
      alert('请先登录再申请项目');
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

  const filteredInternships = internships.filter(internship => {
    if (filters.taskType !== 'all' && internship.taskType !== filters.taskType) return false;
    if (filters.location !== 'all' && internship.location !== filters.location) return false;
    if (filters.duration !== 'all' && internship.duration !== filters.duration) return false;
    if (filters.isPaid && !internship.isPaid) return false;
    return true;
  });

  const taskTypes = [...new Set(internships.map(i => i.taskType))];
  const locations = [...new Set(internships.map(i => i.location))];
  const durations = [...new Set(internships.map(i => i.duration))];

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">加载可用项目...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">筛选项目</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">任务类型</label>
            <select 
              value={filters.taskType} 
              onChange={e => setFilters({...filters, taskType: e.target.value})}
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              <option value="all">所有类型</option>
              {taskTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">地点</label>
            <select 
              value={filters.location} 
              onChange={e => setFilters({...filters, location: e.target.value})}
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              <option value="all">所有地点</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">时长</label>
            <select 
              value={filters.duration} 
              onChange={e => setFilters({...filters, duration: e.target.value})}
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              <option value="all">所有时长</option>
              {durations.map(duration => (
                <option key={duration} value={duration}>{duration}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.isPaid} 
                onChange={e => setFilters({...filters, isPaid: e.target.checked})}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">仅显示有津贴的项目</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">找到 {filteredInternships.length} 个项目</h3>
          {filteredInternships.length > 0 && (
            <div className="text-sm text-gray-500">
              显示 {filteredInternships.length} 个可用项目
            </div>
          )}
        </div>

        {filteredInternships.length > 0 ? (
          filteredInternships.map(internship => (
            <InternshipCard 
              key={internship.id} 
              internship={internship} 
              onApply={handleApply} 
              hasApplied={appliedIds.has(internship.id)}
            />
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的项目</h3>
            <p className="text-gray-600 mb-4">尝试调整筛选条件或稍后再查看</p>
            <button 
              onClick={() => setFilters({
                taskType: 'all',
                location: 'all',
                duration: 'all',
                isPaid: false
              })}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              清除筛选
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
