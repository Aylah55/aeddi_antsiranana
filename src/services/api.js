import axios from 'axios';

export const API_URL = process.env.NODE_ENV === 'development' 
  ? (process.env.REACT_APP_API_URL_LOCAL || 'http://localhost:8000')
  : (process.env.REACT_APP_API_URL_PROD || 'https://aeddi-back.onrender.com');

const API_PREFIX = '/api';

// Debug: Afficher l'URL de l'API
console.log('API_URL:', API_URL);
console.log('Base URL:', API_URL + API_PREFIX);

// Puis le reste comme avant
const apiClient = axios.create({
  baseURL: API_URL + API_PREFIX,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});


// Fonction pour obtenir le CSRF token
const getCsrfToken = async () => {
  try {
    console.log('Tentative de récupération du CSRF token depuis:', `${API_URL}/sanctum/csrf-cookie`);
    console.log('Mode:', process.env.NODE_ENV);
    console.log('API_URL:', API_URL);
    
    const response = await axios.get(`${API_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log('CSRF token récupéré avec succès:', response);
    return response;
  } catch (error) {
    console.error('Erreur lors de la récupération du CSRF token:', error);
    console.error('URL tentée:', `${API_URL}/sanctum/csrf-cookie`);
    console.error('Type d\'erreur:', error.code);
    console.error('Message d\'erreur:', error.message);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    
    // En cas d'erreur réseau, on peut continuer sans CSRF token
    // car certaines configurations peuvent ne pas l'exiger
    console.log('Continuing without CSRF token...');
    throw error; // Re-throw pour que la fonction appelante puisse gérer
  }
};

// Intercepteur pour ajouter le token JWT dans les en-têtes
apiClient.interceptors.request.use(
  async config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Pour les requêtes multipart/form-data, ne pas définir Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Gestion centralisée des erreurs API
const handleApiError = (error) => {
  if (error.response) {
    console.error('API Error Response:', error.response.data);
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
  // Connexion
  login: async (credentials) => {
    try {
      // Désactiver temporairement la récupération du CSRF token
      // await getCsrfToken();
      console.log('Tentative de connexion sans CSRF token...');
    } catch (error) {
      console.log('CSRF token non récupéré, tentative de connexion sans...');
    }
    
    try {
      const response = await apiClient.post('/login', credentials);
      console.log('Connexion réussie:', response.data);
      
      // Stocker le token dans localStorage
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        console.log('Token stocké dans localStorage');
      }
      
      return response;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  // Déconnexion
  logout: () => {
    return apiClient.post('/logout')
      .catch(handleApiError);
  },

  // Créer un mot de passe pour utilisateur Google
  setPassword: async (data) => {
    try {
      // Désactiver temporairement la récupération du CSRF token
      // await getCsrfToken();
      console.log('Tentative de création de mot de passe pour utilisateur Google...');
      
      const response = await apiClient.post('/set-password', data);
      console.log('Mot de passe créé avec succès:', response.data);
      
      return response;
    } catch (error) {
      console.error('Erreur lors de la création du mot de passe:', error);
      throw error;
    }
  }
};

// Service utilisateur
export const userService = {
  // Profil utilisateur connecté
  getProfile: () => {
    return apiClient.get('/user')
      .catch(handleApiError);
  },

  // Récupérer les informations d'un utilisateur
  getUserInfo: (id) => {
    return apiClient.get(`/user/${id}`)
      .catch(handleApiError);
  },

  // Mise à jour du profil utilisateur
  updateProfile: async (id, formData) => {
    try {
      // Désactiver temporairement la récupération du CSRF token
      // await getCsrfToken();
      
      // S'assurer que formData est une instance de FormData
      const data = formData instanceof FormData ? formData : new FormData();
      
      // Si ce n'est pas déjà un FormData, convertir l'objet en FormData
      if (!(formData instanceof FormData)) {
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
            data.append(key, formData[key]);
          }
        });
      }

      // Debug: Afficher les données avant l'envoi
      console.log('Données à envoyer via API:', {
        url: `/user/${id}`,
        method: 'PUT',
        formData: Object.fromEntries(data.entries())
      });
      
      // Utiliser la méthode POST avec _method=PUT pour éviter les problèmes avec FormData
      data.append('_method', 'PUT');
      
      const response = await apiClient.post(`/user/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Réponse API reçue:', response.data);
      return response;
    } catch (error) {
      console.error('Erreur API:', error.response || error);
      throw error;
    }
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

// Service des cotisations
export const cotisationService = {
    // Récupérer toutes les cotisations
    fetchAll: () => {
        return apiClient.get('/cotisations')
            .catch(handleApiError);
    },

    // Créer une cotisation
    create: (data) => {
        return apiClient.post('/cotisations', data)
            .catch(handleApiError);
    },

    // Mettre à jour une cotisation
    update: (id, data) => {
        return apiClient.put(`/cotisation/${id}`, data)
            .catch(handleApiError);
    },

    // Supprimer une cotisation
    delete: (id) => {
        return apiClient.delete(`/cotisation/${id}`)
            .catch(handleApiError);
    }
};

// Service des messages
export const messageService = {
  // Récupérer l'historique des messages
  fetchAll: () => {
    return apiClient.get('/messages').catch(handleApiError);
  },
  // Envoyer un message
  send: (content) => {
    return apiClient.post('/messages/send', { content }).catch(handleApiError);
  }
};

// Alias pratiques pour les composants React
export const loginUser = authService.login;
export const logoutUser = authService.logout;
export const setPassword = authService.setPassword;

export const getUserProfile = userService.getProfile;
export const getUserInfo = userService.getUserInfo;
export const updateUserProfile = userService.updateProfile;
export const fetchUsers = userService.fetchAll;
export const updateUser = userService.update;
export const deleteUser = userService.delete;
export const getCurrentUser = userService.getProfile;

export const fetchActivities = activiteService.fetchAll;
export const createActivity = activiteService.create;
export const updateActivity = activiteService.update;
export const deleteActivity = activiteService.delete;

// Exporter l'instance Axios si besoin
export { apiClient };

export const getAllUsers = async () => {
    const token = localStorage.getItem('auth_token');
    return await axios.get(`${API_URL}/users`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
};
// Service des notifications
export const notificationService = {
  // Récupérer toutes les notifications
  fetchAll: () => {
    return apiClient.get('/notifications')
      .catch(handleApiError);
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: () => {
    return apiClient.post('/notifications/mark-all-read')
      .catch(handleApiError);
  },

  // Supprimer toutes les notifications
  deleteAll: () => {
    return apiClient.delete('/notifications')
      .catch(handleApiError);
  },

  // Marquer une notification comme lue
  markAsRead: (id) => {
    return apiClient.patch(`/notifications/${id}/read`)
      .catch(handleApiError);
  }
};

// Alias pratiques pour les composants React
export const fetchNotifications = notificationService.fetchAll;
export const markNotificationsAsRead = notificationService.markAllAsRead;
export const deleteAllNotifications = notificationService.deleteAll;

// Alias pratiques pour les composants React
export const fetchMessages = messageService.fetchAll;
export const sendMessage = messageService.send;

// Fonction utilitaire pour obtenir l'URL d'auth Google
export const getGoogleAuthUrl = () => `${API_URL}/api/auth/google/redirect`;

// Wrapper générique pour GET (utilisé dans Notification.jsx, etc.)
export const apiGet = (endpoint, config = {}) => {
  return apiClient.get(endpoint, config).catch(handleApiError);
};

// Fonction pour envoyer l'email de réinitialisation du mot de passe
export const sendResetPasswordEmail = async (email) => {
  try {
    await getCsrfToken();
    return await apiClient.post('/forgot-password', { email });
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour réinitialiser le mot de passe
export const resetPassword = async (email, token, password, password_confirmation) => {
  try {
    await getCsrfToken();
    return await apiClient.post('/reset-password', {
      email,
      token,
      password,
      password_confirmation
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// Export explicite de l'URL de l'API
export { API_URL };