import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accueil from './components/Formulaire/Accueil';
import ProfilUtilisateur from './components/Dashboard/ProfilUtilisateur';
import Inscription from './components/Formulaire/Inscription';
import ProfilDashbord from './components/Dashboard/ProfilDashbord';
import Connexion from './components/Formulaire/Connexion';
import GoogleCallback from './components/Formulaire/GoogleCallback';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Message from './components/Dashboard/Message';
import { GoogleOAuthProvider } from '@react-oauth/google';
import CreatePassword from './components/Formulaire/create-password';
import ForgotPassword from './components/Formulaire/ForgotPassword';

// 🟨 Ajoute ce log ici
console.log('GOOGLE_CLIENT_ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);

function App() {
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <Router>
                <ToastContainer />
                <Routes>
                    <Route path="/" element={<Accueil />} />
                    <Route path="/login" element={<Accueil />} />
                    <Route path="/register" element={<Inscription />} />
                    <Route path="/google-callback" element={<GoogleCallback />} />
                    <Route path="/profile/:id" element={<ProfilUtilisateur />} />
                    <Route path="/dashbord" element={<ProfilDashbord />} />
                    <Route path="/create-password" element={<CreatePassword />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Routes>
                <Message />
            </Router>
        </GoogleOAuthProvider>
    );
}

export default App;
