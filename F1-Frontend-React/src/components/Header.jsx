import * as React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';

// Logo F1 personalizzato nell header
const f1Logo = "/F1-monitor-cup-logo1.png";

// Pulsanti di navigazione
const pages = [
{ label: "Home Page", path: "/" },
{ label : "Piloti", path: "/piloti" },
{ label: "Scuderie", path: "/scuderie" },
{ label: "GP 2025", path: "/gp2025" }
];

export default function Header() {
return (
    <AppBar position="static">
    <Container maxWidth="0" className='Header'> {/* Container per centrare il contenuto */}
        <Toolbar disableGutters>
            {/* Voglio mettere i bottoni al centro */}
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: "flex", alignItems: "center"}}> 

                <img src={f1Logo} alt="F1 Logo" style={{ width: 80, height: 70, marginRight: 10 }} /> {/* Logo F1 */}
                <Typography
                variant="h5"
                sx={{
                    fontFamily: "Titillium Web",
                    fontWeight: 700,
                    letterSpacing: ".3rem",
                    color: "inherit",
                    textShadow: "2px 2px 4px rgba(255, 251, 173, 0.63)", // Aggiunge un'ombra al testo per migliorare la leggibilità
                    }}
                >
                F1 Monitor Cup
                </Typography>
            </Box>
        </Link>

        {/* Pulsanti di navigazione */}
        <Box sx={{ flexGrow: 0.80, display: "flex", justifyContent: "center" }}>
            {pages.map((page) => (
            <Button className="ButtonNav"
                key={page.label}
                component={Link}
                to={page.path}
                sx={{ my: 2, color: "white", display: "flex" }}
            >
                {page.label}
            </Button>
            ))}
        </Box>
        </Toolbar>
    </Container>
    </AppBar>
);
}
