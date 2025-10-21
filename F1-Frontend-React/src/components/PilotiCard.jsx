import React, { useState } from "react";
import {Typography,Button,Dialog,DialogTitle,DialogContent,DialogActions,Divider,Box,} from "@mui/material";
import "../App.css"; // per usare i tuoi stili
import DriversData from "../data/piloti.json";
import TeamData from "../data/scuderie.json";

export default function PilotiCard({ driver }) {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const team = TeamData.find(team => team.team_name === driver.team_name);

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

    {/* Pop-up */}
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

            <div
        className="PilotiBackgroundCard"
        style={{ backgroundColor: driver.team_colour }}
    >
        <img
            src={driver.headshot_url}
            alt={driver.full_name}
            className="PilotiImgCard"
            style={{ border: "1px solid white" }}
        />
    </div>
            <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {driver.full_name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <Typography variant="h5">{team.team_name}</Typography>
            <div
                className="LogoBackground"
                style={{ backgroundColor: team.team_colour }}
            >
                <img
                    src={team.team_logo}
                    alt={team.team_name}
                    className="TeamLogo"
                />
            </div>
        </Box>
            <Typography variant="h6">Numero del Pilota: {driver.driver_number}</Typography>
            <Typography variant="subtitle1">{driver.country_name}</Typography>
            </Box>
                {/*Immagine livrea*/}
            <Box sx={{ marginBottom: 0, textAlign: "center" }}>
                <img
                    className="LivreaImg"
                    src={team.team_livrea}
                    alt={`${team.team_name} Livrea`}
                    style={{
                        width: "100%",
                        maxWidth: "500px",
                        borderRadius: "12px",
                        border: "0px solid white",
                    }}
                />
            </Box>
        </Box>
        </DialogTitle>

        <DialogContent dividers>
        {/* Statistiche in griglia */}
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
            <Typography className="StatValue">{driver.season_position} th</Typography>
            </Box>
            <Box>
            <Typography className="StatLabel">Punti</Typography>
            <Typography className="StatValue">{driver.season_point} point</Typography>
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
