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

export const api = {

  // Drivers con filtri avanzati
  getDrivers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/api/drivers/?${query}`);
  },

  // Filtri specifici per classifica piloti
  getDriversByPoints: () => {
    return fetchAPI('/api/drivers/?ordering=-points');
  },

  getDriversByTeam: (teamName) => {
    return fetchAPI(`/api/drivers/?team__team_name=${teamName}`);
  },

  // Filtri per nazione
  getDriversByCountry: (countryCode) => {
    return fetchAPI(`/api/drivers/?country_code=${countryCode}`);
  },

 // Teams con filtri
  getTeams: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/api/teams/?${query}`);
  },

  // Drivers per team specifico
  getDriversByTeam: (teamName) => {
    return fetchAPI(`/api/drivers/?team__team_name=${teamName}`);
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