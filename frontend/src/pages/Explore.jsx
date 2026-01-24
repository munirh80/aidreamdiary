import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Moon, Sparkles, Globe, User, Search, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Explore = () => {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPublicDreams = async () => {
      try {
        const response = await axios.get(`${API_URL}/public/dreams?limit=50`);
        setDreams(response.data);
      } catch (error) {
        console.error('Error fetching public dreams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicDreams();
  }, []);

  const filteredDreams = dreams.filter(dream => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      dream.title.toLowerCase().includes(query) ||
      dream.description.toLowerCase().includes(query) ||
      dream.author_name.toLowerCase().includes(query) ||
      dream.tags?.some(tag => tag.toLowerCase().includes(query)) ||
      dream.themes?.some(theme => theme.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] starfield">
      <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8 animate-fade-in" data-testid="explore-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                <Moon className="w-6 h-6" />
                <span className="font-serif text-xl">Dream Vault</span>
              </Link>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-white mb-2">
              <Globe className="w-8 h-8 inline mr-3 text-cyan-400" />
              Explore Dreams
            </h1>
            <p className="text-slate-400">Discover dreams shared by the community</p>
          </div>
          <Link to="/login">
            <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10">
              Sign In
            </Button>
          </Link>
        </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <Input
          type="text"
          placeholder="Search public dreams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-slate-950/50 border-white/10 focus:border-purple-500/50 rounded-xl h-12 text-white placeholder:text-slate-600"
          data-testid="explore-search"
        />
      </div>

      {/* Dreams Grid */}
      {filteredDreams.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredDreams.map(dream => (
            <Link key={dream.id} to={`/shared/${dream.share_id}`}>
              <div className="dream-card group glass rounded-2xl p-6 h-full" data-testid={`explore-dream-${dream.id}`}>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-400">{dream.author_name}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-500">
                    {format(new Date(dream.date), 'MMM d, yyyy')}
                  </span>
                </div>
                
                <h3 className="font-serif text-lg text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {dream.title}
                </h3>
                
                <p className="text-slate-400 text-sm line-clamp-3 mb-3">
                  {dream.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {dream.is_lucid && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300">
                      ✨ Lucid
                    </span>
                  )}
                  {dream.ai_insight && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      Interpreted
                    </span>
                  )}
                  {dream.themes?.slice(0, 2).map((theme, i) => (
                    <span key={i} className="theme-tag text-xs">{theme}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : dreams.length > 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-serif text-xl text-white mb-2">No dreams found</h3>
          <p className="text-slate-400">Try a different search term</p>
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <Moon className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
          <h3 className="font-serif text-xl text-white mb-2">No public dreams yet</h3>
          <p className="text-slate-400 mb-6">Be the first to share a dream with the community!</p>
          <Link to="/register">
            <Button className="rounded-full px-6 bg-white text-black hover:bg-slate-200 btn-glow">
              Join Dream Vault
            </Button>
          </Link>
        </div>
      )}
      </div>
    </div>
  );
};

export default Explore;
