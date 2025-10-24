import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Table, TableHead, TableRow, 
  TableCell, TableBody, CircularProgress, Alert
} from "@mui/material";
import { api } from "../services/api";
import "../components/gp2025.css";
import "../App.css";

export default function SessionCard({ sessionKey, label, meetingName, dateStart }) {
  const [open, setOpen] = useState(false);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sessionLabels = {
    "FP1": "Prove Libere 1",
    "FP2": "Prove Libere 2", 
    "FP3": "Prove Libere 3",
    "Qualifiche": "Qualifiche",
    "Sprint Qualifiche": "Sprint Qualifiche",
    "Gara": "Gara",
    "Sprint Gara": "Sprint Gara"
  };

  // 🔥 CORREZIONE: Funzione migliorata per formattare i tempi
  const formatTime = (timeValue) => {
    if (!timeValue) return "-";
    
    // Se è già una stringa formattata (es: "1:23.456")
    if (typeof timeValue === 'string') {
      if (timeValue.includes(':') || timeValue.includes('.')) {
        return timeValue;
      }
      // Prova a convertire stringa in numero
      timeValue = parseFloat(timeValue);
    }
    
    // Se è un numero (secondi)
    if (typeof timeValue === 'number' && !isNaN(timeValue)) {
      // Per tempi molto lunghi (gare > 1 ora)
      if (timeValue >= 3600) {
        const hours = Math.floor(timeValue / 3600);
        const minutes = Math.floor((timeValue % 3600) / 60);
        const seconds = (timeValue % 60).toFixed(3);
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.padStart(6, "0")}`;
      }
      
      // Per tempi normali (minuti:secondi.millisecondi)
      const minutes = Math.floor(timeValue / 60);
      const seconds = (timeValue % 60).toFixed(3);
      return `${minutes}:${seconds.padStart(6, "0")}`;
    }
    
    return "-";
  };

  // 🔥 CORREZIONE: Funzione per formattare gap (differenze)
  const formatGap = (gapValue) => {
    if (!gapValue) return "-";
    
    // Se è già una stringa formattata
    if (typeof gapValue === 'string') {
      return gapValue;
    }
    
    // Se è un numero
    if (typeof gapValue === 'number' && !isNaN(gapValue)) {
      if (gapValue === 0) return "0.000";
      
      // Per gap molto piccoli (meno di 1 secondo)
      if (gapValue < 1) {
        return `+${gapValue.toFixed(3)}`;
      }
      
      // Per gap in secondi
      const seconds = gapValue.toFixed(3);
      return `+${seconds}`;
    }
    
    return "-";
  };

// 🔥 NUOVA FUNZIONE: Determina lo status del pilota
const getDriverStatus = (result) => {
  if (result.dsq) return "DSQ";
  if (result.dns) return "DNS";
  if (result.dnf) return "DNF";
  if (result.position) return result.position;
  return "-";
};

// 🔥 NUOVA FUNZIONE: Determina se il pilota è classificato
const isClassified = (result) => {
  return !result.dnf && !result.dns && !result.dsq && result.position;
};

  // 🔥 NUOVA FUNZIONE: Ordina i risultati correttamente
  const sortResults = (results) => {
    if (!Array.isArray(results)) return [];
    
    return results.sort((a, b) => {
      // Prima i piloti classificati (con posizione)
      const aClassified = isClassified(a);
      const bClassified = isClassified(b);
      
      if (aClassified && !bClassified) return -1;
      if (!aClassified && bClassified) return 1;
      
      // Entrambi classificati: ordina per posizione
      if (aClassified && bClassified) {
        return a.position - b.position;
      }
      
      // Entrambi non classificati: ordina per tipo di ritiro
      const statusOrder = { "DSQ": 1, "DNS": 2, "DNF": 3, "-": 4 };
      const aStatus = getDriverStatus(a);
      const bStatus = getDriverStatus(b);
      
      return statusOrder[aStatus] - statusOrder[bStatus];
    });
  };

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    setError(null);
    
    try {
      const results = await api.getResults({ 
        session: sessionKey
        // 🔥 RIMUOVI l'ordering per gestirlo localmente
      });
      
      const resultsData = results.results || results;
      console.log("📊 Dati risultati ricevuti:", resultsData);
      
      // 🔥 APPLICA ORDINAMENTO CORRETTO
      const sortedResults = sortResults(Array.isArray(resultsData) ? resultsData : []);
      setPositions(sortedResults);
      
    } catch (err) {
      console.error("Errore fetch risultati:", err);
      setError("I nostri server non sono al momento disponibili. Ci scusiamo per il disagio.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPositions([]);
    setError(null);
  };

  // Determina se è una sessione di qualifica
  const isQualifyingSession = label.includes("Qualifiche");

  return (
    <>
      <Button variant="contained" color="error" onClick={handleOpen}>
        {label}
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>
          Risultati {sessionLabels[label] || label} – {meetingName}
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <CircularProgress />
              <Typography style={{ marginTop: '10px' }}>Caricamento risultati...</Typography>
            </div>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : positions.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pos</TableCell>
                  <TableCell>Pilota</TableCell>
                  <TableCell>NO</TableCell>
                  <TableCell>Team</TableCell>
                  {isQualifyingSession ? (
                    <>
                      <TableCell>Q1</TableCell>
                      <TableCell>Q2</TableCell>
                      <TableCell>Q3</TableCell>
                      <TableCell>Gap Leader</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>Durata</TableCell>
                      <TableCell>Gap Leader</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {positions.map((p, index) => {
                  const classified = isClassified(p);
                  const status = getDriverStatus(p);
                  
                  return (
                    <TableRow 
                      key={index}
                      style={{
                        opacity: classified ? 1 : 0.6,
                        backgroundColor: classified ? 'transparent' : 'rgba(128, 128, 128, 0.1)'
                      }}
                    >
                      <TableCell 
                        style={{ 
                          color: classified ? 'inherit' : '#e74c3c',
                          fontWeight: classified ? 'normal' : 'bold'
                        }}
                      >
                        {status}
                      </TableCell>
                      <TableCell>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ 
                            backgroundColor: p.team_colour, 
                            borderRadius: "6px", 
                            padding: "2px",
                            width: "10px",
                            height: "30px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            {p.headshot_url ? (
                              <img 
                                src={p.headshot_url} 
                                alt={p.full_name} 
                                style={{ 
                                  objectPosition: "top",
                                  width: "0px", 
                                  height: "0px", 
                                  objectFit: "cover"
                                }} 
                              />
                            ) : (
                              <span style={{ color: 'white', fontSize: '12px' }}>
                                {p.name_acronym}
                              </span>
                            )}
                          </div>
                          <Typography>{p.name_acronym || p.full_name}</Typography>
                        </div>
                      </TableCell>
                      <TableCell>{p.driver_number}</TableCell>
                      <TableCell>{p.team_name}</TableCell>
                      {isQualifyingSession ? (
                        <>
                          <TableCell>{classified ? formatTime(p.q1) : "-"}</TableCell>
                          <TableCell>{classified ? formatTime(p.q2) : "-"}</TableCell>
                          <TableCell>{classified ? formatTime(p.q3) : "-"}</TableCell>
                          <TableCell>{classified ? formatGap(p.gap_to_leader) : "-"}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{classified ? formatTime(p.duration) : "-"}</TableCell>
                          <TableCell>{classified ? formatGap(p.gap_to_leader) : "-"}</TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Typography>Nessun risultato disponibile per questa sessione.</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant="outlined">Chiudi</Button>
        </DialogActions>
      </Dialog>

      <div className="session-date">
        <span>
          {dateStart ? new Date(dateStart).toLocaleDateString("it-IT", { 
            weekday: "short", 
            year: "numeric", 
            month: "2-digit", 
            day: "2-digit" 
          }) : "Data non disponibile"}{" "}
          {dateStart && new Date(dateStart).toLocaleTimeString("it-IT", { 
            hour: "2-digit", 
            minute: "2-digit" 
          })}
        </span>
      </div>
    </>
  );
}