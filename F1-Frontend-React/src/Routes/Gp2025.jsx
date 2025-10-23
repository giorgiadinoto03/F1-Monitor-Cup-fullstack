import React, { useEffect, useState, useRef } from "react";
import SessionCard from "../components/SessionCard";
import { api } from "../services/api";
import SideImage from "../components/SideImage";
import "../App.css";
import "../components/gp2025.css";

export function Gp2025() {
    const [races, setRaces] = useState([]);
    const [sessions, setSessions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const hasFetched = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            try {
                setLoading(true);
                
                const racesData = await api.getRaces(2025);
                const racesList = Array.isArray(racesData) ? racesData : (racesData.results || racesData);
                setRaces(racesList);
                
                const sessionsMap = {};
                
                for (const race of racesList) {
                    try {
                        const sessionData = await api.getSessions(race.meeting_key);
                        sessionsMap[race.meeting_key] = Array.isArray(sessionData) ? sessionData : (sessionData.results || sessionData);
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

    // 🔥 CORREZIONE: Funzione migliorata per organizzare le sessioni
    const organizeSessionsByType = (sessionList) => {
        if (!sessionList || !Array.isArray(sessionList)) {
            return { 
                practice: [], 
                qualifying: [], 
                race: [],
                sprint_qualifying: [],
                sprint_race: []
            };
        }

        return {
            practice: sessionList.filter(s => 
                s.session_type && s.session_type.toLowerCase().includes('practice')
            ),
            qualifying: sessionList.filter(s => 
                s.session_type && (
                    s.session_type.toLowerCase().includes('qualifying') && 
                    !s.session_type.toLowerCase().includes('sprint')
                )
            ),
            race: sessionList.filter(s => 
                s.session_type && (
                    s.session_type.toLowerCase().includes('race') && 
                    !s.session_type.toLowerCase().includes('sprint')
                )
            ),
            sprint_qualifying: sessionList.filter(s => 
                s.session_type && s.session_type.toLowerCase().includes('sprint_qualifying')
            ),
            sprint_race: sessionList.filter(s => 
                s.session_type && s.session_type.toLowerCase().includes('sprint_race')
            )
        };
    };

    // 🔥 CORREZIONE: Funzione per ottenere il label corretto in italiano
    const getSessionLabel = (session, index) => {
        const sessionType = session.session_type?.toLowerCase() || '';
        const sessionName = session.session_name?.toLowerCase() || '';

        if (sessionType.includes('sprint_qualifying')) {
            return "Sprint Qualifiche";
        }
        if (sessionType.includes('sprint_race')) {
            return "Sprint Gara";
        }
        if (sessionType.includes('qualifying')) {
            return "Qualifiche";
        }
        if (sessionType.includes('race')) {
            return "Gara";
        }
        if (sessionType.includes('practice')) {
            return `FP${index + 1}`;
        }
        
        // Fallback basato sul nome
        if (sessionName.includes('sprint qualif')) {
            return "Sprint Qualifiche";
        }
        if (sessionName.includes('sprint')) {
            return "Sprint Gara";
        }
        if (sessionName.includes('qualif')) {
            return "Qualifiche";
        }
        
        return session.session_type || "Sessione";
    };

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
                
                {loading && <div className="loading-message">Caricamento...</div>}
                {error && <div className="error-message">Errore: {error}</div>}
                
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
                                <th>Sprint Qualifiche</th>
                                <th>Gara</th>
                                <th>Sprint Gara</th>
                            </tr>
                        </thead>
                        <tbody>
                        {races.map((gp) => {
                            const gpSessions = organizeSessionsByType(sessions[gp.meeting_key]);

                            return (
                            <tr key={gp.meeting_key}>
                                <td>
                                    {gp.circuit_image_url ? (
                                        <img
                                            src={gp.circuit_image_url}
                                            alt={`Circuito di ${gp.location}`}
                                            style={{ width: "120px", height: "auto", borderRadius: "8px" }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'inline';
                                            }}
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

                                {/* PROVE LIBERE */}
                                <td>
                                    {gpSessions.practice.length > 0 ? (
                                        gpSessions.practice.map((session, i) => (
                                        <div key={session.session_key} className="session-item">
                                            <SessionCard
                                                sessionKey={session.session_key}
                                                label={getSessionLabel(session, i)}
                                                meetingName={gp.meeting_name}
                                                dateStart={session.date_start}
                                            />
                                        </div>
                                        ))
                                    ) : (
                                        "N/A"
                                    )}
                                </td>

                                {/* QUALIFICHE */}
                                <td>
                                    {gpSessions.qualifying.length > 0 ? (
                                        gpSessions.qualifying.map((session) => (
                                        <div key={session.session_key} className="session-item">
                                            <SessionCard
                                                sessionKey={session.session_key}
                                                label={getSessionLabel(session, 0)}
                                                meetingName={gp.meeting_name}
                                                dateStart={session.date_start}
                                            />
                                        </div>
                                        ))
                                    ) : (
                                        "N/A"
                                    )}
                                </td>

                                {/* SPRINT QUALIFICHE */}
                                <td>
                                    {gpSessions.sprint_qualifying.length > 0 ? (
                                        gpSessions.sprint_qualifying.map((session) => (
                                        <div key={session.session_key} className="session-item">
                                            <SessionCard
                                                sessionKey={session.session_key}
                                                label={getSessionLabel(session, 0)}
                                                meetingName={gp.meeting_name}
                                                dateStart={session.date_start}
                                            />
                                        </div>
                                        ))
                                    ) : (
                                        "N/A"
                                    )}
                                </td>

                                {/* GARA */}
                                <td>
                                    {gpSessions.race.length > 0 ? (
                                        gpSessions.race.map((session) => (
                                        <div key={session.session_key} className="session-item">
                                            <SessionCard
                                                sessionKey={session.session_key}
                                                label={getSessionLabel(session, 0)}
                                                meetingName={gp.meeting_name}
                                                dateStart={session.date_start}
                                            />
                                        </div>
                                        ))
                                    ) : (
                                        "N/A"
                                    )}
                                </td>

                                {/* SPRINT GARA */}
                                <td>
                                    {gpSessions.sprint_race.length > 0 ? (
                                        gpSessions.sprint_race.map((session) => (
                                        <div key={session.session_key} className="session-item">
                                            <SessionCard
                                                sessionKey={session.session_key}
                                                label={getSessionLabel(session, 0)}
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