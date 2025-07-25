import React, { useState, useEffect } from 'react';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  Trophy, 
  LogOut, 
  BarChart3, 
  Target,
  Award,
  TrendingUp,
  Calendar,
  User,
  BookOpen,
  Activity,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserDashboard: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [assignedTests, setAssignedTests] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssignedTests();
      fetchSubmissions();
    }
  }, [user]);

  const fetchAssignedTests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .contains('assigned_users', [user.id])
        .eq('is_active', true);

      if (error) throw error;
      setAssignedTests(data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to load assigned tests');
    }
  };

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user.id);

      if (submissionsError) throw submissionsError;

      if (!submissionsData || submissionsData.length === 0) {
        setSubmissions([]);
        return;
      }

      const testIds = [...new Set(submissionsData.map(s => s.test_id))];
      const questionIds = [...new Set(submissionsData.map(s => s.question_id))];

      const { data: testsData } = await supabase
        .from('tests')
        .select('id, name')
        .in('id', testIds);

      const { data: questionsData } = await supabase
        .from('questions')
        .select('id, title')
        .in('id', questionIds);

      const testsMap = new Map(testsData?.map(t => [t.id, t]) || []);
      const questionsMap = new Map(questionsData?.map(q => [q.id, q]) || []);

      const enrichedSubmissions = submissionsData.map(submission => ({
        ...submission,
        tests: testsMap.get(submission.test_id),
        questions: questionsMap.get(submission.question_id)
      }));

      setSubmissions(enrichedSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (testId: string) => {
    try {
      const { data: activeSession } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      if (activeSession) {
        toast.error('You already have an active test session');
        return;
      }

      navigate(`/test/${testId}`);
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Failed to start test');
    }
  };

  const completedTests = submissions.filter(s => s.status === 'submitted').length;
  const averageScore = submissions.length > 0 
    ? Math.round(submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length)
    : 0;

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="stat-card fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className={`stat-icon ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="app-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="page-title text-2xl">
                    Welcome back, {user?.firstName || 'Candidate'}!
                  </h1>
                  <p className="page-subtitle">Ready to showcase your coding skills?</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Leaderboard</span>
                </button>
                <SignOutButton>
                  <button className="btn-primary flex items-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Assigned Tests"
              value={assignedTests.length}
              icon={BookOpen}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              subtitle="Ready to take"
            />
            <StatCard
              title="Completed Tests"
              value={completedTests}
              icon={CheckCircle}
              color="bg-gradient-to-br from-green-500 to-green-600"
              subtitle="Successfully finished"
            />
            <StatCard
              title="Average Score"
              value={`${averageScore}%`}
              icon={TrendingUp}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              subtitle="Overall performance"
            />
            <StatCard
              title="Total Submissions"
              value={submissions.length}
              icon={Activity}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              subtitle="Code submissions"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Assigned Tests */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Target className="w-6 h-6 mr-3 text-blue-500" />
                    Available Tests
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{assignedTests.length} assigned</span>
                  </div>
                </div>
                
                {assignedTests.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <h3 className="empty-state-title">No Tests Assigned</h3>
                    <p className="empty-state-description">
                      You don't have any tests assigned yet. Check back later or contact your administrator.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedTests.map((test) => (
                      <div key={test.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">{test.name}</h3>
                                <p className="text-sm text-gray-600">{test.description}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <BookOpen className="w-4 h-4" />
                                <span>{test.questions.length} questions</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Created {new Date(test.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => startTest(test.id)}
                            className="btn-primary flex items-center space-x-2 ml-6"
                          >
                            <Play className="w-4 h-4" />
                            <span>Start Test</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Performance Overview */}
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                  Performance Overview
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">Completed</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{completedTests}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">Pending</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{assignedTests.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">Avg Score</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">{averageScore}%</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/leaderboard')}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>View Leaderboard</span>
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Refresh Dashboard</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Submissions */}
          {submissions.length > 0 && (
            <div className="card mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-orange-500" />
                  Recent Submissions
                </h2>
                <span className="text-sm text-gray-600">{submissions.length} total</span>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Question</th>
                      <th>Language</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.slice(0, 10).map((submission) => (
                      <tr key={submission.id}>
                        <td className="font-medium">{submission.tests?.name || 'Unknown Test'}</td>
                        <td className="text-sm text-gray-600">{submission.questions?.title || 'Unknown Question'}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;