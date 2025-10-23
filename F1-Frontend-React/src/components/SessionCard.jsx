import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Table, TableHead, TableRow, TableCell, TableBody,} from "@mui/material";
import { api } from "../services/api";

export default function SessionCard({ sessionKey, label, meetingName, dateStart }) {
  const [open, setOpen] = useState(false);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const resultMap = {};
  const resultData = [];

  const sessionLabels = {
    R: "Gara",
    Race: "Gara",
    Q: "Qualifica",
    Qualifying: "Qualifica",
    FP1: "Prove Libere 1",
    FP2: "Prove Libere 2",
    FP3: "Prove Libere 3",
  };

  // Formatta secondi → mm:ss.mmm
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.round((seconds - Math.floor(seconds)) * 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}.${millis
      .toString()
      .padStart(3, "0")}`;
  };

// Modifica handleOpen per usare il tuo backend
const handleOpen = async () => {
  setOpen(true);
  setLoading(true);
  
  try {
    // Usa il tuo endpoint results invece di OpenF1 diretto
    const results = await api.getResults({ 
      session: sessionKey,
      ordering: 'position' 
    });
    
    setPositions(results.results || results);
  } catch (err) {
    console.error("Errore fetch risultati:", err);
    // Fallback a OpenF1 se necessario
  } finally {
    setLoading(false);
  }
};

// Arricchisci con dati locali + duration/gap/q1/q2/q3
const enriched = latestPositions
  .map((pos) => {
    const driver = DriversData.find((d) => d.driver_number === pos.driver_number);
    const result = resultMap[pos.driver_number];
    if (!driver) return null;

    let q1 = "-", q2 = "-", q3 = "-";
    let duration = "-";
    let gap_to_leader = "-";

    if (result) {
      if ((label === "Q" || label === "Qualifying") && Array.isArray(result.duration) && result.duration.length === 3) {
        // durata in array -> Q1/Q2/Q3
        [q1, q2, q3] = result.duration.map(formatTime);

        // calcola gap rispetto al leader per ciascun Q
        const leaderTimes = [0,0,0]; // placeholder per leader
        const allDurations = resultData.map(r => r.duration);
        for(let i=0; i<3; i++){
          const timesQ = allDurations.map(d => Array.isArray(d)? d[i]: null).filter(Boolean);
          leaderTimes[i] = Math.min(...timesQ);
        }
        const gaps = result.duration.map((t, i) => t - leaderTimes[i]);
        gap_to_leader = gaps.map(formatTime).join(" / "); // ad esempio "0:01.234 / 0:00.456 / 0:00.789"
      } else {
        duration = result.duration ? formatTime(result.duration) : result.time ? formatTime(result.time) : "-";
        gap_to_leader = result.gap_to_leader ? formatTime(result.gap_to_leader) : "-";

        // fallback: se qualifiche ma solo un tempo singolo
        if (label === "Q" || label === "Qualifying") q1 = duration;
      }
    }

    return {
      ...pos,
      ...driver,
      duration,
      gap_to_leader,
      q1,
      q2,
      q3,
    };
  })
  .filter(Boolean);




  const handleClose = () => {
    setOpen(false);
    setPositions([]);
  };

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
            <Typography>Caricamento risultati...</Typography>
          ) : positions.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Pos</TableCell>
                  <TableCell>Pilota</TableCell>
                  <TableCell>NO</TableCell>
                  <TableCell>Team</TableCell>
                  {(label === "Q" || label === "Qualifying") ? (
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
                {positions.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell>{p.position}</TableCell>
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ backgroundColor: p.team_colour, borderRadius: "6px", padding: "2px", width: "1.5px" }}>
                          <img src={p.headshot_url} alt={p.full_name} style={{ width: "0px", borderRadius: "4px" }} />
                        </div>
                        <Typography>{p.name_acronym}</Typography>
                      </div>
                    </TableCell>
                    <TableCell>{p.driver_number}</TableCell>
                    <TableCell>{p.team_name}</TableCell>
                    {(label === "Q" || label === "Qualifying") ? (
                      <>
                        <TableCell>{p.q1}</TableCell>
                        <TableCell>{p.q2}</TableCell>
                        <TableCell>{p.q3}</TableCell>
                        <TableCell>{p.gap_to_leader}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{p.duration}</TableCell>
                        <TableCell>{p.gap_to_leader}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>Nessun risultato disponibile.</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant="outlined">Chiudi</Button>
        </DialogActions>
      </Dialog>

      <div className="session-item">
        <span>
          {new Date(dateStart).toLocaleDateString("it-IT", { weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" })}{" "}
          {new Date(dateStart).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </>
  );
}
