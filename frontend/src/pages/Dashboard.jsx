import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { PlusCircle, BookOpen, TrendingUp, Sparkles, ChevronRight, Flame, Calendar, Brain, Download, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Dashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentDreams, setRecentDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [achievementStats, setAchievementStats] = useState({ total_unlocked: 0, total_achievements: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, dreamsRes, achievementsRes] = await Promise.all([
          axios.get(`${API_URL}/stats`, getAuthHeaders()),
          axios.get(`${API_URL}/dreams`, getAuthHeaders()),
          axios.get(`${API_URL}/achievements/check`, getAuthHeaders())
        ]);
        setStats(statsRes.data);
        setRecentDreams(dreamsRes.data.slice(0, 3));
        setAchievementStats({
          total_unlocked: achievementsRes.data.total_unlocked,
          total_achievements: achievementsRes.data.total_achievements
        });
        
        // Show toast for newly unlocked achievements
        if (achievementsRes.data.newly_unlocked?.length > 0) {
          achievementsRes.data.newly_unlocked.forEach(ach => {
            toast.success(`${ach.icon} Achievement Unlocked: ${ach.name}!`, {
              description: ach.description,
              duration: 5000
            });
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAuthHeaders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in" data-testid="dashboard">
      {/* Welcome Header */}
      <div className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-white mb-3">
          Welcome back, <span className="text-purple-400">{user?.name}</span>
        </h1>
        <p className="text-slate-400 text-lg">Explore the depths of your subconscious</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="stat-card" data-testid="stat-total-dreams">
          <div className="text-slate-500 text-sm font-medium mb-2">Total Dreams</div>
          <div className="font-serif text-4xl text-white">{stats?.total_dreams || 0}</div>
          {stats?.lucid_dreams > 0 && (
            <div className="text-xs text-purple-400 mt-1">
              ✨ {stats.lucid_dreams} lucid
            </div>
          )}
        </div>
        <div className="stat-card" data-testid="stat-this-week">
          <div className="text-slate-500 text-sm font-medium mb-2">This Week</div>
          <div className="font-serif text-4xl text-cyan-400">{stats?.dreams_this_week || 0}</div>
        </div>
        {/* Dream Streak Card */}
        <div className="stat-card relative overflow-hidden" data-testid="stat-streak">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
          <div className="text-slate-500 text-sm font-medium mb-2 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Current Streak
          </div>
          <div className="font-serif text-4xl text-orange-400">{stats?.current_streak || 0}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500">Best: {stats?.longest_streak || 0}</span>
            {stats?.streak_freezes > 0 && (
              <span className="text-xs text-cyan-400">❄️ {stats.streak_freezes}</span>
            )}
          </div>
        </div>
        <div className="stat-card" data-testid="stat-top-themes">
          <div className="text-slate-500 text-sm font-medium mb-3">Top Themes</div>
          <div className="flex flex-wrap gap-2">
            {stats?.top_themes?.length > 0 ? (
              stats.top_themes.slice(0, 3).map((theme, i) => (
                <span key={i} className="theme-tag text-xs">
                  {theme.name}
                </span>
              ))
            ) : (
              <span className="text-slate-600 text-sm">No themes yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Streak Motivation Banner */}
      {stats?.current_streak > 0 && (
        <div className="glass rounded-2xl p-6 border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-transparent" data-testid="streak-banner">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center animate-pulse-glow">
              <Flame className="w-7 h-7 text-orange-400" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-white">
                {stats.current_streak} Day Streak! 🔥
              </h3>
              <p className="text-slate-400 text-sm">
                {stats.current_streak >= stats.longest_streak 
                  ? "You're on your longest streak ever! Keep it going!"
                  : `${stats.longest_streak - stats.current_streak} more days to beat your record!`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link to="/dreams/new">
          <Button className="rounded-full px-6 py-3 bg-white text-black font-semibold hover:bg-slate-200 transition-all duration-300 btn-glow h-auto" data-testid="new-dream-button">
            <PlusCircle className="w-5 h-5 mr-2" />
            Record New Dream
          </Button>
        </Link>
        <Link to="/dreams">
          <Button variant="outline" className="rounded-full px-6 py-3 border-white/20 text-white hover:bg-white/10 h-auto" data-testid="view-all-dreams-button">
            <BookOpen className="w-5 h-5 mr-2" />
            View All Dreams
          </Button>
        </Link>
        <Link to="/calendar">
          <Button variant="outline" className="rounded-full px-6 py-3 border-white/20 text-white hover:bg-white/10 h-auto" data-testid="calendar-button">
            <Calendar className="w-5 h-5 mr-2" />
            Calendar
          </Button>
        </Link>
        <Link to="/patterns">
          <Button variant="outline" className="rounded-full px-6 py-3 border-white/20 text-white hover:bg-white/10 h-auto" data-testid="patterns-button">
            <Brain className="w-5 h-5 mr-2" />
            Patterns
          </Button>
        </Link>
      </div>

      {/* Recent Dreams */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl text-white">Recent Dreams</h2>
          {recentDreams.length > 0 && (
            <Link to="/dreams" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {recentDreams.length > 0 ? (
          <div className="grid gap-4">
            {recentDreams.map((dream) => (
              <Link key={dream.id} to={`/dreams/${dream.id}`}>
                <div className="dream-card group glass rounded-2xl p-6" data-testid={`dream-card-${dream.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">
                          {format(new Date(dream.date), 'MMM d, yyyy')}
                        </span>
                        {dream.ai_insight && (
                          <span className="flex items-center gap-1 text-purple-400 text-xs">
                            <Sparkles className="w-3 h-3" /> Interpreted
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-xl text-white mb-2 group-hover:text-purple-300 transition-colors">
                        {dream.title}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-2">{dream.description}</p>
                      {dream.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {dream.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="tag">{tag}</span>
                          ))}
                          {dream.tags.length > 3 && (
                            <span className="text-slate-500 text-xs">+{dream.tags.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="font-serif text-xl text-white mb-2">No dreams yet</h3>
            <p className="text-slate-400 mb-6">Start recording your dreams to unlock insights</p>
            <Link to="/dreams/new">
              <Button className="rounded-full px-6 bg-white text-black hover:bg-slate-200 btn-glow" data-testid="empty-state-new-dream">
                <PlusCircle className="w-4 h-4 mr-2" />
                Record Your First Dream
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Top Tags */}
      {stats?.top_tags?.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl text-white mb-4">Top Tags</h2>
          <div className="flex flex-wrap gap-3" data-testid="top-tags">
            {stats.top_tags.map((tag, i) => (
              <div key={i} className="glass rounded-full px-4 py-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-white">{tag.name}</span>
                <span className="text-slate-500 text-sm">({tag.count})</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
