const API_URL = import.meta.env.VITE_API_URL;

export const api = {
  // Drivers
  getDrivers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/drivers/?${query}`);
    if (!res.ok) throw new Error("Errore drivers");
    return res.json();
  },

  getDriverByNumber: async (number) => {
    const res = await fetch(`${API_URL}/api/drivers/?number=${number}`);
    if (!res.ok) throw new Error("Driver non trovato");
    const data = await res.json();
    return data.results[0];
  },

  // Teams
  getTeams: async (ordering = '-points') => {
    const res = await fetch(`${API_URL}/api/teams/?ordering=${ordering}`);
    if (!res.ok) throw new Error("Errore teams");
    return res.json();
  },

  // Races
  getRaces: async (year = 2025) => {
    const res = await fetch(`${API_URL}/api/races/?year=${year}`);
    if (!res.ok) throw new Error("Errore races");
    return res.json();
  },

  getNextRace: async () => {
    const res = await fetch(`${API_URL}/api/races/next/`);
    if (!res.ok) throw new Error("Nessuna gara futura");
    return res.json();
  },

  // Sessions
  getSessions: async (weekend) => {
    const res = await fetch(`${API_URL}/api/sessions/?weekend=${weekend}`);
    if (!res.ok) throw new Error("Errore sessions");
    return res.json();
  },

  // Results
  getResults: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/api/results/?${query}`);
    if (!res.ok) throw new Error("Errore results");
    return res.json();
  },

  getQualifyingResults: async (weekend) => {
    const res = await fetch(`${API_URL}/api/results/qualify/?weekend=${weekend}`);
    if (!res.ok) throw new Error("Errore qualifying");
    return res.json();
  },

  getRaceResults: async (weekend) => {
    const res = await fetch(`${API_URL}/api/results/race/?weekend=${weekend}`);
    if (!res.ok) throw new Error("Errore race");
    return res.json();
  },
};