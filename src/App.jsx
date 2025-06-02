import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accueil from './components/Formulaire/Accueil';
import ProfilUtilisateur from './components/Dashboard/ProfilUtilisateur';
import Inscription from './components/Formulaire/Inscription';
import ProfilDashbord from './components/Dashboard/ProfilDashbord';
import Connexion from './components/Formulaire/Connexion';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Accueil />} />
                <Route path="/register" element={<Inscription />} />
                <Route path="/profile/:id" element={<ProfilUtilisateur />} />
                <Route path="/dashbord" element={<ProfilDashbord />} />
                <Route path="/login" element={<Connexion />} />
            </Routes>
        </Router>
    );
}

export default App;
