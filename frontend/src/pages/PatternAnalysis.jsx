import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { TrendingUp, Brain, MessageCircle, BarChart3, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const PatternAnalysis = () => {
  const { getAuthHeaders } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await axios.get(`${API_URL}/analysis/patterns`, getAuthHeaders());
        setAnalysis(response.data);
      } catch (error) {
        console.error('Error fetching analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [getAuthHeaders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!analysis || analysis.total_analyzed === 0) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in" data-testid="pattern-analysis">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-white mb-2">Dream Patterns</h1>
          <p className="text-slate-400">Discover recurring symbols and themes</p>
        </div>
        <div className="glass rounded-2xl p-12 text-center">
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="font-serif text-xl text-white mb-2">Not enough dreams yet</h3>
          <p className="text-slate-400">Record more dreams to unlock pattern analysis</p>
        </div>
      </div>
    );
  }

  const symbolIcons = {
    water: '🌊', flying: '🦅', falling: '⬇️', chase: '🏃', death: '💀',
    teeth: '🦷', animals: '🐾', house: '🏠', vehicle: '🚗', people: '👥'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in" data-testid="pattern-analysis">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-white mb-2">Dream Patterns</h1>
        <p className="text-slate-400">Analysis of {analysis.total_analyzed} dreams</p>
      </div>

      {/* Recurring Symbols */}
      <section className="glass rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-white">Recurring Symbols</h2>
            <p className="text-sm text-slate-400">Common themes detected in your dreams</p>
          </div>
        </div>

        {analysis.recurring_symbols.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.recurring_symbols.map((item, i) => (
              <div key={item.symbol} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30" data-testid={`symbol-${item.symbol}`}>
                <span className="text-2xl">{symbolIcons[item.symbol] || '✨'}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white capitalize font-medium">{item.symbol}</span>
                    <span className="text-slate-400 text-sm">{item.count} dreams ({item.percentage}%)</span>
                  </div>
                  <Progress value={item.percentage} className="h-2 bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">No recurring symbols detected yet</p>
        )}
      </section>

      {/* Common Words */}
      <section className="glass rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-white">Word Cloud</h2>
            <p className="text-sm text-slate-400">Most frequent words in your dreams</p>
          </div>
        </div>

        {analysis.common_words.length > 0 ? (
          <div className="flex flex-wrap gap-3" data-testid="word-cloud">
            {analysis.common_words.map((item, i) => {
              const size = Math.max(0.8, Math.min(1.5, item.count / 3));
              return (
                <span
                  key={item.word}
                  className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/10 text-slate-300 transition-all hover:border-cyan-500/30 hover:text-cyan-300"
                  style={{ fontSize: `${size}rem` }}
                >
                  {item.word}
                  <span className="text-slate-500 text-xs ml-1">({item.count})</span>
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">Not enough data for word analysis</p>
        )}
      </section>

      {/* Monthly Activity */}
      <section className="glass rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-white">Monthly Activity</h2>
            <p className="text-sm text-slate-400">Your dream journaling over time</p>
          </div>
        </div>

        {analysis.monthly_activity.length > 0 ? (
          <div className="space-y-3" data-testid="monthly-activity">
            {analysis.monthly_activity.map(item => {
              const maxCount = Math.max(...analysis.monthly_activity.map(m => m.count));
              const percentage = (item.count / maxCount) * 100;
              const [year, month] = item.month.split('-');
              const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              
              return (
                <div key={item.month} className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 w-24">{monthName}</span>
                  <div className="flex-1 h-8 bg-slate-800/30 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500/30 to-emerald-500/60 flex items-center px-3"
                      style={{ width: `${Math.max(percentage, 10)}%` }}
                    >
                      <span className="text-sm text-white font-medium">{item.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">No activity data yet</p>
        )}
      </section>

      {/* Theme Evolution */}
      {analysis.theme_trends.length > 0 && (
        <section className="glass rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-white">Theme Evolution</h2>
              <p className="text-sm text-slate-400">How your dream themes have changed</p>
            </div>
          </div>

          <div className="space-y-4" data-testid="theme-trends">
            {analysis.theme_trends.map(item => {
              const [year, month] = item.month.split('-');
              const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              
              return (
                <div key={item.month} className="p-4 rounded-xl bg-slate-800/30">
                  <div className="text-sm text-slate-400 mb-2">{monthName}</div>
                  <div className="flex flex-wrap gap-2">
                    {item.themes.map(theme => (
                      <span key={theme.name} className="theme-tag">
                        {theme.name} ({theme.count})
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default PatternAnalysis;
