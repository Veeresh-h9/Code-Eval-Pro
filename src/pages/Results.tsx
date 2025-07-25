import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Trophy, Clock, Code, CheckCircle, XCircle, Award } from 'lucide-react';

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user]);

  const fetchResults = async () => {
    if (!user) return;

    try {
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

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
        .select('id, title, difficulty')
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
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number | null) => {
    if (score === null) return <Clock className="w-5 h-5 text-gray-500" />;
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <Award className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading your results...</p>
        </div>
      </div>
    );
  }

  const averageScore = submissions.length > 0 
    ? Math.round(submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length)
    : 0;

  const completedSubmissions = submissions.filter(s => s.status === 'evaluated').length;

  return (
    <div className="min-h-screen gradient-bg p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient">Test Results</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{submissions.length}</div>
            <div className="text-sm font-medium text-gray-600">Total Submissions</div>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{averageScore}%</div>
            <div className="text-sm font-medium text-gray-600">Average Score</div>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{completedSubmissions}</div>
            <div className="text-sm font-medium text-gray-600">Evaluated</div>
          </div>
        </div>

        {/* Results Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Submission History</h2>
            <div className="text-sm text-gray-600">{submissions.length} submissions</div>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Code className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Submissions Yet</h3>
              <p className="text-gray-600 text-lg mb-6">Take some tests to see your results here!</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Test</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Question</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Difficulty</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Language</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, index) => (
                    <tr key={submission.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          {submission.tests?.name || 'Unknown Test'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-700">
                          {submission.questions?.title || 'Unknown Question'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(submission.questions?.difficulty || 'unknown')}`}>
                          {(submission.questions?.difficulty || 'unknown').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-mono">
                          {submission.language}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'evaluated' ? 'bg-green-100 text-green-800' :
                          submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getScoreIcon(submission.score)}
                          <span className={`font-bold ${getScoreColor(submission.score)}`}>
                            {submission.score !== null ? `${submission.score}%` : 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-600">
                          {submission.time_taken ? `${Math.floor(submission.time_taken / 60)}:${(submission.time_taken % 60).toString().padStart(2, '0')}` : '-'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-500">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        {submissions.some(s => s.feedback) && (
          <div className="card mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Feedback</h2>
            <div className="space-y-4">
              {submissions
                .filter(s => s.feedback)
                .slice(0, 3)
                .map((submission) => (
                  <div key={submission.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {submission.questions?.title || 'Unknown Question'}
                      </h3>
                      <span className={`font-bold ${getScoreColor(submission.score)}`}>
                        {submission.score}%
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{submission.feedback}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;