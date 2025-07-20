import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accueil from './components/Formulaire/Accueil';
import ProfilUtilisateur from './components/Dashboard/ProfilUtilisateur';
import ProfilDashbord from './components/Dashboard/ProfilDashbord';
import Connexion from './components/Formulaire/Connexion';
import GoogleCallback from './components/Formulaire/GoogleCallback';
import FacebookCallback from './components/Formulaire/FacebookCallback';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Message from './components/Dashboard/Message';
import { GoogleOAuthProvider } from '@react-oauth/google';
import CreatePassword from './components/Formulaire/create-password';
import ForgotPassword from './components/Formulaire/ForgotPassword';
import TestRoute from './components/TestRoute';

// 🟨 Ajoute ce log ici
console.log('GOOGLE_CLIENT_ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);

function App() {
    console.log('=== App Component Mounted ===');
    console.log('Available routes:', [
        '/',
        '/login', 
        '/google-callback',
        '/facebook-callback',
        '/profile/:id',
        '/dashbord',
        '/create-password',
        '/forgot-password'
    ]);
    console.log('Current pathname:', window.location.pathname);
    console.log('Google Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID ? 'Défini' : 'Non défini');
    
    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <Router>
                <ToastContainer />
                <Routes>
                    <Route path="/" element={<Accueil />} />
                    <Route path="/login" element={<Accueil />} />
                    <Route path="/google-callback" element={<GoogleCallback />} />
                    <Route path="/facebook-callback" element={<FacebookCallback />} />
                    <Route path="/profile/:id" element={<ProfilUtilisateur />} />
                    <Route path="/dashbord" element={<ProfilDashbord />} />
                    <Route path="/create-password" element={<CreatePassword />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/test-route" element={<TestRoute />} />
                </Routes>
                <Message />
            </Router>
        </GoogleOAuthProvider>
    );
}

export default App;
