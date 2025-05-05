import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8000/api';

const Activites = () => {
  const [activites, setActivites] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentActivite, setCurrentActivite] = useState(null);
  const [formData, setFormData] = useState({
    type: 'activite',
    nom: '',
    description: '',
    montant: '',
    date_debut: '',
    date_fin: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Fonction pour obtenir les en-têtes d'authentification
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  };

  // Fonction pour gérer les erreurs d'authentification
  const handleAuthError = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  useEffect(() => {
    fetchActivites();
  }, []);

  const fetchActivites = async () => {
    try {
      const response = await axios.get(`${API_URL}/activites`, {
        headers: getAuthHeaders()
      });
      setActivites(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        alert('Erreur lors du chargement des activités');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      let response;
      const config = {
        headers: getAuthHeaders()
      };

      if (currentActivite) {
        response = await axios.put(
          `${API_URL}/activites/${currentActivite.id}`,
          formData,
          config
        );
      } else {
        response = await axios.post(
          `${API_URL}/activites`,
          formData,
          config
        );
      }

      setSuccessMessage(currentActivite 
        ? 'Activité mise à jour avec succès' 
        : 'Activité créée avec succès');
      
      fetchActivites();
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      console.error('Erreur complète:', error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Une erreur est survenue: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (activite = null) => {
    setCurrentActivite(activite);
    setFormData(activite ? { 
      ...activite,
      date_debut: activite.date_debut.split('T')[0],
      date_fin: activite.date_fin.split('T')[0]
    } : {
      type: 'activite',
      nom: '',
      description: '',
      montant: '',
      date_debut: '',
      date_fin: ''
    });
    setErrors({});
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentActivite(null);
    setSuccessMessage('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await axios.delete(`${API_URL}/activites/${id}`, {
          headers: getAuthHeaders()
        });
        setSuccessMessage('Activité supprimée avec succès');
        fetchActivites();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        if (error.response?.status === 401) {
          handleAuthError();
        } else {
          alert('Erreur lors de la suppression');
        }
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Activités et Cotisations</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
        >
          <FiPlus className="mr-2" /> Ajouter
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Début</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Fin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activites.map((activite) => (
              <tr key={activite.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{activite.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activite.nom}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{activite.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activite.type === 'activite' ? `${activite.montant} €` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(activite.date_debut).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(activite.date_fin).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openModal(activite)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(activite.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold">
                {currentActivite ? 'Modifier' : 'Ajouter'} une {formData.type === 'activite' ? 'Activité' : 'Cotisation'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                  {successMessage}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="activite">Activité</option>
                  <option value="cotisation">Cotisation</option>
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type[0]}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom[0]}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>}
              </div>

              {formData.type === 'activite' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
                  <input
                    type="number"
                    name="montant"
                    value={formData.montant}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    step="0.01"
                  />
                  {errors.montant && <p className="text-red-500 text-xs mt-1">{errors.montant[0]}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Début</label>
                  <input
                    type="date"
                    name="date_debut"
                    value={formData.date_debut}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                  {errors.date_debut && <p className="text-red-500 text-xs mt-1">{errors.date_debut[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Fin</label>
                  <input
                    type="date"
                    name="date_fin"
                    value={formData.date_fin}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                  {errors.date_fin && <p className="text-red-500 text-xs mt-1">{errors.date_fin[0]}</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      En cours...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      {currentActivite ? 'Mettre à jour' : 'Enregistrer'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activites;