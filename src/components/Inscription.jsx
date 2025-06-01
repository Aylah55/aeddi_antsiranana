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

    // Log des données du formulaire
    console.log('=== DÉBUT DE LA SOUMISSION ===');
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

    // Vérification du contenu du FormData
    console.log('=== CONTENU DU FORMDATA ===');
    for (let pair of data.entries()) {
      console.log(pair[0] + ': ' + (pair[0] === 'photo' ? 'File object' : pair[1]));
    }

    try {
      console.log('=== ENVOI DE LA REQUÊTE ===');
      console.log('URL complète:', `${API_URL}/inscription`);
      console.log('Headers:', {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      });

      // Première tentative avec axios normal
      let response;
      try {
        response = await axios({
          method: 'post',
          url: `${API_URL}/inscription`,
          data: data,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        });
      } catch (axiosError) {
        console.log('=== ERREUR AXIOS DÉTAILLÉE ===');
        console.log('Status:', axiosError.response?.status);
        console.log('Status Text:', axiosError.response?.statusText);
        console.log('Headers:', axiosError.response?.headers);
        console.log('Data:', axiosError.response?.data);
        console.log('Config:', axiosError.config);
        throw axiosError;
      }

      console.log('=== RÉPONSE REÇUE ===');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', response.data);
      
      if (response.data && response.data.status === 'success') {
        console.log('=== INSCRIPTION RÉUSSIE ===');
        // Stocker le token et les informations de l'utilisateur
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // En cas de succès, naviguer vers le tableau de bord
        navigate('/dashbord');
      } else {
        console.log('=== RÉPONSE SANS SUCCÈS ===');
        console.log('Response data:', response.data);
        setError('Une erreur est survenue lors de l\'inscription: ' + (response.data.message || 'Réponse invalide du serveur'));
      }
    } catch (err) {
      console.log('=== ERREUR DÉTAILLÉE ===');
      console.log('Type d\'erreur:', err.constructor.name);
      console.log('Message d\'erreur:', err.message);
      console.log('Stack trace:', err.stack);
      
      if (err.response) {
        console.log('=== DÉTAILS DE LA RÉPONSE D\'ERREUR ===');
        console.log('Status:', err.response.status);
        console.log('Headers:', err.response.headers);
        console.log('Data:', err.response.data);

        if (err.response.status === 422) {
          const errors = err.response.data.errors;
          console.log('Erreurs de validation:', errors);
          let errorMessages = [];
          for (const key in errors) {
            errorMessages.push(`${key}: ${errors[key].join(', ')}`);
          }
          setError(errorMessages.join('\n'));
        } else {
          setError(`Erreur du serveur (${err.response.status}): ${err.response.data.message || 'Erreur inconnue'}`);
        }
      } else if (err.request) {
        console.log('=== ERREUR DE REQUÊTE ===');
        console.log('La requête a été faite mais pas de réponse reçue');
        console.log('Request:', err.request);
        setError('Erreur de connexion: Pas de réponse du serveur');
      } else {
        console.log('=== ERREUR DE CONFIGURATION ===');
        console.log('Error config:', err.config);
        setError(`Erreur de configuration: ${err.message}`);
      }
    } finally {
      console.log('=== FIN DE LA SOUMISSION ===');
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