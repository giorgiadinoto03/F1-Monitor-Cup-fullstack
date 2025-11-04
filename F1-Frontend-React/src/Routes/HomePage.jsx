import React, { useState, useEffect } from "react";
import SideImage from "../components/SideImage";
import { api } from "../services/api";
import "../App.css";


export default function HomePage() {
    const [nextGp, setNextGp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Funzione per formattare la data in italiano
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("it-IT", {
            timeZone: "Europe/Rome",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    useEffect(() => {
        const fetchNextGp = async () => {
            try {
                const data = await api.getNextRace();
                console.log('🚨 DATI RICEVUTI:', data);
                setNextGp(data);
            } catch (err) {
                console.error("Errore nel fetch:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchNextGp();
    }, []);

    if (loading) return <div className="main-content"><h2>Caricamento...</h2></div>;
    if (error) return <div className="main-content"><h2>Errore: {error}</h2></div>;

    return (
        <div className="SideImage-container">
            <SideImage
                src="https://static.vecteezy.com/ti/vettori-gratis/p1/16168385-da-corsa-e-rally-auto-scacchi-vettore-bandiera-vettoriale.jpg"
                alt="Bandiera a scacchi sinistra"
                position="left"
            />

            <div className="main-content">
                <h1>Benvenuto in F1 Monitor Cup</h1>
                <h2>Applicazione web per monitorare le gare della Formula 1</h2>
                <p>
                    Qui troverai tutte le informazioni sulla stagione 2025, incluse classifiche, piloti, scuderie e GP.
                </p>

                <br />
                <h2>La prossima gara è</h2>

                <div className="NextGP-info">
                {nextGp ? (
                    <>
                        {nextGp.circuit_image_url && (  
                            <img
                                src={nextGp.circuit_image_url}
                                alt={nextGp.meeting_name}
                                style={{
                                    width: "300px",
                                    maxWidth: "100%",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 12px rgba(4, 78, 152, 0.3)"
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        )}

                        <h3>
                            {nextGp.meeting_name} - {nextGp.location} in {nextGp.country_name}
                            <br />
                            <i>{nextGp.meeting_official_name}</i>
                        </h3>
                        <h4>
                            <small>
                                Inizio weekend: <br /> {formatDateTime(nextGp.date_start)}
                            </small>
                        </h4>
                    </>
                ) : (
                    <h3>Nessun GP in programma</h3>
                )}
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