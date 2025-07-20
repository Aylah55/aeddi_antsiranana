import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../services/api';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log('=== GoogleCallback Component Mounted ===');
    console.log('Current URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Search params:', window.location.search);
    
    const token = searchParams.get('token');
    const userId = searchParams.get('user_id');
    const error = searchParams.get('error');

    console.log('=== GoogleCallback Debug ===');
    console.log('Token:', token ? 'Présent' : 'Manquant');
    console.log('UserId:', userId);
    console.log('Error:', error);
    console.log('URL complète:', window.location.href);
    console.log('API_URL:', process.env.REACT_APP_API_URL_PROD || 'Non défini');
    if (error) {
      console.error('Erreur Google OAuth:', error);
      navigate('/login?error=google_auth_failed');
      return;
    }
    if (token && userId) {
      localStorage.setItem('auth_token', token);
      const userDataEncoded = searchParams.get('user_data');
      const isNewUser = searchParams.get('new_user') === 'true';
      console.log('userDataEncoded:', userDataEncoded, 'isNewUser:', isNewUser);
      if (userDataEncoded && isNewUser) {
        // Nouvel utilisateur : décoder et stocker directement
        try {
          const decodedData = atob(userDataEncoded);
          const user = JSON.parse(decodedData);
          localStorage.setItem('user', JSON.stringify(user));
          navigate('/dashbord', { replace: true });
          return;
        } catch (decodeError) {
          console.error('Erreur lors du décodage des données utilisateur:', decodeError);
        }
      }
      // Utilisateur existant : récupérer via l'API
      fetch(`${API_URL}/api/temp-user-data/${userId}`)
        .then(async response => {
          if (response.status === 404) {
            // Fallback utilisateur minimal si données temporaires non trouvées
            console.info('Aucune donnée temporaire trouvée (404), fallback utilisateur minimal.');
            const minimalUser = {
              id: userId,
              email: 'utilisateur@google.com',
              nom: 'Utilisateur Google',
              prenom: 'Utilisateur',
              provider: 'google'
            };
            localStorage.setItem('user', JSON.stringify(minimalUser));
            navigate('/dashbord', { replace: true });
            return;
          }
          // Si autre erreur, lever une exception pour catch
          if (!response.ok) throw new Error('Erreur API temp-user-data');
          return response.json();
        })
        .then(data => {
          if (!data) return; // déjà géré plus haut
          if (data.status === 'success' && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/dashbord', { replace: true });
          } else {
            throw new Error(data.message || 'Aucune information utilisateur trouvée');
          }
        })
        .catch(err => {
          // Fallback utilisateur minimal pour toute autre erreur
          console.warn('Erreur inattendue lors de la récupération des données utilisateur, fallback minimal utilisé.', err);
          const minimalUser = {
            id: userId,
            email: 'utilisateur@google.com',
            nom: 'Utilisateur Google',
            prenom: 'Utilisateur',
            provider: 'google'
          };
          localStorage.setItem('user', JSON.stringify(minimalUser));
          navigate('/dashbord', { replace: true });
        });
    } else {
      console.error('Token ou userId manquant');
      console.error('Token:', token);
      console.error('UserId:', userId);
      navigate('/login?error=google_auth_failed');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Connexion en cours...</h2>
        <p className="text-gray-500">Veuillez patienter pendant que nous vous connectons à votre espace personnel.</p>
        <div className="mt-4 text-xs text-gray-400">
          <p>Debug: Récupération des données utilisateur...</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback; 