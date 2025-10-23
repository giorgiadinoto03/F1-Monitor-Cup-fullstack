import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import PilotiCard from '../components/PilotiCard';
import SideImage from '../components/SideImage';
import "../App.css";
import "../components/Piloti.css";

export function Piloti() {
    const [drivers, setDrivers] = useState([]);
    const [teams, setTeams] = useState([]); // Aggiungi stato per i team
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        ordering: 'number',
        team: '',
        country: ''
    });

    // Fetch drivers dal backend
    const fetchDrivers = async (filters) => {
    try {
        setLoading(true);
        // Pulisci i filtri vuoti
        const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
        );
        
        const data = await api.getDrivers(cleanFilters);
        setDrivers(data.results || data);
    } catch (err) {
        setError(err.message);
        console.error("Errore nel fetch:", err);
    } finally {
        setLoading(false);
    }
    };

    // Fetch teams per il dropdown
    const fetchTeams = async () => {
        try {
            const data = await api.getTeams();
            setTeams(data.results || data);
        } catch (err) {
            console.error("Errore nel fetch teams:", err);
        }
    };

    useEffect(() => {
        fetchDrivers(filters);
        fetchTeams(); // Carica i team all'avvio
    }, [filters]);

    console.log("Dati driver ricevuti:", drivers);
    console.log("Team disponibili:", teams);

    // Gestori per i filtri
    const handleOrderChange = (ordering) => {
        setFilters(prev => ({ ...prev, ordering }));
    };

    const handleTeamFilter = (event) => {
        const teamName = event.target.value;
        setFilters(prev => ({ 
            ...prev, 
            team: teamName,
            team__team_name: teamName
        }));
    };

    const clearFilters = () => {
        setFilters({ ordering: 'number', team: '', country: '' });
    };

    if (loading) return <div className="main-content"><h2>Caricamento piloti...</h2></div>;
    if (error) return <div className="main-content"><h2>Errore: {error}</h2></div>;

    return (
        <div className="SideImage-container">
            <SideImage 
                src="https://static.vecteezy.com/ti/vettori-gratis/p1/16168385-da-corsa-e-rally-auto-scacchi-vettore-bandiera-vettoriale.jpg"
                alt="Bandiera a scacchi sinistra"
                position="left"
            />
            
            <div className="Piloti">
                <h1>Benvenuto nella sezione Piloti</h1>
                <h2>Informazioni sui piloti di Formula 1</h2>
                <p>Qui potrai trovare tutte le informazioni sulla stagione di Formula 1 2025</p>

                {/* BARRA FILTRI MIGLIORATA */}
                <div className="filtri-container">
                    <h3>Filtra i piloti:</h3>
                    
                    <div className="filtri-grid">
                        {/* Ordinamento */}
                        <div className="filtro-group">
                            <label>Ordina per:</label>
                            <div className="filtri-buttons">
                                <button 
                                    className={`filtro-btn ${filters.ordering === 'number' ? 'active' : ''}`}
                                    onClick={() => handleOrderChange('number')}
                                >
                                    Numero
                                </button>
                                <button 
                                    className={`filtro-btn ${filters.ordering === 'full_name' ? 'active' : ''}`}
                                    onClick={() => handleOrderChange('full_name')}
                                >
                                    Nome
                                </button>
                                <button 
                                    className={`filtro-btn ${filters.ordering === '-points' ? 'active' : ''}`}
                                    onClick={() => handleOrderChange('-points')}
                                >
                                    Punti
                                </button>
                            </div>
                        </div>

                        {/* Filtro Team - DROPDOWN */}
                        <div className="filtro-group">
                            <label htmlFor="team-select">Filtra per Team:</label>
                            <select 
                                id="team-select"
                                className="team-dropdown"
                                value={filters.team}
                                onChange={handleTeamFilter}
                            >
                                <option value="">Tutti i team</option>
                                {teams.map(team => (
                                    <option key={team.id} value={team.team_name}>
                                        {team.team_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Reset */}
                        <div className="filtro-group">
                            <label>&nbsp;</label>
                            <button 
                                className="filtro-btn reset"
                                onClick={clearFilters}
                            >
                                Reset Filtri
                            </button>
                        </div>
                    </div>

                    {/* Mostra filtri attivi */}
                    {filters.team && (
                        <div className="active-filters">
                            <small>
                                Filtri attivi: 
                                {filters.team && ` Team: ${filters.team}`}
                                {filters.ordering === '-points' && ' (Ordine: Punti)'}
                                {filters.ordering === 'full_name' && ' (Ordine: Nome)'}
                                {filters.ordering === 'number' && ' (Ordine: Numero)'}
                            </small>
                        </div>
                    )}
                </div>


                {/* Tabella piloti */}
                <div className="piloti-table-container">
                    <table className="piloti-table">
                        <thead>
                            <tr>
                                <th>Numero</th>
                                <th></th>
                                <th>Acronimo</th>
                                <th>Nome Completo</th>
                                <th>Team</th>
                                <th>Nazione</th>
                                <th>Punti</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map((driver) => (
                                <tr key={driver.number}>
                                    <td>{driver.number}</td>
                                    <td>
                                        <div
                                            className='PilotiBackground'
                                            style={{ backgroundColor: driver.team_colour }}
                                        >
                                            <img
                                                className='PilotiImg'
                                                src={driver.headshot_url}
                                                alt={driver.full_name}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/50x50/333333/FFFFFF?text=DRIVER';
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td><b>{driver.acronym}</b></td>
                                    <td className='PilotiName'>
                                        {driver.first_name} {driver.last_name}
                                        <br />
                                        <PilotiCard driver={driver} />
                                    </td>
                                    <td>{driver.team_name}</td>
                                    <td>{driver.country_code}</td>
                                    <td>{driver.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <SideImage
                src="https://static.vecteezy.com/ti/vettori-gratis/p1/16168385-da-corsa-e-rally-auto-scacchi-vettore-bandiera-vettoriale.jpg"
                alt="Bandiera a scacchi destra"
                position="right"
            />
        </div>
    );
}

export default Piloti;