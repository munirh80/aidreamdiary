import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Trophy, Lock, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const categoryNames = {
  basics: 'Getting Started',
  dreams: 'Dream Collection',
  streaks: 'Consistency',
  lucid: 'Lucid Dreaming',
  insights: 'AI Insights',
  social: 'Community',
  exploration: 'Exploration'
};

const categoryOrder = ['basics', 'dreams', 'streaks', 'lucid', 'insights', 'social', 'exploration'];

const Achievements = () => {
  const { getAuthHeaders } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ total_unlocked: 0, total_achievements: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await axios.get(`${API_URL}/achievements`, getAuthHeaders());
        setAchievements(response.data.achievements);
        setStats({
          total_unlocked: response.data.total_unlocked,
          total_achievements: response.data.total_achievements
        });
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [getAuthHeaders]);

  // Group achievements by category
  const groupedAchievements = categoryOrder.reduce((acc, category) => {
    acc[category] = achievements.filter(a => a.category === category);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const progressPercent = stats.total_achievements > 0 
    ? Math.round((stats.total_unlocked / stats.total_achievements) * 100) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in" data-testid="achievements-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-white mb-2">
          <Trophy className="w-8 h-8 inline mr-3 text-amber-400" />
          Achievements
        </h1>
        <p className="text-slate-400">Track your dream journaling milestones</p>
      </div>

      {/* Overall Progress */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-3xl font-serif text-white">{stats.total_unlocked}</span>
            <span className="text-slate-400 text-lg"> / {stats.total_achievements}</span>
          </div>
          <span className="text-2xl font-serif text-amber-400">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-3 bg-slate-800" />
        <p className="text-sm text-slate-500 mt-2">
          {stats.total_achievements - stats.total_unlocked} achievements remaining
        </p>
      </div>

      {/* Achievement Categories */}
      <div className="space-y-8">
        {categoryOrder.map(category => {
          const categoryAchievements = groupedAchievements[category];
          if (!categoryAchievements?.length) return null;
          
          const unlockedInCategory = categoryAchievements.filter(a => a.unlocked).length;
          
          return (
            <section key={category}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl text-white">{categoryNames[category]}</h2>
                <span className="text-sm text-slate-500">
                  {unlockedInCategory} / {categoryAchievements.length}
                </span>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {categoryAchievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`relative rounded-2xl p-5 transition-all duration-300 ${
                      achievement.unlocked
                        ? 'glass border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent'
                        : 'bg-slate-900/30 border border-white/5 opacity-60'
                    }`}
                    data-testid={`achievement-${achievement.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                        achievement.unlocked
                          ? 'bg-amber-500/20'
                          : 'bg-slate-800/50'
                      }`}>
                        {achievement.unlocked ? achievement.icon : <Lock className="w-6 h-6 text-slate-600" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${achievement.unlocked ? 'text-white' : 'text-slate-500'}`}>
                            {achievement.name}
                          </h3>
                          {achievement.unlocked && (
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${achievement.unlocked ? 'text-slate-400' : 'text-slate-600'}`}>
                          {achievement.description}
                        </p>
                        
                        {/* Progress bar for locked achievements */}
                        {!achievement.unlocked && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress} / {achievement.target}</span>
                            </div>
                            <Progress 
                              value={(achievement.progress / achievement.target) * 100} 
                              className="h-1.5 bg-slate-800"
                            />
                          </div>
                        )}
                        
                        {achievement.unlocked && achievement.unlocked_at && (
                          <p className="text-xs text-amber-400/70 mt-2">
                            Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
