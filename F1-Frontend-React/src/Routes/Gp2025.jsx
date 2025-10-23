import React, { useEffect, useState, useRef } from "react"; // Aggiungi useRef
import SessionCard from "../components/SessionCard";
import "../App.css";
import { api } from "../services/api";
import SideImage from "../components/SideImage";

export function Gp2025() {
    const [races, setRaces] = useState([]);
    const [sessions, setSessions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [Gpimage, setGpimage] = useState([]); // Sposta qui

    // Aggiungi useRef per prevenire loop
    const hasFetched = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
        // Previeni fetch multipli
        if (hasFetched.current) return;
        hasFetched.current = true;

        try {
            setLoading(true);
            
            // Fetch races dal backend
            const racesData = await api.getRaces({ year: 2025 });
            const racesList = racesData.results || racesData;
            setRaces(racesList);
            
            // Fetch sessions per ogni race (ma con limiti)
            const sessionsMap = {};
            // Limita a max 5 gare per evitare troppe richieste
            const limitedRaces = racesList.slice(0, 5);
            
            for (const race of limitedRaces) {
            try {
                const sessionData = await api.getSessions({ weekend: race.meeting_key });
                sessionsMap[race.meeting_key] = sessionData.results || sessionData;
            } catch (sessionError) {
                console.warn(`Errore sessioni per ${race.meeting_name}:`, sessionError);
                sessionsMap[race.meeting_key] = [];
            }
            }
            
            setSessions(sessionsMap);
        } catch (error) {
            console.error("Errore fetch dati:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
        };
        
        fetchData();
    }, []);

    const fixImagePath = (path) => {
        if (!path) return null;
        return path.replace('../public', '');
    };

    // CORREGGI: usa races invece di GranPremio
    return (
        <div className="SideImage-container">
            <SideImage 
                src="https://static.vecteezy.com/ti/vettori-gratis/p1/16168385-da-corsa-e-rally-auto-scacchi-vettore-bandiera-vettoriale.jpg"
                alt="Bandiera a scacchi sinistra"
                position="left"
            />
            
            <div className="Gp2025">
                <h1>GP del 2025</h1>
                <p>Qui potrai trovare tutte le informazioni sulla stagione di Formula 1 2025.
                    <br />Per ogni Gran Premio, tutte le sessioni e le prestazioni per ogni pilota.
                    <br />(Prove Libere, Qualifiche, Gara e Sprint)
                </p>
                <p>Seleziona un Gran Premio per vedere i dettagli delle sessioni.</p>
                <h3><u>L'elenco di GP 2025 mostra SOLO i GP di Formula 1 GIA' PASSATI</u></h3>
                
                {loading && <div>Caricamento...</div>}
                {error && <div>Errore: {error}</div>}
                
                <div className="table-container">
                    <table className="gp-table">
                        <thead>
                            <tr>
                                <th>Circuito</th>
                                <th>Paese</th>
                                <th>Nome Ufficiale</th>
                                <th>Location</th>
                                <th>Prove Libere</th>
                                <th>Qualifiche</th>
                                <th>Gara</th>
                            </tr>
                        </thead>
                        <tbody>
                        {races.map((gp, index) => { // CORREGGI: usa races
                            const gpLocal = Gpimage.find((item) => item.meeting_key === gp.meeting_key);

                            return (
                            <tr key={index}>
                                <td>
                                {gpLocal && gpLocal["circuit_image"] ? (
                                    <img
                                    src={fixImagePath(gpLocal["circuit_image"])}
                                    alt={`Circuito di ${gp.location}`}
                                    style={{ width: "120px", height: "auto", borderRadius: "8px" }}
                                    />
                                ) : (
                                    <span style={{ fontStyle: "italic", color: "gray" }}>No image</span>
                                )}
                                </td>

                                <td>
                                <strong style={{ fontSize: "1.2em" }}>{gp.country_name}</strong>
                                </td>

                                <td>
                                <div>
                                    <span style={{ fontWeight: "bold" }}>{gp.meeting_name}</span>
                                    <br />
                                    <span style={{ fontStyle: "italic" }}>{gp.meeting_official_name}</span>
                                </div>
                                </td>

                                <td>{gp.location}</td>

                                <td>
                                {sessions[gp.meeting_key]?.practice?.length > 0 ? (
                                    sessions[gp.meeting_key].practice.map((session, i) => (
                                    <div key={i} className="session-item">
                                        <SessionCard
                                        sessionKey={session.session_key}
                                        label={`FP${i + 1}`}
                                        meetingName={gp.meeting_name}
                                        dateStart={session.date_start}
                                        />
                                    </div>
                                    ))
                                ) : (
                                    "N/A"
                                )}
                                </td>

                                <td>
                                {sessions[gp.meeting_key]?.qualifying?.length > 0 ? (
                                    sessions[gp.meeting_key].qualifying.map((session, i) => (
                                    <div key={i} className="session-item">
                                        <SessionCard
                                        sessionKey={session.session_key}
                                        label="Qualifying"
                                        meetingName={gp.meeting_name}
                                        dateStart={session.date_start}
                                        />
                                    </div>
                                    ))
                                ) : (
                                    "N/A"
                                )}
                                </td>

                                <td>
                                {sessions[gp.meeting_key]?.race?.length > 0 ? (
                                    sessions[gp.meeting_key].race.map((session, i) => (
                                    <div key={i} className="session-item">
                                        <SessionCard
                                        sessionKey={session.session_key}
                                        label="Race"
                                        meetingName={gp.meeting_name}
                                        dateStart={session.date_start}
                                        />
                                    </div>
                                    ))
                                ) : (
                                    "N/A"
                                )}
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

export default Gp2025;