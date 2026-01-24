import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Bell, Shield, Snowflake, Clock, Save, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import NotificationService from '@/services/NotificationService';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Settings = () => {
  const { user, getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    reminder_enabled: false,
    reminder_time: '08:00',
    streak_freeze_count: 0,
    streak_freezes_used: 0
  });
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/settings`, getAuthHeaders());
        setSettings(response.data);
        
        // Check notification permission
        setNotificationPermission(NotificationService.getPermissionStatus());
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [getAuthHeaders]);

  const handleReminderToggle = async (checked) => {
    if (checked) {
      // Request notification permission
      const granted = await NotificationService.requestPermission();
      if (!granted) {
        toast.error('Please allow notifications in your browser settings');
        return;
      }
      setNotificationPermission('granted');
      
      // Schedule reminder
      NotificationService.scheduleReminder(settings.reminder_time);
      toast.success('Reminders enabled! You\'ll be notified daily.');
    }
    
    setSettings(prev => ({ ...prev, reminder_enabled: checked }));
  };

  const handleTimeChange = (value) => {
    setSettings(prev => ({ ...prev, reminder_time: value }));
    if (settings.reminder_enabled) {
      NotificationService.scheduleReminder(value);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/settings`, {
        reminder_enabled: settings.reminder_enabled,
        reminder_time: settings.reminder_time
      }, getAuthHeaders());
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleUseFreeze = async () => {
    if (settings.streak_freeze_count <= 0) {
      toast.error('No streak freezes available');
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/settings/use-freeze`, {}, getAuthHeaders());
      setSettings(prev => ({
        ...prev,
        streak_freeze_count: response.data.remaining_freezes,
        streak_freezes_used: prev.streak_freezes_used + 1
      }));
      toast.success('Streak freeze activated! Your streak is protected for today.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to use freeze');
    }
  };

  const handleEarnFreeze = async () => {
    try {
      const response = await axios.post(`${API_URL}/settings/add-freeze`, {}, getAuthHeaders());
      setSettings(prev => ({
        ...prev,
        streak_freeze_count: response.data.total_freezes
      }));
      toast.success('You earned a streak freeze!');
    } catch (error) {
      toast.error('Failed to add freeze');
    }
  };

  const timeOptions = [];
  for (let h = 5; h <= 23; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in" data-testid="settings-page">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-white mb-2">Settings</h1>
        <p className="text-slate-400">Customize your Dream Vault experience</p>
      </div>

      {/* Dream Reminders */}
      <section className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-white">Dream Reminders</h2>
            <p className="text-sm text-slate-400">Get reminded to log your dreams</p>
          </div>
        </div>

        <div className="space-y-6">
          {notificationPermission === 'denied' && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">
                Notifications are blocked. Please enable them in your browser settings.
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reminder-toggle" className="text-white font-medium cursor-pointer">Enable Reminders</Label>
              <p className="text-xs text-slate-500">Receive browser notifications</p>
            </div>
            <Switch
              id="reminder-toggle"
              checked={settings.reminder_enabled}
              onCheckedChange={handleReminderToggle}
              disabled={notificationPermission === 'denied'}
              data-testid="reminder-toggle"
            />
          </div>

          {settings.reminder_enabled && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <Label className="text-slate-300">Reminder Time</Label>
              </div>
              <Select
                value={settings.reminder_time}
                onValueChange={handleTimeChange}
              >
                <SelectTrigger className="w-32 bg-slate-800 border-white/10 text-white" data-testid="reminder-time-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 max-h-60">
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time} className="text-white">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-white text-black hover:bg-slate-200"
            data-testid="save-settings-button"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </section>

      {/* Streak Freeze */}
      <section className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Snowflake className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-white">Streak Freeze</h2>
            <p className="text-sm text-slate-400">Protect your streak on busy days</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="font-serif text-3xl text-cyan-400" data-testid="freeze-count">
                {settings.streak_freeze_count}
              </div>
              <div className="text-xs text-slate-500 mt-1">Available Freezes</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="font-serif text-3xl text-slate-400">
                {settings.streak_freezes_used}
              </div>
              <div className="text-xs text-slate-500 mt-1">Total Used</div>
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-xl p-4">
            <h3 className="text-white font-medium mb-2">How it works</h3>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• Use a freeze to skip a day without breaking your streak</li>
              <li>• Earn freezes by reaching streak milestones (7, 14, 30 days)</li>
              <li>• Freezes can only protect one day at a time</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleUseFreeze}
              disabled={settings.streak_freeze_count <= 0}
              variant="outline"
              className="flex-1 rounded-xl border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-50"
              data-testid="use-freeze-button"
            >
              <Snowflake className="w-4 h-4 mr-2" />
              Use Freeze
            </Button>
            <Button
              onClick={handleEarnFreeze}
              variant="outline"
              className="flex-1 rounded-xl border-white/20 text-white hover:bg-white/10"
              data-testid="earn-freeze-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Earn Freeze
            </Button>
          </div>
        </div>
      </section>

      {/* Account Info */}
      <section className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-white">Account</h2>
            <p className="text-sm text-slate-400">Your account information</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-slate-400">Name</span>
            <span className="text-white">{user?.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-slate-400">Email</span>
            <span className="text-white">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-400">Member Since</span>
            <span className="text-white">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
