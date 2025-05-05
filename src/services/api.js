import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

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

// Service d'authentification
export const authService = {
  inscription: (formData) => {
    return apiClient.post('/inscription', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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
    return apiClient.post(`/profile/${id}?_method=PUT`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  fetchAll: () => {
    return apiClient.get('/users');
  },

  update: (id, formData) => {
    return apiClient.post(`/actions/users/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
},
  delete: (id) => {
    return apiClient.delete(`/actions/users/${id}`);
  }
};

// Fonctions dépréciées (à supprimer progressivement)
export const registerUser = authService.inscription;
export const loginUser = authService.login;
export const logoutUser = authService.logout;
export const getUserProfile = userService.getProfile;
export const updateUserProfile = userService.updateProfile;
export const fetchUsers = userService.fetchAll;
export const updateUser = userService.update;
export const deleteUser = userService.delete;
// Export par défaut pour les cas spéciaux
export default {
  install: (app) => {
    app.config.globalProperties.$api = {
      auth: authService,
      users: userService
    };
  }
};

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