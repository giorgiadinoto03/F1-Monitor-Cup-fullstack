import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import PilotiCard from '../components/PilotiCard';
import SideImage from '../components/SideImage';
import "../App.css";
import "../components/Piloti.css";

export function Piloti() {
    const [drivers, setDrivers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        ordering: 'number',
        team: '',
        country: ''
    });

    // 🔹 Trova il pilota con il punteggio più alto
    const findTopDriver = () => {
        if (drivers.length === 0) return null;
        
        let topDriver = drivers[0];
        drivers.forEach(driver => {
            const driverPoints = driver.points || 0;
            const topPoints = topDriver.points || 0;
            if (driverPoints > topPoints) {
                topDriver = driver;
            }
        });
        return topDriver;
    };

    const topDriver = findTopDriver();

    // 🔹 Fallback in caso di errore nel fetch
    const localFallback = () => {
        console.warn("⚠️ Errore di connessione al backend. Riprova più tardi.");
        setDrivers([]);
        setError("Backend non disponibile. Riprova più tardi.");
    };

    // 🔹 Fetch drivers dal backend
    const fetchDrivers = async (filters) => {
        try {
            setLoading(true);
            const cleanFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
            );
            const data = await api.getDrivers(cleanFilters);
            setDrivers(data.results || data);
        } catch (err) {
            console.error("Errore nel fetch:", err);
            setError(err.message);
            localFallback();
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
        fetchTeams();
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
    if (error && drivers.length === 0) return <div className="main-content"><h2>Errore: {error}</h2></div>;

    return (
        <div className="SideImage-container">
            <SideImage 
                src="https://static.vecteezy.com/ti/vettori-gratis/p1/16168385-da-corsa-e-rally-auto-scacchi-vettore-bandiera-vettoriale.jpg"
                alt="Bandiera a scacchi sinistra"
                position="left"
            />
            
            <div className="Piloti">
                <h1>Sezione Piloti</h1>
                <h2>Informazioni sui piloti di Formula 1</h2>
                <p>Qui potrai trovare le informazioni relative ai piloti e i loro risultati.
                    <br/>
                </p>

                {/* BARRA FILTRI */}
                <div className="filtri-container">
                    <h3>Filtra i piloti:</h3>
                    
                    <div className="filtri-grid">
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
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map((driver) => {
                                const isTopDriver = topDriver && driver.number === topDriver.number && (driver.points || 0) > 0;
                                
                                return (
                                    <tr 
                                        key={driver.number} 
                                        className="driver-row"
                                        style={isTopDriver ? {
                                            background: 'linear-gradient(90deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.05) 100%)',
                                            borderLeft: '4px solid #FFD700'
                                        } : {}}
                                    >
                                        <td className="number-cell">
                                            <span 
                                                className="driver-number-badge"
                                                style={isTopDriver ? {
                                                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                                    color: '#000',
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 0 15px rgba(255,215,0,0.5)'
                                                } : {}}
                                            >
                                                {driver.number}
                                            </span>
                                        </td>
                                        <td className="avatar-cell">
                                            <div
                                                className='PilotiBackground'
                                                style={{ 
                                                    backgroundColor: driver.team_colour,
                                                    boxShadow: isTopDriver ? '0 0 20px rgba(255,215,0,0.6)' : 'none'
                                                }}
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
                                        <td>
                                            {isTopDriver && <span style={{ color: '#FFD700', marginLeft: '8px' }}>👑</span>}
                                            <b>{driver.acronym}</b>
                                        </td>
                                        <td className='PilotiName'>
                                            {driver.first_name} {driver.last_name}
                                        </td>
                                        <td>{driver.team_name}</td>
                                        <td>{driver.country_code}</td>
                                        <td className="points-cell">
                                            <span 
                                                className="points-badge"
                                                style={isTopDriver ? {
                                                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                                    color: '#000',
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 0 15px rgba(255,215,0,0.5)'
                                                } : {}}
                                            >
                                                {driver.points}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <PilotiCard driver={driver} />
                                        </td>
                                    </tr>
                                );
                            })}
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