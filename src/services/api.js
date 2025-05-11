import axios from 'axios';

// URL de ton API backend sur Render
const API_URL = 'https://aeddi-backend.onrender.com/api';  // Mise à jour ici

// Configuration Axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter un token (si besoin à l’avenir)
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Gestion des erreurs
const handleApiError = (error) => {
  if (error.response) {
    console.error('Erreur API :', error.response.data);
    throw error.response.data;
  } else if (error.request) {
    console.error('Pas de réponse du serveur :', error.request);
    throw new Error('Aucune réponse du serveur');
  } else {
    console.error('Erreur de configuration :', error.message);
    throw error;
  }
};

// Service d'inscription uniquement
export const registerUser = async (formData) => {
  try {
    const response = await apiClient.post('/inscription', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
