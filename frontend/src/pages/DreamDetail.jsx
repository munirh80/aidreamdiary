import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Trash2, Sparkles, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const DreamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDream = async () => {
      try {
        const response = await axios.get(`${API_URL}/dreams/${id}`, getAuthHeaders());
        setDream(response.data);
      } catch (error) {
        toast.error('Dream not found');
        navigate('/dreams');
      } finally {
        setLoading(false);
      }
    };

    fetchDream();
  }, [id, getAuthHeaders, navigate]);

  const handleGenerateInsight = async () => {
    setGeneratingInsight(true);
    try {
      const response = await axios.post(
        `${API_URL}/dreams/${id}/insight`,
        {},
        getAuthHeaders()
      );
      setDream(prev => ({ ...prev, ai_insight: response.data.insight }));
      toast.success('Dream interpretation generated!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate insight');
    } finally {
      setGeneratingInsight(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/dreams/${id}`, getAuthHeaders());
      toast.success('Dream deleted');
      navigate('/dreams');
    } catch (error) {
      toast.error('Failed to delete dream');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!dream) return null;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in" data-testid="dream-detail">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dreams')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Journal
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="font-mono text-sm text-slate-500 uppercase tracking-wider">
                {format(new Date(dream.date), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-white" data-testid="dream-title">
              {dream.title}
            </h1>
          </div>

          <div className="flex gap-2">
            <Link to={`/dreams/${id}/edit`}>
              <Button
                variant="outline"
                size="icon"
                className="border-white/20 text-white hover:bg-white/10 rounded-xl"
                data-testid="edit-button"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl"
                  data-testid="delete-button"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900 border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete this dream?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    This action cannot be undone. This dream will be permanently removed from your journal.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10" data-testid="cancel-delete">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-500 text-white hover:bg-red-600"
                    data-testid="confirm-delete"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Tags & Themes */}
      {(dream.tags?.length > 0 || dream.themes?.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-8" data-testid="dream-tags">
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
        <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap" data-testid="dream-description">
          {dream.description}
        </p>
      </div>

      {/* AI Insight Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Dream Interpretation
          </h2>
          {!dream.ai_insight && (
            <Button
              onClick={handleGenerateInsight}
              disabled={generatingInsight}
              className="rounded-full px-6 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
              data-testid="generate-insight-button"
            >
              {generatingInsight ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Interpreting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Insight
                </>
              )}
            </Button>
          )}
        </div>

        {dream.ai_insight ? (
          <div className="insight-box p-6 md:p-8" data-testid="ai-insight">
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {dream.ai_insight}
            </p>
            <div className="mt-6 pt-4 border-t border-white/10">
              <Button
                onClick={handleGenerateInsight}
                disabled={generatingInsight}
                variant="ghost"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                data-testid="regenerate-insight-button"
              >
                {generatingInsight ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate New Interpretation
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="font-serif text-xl text-white mb-2">Unlock Dream Insights</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Let AI analyze your dream and reveal hidden meanings, symbols, and emotional themes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DreamDetail;
