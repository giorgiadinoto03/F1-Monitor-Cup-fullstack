import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import DriversData from '../data/piloti.json';
import PilotiCard from '../components/PilotiCard';
import SideImage from '../components/SideImage';

export function ClassificaPiloti() {
    const [drivers] = useState(
        [...DriversData].sort((a, b) => a.season_position - b.season_position)
    );

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
                <p>Qui potrai trovare tutte le informazioni sulla stagione di Formula 1 2025 </p>
                <p> Usa la barra di navigazione in alto per esplorare le diverse sezioni dell'app.</p>
                <p>Buona navigazione!</p>

                {/*Bottone per vedere in base al numero del pilota*/}
                <div className="filtro-container">
                    <Link to="/piloti">
                        <button className='Filtro'>Filtra per Numero Piloti</button>
                    </Link>
                </div>

                <div className="piloti-table-container">
                    <table className="piloti-table">
                        <thead>
                            <tr>
                                <th>Classifica Piloti</th>
                                <th>  </th>
                                <th>Acronimo</th>
                                <th>Nome Completo</th>
                                <th>Team</th>
                                <th>Numero del pilota</th>
                                <th>Nazione</th>
                                <th>Punti Stagione 2025</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map((driver) => (
                                <tr key={driver.broadcast_name}>
                                    <td>{driver.season_position}</td>
                                    <td>
                                        <div
                                            className="PilotiBackground"
                                            style={{ backgroundColor: driver.team_colour }}
                                        >
                                            <img
                                                className="PilotiImg"
                                                src={driver.headshot_url}
                                                alt={driver.full_name}
                                            />
                                        </div>
                                    </td>
                                    <td>{driver.name_acronym}</td>
                                    <td className='PilotiName' >{driver.first_name } {driver.last_name}
                                        <br></br>
                                        <PilotiCard driver={driver} />
                                    </td>
                                    <td>
                                        {driver.team_name}
                                    </td>
                                    <td>{driver.driver_number}</td>
                                    <td>{driver.country_code}</td>
                                    <td>{driver.season_point}</td>
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