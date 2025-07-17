import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userId = params.get('user_id');
        const errorParam = params.get('error');

        console.log('GoogleCallback - Token reçu:', token ? 'OUI' : 'NON');
        console.log('GoogleCallback - User ID reçu:', userId);
        console.log('GoogleCallback - Error param:', errorParam);

        if (errorParam) {
          setError('Erreur lors de la connexion avec Google');
          setLoading(false);
          return;
        }

        if (!token) {
          setError('Token d\'authentification manquant');
          setLoading(false);
          return;
        }

        // Stocker le token
        localStorage.setItem('auth_token', token);
        console.log('GoogleCallback - Token stocké dans localStorage');

        // Récupérer les informations de l'utilisateur
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL_LOCAL}/api/user`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            }
          );

          console.log('GoogleCallback - Profil utilisateur récupéré:', response.data);

          // Stocker les informations utilisateur
          localStorage.setItem('user', JSON.stringify(response.data));
          
          // Rediriger selon la présence du mot de passe
          if (!response.data.password) {
            navigate('/create-password');
          } else {
            // Rediriger vers le dashboard
            console.log('GoogleCallback - Redirection vers /dashbord');
            navigate('/dashbord');
          }
        } catch (userError) {
          console.error('Erreur lors de la récupération du profil:', userError);
          // Même en cas d'erreur, on peut rediriger vers le dashboard
          // car le token est valide
          console.log('GoogleCallback - Erreur profil, mais redirection vers /dashbord');
          navigate('/dashbord');
        }

      } catch (err) {
        console.error('Erreur callback Google:', err);
        setError('Erreur lors de la connexion');
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connexion en cours...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de connexion</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/connexion')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return null;
} 