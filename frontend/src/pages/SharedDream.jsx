import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Moon, Sparkles, Calendar, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const SharedDream = () => {
  const { shareId } = useParams();
  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDream = async () => {
      try {
        const response = await axios.get(`${API_URL}/public/dream/${shareId}`);
        setDream(response.data);
      } catch (err) {
        setError('Dream not found or no longer public');
      } finally {
        setLoading(false);
      }
    };

    fetchDream();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] starfield flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-12 text-center max-w-md">
          <Moon className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
          <h1 className="font-serif text-2xl text-white mb-2">Dream Not Found</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link to="/">
            <Button className="rounded-full px-6 bg-white text-black hover:bg-slate-200">
              Go to Dreamscape
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] starfield" data-testid="shared-dream">
      <div className="max-w-3xl mx-auto p-6 md:p-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
            <Moon className="w-6 h-6" />
            <span className="font-serif text-xl">Dreamscape</span>
          </Link>
        </div>

        {/* Dream Content */}
        <article className="animate-fade-in">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="font-mono text-sm text-slate-500 uppercase tracking-wider">
                {format(new Date(dream.date), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-white mb-4">
              {dream.title}
            </h1>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <User className="w-4 h-4" />
              <span>Shared by {dream.author_name}</span>
            </div>
          </div>

          {/* Tags */}
          {(dream.tags?.length > 0 || dream.themes?.length > 0 || dream.is_lucid) && (
            <div className="flex flex-wrap gap-2 mb-8">
              {dream.is_lucid && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/30 border border-purple-500/50 text-purple-300">
                  ✨ Lucid Dream
                </span>
              )}
              {dream.tags?.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
              {dream.themes?.map((theme, i) => (
                <span key={i} className="theme-tag">{theme}</span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="glass rounded-2xl p-6 md:p-8 mb-8">
            <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
              {dream.description}
            </p>
          </div>

          {/* AI Insight */}
          {dream.ai_insight && (
            <div className="insight-box p-6 md:p-8">
              <h2 className="font-serif text-xl text-white flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Dream Interpretation
              </h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {dream.ai_insight}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-4">Start your own dream journal</p>
            <Link to="/register">
              <Button className="rounded-full px-8 py-3 bg-white text-black font-semibold hover:bg-slate-200 btn-glow">
                Join Dreamscape
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
};

export default SharedDream;
