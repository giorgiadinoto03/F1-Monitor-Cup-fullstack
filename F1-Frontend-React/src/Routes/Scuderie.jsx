import React from "react";
import DriversData from "../data/piloti.json";
import TeamData from "../data/scuderie.json";
import SideImage from "../components/SideImage";

export function Scuderie() {
    // Ordina le scuderie in base ai punti (dal valore più alto al più basso)
    const sortedTeams = [...TeamData].sort((a, b) => b.season_point - a.season_point);

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
                <p>Qui potrai trovare tutte le informazioni sulla stagione di Formula 1 2025 </p>
                <p> Usa la barra di navigazione in alto per esplorare le diverse sezioni dell'app.</p>
                <p>Buona navigazione!</p>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Classifica Scuderia</th>
                                <th>Scuderia</th>
                                <th>Logo</th>
                                <th>Piloti </th>
                                <th>Punti Stagione 2025</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sortedTeams.map((team, index) => (
                                <tr key={index}>
                                    <td>{team.season_position}</td>
                                    <td>{team.team_name}</td>
                                    <td>
                                        <div
                                            className='LogoBackground'
                                            style={{backgroundColor: team.team_colour}}
                                        >
                                            <img 
                                                className="TeamLogo"
                                                src={team.team_logo}
                                                alt={team.team_name}
                                            />
                                        </div>
                                    </td>
                                    <td> 
                                        <ul className="PilotiList">
                                            {team.drivers.map((driver, idx) => (
                                                <li key={idx} className="Pilota">
                                                    <img
                                                        className='PilotiImgTeam'
                                                        src={driver.headshot_url}
                                                        alt={driver.full_name}
                                                    />
                                                    <span>{driver.full_name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>{team.season_point}</td>
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
};

export default Scuderie;