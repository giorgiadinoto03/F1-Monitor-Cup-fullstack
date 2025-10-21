const API_URL = import.meta.env.VITE_API_URL;

export const api = {
  getDrivers: async () => {
    const res = await fetch(`${API_URL}/api/drivers/`);
    if (!res.ok) throw new Error("Errore nel recupero dei piloti");
    return res.json();
  },

  getTeams: async () => {
    const res = await fetch(`${API_URL}/api/teams/`);
    if (!res.ok) throw new Error("Errore nel recupero delle scuderie");
    return res.json();
  },

  getRaces: async () => {
    const res = await fetch(`${API_URL}/api/races/`);
    if (!res.ok) throw new Error("Errore nel recupero delle gare");
    return res.json();
  },
};
