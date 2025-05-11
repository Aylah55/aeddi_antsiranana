import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accueil from './components/Accueil';
import ProfilUtilisateur from './components/ProfilUtilisateur';
import Inscription from './components/Inscription';
import ProfilDashbord from './components/ProfilDashbord';
import Connexion from './components/Connexion';
import Administrateur from './pages/admin/Administrateur';
import GestionMembre from './pages/admin/GestionMembre'; // Importez le composant GestionMembre
import Activites from './pages/admin/Activites';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Accueil />} />
                <Route path="/register" element={<Inscription />} />
                <Route path="/profile/:id" element={<ProfilUtilisateur />} />
                <Route path="/dashbord" element={<ProfilDashbord />} />
                <Route path="/login" element={<Connexion />} />
                <Route path="/administrateur" element={<Administrateur />}>
                    <Route path="membres" element={<GestionMembre />} />
                    <Route path="activites" element={<Activites />} />
                </Route>
            
            </Routes>
        </Router>
    );
}

export default App;
