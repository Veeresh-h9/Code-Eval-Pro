import React, { useState, useEffect } from 'react';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  FileText, 
  Settings, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  LogOut,
  Activity,
  Trophy,
  CheckCircle,
  BarChart3,
  Clock,
  AlertCircle,
  Menu,
  X,
  Home,
  Database,
  UserCheck,
  Send,
  Code
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [tests, setTests] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [showAssignTest, setShowAssignTest] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    questions: [] as string[]
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsRes, questionsRes, submissionsRes, activeUsersRes, usersRes] = await Promise.all([
        supabase.from('tests').select('*').order('created_at', { ascending: false }),
        supabase.from('questions').select('*').order('created_at', { ascending: false }),
        supabase.from('submissions').select('*').order('submitted_at', { ascending: false }),
        supabase.from('active_sessions').select('*').eq('is_active', true),
        supabase.from('users').select('*')
      ]);

      const allUsers = usersRes.data || [];
      const userLookup = allUsers.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, any>);

      const enrichedSubmissions = (submissionsRes.data || []).map(submission => ({
        ...submission,
        users: userLookup[submission.user_id] || null,
        tests: (testsRes.data || []).find(t => t.id === submission.test_id) || null,
        questions: (questionsRes.data || []).find(q => q.id === submission.question_id) || null
      }));

      const enrichedActiveSessions = (activeUsersRes.data || []).map(session => ({
        ...session,
        users: userLookup[session.user_id] || null,
        tests: (testsRes.data || []).find(t => t.id === session.test_id) || null,
        questions: (questionsRes.data || []).find(q => q.id === session.question_id) || null
      }));

      setTests(testsRes.data || []);
      setQuestions(questionsRes.data || []);
      setSubmissions(enrichedSubmissions);
      setActiveUsers(enrichedActiveSessions);
      setUsers(allUsers.filter(user => user.role === 'user'));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const evaluateSubmission = async (submissionId: string, score: number, feedback: string) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          status: 'evaluated',
          score,
          feedback
        })
        .eq('id', submissionId);

      if (error) throw error;
      
      toast.success('Submission evaluated successfully');
      fetchData();
    } catch (error) {
      console.error('Error evaluating submission:', error);
      toast.error('Failed to evaluate submission');
    }
  };

  const createTest = async () => {
    if (!newTest.name.trim() || newTest.questions.length === 0) {
      toast.error('Please provide test name and select at least one question');
      return;
    }

    try {
      const { error } = await supabase
        .from('tests')
        .insert({
          name: newTest.name,
          description: newTest.description,
          questions: newTest.questions,
          assigned_users: [],
          is_active: true,
          created_by: user?.id || 'admin'
        });

      if (error) throw error;
      
      toast.success('Test created successfully');
      setShowCreateTest(false);
      setNewTest({ name: '', description: '', questions: [] });
      fetchData();
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error('Failed to create test');
    }
  };

  const assignTestToUsers = async (testId: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    try {
      const { error } = await supabase
        .from('tests')
        .update({
          assigned_users: selectedUsers
        })
        .eq('id', testId);

      if (error) throw error;
      
      toast.success(`Test assigned to ${selectedUsers.length} user(s)`);
      setShowAssignTest(false);
      setSelectedUsers([]);
      fetchData();
    } catch (error) {
      console.error('Error assigning test:', error);
      toast.error('Failed to assign test');
    }
  };

  const createFibonacciTest = async () => {
    try {
      const { error } = await supabase
        .from('tests')
        .insert({
          name: 'Fibonacci Series Challenge',
          description: 'Write a Python function to generate the Fibonacci series. Test your algorithmic thinking and implementation skills.',
          questions: ['fibonacci-series'],
          assigned_users: users.map(u => u.id),
          is_active: true,
          created_by: user?.id || 'admin'
        });

      if (error) throw error;
      
      toast.success('Fibonacci test created and assigned to all users!');
      fetchData();
    } catch (error) {
      console.error('Error creating Fibonacci test:', error);
      toast.error('Failed to create Fibonacci test');
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'tests', label: 'Tests', icon: Settings },
    { id: 'questions', label: 'Questions', icon: Database },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="stat-card fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className={`stat-icon ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
            +{trend}%
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="app-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">CodeEval Pro</h1>
              <p className="text-sm opacity-90">Admin Dashboard</p>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white/20 p-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">{user?.firstName}</p>
                <p className="text-xs opacity-75">Administrator</p>
              </div>
            </div>
            <SignOutButton>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="mobile-menu-toggle"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {navigationItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.firstName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {activeTab === 'overview' && (
            <div className="fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard
                  title="Total Users"
                  value={users.length}
                  icon={Users}
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                  trend={12}
                />
                <StatCard
                  title="Active Tests"
                  value={tests.filter(t => t.is_active).length}
                  icon={FileText}
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                  trend={8}
                />
                <StatCard
                  title="Live Sessions"
                  value={activeUsers.length}
                  icon={Activity}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                />
                <StatCard
                  title="Total Submissions"
                  value={submissions.length}
                  icon={CheckCircle}
                  color="bg-gradient-to-br from-orange-500 to-orange-600"
                  trend={15}
                />
              </div>

              {/* Active Users Section */}
              <div className="card mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Activity className="w-6 h-6 mr-3 text-green-500" />
                    Live Test Sessions
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>{activeUsers.length} active</span>
                  </div>
                </div>
                
                {activeUsers.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Activity className="w-8 h-8" />
                    </div>
                    <h3 className="empty-state-title">No Active Sessions</h3>
                    <p className="empty-state-description">
                      No users are currently taking tests. Active sessions will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Test</th>
                          <th>Question</th>
                          <th>Started</th>
                          <th>Last Activity</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeUsers.map((session) => (
                          <tr key={session.id}>
                            <td>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {session.users?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="font-semibold">{session.users?.name || 'Unknown'}</p>
                                  <p className="text-xs text-gray-500">{session.users?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="font-medium">{session.tests?.name || 'Unknown Test'}</td>
                            <td className="text-sm text-gray-600">{session.questions?.title || 'Unknown Question'}</td>
                            <td className="text-sm text-gray-500">
                              {new Date(session.start_time).toLocaleTimeString()}
                            </td>
                            <td className="text-sm text-gray-500">
                              {new Date(session.last_activity).toLocaleTimeString()}
                            </td>
                            <td>
                              <span className="badge badge-success">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Submissions */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3 text-blue-500" />
                    Recent Submissions
                  </h2>
                  <button 
                    onClick={() => setActiveTab('submissions')}
                    className="btn-secondary text-sm"
                  >
                    View All
                  </button>
                </div>
                
                {submissions.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="empty-state-title">No Submissions Yet</h3>
                    <p className="empty-state-description">
                      Submissions will appear here once users start taking tests.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.slice(0, 5).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                            {submission.users?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold">{submission.users?.name || 'Unknown User'}</p>
                            <p className="text-sm text-gray-600">
                              {submission.tests?.name} • {submission.questions?.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(submission.submitted_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {submission.score !== null && (
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">{submission.score}%</p>
                              <p className="text-xs text-gray-500">Score</p>
                            </div>
                          )}
                          <span className={`badge ${
                            submission.status === 'evaluated' ? 'badge-success' :
                            submission.status === 'submitted' ? 'badge-info' :
                            'badge-warning'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="fade-in">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">All Submissions</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{submissions.length} total</span>
                  </div>
                </div>
                
                {submissions.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="empty-state-title">No Submissions</h3>
                    <p className="empty-state-description">
                      Submissions will appear here once users complete tests.
                    </p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Test</th>
                          <th>Question</th>
                          <th>Language</th>
                          <th>Status</th>
                          <th>Score</th>
                          <th>Submitted</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((submission) => (
                          <tr key={submission.id}>
                            <td>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {submission.users?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="font-semibold">{submission.users?.name || 'Unknown'}</p>
                                  <p className="text-xs text-gray-500">{submission.users?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="font-medium">{submission.tests?.name || 'Unknown'}</td>
                            <td className="text-sm">{submission.questions?.title || 'Unknown'}</td>
                            <td>
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono">
                                {submission.language}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                submission.status === 'evaluated' ? 'badge-success' :
                                submission.status === 'submitted' ? 'badge-info' :
                                'badge-warning'
                              }`}>
                                {submission.status}
                              </span>
                            </td>
                            <td>
                              {submission.score !== null ? (
                                <span className="font-bold text-lg">{submission.score}%</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="text-sm text-gray-500">
                              {new Date(submission.submitted_at).toLocaleDateString()}
                            </td>
                            <td>
                              <button
                                onClick={() => {
                                  const score = prompt('Enter score (0-100):');
                                  const feedback = prompt('Enter feedback:');
                                  if (score && feedback) {
                                    evaluateSubmission(submission.id, parseInt(score), feedback);
                                  }
                                }}
                                className="btn-secondary text-xs p-2"
                                title="Evaluate Submission"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="fade-in">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Test Management</h2>
                  <div className="flex space-x-3">
                    <button 
                      onClick={createFibonacciTest}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Code className="w-4 h-4" />
                      <span>Create Fibonacci Test</span>
                    </button>
                    <button 
                      onClick={() => setShowCreateTest(true)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Test</span>
                    </button>
                  </div>
                </div>
                
                {tests.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="empty-state-title">No Tests Created</h3>
                    <p className="empty-state-description">
                      Create your first test to start evaluating candidates. Use the "Create Fibonacci Test" button for a quick start.
                    </p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Test Name</th>
                          <th>Questions</th>
                          <th>Assigned Users</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tests.map((test) => (
                          <tr key={test.id}>
                            <td>
                              <div>
                                <p className="font-semibold">{test.name}</p>
                                <p className="text-sm text-gray-600">{test.description}</p>
                              </div>
                            </td>
                            <td>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                                {test.questions.length} questions
                              </span>
                            </td>
                            <td>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                                {test.assigned_users.length} users
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${test.is_active ? 'badge-success' : 'badge-danger'}`}>
                                {test.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-sm text-gray-500">
                              {new Date(test.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setShowAssignTest(true);
                                    // Set current test for assignment
                                  }}
                                  className="btn-secondary text-xs p-2"
                                  title="Assign to Users"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                                <button
                                  className="btn-secondary text-xs p-2"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="fade-in">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Question Bank</h2>
                  <button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </button>
                </div>
                
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Database className="w-8 h-8" />
                  </div>
                  <h3 className="empty-state-title">Question Management</h3>
                  <p className="empty-state-description">
                    Question bank management interface coming soon. Create, edit, and organize coding questions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="fade-in">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{users.length} users</span>
                  </div>
                </div>
                
                {users.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="empty-state-title">No Users</h3>
                    <p className="empty-state-description">
                      No users have registered yet. Users will appear here once they sign up.
                    </p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Joined</th>
                          <th>Tests Taken</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {user.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="font-semibold">{user.name}</p>
                                  <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="font-medium">{user.email}</td>
                            <td>
                              <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                                {submissions.filter(s => s.user_id === user.id).length}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Test Modal */}
      {showCreateTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Test</h2>
              <button 
                onClick={() => setShowCreateTest(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Test Name</label>
                <input
                  type="text"
                  value={newTest.name}
                  onChange={(e) => setNewTest({...newTest, name: e.target.value})}
                  className="input-field"
                  placeholder="Enter test name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newTest.description}
                  onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                  className="input-field h-24 resize-none"
                  placeholder="Enter test description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Questions</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {questions.map((question) => (
                    <label key={question.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTest.questions.includes(question.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTest({...newTest, questions: [...newTest.questions, question.id]});
                          } else {
                            setNewTest({...newTest, questions: newTest.questions.filter(q => q !== question.id)});
                          }
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{question.title}</p>
                        <p className="text-sm text-gray-600">
                          {question.difficulty} • {question.time_limit} min
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowCreateTest(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={createTest}
                className="btn-primary"
              >
                Create Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Test Modal */}
      {showAssignTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Assign Test to Users</h2>
              <button 
                onClick={() => setShowAssignTest(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {users.map((user) => (
                <label key={user.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user.id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(u => u !== user.id));
                      }
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowAssignTest(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => assignTestToUsers('test-id')}
                className="btn-primary"
              >
                Assign Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;