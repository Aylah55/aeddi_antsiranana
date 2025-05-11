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

// Intercepteur de réponse pour la gestion des erreurs
apiClient.interceptors.response.use(
  response => response, // Retourne la réponse si tout est OK
  error => {
    // Gère les erreurs d'API globalement
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
  }
);

// Service d'authentification
export const authService = {
  inscription: (formData) => {
    return apiClient.post('/inscription', formData); // Axios gère le type `multipart/form-data`
  },

  login: (credentials) => {
    return apiClient.post('/login', credentials);
  },

  logout: () => {
    return apiClient.post('/logout');
  }
};

// Service utilisateur
export const userService = {
  getProfile: (id) => {
    return apiClient.get(`/profile/${id}`);
  },

  updateProfile: (id, formData) => {
    return apiClient.post(`/profile/${id}?_method=PUT`, formData); // Axios gère également `multipart/form-data`
  },

  fetchAll: () => {
    return apiClient.get('/users');
  },

  update: (id, formData) => {
    return apiClient.post(`/actions/users/${id}`, formData);
  },

  delete: (id) => {
    return apiClient.delete(`/actions/users/${id}`);
  }
};

// Service d'activités
export const activiteService = {
  fetchAll: () => {
    return apiClient.get('/activites');
  },

  create: (data) => {
    return apiClient.post('/activites', data);
  },

  update: (id, data) => {
    return apiClient.put(`/activites/${id}`, data);
  },

  delete: (id) => {
    return apiClient.delete(`/activites/${id}`);
  }
};

// Export par défaut pour les cas spéciaux
export default {
  install: (app) => {
    app.config.globalProperties.$api = {
      auth: authService,
      users: userService,
      activites: activiteService
    };
  }
};
