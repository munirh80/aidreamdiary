import { create } from 'zustand';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../config/api';
import { useAuthStore } from './authStore';

export interface Dream {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  themes: string[];
  is_lucid: boolean;
  is_public: boolean;
  ai_insight: string | null;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  total_dreams: number;
  lucid_dreams: number;
  dreams_this_week: number;
  top_tags: { name: string; count: number }[];
  top_themes: { name: string; count: number }[];
  current_streak: number;
  longest_streak: number;
  streak_freezes: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
  target: number;
}

interface CalendarData {
  dreams_by_date: { [date: string]: { id: string; title: string; themes: string[] }[] };
}

interface PatternData {
  total_analyzed: number;
  recurring_symbols: { symbol: string; count: number; percentage: number }[];
  theme_trends: { month: string; themes: { name: string; count: number }[] }[];
  common_words: { word: string; count: number }[];
  monthly_activity: { month: string; count: number }[];
}

interface DreamState {
  dreams: Dream[];
  stats: Stats | null;
  achievements: Achievement[];
  calendarData: CalendarData | null;
  patterns: PatternData | null;
  isLoading: boolean;
  error: string | null;
  
  fetchDreams: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchCalendar: (year: number, month: number) => Promise<void>;
  fetchPatterns: () => Promise<void>;
  createDream: (dream: Partial<Dream>) => Promise<Dream | null>;
  updateDream: (id: string, dream: Partial<Dream>) => Promise<Dream | null>;
  deleteDream: (id: string) => Promise<boolean>;
  generateInsight: (id: string) => Promise<string | null>;
  clearError: () => void;
}

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return { Authorization: `Bearer ${token}` };
};

export const useDreamStore = create<DreamState>((set, get) => ({
  dreams: [],
  stats: null,
  achievements: [],
  calendarData: null,
  patterns: null,
  isLoading: false,
  error: null,

  fetchDreams: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.dreams}`, {
        headers: getAuthHeader(),
      });
      set({ dreams: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: 'Failed to fetch dreams', isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.stats}`, {
        headers: getAuthHeader(),
      });
      set({ stats: response.data });
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  },

  fetchAchievements: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.achievements}`, {
        headers: getAuthHeader(),
      });
      // Backend returns array directly
      set({ achievements: response.data || [] });
    } catch (error: any) {
      console.error('Failed to fetch achievements:', error);
    }
  },

  fetchCalendar: async (year: number, month: number) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${ENDPOINTS.calendar(year, month)}`,
        { headers: getAuthHeader() }
      );
      set({ calendarData: response.data });
    } catch (error: any) {
      console.error('Failed to fetch calendar:', error);
    }
  },

  fetchPatterns: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.patterns}`, {
        headers: getAuthHeader(),
      });
      set({ patterns: response.data });
    } catch (error: any) {
      console.error('Failed to fetch patterns:', error);
    }
  },

  createDream: async (dream: Partial<Dream>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_BASE_URL}${ENDPOINTS.dreams}`,
        dream,
        { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } }
      );
      const newDream = response.data;
      set((state) => ({
        dreams: [newDream, ...state.dreams],
        isLoading: false,
      }));
      return newDream;
    } catch (error: any) {
      set({ error: 'Failed to create dream', isLoading: false });
      return null;
    }
  },

  updateDream: async (id: string, dream: Partial<Dream>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_BASE_URL}${ENDPOINTS.dreamById(id)}`,
        dream,
        { headers: { ...getAuthHeader(), 'Content-Type': 'application/json' } }
      );
      const updatedDream = response.data;
      set((state) => ({
        dreams: state.dreams.map((d) => (d.id === id ? updatedDream : d)),
        isLoading: false,
      }));
      return updatedDream;
    } catch (error: any) {
      set({ error: 'Failed to update dream', isLoading: false });
      return null;
    }
  },

  deleteDream: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_BASE_URL}${ENDPOINTS.dreamById(id)}`, {
        headers: getAuthHeader(),
      });
      set((state) => ({
        dreams: state.dreams.filter((d) => d.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: 'Failed to delete dream', isLoading: false });
      return false;
    }
  },

  generateInsight: async (id: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${ENDPOINTS.dreamInsight(id)}`,
        {},
        { headers: getAuthHeader() }
      );
      // Backend returns full dream object with ai_insight field
      const updatedDream = response.data;
      const insight = updatedDream.ai_insight;
      set((state) => ({
        dreams: state.dreams.map((d) =>
          d.id === id ? { ...d, ai_insight: insight } : d
        ),
      }));
      return insight;
    } catch (error: any) {
      console.error('Failed to generate insight:', error);
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
