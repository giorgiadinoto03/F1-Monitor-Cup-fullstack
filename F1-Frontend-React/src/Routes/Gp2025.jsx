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

    // 🔹 Fallback locale
    const localFallback = () => {
        console.warn("⚠️ Errore di connessione al backend. Riprova più tardi");
        setRaces([]);
        setSessions({});
        setError("Connessione al backend non disponibile. Riprova più tardi.");
    };

    useEffect(() => {
        const fetchData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            try {
                setLoading(true);
                const racesData = await api.getRaces(2025);
                const racesList = Array.isArray(racesData)
                    ? racesData
                    : racesData.results || racesData;
                setRaces(racesList);

                const sessionsMap = {};
                for (const race of racesList) {
                    try {
                        const sessionData = await api.getSessions(race.meeting_key);
                        const sessionList = Array.isArray(sessionData)
                            ? sessionData
                            : sessionData.results || sessionData;

                        // 🔥 Ordina per data cronologica e rimuove duplicati
                        const sortedSessions = Array.from(
                            new Map(
                                sessionList
                                    .filter((s) => s.session_key)
                                    .map((s) => [s.session_key, s])
                            ).values()
                        ).sort((a, b) => new Date(a.date_start) - new Date(b.date_start));

                        sessionsMap[race.meeting_key] = sortedSessions;
                    } catch (err) {
                        console.warn(`Errore sessioni per ${race.meeting_name}:`, err);
                        sessionsMap[race.meeting_key] = [];
                    }
                }

                setSessions(sessionsMap);
            } catch (error) {
                console.error("Errore fetch dati:", error);
                setError(error.message);
                localFallback();
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 🔥 Label corretto per tipo di sessione
    const getSessionLabel = (session, index) => {
        const type = session.session_type?.toLowerCase() || "";
        const name = session.session_name?.toLowerCase() || "";

        if (type.includes("sprint_qualifying") || name.includes("sprint qualif"))
            return "Sprint Qualifiche";
        if (type.includes("sprint_race") || name.includes("sprint race"))
            return "Sprint Gara";
        if (type.includes("qualifying") || name.includes("qualif"))
            return "Qualifiche";
        if (type.includes("race") && !type.includes("sprint")) return "Gara";
        if (type.includes("practice")) return `FP${index + 1}`;
        return session.session_name || session.session_type || "Sessione";
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
                <p>
                    Qui potrai trovare tutte le informazioni sulla stagione di Formula 1 2025.
                    <br />
                    Per ogni Gran Premio, tutte le sessioni avvenute:
                    <br />
                    (Prove Libere, Qualifiche, Gara e Sprint)
                </p>
                <p>Seleziona una sessione per vedere i dettagli e i risultati.</p>

                <h3>
                    <u>L'elenco mostra SOLO i GP già conclusi della stagione 2025</u>
                </h3>

                {loading && <div className="loading-message">Caricamento...</div>}
                {error && <div className="error-message">Errore: {error}</div>}

                <div className="table-container">
                    <table className="gp-table">
                        <thead>
                            <tr>
                                <th>Circuito</th>
                                <th>Nome Ufficiale</th>
                                <th>Paese</th>
                                <th>Location</th>
                                <th>Sessioni</th>
                            </tr>
                        </thead>

                        <tbody>
                            {races.map((gp) => {
                                const gpSessions = sessions[gp.meeting_key] || [];

                                return (
                                    <tr key={gp.meeting_key}>
                                        {/* 🏎️ Immagine circuito */}
                                        <td>
                                            {gp.circuit_image_url ? (
                                                <img
                                                    src={gp.circuit_image_url}
                                                    alt={`Circuito di ${gp.location}`}
                                                    className="gp-image"
                                                    onError={(e) => {
                                                        e.target.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <span className="no-image">
                                                    Nessuna immagine
                                                </span>
                                            )}
                                        </td>

                                        {/* 📛 Nome GP */}
                                        <td>
                                            <strong className="gp-name">
                                                {gp.meeting_name}
                                            </strong>
                                            <br />
                                            <span className="gp-official-name">
                                                {gp.meeting_official_name}
                                            </span>
                                        </td>

                                        {/* 🌍 Paese */}
                                        <td>
                                            <strong>{gp.country_name}</strong>
                                        </td>

                                        {/* 📍 Location */}
                                        <td>
                                            <strong>{gp.location}</strong>
                                        </td>

                                        {/* 🗓️ Sessioni */}
                                        <td>
                                            {gpSessions.length > 0 ? (
                                                <div className="session-grid">
                                                    {gpSessions.map((session, i) => {
                                                        const label = getSessionLabel(session, i);
                                                        
                                                        return (
                                                            <div
                                                                key={session.session_key}
                                                                className="session-item"
                                                            >
                                                                <SessionCard
                                                                    sessionKey={session.session_key}
                                                                    label={label}
                                                                    meetingName={gp.meeting_name}
                                                                    dateStart={session.date_start}
                                                                />
                                                                <span className="session-id">
                                                                    ID: {session.session_key}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="no-session">
                                                    Nessuna sessione disponibile
                                                </div>
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
                positess="right"
            />
        </div>
    );
}

export default Gp2025;