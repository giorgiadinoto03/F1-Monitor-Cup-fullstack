import React, { useState, useEffect } from "react";
import SideImage from "../components/SideImage";
import "../App.css";
import GpData from "../data/gp2025.json";

export default function HomePage() {
    const [nextGp, setNextGp] = useState(null);

    // Funzione per sistemare il path dell'immagine
    const fixImagePath = (path) => {
        if (!path) return null;
        // Rimuove "../public" e lascia solo il path dalla root
        return path.replace('../public', '');
    };

    useEffect(() => {
        const now = new Date();

        // Trova il primo GP che deve ancora iniziare
        const upcoming = GpData
            .map(gp => ({ ...gp, date: new Date(gp.date_start) }))
            .filter(gp => gp.date > now)
            .sort((a, b) => a.date - b.date)[0];

        setNextGp(upcoming);
    }, []);
    // Funzione per formattare data/ora in orario italiano
const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("it-IT", {
        timeZone: "Europe/Rome", // forza l'orario italiano
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};


    return (
        <div className="SideImage-container">
            {/* Immagine a sinistra */}
            <SideImage
                src="https://static.vecteezy.com/ti/vettori-gratis/p1/16168385-da-corsa-e-rally-auto-scacchi-vettore-bandiera-vettoriale.jpg"
                alt="Bandiera a scacchi sinistra"
                position="left"
            />

            {/* Contenuto centrale */}
            <div className="main-content">
                <h1>Benvenuto in F1 Monitor Cup</h1>
                <h2>Applicazione web per monitorare le gare della Formula 1</h2>
                <p>
                    Qui potrai trovare tutte le informazioni sulla stagione di Formula 1
                    2025, incluse classifiche, piloti, scuderie, GP e statistiche.<br />
                    Usa la barra di navigazione in alto per esplorare le diverse sezioni
                    dell'app.
                </p>
                <p>Buona navigazione!</p>

                <br />
                <br />
                <h2>Il prossimo GP è</h2>
                <br />
        {nextGp ? (
            <>
                {/* Immagine del circuito */}
                <div style={{ marginBottom: "20px" }}>
                <img
                    src={fixImagePath(nextGp.circuit_image)} 
                    alt={nextGp.meeting_name}
                    style={{
                    width: "300px",
                    maxWidth: "100%",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(4, 78, 152, 0.3)"
                    }}
                />
                </div>

                {/* Titolo e informazioni del GP */}
                <h3>
                {nextGp.meeting_name} - {nextGp.location} <br />
                <i>{nextGp.meeting_official_name}</i>
                </h3>

                <h4>
                <small>
                    inizio Weekend Race:
                    <br /> {formatDateTime(nextGp.date_start)}
                </small>
                </h4>
            </>
            ) : (
            <h3>Nessun GP in programma</h3>
            )}

            </div>

            {/* Immagine a destra */}
            <SideImage
                src="https://static.vecteezy.com/ti/vettori-gratis/p1/16168385-da-corsa-e-rally-auto-scacchi-vettore-bandiera-vettoriale.jpg"
                alt="Bandiera a scacchi destra"
                position="right"
            />
        </div>
    );
}
