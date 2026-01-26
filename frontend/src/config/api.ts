// API Configuration for Dream Vault
// Use the backend URL from environment or default to the current environment
const getApiBaseUrl = () => {
  // In production builds, use the environment's backend URL
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_BACKEND_URL) {
    return `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;
  }
  // Fallback for web/development
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const ENDPOINTS = {
  // Auth
  register: '/auth/register',
  login: '/auth/login',
  
  // Dreams
  dreams: '/dreams',
  dreamById: (id: string) => `/dreams/${id}`,
  dreamInsight: (id: string) => `/dreams/${id}/insight`,
  calendar: (year: number, month: number) => `/dreams/calendar/${year}/${month}`,
  
  // Stats & Analysis
  stats: '/stats',
  achievements: '/achievements',
  patterns: '/analysis/patterns',
};

export const THEMES = [
  'Flying',
  'Falling',
  'Water',
  'Chase',
  'Death',
  'Teeth',
  'Naked',
  'School',
  'Lost',
  'Animals',
  'Supernatural',
  'Travel',
  'Family',
  'Romance',
  'Work',
  'Other',
];
