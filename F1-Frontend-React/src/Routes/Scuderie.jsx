import React, { useState, useEffect } from "react";
import { api } from '../services/api.jsx';
import SideImage from "../components/SideImage";
import "../App.css";
import "../components/Scuderie.css";

export function Scuderie() {
    const [teams, setTeams] = useState([]);
    const [drivers, setDrivers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        ordering: '-points'
    });

    // 🔹 Fallback in caso di errore nel fetch
    const localFallback = () => {
        console.warn("⚠️ Backend non disponibile");
        setTeams([]); // Invece di usare dati locali, mostra array vuoto
        setDrivers({});
        setError("Backend al momento non disponibile. Riprova più tardi.");
    };

    // 🔹 Fetch teams dal backend
    const fetchTeams = async (filters) => {
        try {
            setLoading(true);
            const data = await api.getTeams(filters);
            setTeams(data.results || data);
        } catch (err) {
            setError(err.message);
            console.error("Errore nel fetch teams:", err);
            localFallback();
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Fetch drivers per ogni team
    const fetchDriversForTeams = async (teamsList) => {
        try {
            const driversData = {};
            for (const team of teamsList) {
                const teamDrivers = await api.getDrivers({ team__team_name: team.team_name });
                driversData[team.team_name] = teamDrivers.results || teamDrivers;
            }
            setDrivers(driversData);
        } catch (err) {
            console.error("Errore nel fetch drivers:", err);
        }
    };

    // 🔹 Effetto iniziale: carica team
    useEffect(() => {
        const loadData = async () => {
            await fetchTeams(filters);
        };
        loadData();
    }, [filters]);

    // 🔹 Quando i teams sono caricati, carica i drivers
    useEffect(() => {
        if (teams.length > 0) {
            fetchDriversForTeams(teams);
        }
    }, [teams]);

    // 🔹 Gestione filtri
    const handleOrderChange = (ordering) => {
        setFilters(prev => ({ ...prev, ordering }));
    };

    const clearFilters = () => {
        setFilters({ ordering: '-points' });
    };

    // 🔹 Stati di caricamento / errore
    if (loading) return <div className="main-content"><h2>Caricamento scuderie...</h2></div>;
    if (error && teams.length === 0) return <div className="main-content"><h2>Errore: {error}</h2></div>;

    return (
        <div className="SideImage-container">
            <SideImage 
                src="https://static.vecteezy.com/ti/vettori-gratis/p1/16168385-da-corsa-e-rally-auto-scacchi-vettore-bandiera-vettoriale.jpg"
                alt="Bandiera a scacchi sinistra"
                position="left"
            />
            
            <div className="Scuderie">
                <h1>Benvenuto nella sezione Scuderie</h1>
                <h2>Informazioni sui team di Formula 1</h2>
                <p>Qui potrai trovare tutte le informazioni sulla stagione di Formula 1 2025</p>

                {/* 🔸 Barra filtri */}
                <div className="filtri-container">
                    <h3>Ordina per:</h3>
                    <div className="filtri-buttons">
                        <button 
                            className={`filtro-btn ${filters.ordering === '-points' ? 'active' : ''}`}
                            onClick={() => handleOrderChange('-points')}
                        >
                            Classifica (Punti)
                        </button>
                        <button 
                            className={`filtro-btn ${filters.ordering === 'team_name' ? 'active' : ''}`}
                            onClick={() => handleOrderChange('team_name')}
                        >
                            Nome Team
                        </button>
                        <button 
                            className="filtro-btn reset"
                            onClick={clearFilters}
                        >
                            Reset
                        </button>
                    </div>

                    {filters.ordering && (
                        <div className="active-filters">
                            <small>
                                Ordine: {filters.ordering === '-points' ? 'Classifica' : 'Nome Team'}
                            </small>
                        </div>
                    )}
                </div>

                {/* 🔸 Tabella scuderie */}
                <div className="table-container">
                    <table className="scuderie-table">
                        <thead>
                            <tr>
                                <th>Pos.</th>
                                <th>Scuderia</th>
                                <th>Logo</th>
                                <th>Piloti</th>
                                <th>Livrea</th>
                                <th>Punti 2025</th>
                            </tr>
                        </thead>

                        <tbody>
                            {teams.map((team, index) => (
                                <tr key={team.id || team.team_name} className="team-row">
                                    <td className="position-cell">
                                        <span className="position-badge">{index + 1}</span>
                                    </td>
                                    <td className="team-name-cell">
                                        <strong>{team.team_name}</strong>
                                    </td>
                                    <td className="logo-cell">
                                        <div className='LogoBackground' style={{ backgroundColor: team.team_colour }}>
                                            <img 
                                                className="TeamLogo"
                                                src={team.logo_url || team.team_logo}
                                                alt={team.team_name}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/60x60/333333/FFFFFF?text=LOGO';
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="drivers-cell"> 
                                        <ul className="PilotiList">
                                            {drivers[team.team_name]?.map((driver) => (
                                                <li key={driver.number || driver.id} className="Pilota">
                                                    <div className="driver-info">
                                                        <img
                                                            className='PilotiImgTeam'
                                                            src={driver.headshot_url}
                                                            alt={driver.full_name}
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/40x40/333333/FFFFFF?text=DRIVER';
                                                            }}
                                                        />
                                                        <div className="driver-details">
                                                            <span className="driver-name">{driver.full_name}</span>
                                                            <span className="driver-number">#{driver.number}</span>
                                                        </div>
                                                    </div>
                                                </li>
                                            )) || (
                                                <li className="Pilota">
                                                    <span>Caricamento piloti...</span>
                                                </li>
                                            )}
                                        </ul>
                                    </td>
                                    <td className="livrea-cell">
                                        {team.livrea ? (
                                            <img
                                                className="livrea-img"
                                                src={team.livrea}
                                                alt={`Livrea ${team.team_name}`}
                                                onError={(e) => (e.target.style.display = 'none')}
                                            />
                                        ) : (
                                            <div className="no-livrea">N/A</div>
                                        )}
                                    </td>
                                    <td className="points-cell">
                                        <span className="points-badge">
                                            {team.points || team.season_point}
                                        </span>
                                    </td>
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
export default Scuderie;
