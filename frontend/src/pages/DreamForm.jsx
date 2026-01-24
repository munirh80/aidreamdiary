import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { Save, X, Plus, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { CalendarIcon } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const SUGGESTED_THEMES = [
  'Flying', 'Falling', 'Being Chased', 'Water', 'Death', 'Being Lost',
  'Being Late', 'Teeth Falling Out', 'Being Naked', 'Meeting Someone',
  'Animals', 'School/Work', 'Travel', 'Family', 'Supernatural'
];

const DreamForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetchingDream, setFetchingDream] = useState(isEditing);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [tags, setTags] = useState([]);
  const [themes, setThemes] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isLucid, setIsLucid] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchDream = async () => {
        try {
          const response = await axios.get(`${API_URL}/dreams/${id}`, getAuthHeaders());
          const dream = response.data;
          setTitle(dream.title);
          setDescription(dream.description);
          setDate(new Date(dream.date));
          setTags(dream.tags || []);
          setThemes(dream.themes || []);
          setIsLucid(dream.is_lucid || false);
        } catch (error) {
          toast.error('Failed to load dream');
          navigate('/dreams');
        } finally {
          setFetchingDream(false);
        }
      };
      fetchDream();
    }
  }, [id, isEditing, getAuthHeaders, navigate]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleToggleTheme = (theme) => {
    if (themes.includes(theme)) {
      setThemes(themes.filter(t => t !== theme));
    } else {
      setThemes([...themes, theme]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const dreamData = {
      title: title.trim(),
      description: description.trim(),
      date: format(date, 'yyyy-MM-dd'),
      tags,
      themes,
      is_lucid: isLucid
    };

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/dreams/${id}`, dreamData, getAuthHeaders());
        toast.success('Dream updated successfully');
      } else {
        await axios.post(`${API_URL}/dreams`, dreamData, getAuthHeaders());
        toast.success('Dream recorded successfully');
      }
      navigate('/dreams');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save dream');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingDream) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in" data-testid="dream-form">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="font-serif text-3xl md:text-4xl text-white">
          {isEditing ? 'Edit Dream' : 'Record a Dream'}
        </h1>
        <p className="text-slate-400 mt-2">Capture the details while they're fresh</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Date Picker */}
        <div className="space-y-2">
          <Label className="text-slate-300">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-slate-950/50 border-white/10 hover:bg-slate-900/50 rounded-xl h-12 text-white"
                data-testid="date-picker-trigger"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                {format(date, 'EEEE, MMMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-900 border-white/10" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                className="bg-slate-900"
                data-testid="calendar"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-slate-300">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your dream a title..."
            required
            className="bg-slate-950/50 border-white/10 focus:border-purple-500/50 rounded-xl h-12 text-white placeholder:text-slate-600"
            data-testid="title-input"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-300">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your dream in as much detail as you can remember..."
            required
            rows={8}
            className="bg-slate-950/50 border-white/10 focus:border-purple-500/50 rounded-xl text-white placeholder:text-slate-600 resize-none"
            data-testid="description-input"
          />
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label className="text-slate-300">Tags</Label>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="bg-slate-950/50 border-white/10 focus:border-purple-500/50 rounded-xl h-10 text-white placeholder:text-slate-600"
              data-testid="tag-input"
            />
            <Button
              type="button"
              onClick={handleAddTag}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 rounded-xl"
              data-testid="add-tag-button"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2" data-testid="tags-list">
              {tags.map((tag, i) => (
                <span key={i} className="tag flex items-center gap-1 pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-white"
                    data-testid={`remove-tag-${tag}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Themes */}
        <div className="space-y-3">
          <Label className="text-slate-300">Recurring Themes</Label>
          <div className="flex flex-wrap gap-2" data-testid="themes-list">
            {SUGGESTED_THEMES.map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => handleToggleTheme(theme)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                  themes.includes(theme)
                    ? 'bg-cyan-500/30 border-cyan-500/50 text-cyan-300 border'
                    : 'bg-slate-800/50 border-white/10 text-slate-400 border hover:border-white/20 hover:text-white'
                }`}
                data-testid={`theme-${theme.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-full h-12 bg-white text-black font-semibold hover:bg-slate-200 transition-all duration-300 btn-glow"
            data-testid="save-dream-button"
          >
            {loading ? (
              'Saving...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Update Dream' : 'Save Dream'}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="rounded-full h-12 px-8 border-white/20 text-white hover:bg-white/10"
            data-testid="cancel-button"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DreamForm;
