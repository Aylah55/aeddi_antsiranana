import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const FacebookCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('user_id');
    const error = searchParams.get('error');

    console.log('=== FacebookCallback Debug ===');
    console.log('Token:', token ? 'Présent' : 'Manquant');
    console.log('UserId:', userId);
    console.log('Error:', error);
    console.log('URL complète:', window.location.href);

    if (error) {
      console.error('Erreur Facebook OAuth:', error);
      navigate('/login?error=facebook_auth_failed');
      return;
    }

    if (token && userId) {
      // Stocker le token d'authentification
      localStorage.setItem('auth_token', token);
      console.log('Token stocké dans localStorage');
      
      // Récupérer les données utilisateur depuis l'API
      fetch(`http://localhost:8000/api/temp-user-data/${userId}`)
        .then(response => {
          console.log('Réponse API temp-user-data - Status:', response.status);
          return response.json();
        })
        .then(data => {
          console.log('Données utilisateur reçues:', data);
          
          if (data.status === 'success' && data.user) {
            const user = data.user;
            console.log('Utilisateur récupéré depuis le cache:', user);
            
            // Stocker les informations utilisateur
            localStorage.setItem('user', JSON.stringify(user));
            console.log('Utilisateur stocké dans localStorage:', user);
            
            // Rediriger vers le dashboard
            console.log('Connexion Facebook réussie, redirection vers le dashboard...');
            navigate('/dashbord', { replace: true });
          } else {
            throw new Error(data.message || 'Aucune information utilisateur trouvée');
          }
        })
        .catch(err => {
          console.error('Erreur lors de la récupération des données utilisateur:', err);
          
          // En cas d'erreur, créer un utilisateur minimal
          const minimalUser = {
            id: userId,
            email: 'utilisateur@facebook.com',
            nom: 'Utilisateur Facebook',
            prenom: 'Utilisateur',
            provider: 'facebook'
          };
          
          localStorage.setItem('user', JSON.stringify(minimalUser));
          console.log('Utilisateur minimal créé, redirection vers dashboard...');
          navigate('/dashbord', { replace: true });
        });
    } else {
      console.error('Token ou userId manquant');
      console.error('Token:', token);
      console.error('UserId:', userId);
      navigate('/login?error=facebook_auth_failed');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Connexion en cours...</h2>
        <p className="text-gray-500">Veuillez patienter pendant que nous vous connectons à votre espace personnel.</p>
        <div className="mt-4 text-xs text-gray-400">
          <p>Debug: Récupération des données utilisateur...</p>
        </div>
      </div>
    </div>
  );
};

export default FacebookCallback; 