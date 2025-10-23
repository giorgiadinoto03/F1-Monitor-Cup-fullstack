import React, { useState } from "react";
import {
Typography,
Button,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
Box,
} from "@mui/material";
import "../App.css";

export default function PilotiCard({ driver }) {
    const [open, setOpen] = useState(false);
    const [teamData, setTeamData] = useState(null);

    const handleOpen = () => {
        setOpen(true);
        // Carica i dati del team quando apri il dialog
        fetchTeamData(driver.team_name);
    };

    const handleClose = () => setOpen(false);

    const fetchTeamData = async (teamName) => {
        try {
        const response = await fetch(`http://localhost:8000/api/teams/?team_name=${teamName}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            setTeamData(data.results[0]);
        }
        } catch (error) {
        console.error("Errore nel fetch team:", error);
        }
    };

    return (
        <>
        <Button
            className="DettagliBtn"
            sx={{ margin: "auto" }}
            variant="outlined"
            onClick={handleOpen}
        >
            Dettagli
        </Button>

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>
            <Box
                sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                backgroundImage: 'url("https://media.istockphoto.com/id/1344251610/vector/abstract-blue-and-red-light-motion-background.jpg?s=612x612&w=0&k=20&c=__v3SABlLjs7Yt8JY6fBTPddml5n7Xu3rE6lapRIfXg=")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                color: "white",
                padding: "20px",
                borderRadius: "10px",
                }}
            >
                {/* Immagine pilota */}
                <div
                className="PilotiBackgroundCard"
                style={{ backgroundColor: driver.team_colour }}
                >
                <img
                    src={driver.headshot_url}
                    alt={driver.full_name}
                    className="PilotiImgCard"
                    style={{ border: "1px solid white" }}
                    onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150x150/333333/FFFFFF?text=DRIVER";
                    }}
                />
                </div>

                {/* Info pilota + team */}
                <Box>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {driver.full_name}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h5">{driver.team_name}</Typography>

                    {/* Logo del team */}
                    {teamData && teamData.team_colour && (
                    <div
                        className="LogoBackground"
                        style={{
                        backgroundColor: teamData.team_colour,
                        borderRadius: "50px",
                        padding: "4px",
                        }}
                    >
                        {teamData.logo_url ? (
                        <img
                            src={teamData.logo_url}
                            alt={teamData.team_name}
                            className="TeamLogo"
                            style={{ width: "45px", height: "45px" }}
                            onError={(e) => {
                            e.target.style.display = "none";
                            }}
                        />
                        ) : (
                        <span>🏎️</span>
                        )}
                    </div>
                    )}
                </Box>

                <Typography variant="h6">
                    Numero del Pilota: {driver.driver_number || driver.number}
                </Typography>
                <Typography variant="subtitle1">
                    {driver.country_name}
                </Typography>
                </Box>
            </Box>
            </DialogTitle>

            {/* Immagine livrea */}
            {teamData && teamData.livrea && (
            <Box sx={{ marginTop: 2, textAlign: "center", padding: "20px" }}>
                <img
                className="LivreaImg"
                src={teamData.livrea}
                alt={`${teamData.team_name} Livrea`}
                style={{
                    width: "100%",
                    maxWidth: "500px",
                    borderRadius: "12px",
                    border: "0px solid white",
                }}
                onError={(e) => {
                    e.target.style.display = "none";
                }}
                />
            </Box>
            )}

            {/* Statistiche */}
            <DialogContent dividers>
            <Box
                sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 2,
                marginTop: 1,
                }}
            >
                <Box>
                <Typography className="StatLabel">Posizione in Classifica</Typography>
                <Typography className="StatValue">{driver.season_position}°</Typography>
                </Box>

                <Box>
                <Typography className="StatLabel">Punti</Typography>
                <Typography className="StatValue">{driver.season_point || driver.points} pts</Typography>
                </Box>

                <Box>
                <Typography className="StatLabel">Gran Premi</Typography>
                <Typography className="StatValue">{driver.gp_count}</Typography>
                </Box>

                <Box>
                <Typography className="StatLabel">Pole Position</Typography>
                <Typography className="StatValue">{driver.poles}</Typography>
                </Box>

                <Box>
                <Typography className="StatLabel">Podi</Typography>
                <Typography className="StatValue">{driver.podiums}</Typography>
                </Box>

                <Box>
                <Typography className="StatLabel">Vittorie</Typography>
                <Typography className="StatValue">{driver.wins}</Typography>
                </Box>
            </Box>
            </DialogContent>

            <DialogActions>
            <Button onClick={handleClose} color="error" variant="contained">
                Chiudi
            </Button>
            </DialogActions>
        </Dialog>
        </>
    );
}