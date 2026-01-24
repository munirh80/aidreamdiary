import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { PlusCircle, Search, Sparkles, BookOpen, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const DreamList = () => {
  const { getAuthHeaders } = useAuth();
  const [dreams, setDreams] = useState([]);
  const [filteredDreams, setFilteredDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [allTags, setAllTags] = useState([]);

  const handleExportAll = () => {
    if (dreams.length === 0) {
      toast.error('No dreams to export');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dream Journal Export</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Manrope:wght@400;500&display=swap');
          body { 
            font-family: 'Manrope', sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px;
            color: #1e293b;
          }
          h1 { 
            font-family: 'Cormorant Garamond', serif; 
            font-size: 2.5rem;
            text-align: center;
            margin-bottom: 0.5rem;
          }
          .subtitle {
            text-align: center;
            color: #64748b;
            margin-bottom: 3rem;
          }
          .dream { 
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #e2e8f0;
            page-break-inside: avoid;
          }
          .dream-title { 
            font-family: 'Cormorant Garamond', serif; 
            font-size: 1.5rem;
            margin-bottom: 0.25rem;
          }
          .dream-date { 
            color: #64748b; 
            font-size: 0.85rem;
            margin-bottom: 1rem;
          }
          .tags { 
            margin-bottom: 1rem;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }
          .tag { 
            background: #f1f5f9; 
            padding: 2px 10px; 
            border-radius: 999px;
            font-size: 0.75rem;
          }
          .theme { background: #ecfeff; color: #0891b2; }
          .description { 
            white-space: pre-wrap;
            line-height: 1.6;
          }
          .insight {
            margin-top: 1rem;
            padding: 1rem;
            background: #faf5ff;
            border-radius: 8px;
            border-left: 3px solid #a855f7;
            font-size: 0.9rem;
          }
          .footer {
            margin-top: 2rem;
            text-align: center;
            color: #94a3b8;
            font-size: 0.8rem;
          }
        </style>
      </head>
      <body>
        <h1>Dream Journal</h1>
        <div class="subtitle">${dreams.length} dreams • Exported ${format(new Date(), 'MMMM d, yyyy')}</div>
        
        ${dreams.map(dream => `
          <div class="dream">
            <div class="dream-title">${dream.title}</div>
            <div class="dream-date">${format(new Date(dream.date), 'EEEE, MMMM d, yyyy')}</div>
            ${(dream.tags?.length > 0 || dream.themes?.length > 0) ? `
              <div class="tags">
                ${dream.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
                ${dream.themes?.map(theme => `<span class="tag theme">${theme}</span>`).join('') || ''}
              </div>
            ` : ''}
            <div class="description">${dream.description}</div>
            ${dream.ai_insight ? `<div class="insight"><strong>AI Insight:</strong><br>${dream.ai_insight.replace(/\n/g, '<br>')}</div>` : ''}
          </div>
        `).join('')}
        
        <div class="footer">Dream Vault - Dream Journal App</div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
    
    toast.success('Journal export ready!');
  };

  useEffect(() => {
    const fetchDreams = async () => {
      try {
        const response = await axios.get(`${API_URL}/dreams`, getAuthHeaders());
        setDreams(response.data);
        setFilteredDreams(response.data);
        
        // Extract unique tags
        const tags = new Set();
        response.data.forEach(dream => {
          dream.tags?.forEach(tag => tags.add(tag));
        });
        setAllTags(Array.from(tags));
      } catch (error) {
        console.error('Error fetching dreams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDreams();
  }, [getAuthHeaders]);

  useEffect(() => {
    let filtered = dreams;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        dream =>
          dream.title.toLowerCase().includes(query) ||
          dream.description.toLowerCase().includes(query) ||
          dream.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          dream.themes?.some(theme => theme.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (filterTag && filterTag !== 'all') {
      filtered = filtered.filter(dream => dream.tags?.includes(filterTag));
    }

    setFilteredDreams(filtered);
  }, [searchQuery, filterTag, dreams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in" data-testid="dream-list">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-white mb-2">Dream Journal</h1>
          <p className="text-slate-400">{dreams.length} dreams recorded</p>
        </div>
        <div className="flex gap-3">
          {dreams.length > 0 && (
            <Button
              variant="outline"
              onClick={handleExportAll}
              className="rounded-full px-6 border-white/20 text-white hover:bg-white/10"
              data-testid="export-all-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          )}
          <Link to="/dreams/new">
            <Button className="rounded-full px-6 bg-white text-black font-semibold hover:bg-slate-200 btn-glow" data-testid="new-dream-button">
              <PlusCircle className="w-5 h-5 mr-2" />
              New Dream
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <Input
            type="text"
            placeholder="Search dreams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-slate-950/50 border-white/10 focus:border-purple-500/50 rounded-xl h-12 text-white placeholder:text-slate-600"
            data-testid="search-input"
          />
        </div>
        {allTags.length > 0 && (
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="w-full sm:w-48 bg-slate-950/50 border-white/10 rounded-xl h-12 text-white" data-testid="tag-filter">
              <Filter className="w-4 h-4 mr-2 text-slate-500" />
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10">
              <SelectItem value="all" className="text-white">All Tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag} className="text-white">{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Dreams List */}
      {filteredDreams.length > 0 ? (
        <div className="space-y-4">
          {filteredDreams.map((dream) => (
            <Link key={dream.id} to={`/dreams/${dream.id}`}>
              <div className="dream-card group glass rounded-2xl p-6 mb-4" data-testid={`dream-item-${dream.id}`}>
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 items-center justify-center flex-shrink-0">
                    <BookOpen className="w-7 h-7 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">
                        {format(new Date(dream.date), 'EEEE, MMM d, yyyy')}
                      </span>
                      {dream.ai_insight && (
                        <span className="flex items-center gap-1 text-purple-400 text-xs bg-purple-500/10 px-2 py-1 rounded-full">
                          <Sparkles className="w-3 h-3" /> Insight
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-xl text-white mb-2 group-hover:text-purple-300 transition-colors truncate">
                      {dream.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-3">{dream.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {dream.tags?.map((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                      ))}
                      {dream.themes?.map((theme, i) => (
                        <span key={i} className="theme-tag">{theme}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : dreams.length > 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="font-serif text-xl text-white mb-2">No dreams found</h3>
          <p className="text-slate-400">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="font-serif text-xl text-white mb-2">Your journal awaits</h3>
          <p className="text-slate-400 mb-6">Start by recording your first dream</p>
          <Link to="/dreams/new">
            <Button className="rounded-full px-6 bg-white text-black hover:bg-slate-200 btn-glow" data-testid="empty-new-dream">
              <PlusCircle className="w-4 h-4 mr-2" />
              Record Dream
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DreamList;
