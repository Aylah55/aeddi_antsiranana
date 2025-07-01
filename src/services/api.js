import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'development' 
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
    const response = await axios.get(`${API_URL}/sanctum/csrf-cookie`, {
      withCredentials: true
    });
    console.log('CSRF token récupéré avec succès:', response);
  } catch (error) {
    console.error('Erreur lors de la récupération du CSRF token:', error);
    console.error('URL tentée:', `${API_URL}/sanctum/csrf-cookie`);
    console.error('Type d\'erreur:', error.code);
    console.error('Message d\'erreur:', error.message);
    
    // En cas d'erreur réseau, on peut continuer sans CSRF token
    // car certaines configurations peuvent ne pas l'exiger
    console.log('Continuing without CSRF token...');
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
  // Inscription
  inscription: async (formData) => {
    await getCsrfToken();
    return apiClient.post('/inscription', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).catch(handleApiError);
  },

  // Connexion
  login: async (credentials) => {
    try {
      await getCsrfToken();
    } catch (error) {
      console.log('CSRF token non récupéré, tentative de connexion sans...');
    }
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

  // Récupérer les informations d'un utilisateur
  getUserInfo: (id) => {
    return apiClient.get(`/user/${id}`)
      .catch(handleApiError);
  },

  // Mise à jour du profil utilisateur
  updateProfile: async (id, formData) => {
    try {
      await getCsrfToken();
      
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

// Alias pratiques pour les composants React
export const registerUser = authService.inscription;
export const loginUser = authService.login;
export const logoutUser = authService.logout;

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
