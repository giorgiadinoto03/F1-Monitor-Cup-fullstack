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

export const api = {
  // Drivers
  getDrivers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/drivers/?${query}`);
    return handleResponse(res);
  },

  getDriverByNumber: async (number) => {
    const res = await fetch(`${API_URL}/api/drivers/?number=${number}`);
    const data = await handleResponse(res);
    return data.results[0];
  },

  // Teams
  getTeams: async (ordering = '-points') => {
    const res = await fetch(`${API_URL}/api/teams/?ordering=${ordering}`);
    return handleResponse(res);
  },

  // Races
  getRaces: async (year = 2025) => {
    const res = await fetch(`${API_URL}/api/races/?year=${year}`);
    return handleResponse(res);
  },

  getNextRace: async () => {
    const res = await fetch(`${API_URL}/api/races/next/`);
    return handleResponse(res);
  },

  // Sessions
  getSessions: async (weekend) => {
    const res = await fetch(`${API_URL}/api/sessions/?weekend=${weekend}`);
    return handleResponse(res);
  },

  // Results
  getResults: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/api/results/?${query}`);
    return handleResponse(res);
  },

  getQualifyingResults: async (weekend) => {
    const res = await fetch(`${API_URL}/api/results/qualify/?weekend=${weekend}`);
    return handleResponse(res);
  },

  getRaceResults: async (weekend) => {
    const res = await fetch(`${API_URL}/api/results/race/?weekend=${weekend}`);
    return handleResponse(res);
  },
};