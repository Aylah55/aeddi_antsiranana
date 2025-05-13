import axios from 'axios';

// Configuration de l'URL de base de l'API en fonction de l'environnement
const API_URL = process.env.REACT_APP_API_URL || 'https://aeddi-backend.onrender.com/api';

// Configuration Axios globale
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Configuration des intercepteurs pour gérer les requêtes CORS
apiClient.interceptors.request.use(
  config => {
    // Ne pas ajouter le header Authorization pour les requêtes OPTIONS
    if (config.method === 'options') {
      return config;
    }
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

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

// Service d'authentification
export const authService = {
  // Inscription d'un utilisateur
  inscription: (formData) => {
    return apiClient.post('/inscription', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).catch(handleApiError);
  },


  login: (credentials) => {
    return apiClient.post('/login', credentials)
      .catch(handleApiError);
  },


  logout: () => {
    return apiClient.post('/logout')
      .catch(handleApiError);
  }
};

export const userService = {
  getProfile: () => {
    return apiClient.get('/user')
      .catch(handleApiError);
  },

  updateProfile: (id, formData) => {
    return apiClient.post(`/profile/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).catch(handleApiError);
  },

  // Récupérer tous les utilisateurs
  fetchUsers: () => {
    return apiClient.get('/users')
      .then(response => {
        // S'assurer que la réponse contient bien la propriété users
        if (response.data && response.data.users) {
          return { data: response.data };
        }
        // Si la réponse est directement le tableau des utilisateurs
        if (Array.isArray(response.data)) {
          return { data: { users: response.data } };
        }
        // Sinon, retourner la réponse telle quelle
        return response;
      })
      .catch(handleApiError);
  },

  update: (id, formData) => {
    return apiClient.post(`/actions/users/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).catch(handleApiError);
  },

  delete: (id) => {
    return apiClient.delete(`/actions/users/${id}`)
      .catch(handleApiError);
  }
};

// Service activités
export const activiteService = {
  fetchAll: () => {
    return apiClient.get('/activites')
      .catch(handleApiError); // Gérer les erreurs
  },

  create: (data) => {
    return apiClient.post('/activites', data)
      .catch(handleApiError); // Gérer les erreurs
  },

  update: (id, data) => {
    return apiClient.put(`/activites/${id}`, data)
      .catch(handleApiError); // Gérer les erreurs
  },

  delete: (id) => {
    return apiClient.delete(`/activites/${id}`)
      .catch(handleApiError); // Gérer les erreurs
  }
};

// Exposer les services d'authentification
export const registerUser = authService.inscription;
export const loginUser = authService.login;
export const logoutUser = authService.logout;

// Exposer les services utilisateur
export const getUserProfile = userService.getProfile;
export const updateUserProfile = userService.updateProfile;
export const fetchUsers = userService.fetchAll;
export const updateUser = userService.update;
export const deleteUser = userService.delete;
// Alias pour la rétrocompatibilité
export const getCurrentUser = userService.getProfile;

// Exposer les services d'activités
export const fetchActivities = activiteService.fetchAll;
export const createActivity = activiteService.create;
export const updateActivity = activiteService.update;
export const deleteActivity = activiteService.delete;

// Exporter apiClient pour une utilisation directe si nécessaire
export { apiClient };

// Export par défaut pour les cas spéciaux
export default {
  install: (app) => {
    app.config.globalProperties.$api = {
      auth: authService,
      users: userService,
      activities: activiteService
    };
  }
};
