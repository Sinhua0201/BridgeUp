import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, push, set, query, orderByChild, equalTo, get } from 'firebase/database';

export default function Challenges() {
  const [activeTab, setActiveTab] = useState('challenges');
  const [challenges, setChallenges] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [userRole, setUserRole] = useState('student');
  const [filterType, setFilterType] = useState('all');

  // Auth and profile
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Create challenge form state
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createType, setCreateType] = useState('marketing');
  const [createDifficulty, setCreateDifficulty] = useState('中等');
  const [createDuration, setCreateDuration] = useState('48小时');
  const [createDeadline, setCreateDeadline] = useState('');
  const [createMaxParticipants, setCreateMaxParticipants] = useState(50);
  const [createReward, setCreateReward] = useState('');
  const [createTagsCSV, setCreateTagsCSV] = useState('');

  // My submissions
  const [mySubmissions, setMySubmissions] = useState([]);

  // Submission form state
  const [participationMode, setParticipationMode] = useState('individual');
  const [submissionType, setSubmissionType] = useState('pdf');
  const [submissionDescription, setSubmissionDescription] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');

  // Auth: load user and profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      if (!u) return setUserProfile(null);
      const userRef = ref(db, `users/${u.uid}`);
      onValue(userRef, (snap) => setUserProfile(snap.val() || null));
    });
    return () => unsubscribe();
  }, []);

  // Live challenges
  useEffect(() => {
    const challengesRef = ref(db, 'challenges');
    const unsub = onValue(challengesRef, (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data).map(([id, v]) => ({ id, ...v }));
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setChallenges(list);
    });
    return () => unsub();
  }, []);

  // My submissions
  useEffect(() => {
    if (!currentUser) return setMySubmissions([]);
    const submissionsRef = ref(db, 'challengeSubmissions');
    const q = query(submissionsRef, orderByChild('studentId'), equalTo(currentUser.uid));
    const unsub = onValue(q, (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data).map(([id, v]) => ({ id, ...v }));
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setMySubmissions(list);
    });
    return () => unsub();
  }, [currentUser]);

  // Reflect role from profile
  useEffect(() => {
    if (userProfile?.role) setUserRole(userProfile.role);
  }, [userProfile]);

  const filteredChallenges = challenges.filter(challenge => {
    if (filterType === 'all') return true;
    return challenge.type === filterType;
  });

  const getTypeColor = (type) => {
    const colors = {
      'marketing': 'bg-blue-100 text-blue-800',
      'sustainability': 'bg-green-100 text-green-800',
      'data-analysis': 'bg-purple-100 text-purple-800',
      'technology': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      '简单': 'bg-green-100 text-green-800',
      '中等': 'bg-yellow-100 text-yellow-800',
      '困难': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">企业挑战赛平台</h1>
              <p className="text-gray-600 mt-1">体验真实行业问题，赢取实习机会和奖金</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setUserRole(userRole === 'student' ? 'company' : 'student')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  userRole === 'student' 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {userRole === 'student' ? '👨‍🎓 学生模式' : '🏢 企业模式'}
              </button>
              {userRole === 'company' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>发布挑战</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'challenges', name: '挑战赛', icon: '🏆' },
              { id: 'my-participations', name: '我的参与', icon: '👥' },
              { id: 'collaboration', name: '协作工具', icon: '💬' },
              { id: 'leaderboard', name: '排行榜', icon: '⭐' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'challenges' && (
          <div>
            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">筛选:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部类型</option>
                  <option value="marketing">市场营销</option>
                  <option value="sustainability">可持续发展</option>
                  <option value="data-analysis">数据分析</option>
                  <option value="technology">技术开发</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">排序:</span>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>最新发布</option>
                  <option>截止时间</option>
                  <option>参与人数</option>
                  <option>奖励金额</option>
                </select>
              </div>
            </div>

            {/* Challenges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => (
                <div key={challenge.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{challenge.companyLogo}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{challenge.title}</h3>
                          <p className="text-sm text-gray-600">{challenge.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm text-gray-600">{challenge.rating}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-sm mb-4">{challenge.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {challenge.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">难度:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">时长:</span>
                        <span className="text-gray-900">{challenge.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">截止:</span>
                        <span className="text-gray-900">{challenge.deadline || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">参与:</span>
                        <span className="text-gray-900">{(challenge.participantsCount ?? challenge.participants ?? 0)}/{challenge.maxParticipants ?? '∞'}</span>
                      </div>
                    </div>

                    {/* Reward */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-600">🏆</span>
                        <span className="text-sm font-medium text-gray-900">奖励</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{challenge.reward}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedChallenge(challenge);
                          setShowSubmissionModal(true);
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        立即参与
                      </button>
                      <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        查看详情
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'my-participations' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">我的参与项目</h2>
            <div className="text-center py-12">
              <span className="text-6xl text-gray-400">👥</span>
              <p className="text-gray-500 mt-4">您还没有参与任何挑战赛</p>
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                浏览挑战赛
              </button>
            </div>
          </div>
        )}

        {activeTab === 'collaboration' && (
          <div className="space-y-6">
            {/* Task Board */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">任务板 (Trello风格)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['待办', '进行中', '已完成'].map((status) => (
                  <div key={status} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">{status}</h3>
                    <div className="space-y-2">
                      {status === '待办' && (
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <p className="text-sm text-gray-700">设计用户界面原型</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">截止: 明天</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">UI/UX</span>
                          </div>
                        </div>
                      )}
                      {status === '进行中' && (
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <p className="text-sm text-gray-700">收集市场调研数据</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">截止: 后天</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">研究</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Communication Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <span>💬</span>
                  <span>团队聊天</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        A
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Alice</p>
                        <p className="text-sm text-gray-700">大家觉得这个设计方案怎么样？</p>
                        <p className="text-xs text-gray-500 mt-1">10:30 AM</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        B
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Bob</p>
                        <p className="text-sm text-gray-700">看起来不错，但可能需要调整一下颜色搭配</p>
                        <p className="text-xs text-gray-500 mt-1">10:32 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <input
                    type="text"
                    placeholder="输入消息..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    发送
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <span>📹</span>
                  <span>视频会议</span>
                </h3>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📹</span>
                  </div>
                  <p className="text-gray-600 mb-4">开始团队视频会议</p>
                  <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                    开始会议
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">挑战赛排行榜</h2>
            <div className="space-y-4">
              {[
                { rank: 1, name: "张小明", university: "马来亚大学", points: 2850, challenges: 8, avatar: "🥇" },
                { rank: 2, name: "李小红", university: "国民大学", points: 2720, challenges: 7, avatar: "🥈" },
                { rank: 3, name: "王小明", university: "博特拉大学", points: 2580, challenges: 6, avatar: "🥉" },
                { rank: 4, name: "陈小华", university: "理科大学", points: 2450, challenges: 6, avatar: "4" },
                { rank: 5, name: "刘小强", university: "工艺大学", points: 2320, challenges: 5, avatar: "5" }
              ].map((student) => (
                <div key={student.rank} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{student.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.university}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{student.points} 分</p>
                    <p className="text-sm text-gray-600">{student.challenges} 个挑战</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">发布新挑战</h2>
              <p className="text-gray-600 mt-1">创建吸引学生的行业挑战</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">挑战标题</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：设计TikTok广告策略"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">挑战描述</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="详细描述挑战内容、要求和目标..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">挑战类型</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>市场营销</option>
                    <option>可持续发展</option>
                    <option>数据分析</option>
                    <option>技术开发</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">难度等级</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>简单</option>
                    <option>中等</option>
                    <option>困难</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">挑战时长</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>48小时</option>
                    <option>72小时</option>
                    <option>1周</option>
                    <option>2周</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">最大参与人数</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">奖励设置</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：实习直通卡 + 5000马币奖金"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="用逗号分隔，例如：社交媒体, 广告创意, 年轻群体"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                发布挑战
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {showSubmissionModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">参与挑战：{selectedChallenge.title}</h2>
              <p className="text-gray-600 mt-1">提交您的创意方案</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">参与方式</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="participation" value="individual" className="text-blue-600" />
                    <span>个人参与</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="participation" value="team" className="text-blue-600" />
                    <span>组队参与</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">方案类型</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'pdf', name: 'PDF文档', icon: '📄' },
                    { type: 'ppt', name: 'PPT演示', icon: '📊' },
                    { type: 'video', name: '视频方案', icon: '🎥' },
                    { type: 'prototype', name: '原型设计', icon: '🏗️' }
                  ].map((option) => (
                    <label key={option.type} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="submissionType" value={option.type} className="text-blue-600" />
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm">{option.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">方案描述</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="简要描述您的方案思路和创意点..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">上传文件</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <span className="text-4xl text-gray-400">📄</span>
                  <p className="text-gray-600 mb-2 mt-2">拖拽文件到此处或点击上传</p>
                  <p className="text-sm text-gray-500">支持 PDF, PPT, MP4, 图片等格式</p>
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    选择文件
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button onClick={handleSubmitSubmission} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                提交方案
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
