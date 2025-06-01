import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://aeddi-backend.onrender.com/api';

function Inscription({ onSwitch }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    photo: null,
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'photo') {
      setFormData({ ...formData, photo: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    console.log('=== DÉBUT DE L\'INSCRIPTION ===');
    console.log('URL de l\'API:', API_URL);
    console.log('FormData initial:', formData);

    const data = new FormData();
    data.append('nom', formData.nom);
    data.append('prenom', formData.prenom);
    data.append('email', formData.email);
    data.append('password', formData.password);
    if (formData.photo) {
      data.append('photo', formData.photo);
    }

    console.log('=== CONTENU DU FORMDATA ===');
    for (let pair of data.entries()) {
      console.log(pair[0] + ':', pair[0] === 'photo' ? 'File object' : pair[1]);
    }

    try {
      console.log('=== ENVOI DE LA REQUÊTE ===');
      const fullUrl = `${API_URL}/inscription`;
      console.log('URL complète:', fullUrl);

      const response = await axios.post(fullUrl, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });

      console.log('=== RÉPONSE REÇUE ===');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', response.data);

      if (!response.data) {
        throw new Error('Pas de données reçues du serveur');
      }

      if (response.data.status === 'success' && response.data.token && response.data.user) {
        console.log('=== INSCRIPTION RÉUSSIE ===');
        console.log('Token reçu:', response.data.token.substring(0, 10) + '...');
        console.log('Données utilisateur:', response.data.user);

        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Vérification du stockage
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user');
        console.log('=== VÉRIFICATION DU STOCKAGE ===');
        console.log('Token stocké:', storedToken ? 'Présent' : 'Absent');
        console.log('Utilisateur stocké:', storedUser ? 'Présent' : 'Absent');

        if (storedToken && storedUser) {
          navigate('/dashbord');
        } else {
          throw new Error('Échec du stockage des données d\'authentification');
        }
      } else {
        console.log('=== RÉPONSE INVALIDE ===');
        console.log('Structure de la réponse:', Object.keys(response.data));
        
        let errorMessage = 'Erreur lors de l\'inscription: ';
        if (response.data.message) {
          errorMessage += response.data.message;
        } else if (response.data.error) {
          errorMessage += response.data.error;
        } else {
          errorMessage += 'Format de réponse invalide';
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.log('=== ERREUR DÉTAILLÉE ===');
      console.log('Type d\'erreur:', err.constructor.name);
      console.log('Message d\'erreur:', err.message);
      
      if (err.response) {
        console.log('Statut de l\'erreur:', err.response.status);
        console.log('Données de l\'erreur:', err.response.data);
        
        if (err.response.status === 422) {
          const errors = err.response.data.errors;
          let errorMessages = [];
          for (const key in errors) {
            errorMessages.push(`${key}: ${errors[key].join(', ')}`);
          }
          setError(errorMessages.join('\n'));
        } else {
          setError(`Erreur du serveur (${err.response.status}): ${err.response.data.message || err.message}`);
        }
      } else if (err.request) {
        console.log('Erreur de requête:', err.request);
        setError('Erreur de connexion: Le serveur ne répond pas');
      } else {
        console.log('Erreur:', err.message);
        setError(`Erreur: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 border-2 border-transparent hover:border-blue-200 transition-all duration-300">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Inscription</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-500 text-sm rounded-md text-center whitespace-pre-line">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <input
                type="file"
                name="photo"
                onChange={handleChange}
                className="w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 shadow-md ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Vous avez déjà un compte ?{' '}
          <span
            onClick={onSwitch}
            className="text-blue-600 font-medium hover:text-blue-800 cursor-pointer underline transition-colors"
          >
            Connectez-vous ici
          </span>
        </p>
      </div>
    </div>
  );
}

export default Inscription;
