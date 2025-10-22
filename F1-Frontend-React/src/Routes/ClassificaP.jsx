import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import PilotiCard from '../components/PilotiCard';
import SideImage from '../components/SideImage';

export function ClassificaPiloti() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClassifica = async () => {
            try {
                setLoading(true);
                // Ordina per punti discendenti
                const data = await api.getDrivers({ ordering: '-points' });
                setDrivers(data.results || data);
            } catch (err) {
                setError(err.message);
                console.error("Errore nel fetch classifica:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchClassifica();
    }, []);

    if (loading) return <div className="main-content"><h2>Caricamento classifica...</h2></div>;
    if (error) return <div className="main-content"><h2>Errore: {error}</h2></div>;

    return (
        <div className="SideImage-container">
            <SideImage 
                src="https://static.vecteezy.com/ti/vettori-gratis/p1/16168385-da-corsa-e-rally-auto-scacchi-vettore-bandiera-vettoriale.jpg"
                alt="Bandiera a scacchi sinistra"
                position="left"
            />
            
            <div className="Piloti">
                <h1>Classifica Piloti 2025</h1>
                <h2>La classifica ufficiale dei piloti di Formula 1</h2>

                {/* Bottone per tornare alla vista per numero */}
                <div className="filtro-container">
                    <Link to="/piloti">
                        <button className='Filtro'>Vedi per Numero Pilota</button>
                    </Link>
                </div>

                <div className="piloti-table-container">
                    <table className="piloti-table">
                        <thead>
                            <tr>
                                <th>Pos.</th>
                                <th></th>
                                <th>Acronimo</th>
                                <th>Nome Completo</th>
                                <th>Team</th>
                                <th>Numero Pilota</th>
                                <th>Nazione</th>
                                <th>Punti</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map((driver, index) => (
                                <tr key={driver.number}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div
                                            className="PilotiBackground"
                                            style={{ backgroundColor: driver.team_colour }}
                                        >
                                            <img
                                                className="PilotiImg"
                                                src={driver.headshot_url}
                                                alt={driver.full_name}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/50x50/333333/FFFFFF?text=DRIVER';
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td>{driver.acronym}</td>
                                    <td className='PilotiName'>
                                        {driver.first_name} {driver.last_name}
                                        <br />
                                        <PilotiCard driver={driver} />
                                    </td>
                                    <td>{driver.team_name}</td>
                                    <td>{driver.number}</td>
                                    <td>{driver.country_code}</td>
                                    <td><strong>{driver.points}</strong></td>
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

export default ClassificaPiloti;