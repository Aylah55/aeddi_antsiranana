import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Configuration Axios globale
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Gestion des erreurs centralisée
const handleApiError = (error) => {
  if (error.response) {
    console.error('API Error Response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
    throw error.response.data;
  } else if (error.request) {
    console.error('API Request Error:', error.request);
    throw new Error('Aucune réponse du serveur');
  } else {
    console.error('API Setup Error:', error.message);
    throw error;
  }
};

// Service d'authentification (inscription uniquement)
export const authService = {
  inscription: (formData) => {
    return apiClient.post('/inscription', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).catch(handleApiError); // Ajout de la gestion des erreurs ici
  },

  login: (credentials) => {
    return apiClient.post('/login', credentials).catch(handleApiError); // Ajout de la gestion des erreurs ici
  },

  logout: () => {
    return apiClient.post('/logout').catch(handleApiError); // Ajout de la gestion des erreurs ici
  }
};

// Export par défaut pour les cas spéciaux
export default {
  install: (app) => {
    app.config.globalProperties.$api = {
      auth: authService,
    };
  }
};
