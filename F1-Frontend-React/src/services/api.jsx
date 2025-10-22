// src/services/api.jsx
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper per gestire le risposte
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Funzione generica per le fetch
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(url, config);
  return handleResponse(response);
};

// Funzioni specifiche per ogni endpoint
export const api = {
  // Drivers
  getDrivers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/api/drivers/?${query}`);
  },

  getDriverByNumber: (number) => {
    return fetchAPI(`/api/drivers/${number}/`);
  },

  // Teams
  getTeams: (ordering = '-points') => {
    return fetchAPI(`/api/teams/?ordering=${ordering}`);
  },

  // Races
  getRaces: (year = 2025) => {
    return fetchAPI(`/api/races/?year=${year}`);
  },

  getNextRace: () => {
    return fetchAPI('/api/races/next/');
  },

  getRaceById: (id) => {
    return fetchAPI(`/api/races/${id}/`);
  },

  // Sessions
  getSessions: (weekend) => {
    return fetchAPI(`/api/sessions/?weekend=${weekend}`);
  },

  // Results
  getResults: (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return fetchAPI(`/api/results/?${query}`);
  },

  getQualifyingResults: (weekend) => {
    return fetchAPI(`/api/results/qualify/?weekend=${weekend}`);
  },

  getRaceResults: (weekend) => {
    return fetchAPI(`/api/results/race/?weekend=${weekend}`);
  },
};

export default api;