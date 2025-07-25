import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Award, ArrowLeft } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          user_id,
          score,
          users:user_id(name, email)
        `)
        .eq('status', 'evaluated')
        .not('score', 'is', null);

      if (error) throw error;

      // Calculate average scores per user
      const userScores: { [key: string]: { name: string; email: string; scores: number[]; average: number } } = {};
      
      data?.forEach((submission) => {
        const userId = submission.user_id;
        if (!userScores[userId]) {
          userScores[userId] = {
            name: submission.users?.name || 'Unknown',
            email: submission.users?.email || '',
            scores: [],
            average: 0
          };
        }
        userScores[userId].scores.push(submission.score);
      });

      // Calculate averages and sort
      const leaderboardData = Object.entries(userScores)
        .map(([userId, data]) => ({
          userId,
          name: data.name,
          email: data.email,
          average: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
          totalTests: data.scores.length
        }))
        .sort((a, b) => b.average - a.average);

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-secondary-600 font-bold">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary flex items-center space-x-2 w-full sm:w-auto justify-center sm:mr-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient">Leaderboard</h1>
        </div>

        <div className="card hover:shadow-2xl transition-all duration-300">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-secondary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-secondary-400" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3">No Results Yet</h3>
              <p className="text-secondary-600 text-lg">Complete some tests to see the leaderboard!</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {leaderboard.map((user, index) => (
                <div
                  key={user.userId}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 rounded-xl border-2 gap-4 transition-all duration-300 hover:shadow-lg ${
                    index < 3 ? 'bg-gradient-to-r from-primary-50 to-accent-50 border-primary-300 hover:border-primary-400' : 'bg-secondary-50 border-secondary-200 hover:border-secondary-300'
                  }`}
                >
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    {getRankIcon(index + 1)}
                    <div>
                      <h3 className="font-bold text-secondary-900 text-lg">{user.name}</h3>
                      <p className="text-sm text-secondary-600 break-all sm:break-normal">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <div className="text-2xl sm:text-3xl font-bold text-primary-600">{user.average}%</div>
                    <div className="text-sm text-secondary-500 font-medium">{user.totalTests} tests</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;