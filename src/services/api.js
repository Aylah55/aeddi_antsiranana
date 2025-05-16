import axios from 'axios';

// Configuration de l'URL de base de l'API en fonction de l'environnement
const API_URL = process.env.REACT_APP_API_URL || 'https://aeddi-backend.onrender.com/api';

// Configuration Axios globale
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000, // 10 secondes de timeout
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Intercepteur pour ajouter le token JWT dans les en-têtes (sauf pour les requêtes OPTIONS)
apiClient.interceptors.request.use(
  config => {
    if (config.method !== 'options') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

// Gestion centralisée des erreurs API
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
  // Inscription
  inscription: (formData) => {
    return apiClient.post('/inscription', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).catch(handleApiError);
  },

  // Connexion
  login: (credentials) => {
    return apiClient.post('/login', credentials)
      .catch(handleApiError);
  },

  // Déconnexion
  logout: () => {
    return apiClient.post('/logout')
      .catch(handleApiError);
  }
};

// Service utilisateur
export const userService = {
  // Profil utilisateur connecté
  getProfile: () => {
    return apiClient.get('/user')
      .catch(handleApiError);
  },

  // Mise à jour du profil utilisateur
  updateProfile: (id, formData) => {
    return apiClient.post(`/profile/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).catch(handleApiError);
  },

  // Récupérer tous les utilisateurs
  fetchAll: () => {
    return apiClient.get('/users')
      .then(response => {
        if (response.data && response.data.users) {
          return { data: response.data };
        }
        if (Array.isArray(response.data)) {
          return { data: { users: response.data } };
        }
        return response;
      })
      .catch(handleApiError);
  },

  // Mettre à jour un utilisateur
  update: (id, formData) => {
    return apiClient.put(`/actions/users/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).catch(handleApiError);
  },

  // Supprimer un utilisateur
  delete: (id) => {
    return apiClient.delete(`/actions/users/${id}`)
      .catch(handleApiError);
  }
};

// Service des activités
export const activiteService = {
  // Récupérer toutes les activités
  fetchAll: () => {
    return apiClient.get('/activites')
      .catch(handleApiError);
  },

  // Créer une activité
  create: (data) => {
    return apiClient.post('/activites', data)
      .catch(handleApiError);
  },

  // Mettre à jour une activité
  update: (id, data) => {
    return apiClient.put(`/activites/${id}`, data)
      .catch(handleApiError);
  },

  // Supprimer une activité
  delete: (id) => {
    return apiClient.delete(`/activites/${id}`)
      .catch(handleApiError);
  }
};

// Alias pratiques pour les composants React
export const registerUser = authService.inscription;
export const loginUser = authService.login;
export const logoutUser = authService.logout;

export const getUserProfile = userService.getProfile;
export const updateUserProfile = userService.updateProfile;
export const fetchUsers = userService.fetchAll;
export const updateUser = userService.update;
export const deleteUser = userService.delete;
export const getCurrentUser = userService.getProfile;

export const fetchActivities = activiteService.fetchAll;
export const createActivity = activiteService.create;
export const updateActivity = activiteService.update;
export const deleteActivity = activiteService.delete;

// Exporter l’instance Axios si besoin
export { apiClient };
