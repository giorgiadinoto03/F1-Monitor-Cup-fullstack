import Header from './components/Header'
import Theme from './components/Theme'
import React from 'react'
import './App.css'
import HomePage from './Routes/HomePage'
import Scuderie from './Routes/Scuderie'; 
import Piloti from './Routes/Piloti'; 
import Gp2025 from './Routes/Gp2025'; 
import Footer from './components/Footer'
import { BrowserRouter, Routes, Route } from 'react-router-dom'


function App() {

  return (
    <>
    <Theme> 
      <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/piloti" element={<Piloti />} />
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