import Header from './components/Header'
import Theme from './components/Theme' // Assicurati che Theme sia un componente valido se lo mantieni
import React from 'react'
import './App.css'
import HomePage from './Routes/HomePage'
import ClassificaP from './Routes/ClassificaP'
import Piloti from './Routes/Piloti'
import Scuderie from './Routes/Scuderie'
import Footer from './components/Footer'
import Gp2025 from './Routes/Gp2025'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <>
    {/* Ho mantenuto il componente Theme, assicurati che sia funzionale o rimuovilo se non necessario */}
    <Theme> 
      <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/classifica_Piloti" element={<ClassificaP />} />
        <Route path="/piloti" element={<Piloti />} />
        <Route path="/piloti/classifica_Piloti" element={<ClassificaP />} />
        <Route path="/scuderie" element={<Scuderie />} />
        <Route path="/gp2025" element={<Gp2025 />} />
      </Routes>
      </BrowserRouter>
      <Footer />
    </Theme>
    </>
  )
}

export default App