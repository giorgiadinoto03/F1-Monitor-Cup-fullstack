import React, { useEffect , useState} from 'react';
import {BrowserRouter, Route, Routes, Link} from 'react-router-dom';
import DriversData from '../data/piloti.json';
import PilotiCard from '../components/PilotiCard';
import "../App.css";
import SideImage from '../components/SideImage';

export function Piloti() {
    const [drivers, setDrivers ] = useState(DriversData);
    const [lastSession_key, setLastSession_key] = useState('');

    //ordina i piloti in base all'ordine numerico
    drivers.sort((a, b) => a.driver_number - b.driver_number);

    useEffect(() => {
    const getData = async () => {
        try {
            const response = await fetch('https://api.openf1.org/v1/sessions?session_key=latest');
            const data = await response.json();

            const Session_key = data[0].session_key;
            setLastSession_key(Session_key);
            
            console.log("Session_key:", Session_key);

            const responseDrivers = await fetch('https://api.openf1.org/v1/drivers?session_key=' + Session_key);
            const driversData = await responseDrivers.json();

            console.log("Drivers API:", driversData);

            const mergeDrivers = DriversData.map(localDriver => {
                const apiDriver = DriversData.find (d => d.driver_number === localDriver.driver_number);
                
                if (!apiDriver) {
                    return localDriver;
                }
                return {
                    ...localDriver,
                    ...apiDriver,
                }
            })

            setDrivers(mergeDrivers);
            

        } catch (err) {
            console.error("Errore nel fetch:", err);
        }
    };

    getData();
}, []);

    return (
    <div className="SideImage-container">
        <SideImage 
                src="https://static.vecteezy.com/ti/vettori-gratis/p1/16168385-da-corsa-e-rally-auto-scacchi-vettore-bandiera-vettoriale.jpg"
                alt="Bandiera a scacchi sinistra"
                position="left"
            />
        <div className="Piloti">
        
            <h1>Benvenuto nella sezione Piloti</h1>
            <h2>Informazioni sui piloti di Formula 1</h2>
            <p>Qui potrai trovare tutte le informazioni sulla stagione di Formula 1 2025 </p>
            <p> Usa la barra di navigazione in alto per esplorare le diverse sezioni dell'app.</p>
            <p>Buona navigazione!</p>

        {/*Bottone per vedere in base alla classifica*/}
        <div className="filtro-container">
            <Link to="/piloti/classifica_Piloti">
                <button className='Filtro'> Filtra per Classifica Piloti</button>
            </Link>
        </div>
            
            <div className="piloti-table-container">
                <table className="piloti-table">
                    <thead>
                        <tr>
                            <th>Numero del pilota</th>
                            <th>  </th>
                            <th>Acronimo</th>
                            <th>Nome Completo</th>
                            <th>Team</th>
                            <th>Nazione</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers.map((driver, index) => (
                            <tr key={index}>
                                <td>{driver.driver_number}</td> 
                                <td>
                                    <div
                                    className='PilotiBackground'
                                    style={{ backgroundColor: driver.team_colour}}
                                    >
                                    <img
                                    className='PilotiImg'
                                        src={driver.headshot_url}
                                        alt={driver.full_name}
                                    />
                                    </div>
                                </td>
                                <td><b>{driver.name_acronym}</b></td>
                                <td className='PilotiName' >{driver.first_name } {driver.last_name}
                                    <br></br>
                                    <PilotiCard driver={driver} />
                                </td>
                                <td>
                                    {driver.team_name}
                                </td>
                                <td>{driver.country_code}</td>
                            </tr>
                        ))}
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
export default Piloti;