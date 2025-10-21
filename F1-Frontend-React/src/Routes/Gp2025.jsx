import React, { useEffect, useState } from "react";
import SessionCard from "../components/SessionCard";
import "../App.css";
import GpData from "../data/gp2025.json";
import SideImage from "../components/SideImage";

export function Gp2025() {
    const [GranPremio, setGranPremio] = useState([]);
    const [Sessioni, setSessioni] = useState({});

    const fixImagePath = (path) => {
        if (!path) return null;
        return path.replace('../public', '');
    };

    useEffect(() => {
        const fetchGranPremio = async () => {
            try {
                const response = await fetch('https://api.openf1.org/v1/meetings?year=2025');
                const data = await response.json();
                setGranPremio(data);
                fetchSessioni(data);
            } catch (error) {
                console.error("Errore durante il fetch dei dati dei meeting:", error);
            }
        };

        const fetchSessioni = async () => {
            try {
                const responseGp = await fetch('https://api.openf1.org/v1/sessions?year=2025');
                const data = await responseGp.json();

                const sessioniPerMeeting = {};
                data.forEach((session) => {
                    const key = session.meeting_key;
                    if (!sessioniPerMeeting[key]) {
                        sessioniPerMeeting[key] = { practice: [], qualifying: [], race: [] };
                    }

                    if (session.session_type === "Practice") {
                        sessioniPerMeeting[key].practice.push(session);
                    } else if (session.session_type === "Qualifying") {
                        sessioniPerMeeting[key].qualifying.push(session);
                    } else if (session.session_type === "Race") {
                        sessioniPerMeeting[key].race.push(session);
                    }
                });

                setSessioni(sessioniPerMeeting);
            } catch (error) {
                console.error("Errore durante il fetch dei dati delle sessioni:", error);
            }
        };

        fetchGranPremio();
    }, []);

    const [Gpimage, setGpimage] = useState(GpData);

    return (
        <div className="SideImage-container">
            <SideImage 
                src="https://static.vecteezy.com/ti/vettori-gratis/p1/16168385-da-corsa-e-rally-auto-scacchi-vettore-bandiera-vettoriale.jpg"
                alt="Bandiera a scacchi sinistra"
                position="left"
            />
            
            <div className="Gp2025">
                <h1>GP eseguiti nel 2025</h1>
                <h2>Elenco dei Gran Premi</h2>
                <p>Qui potrai trovare tutte le informazioni sulla stagione di Formula 1 2025.</p>
                <p>Seleziona un Gran Premio per vedere i dettagli delle sessioni.</p>
                <h3>L'elenco di GP 2025 mostra SOLO i GP di Formula 1 GIA' PASSATI</h3>
                
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
                        {GranPremio.map((gp, index) => {
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
                                {Sessioni[gp.meeting_key]?.practice.length > 0 ? (
                                    Sessioni[gp.meeting_key].practice.map((session, i) => (
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
                                {Sessioni[gp.meeting_key]?.qualifying.length > 0 ? (
                                    Sessioni[gp.meeting_key].qualifying.map((session, i) => (
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
                                {Sessioni[gp.meeting_key]?.race.length > 0 ? (
                                    Sessioni[gp.meeting_key].race.map((session, i) => (
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
};

export default Gp2025;