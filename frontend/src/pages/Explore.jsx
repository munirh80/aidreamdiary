import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Moon, Sparkles, Globe, User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in" data-testid="explore-page">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-white mb-2">
          <Globe className="w-8 h-8 inline mr-3 text-cyan-400" />
          Explore Dreams
        </h1>
        <p className="text-slate-400">Discover dreams shared by the community</p>
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
            <Link key={dream.id} to={`/shared/${dream.id.slice(0, 8)}`}>
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
          <p className="text-slate-400">Be the first to share a dream with the community!</p>
        </div>
      )}
    </div>
  );
};

export default Explore;
