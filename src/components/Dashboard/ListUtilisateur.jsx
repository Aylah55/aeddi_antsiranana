import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { FiUser, FiSearch, FiEye, FiEdit, FiTrash2, FiX, FiMoreVertical } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { DollarSign } from 'lucide-react';

// Assurez-vous que cette URL correspond à votre backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Ajouter la configuration Axios
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

console.log('URL de l\'API:', API_URL);

const getPhotoUrl = (photoPath) => `${API_URL}/storage/${photoPath}`;

const ListUtilisateur = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [etablissementFilter, setEtablissementFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const usersPerPage = 10;
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [showCotisationsModal, setShowCotisationsModal] = useState(false);
    const [selectedUserCotisations, setSelectedUserCotisations] = useState([]);
    const [loadingCotisations, setLoadingCotisations] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        const getUsers = async () => {
            try {
                setLoading(true);
                const response = await userService.fetchAll();
                console.log('Réponse complète de l\'API:', response);

                let fetchedUsers = [];
                if (response && response.data) {
                    if (Array.isArray(response.data)) {
                        fetchedUsers = response.data;
                    } else if (response.data.users && Array.isArray(response.data.users)) {
                        fetchedUsers = response.data.users;
                    } else if (response.data.data && Array.isArray(response.data.data)) {
                        fetchedUsers = response.data.data;
                    }
                }

                console.log('Données des utilisateurs après traitement:', fetchedUsers);
                
                const cleanedUsers = fetchedUsers
                    .filter(user => user.role !== 'admin') // Filtrer les administrateurs
                    .map(user => ({
                        id: user.id,
                        nom: user.nom || '',
                        prenom: user.prenom || '',
                        email: user.email || '',
                        telephone: user.telephone || '',
                        role: user.role || '',
                        sous_role: user.sous_role || '',
                        etablissement: user.etablissement || '',
                        parcours: user.parcours || '',
                        niveau: user.niveau || '',
                        promotion: user.promotion || '',
                        photo: user.photo || null
                    }));

                console.log('Utilisateurs nettoyés:', cleanedUsers);
                setUsers(cleanedUsers);
                setLoading(false);
            } catch (err) {
                console.error('Erreur détaillée de l\'API:', err);
                setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors du chargement des utilisateurs');
                setLoading(false);
            }
        };

        getUsers();
    }, []);

    // Fonction pour fermer le menu déroulant quand on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.action-menu')) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const filteredUsers = users.filter(user =>
        (user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.prenom?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (etablissementFilter === '' || user.etablissement?.toLowerCase() === etablissementFilter.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleViewUser = (utilisateur) => {
        setSelectedUser(utilisateur);
        setShowViewModal(true);
    };

    const handleEditUser = (utilisateur) => {
        setEditingUser(utilisateur);
        setFormData({
            nom: utilisateur.nom || '',
            prenom: utilisateur.prenom || '',
            email: utilisateur.email || '',
            telephone: utilisateur.telephone || '',
            etablissement: utilisateur.etablissement || '',
            parcours: utilisateur.parcours || '',
            niveau: utilisateur.niveau || '',
            role: utilisateur.role || '',
            sous_role: utilisateur.sous_role || '',
            promotion: utilisateur.promotion || '',
            photo: null
        });
        setShowEditModal(true);
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        
        if (name === 'photo' && files?.length > 0) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));

            // Prévisualisation de l'image
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(files[0]);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const data = new FormData();
            let hasChanges = false;
            
            // Ajouter uniquement les champs qui ont été modifiés
            Object.keys(formData).forEach(key => {
                const oldValue = editingUser[key];
                const newValue = formData[key];
                
                if (oldValue !== newValue) {
                    console.log(`Champ modifié - ${key}:`, {
                        ancien: oldValue,
                        nouveau: newValue
                    });
                    hasChanges = true;
                    
                    if (key === 'photo') {
                        if (newValue instanceof File) {
                            data.append(key, newValue);
                        }
                    } else if (newValue !== null && newValue !== undefined) {
                        data.append(key, newValue);
                    }
                }
            });

            if (!hasChanges) {
                console.log('Aucune modification détectée');
                setShowEditModal(false);
                return;
            }

            const response = await userService.updateProfile(editingUser.id, data);

            if (response.data.status === 'success') {
                const updatedUser = response.data.user;
                setUsers(prevUsers => 
                    prevUsers.map(u => 
                        u.id === updatedUser.id ? updatedUser : u
                    )
                );
                toast.success('Utilisateur mis à jour avec succès');
                setShowEditModal(false);
            } else {
                throw new Error(response.data.message || 'Erreur lors de la mise à jour');
            }
        } catch (err) {
            console.error('Erreur lors de la mise à jour:', err);
            toast.error(err.message || 'Erreur lors de la mise à jour de l\'utilisateur');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (utilisateur) => {
        console.log("handleDeleteClick - Données complètes de l'utilisateur:", utilisateur);
        if (!utilisateur) {
            console.error("Utilisateur non défini");
            return;
        }
        
        console.log("ID de l'utilisateur:", utilisateur.id);
        console.log("Type de l'ID:", typeof utilisateur.id);

        if (utilisateur.id) {
            setUserToDelete({
                id: utilisateur.id,
                nom: utilisateur.nom || '',
                prenom: utilisateur.prenom || ''
            });
            setShowConfirmDialog(true);
        } else {
            console.error("Données utilisateur invalides:", utilisateur);
        }
    };

    const handleConfirmDelete = async () => {
        console.log("handleConfirmDelete - userToDelete:", userToDelete);
        
        try {
            if (!userToDelete || !userToDelete.id) {
                console.error("ID utilisateur manquant dans handleConfirmDelete");
                return;
            }

            console.log("Tentative de suppression de l'utilisateur avec l'ID:", userToDelete.id);
            // Utiliser l'URL correcte pour la suppression
            const response = await axiosInstance.delete(`/api/users/${userToDelete.id}`);
            
            if (response.status === 200 || response.status === 204) {
                // Mise à jour optimiste de la liste
                setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
                
                // Recalculer la pagination
                const updatedUsers = users.filter(u => u.id !== userToDelete.id);
                const newTotalPages = Math.ceil(updatedUsers.length / usersPerPage);
                if (currentPage > newTotalPages) {
                    setCurrentPage(Math.max(1, newTotalPages));
                }
                
                alert('Utilisateur supprimé avec succès');
            }
        } catch (error) {
            console.error('Erreur détaillée de la suppression:', error);
            alert('Erreur lors de la suppression de l\'utilisateur');
        } finally {
            setShowConfirmDialog(false);
            setUserToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        console.log("Annulation de la suppression");
        setShowConfirmDialog(false);
        setUserToDelete(null);
    };

    const isAdmin = user?.role === 'admin';

    const handleCotisationsClick = async (user) => {
        setLoadingCotisations(true);
        try {
            const response = await axiosInstance.get(`/api/user/${user.id}/cotisations`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            setSelectedUser(user);
            setSelectedUserCotisations(response.data.data);
            setShowCotisationsModal(true);
        } catch (error) {
            console.error('Erreur lors de la récupération des cotisations:', error);
            toast.error('Erreur lors de la récupération des cotisations');
        } finally {
            setLoadingCotisations(false);
        }
    };

    const handleUpdatePaiement = async (cotisationId, userId, nouveauStatut) => {
        try {
            await axiosInstance.put(`/api/cotisation/${cotisationId}/user/${userId}/paiement`, 
                { statut_paiement: nouveauStatut },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                }
            );
            
            // Mettre à jour la liste localement
            setSelectedUserCotisations(prevCotisations => 
                prevCotisations.map(cotisation => 
                    cotisation.id === cotisationId 
                        ? { ...cotisation, statut_paiement: nouveauStatut }
                        : cotisation
                )
            );
            
            toast.success('Statut de paiement mis à jour avec succès');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            toast.error('Erreur lors de la mise à jour du statut');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Chargement des utilisateurs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <div className="flex items-center">
                        <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="font-semibold">Erreur</h3>
                    </div>
                    <p className="mt-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen relative">
            {/* Barre de recherche et filtres */}
            <div className="bg-white p-4 shadow rounded-lg mb-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher un utilisateur..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                    <div className="md:w-64">
                        <select
                            value={etablissementFilter}
                            onChange={(e) => setEtablissementFilter(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tous les établissements</option>
                            {/* Ajoutez vos options d'établissements ici */}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tableau des utilisateurs */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                        {user.photo ? (
                                            <img
                                                src={getPhotoUrl(user.photo)}
                                                alt={`${user.nom} ${user.prenom}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <FiUser className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nom}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.prenom}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                                    <div className="action-menu">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(activeDropdown === user.id ? null : user.id);
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                            title="Actions"
                                        >
                                            <FiMoreVertical className="h-5 w-5" />
                                        </button>
                                        
                                        {activeDropdown === user.id && (
                                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                <div className="py-1" role="menu">
                                                    <button
                                                        onClick={() => {
                                                            handleViewUser(user);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        role="menuitem"
                                                    >
                                                        <FiEye className="mr-3 h-4 w-4 text-indigo-600" />
                                                        Voir
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleEditUser(user);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        role="menuitem"
                                                    >
                                                        <FiEdit className="mr-3 h-4 w-4 text-yellow-600" />
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleCotisationsClick(user);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        role="menuitem"
                                                    >
                                                        <DollarSign className="mr-3 h-4 w-4 text-green-600" />
                                                        Cotisations
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleDeleteClick(user);
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        role="menuitem"
                                                    >
                                                        <FiTrash2 className="mr-3 h-4 w-4 text-red-600" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                currentPage === 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            Précédent
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => paginate(index + 1)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    currentPage === index + 1
                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                currentPage === totalPages
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            Suivant
                        </button>
                    </nav>
                </div>
            )}

            {showConfirmDialog && userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Confirmer la suppression</h3>
                            <button
                                type="button"
                                onClick={handleCancelDelete}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="mb-4">
                            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
                            <span className="font-semibold">
                                {userToDelete.prenom} {userToDelete.nom}
                            </span> ?
                            <br />
                            Cette action est irréversible.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCancelDelete}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'édition */}
            <AnimatePresence>
                {showEditModal && editingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl w-full max-h-[80vh] overflow-y-auto"
                        >
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Modifier l'utilisateur
                                    </h2>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <FiX className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Photo de profil */}
                                    <div className="col-span-1 md:col-span-2 flex justify-center">
                                        <div className="relative w-24 h-24 mb-3">
                                            {previewImage ? (
                                                <img
                                                    src={previewImage}
                                                    alt="Prévisualisation"
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : editingUser.photo ? (
                                                <img
                                                    src={getPhotoUrl(editingUser.photo)}
                                                    alt="Photo de profil"
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <FiUser className="h-10 w-10 text-gray-400" />
                                                </div>
                                            )}
                                            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg cursor-pointer transition-all hover:bg-opacity-40">
                                                <input
                                                    type="file"
                                                    name="photo"
                                                    onChange={handleChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                <span className="text-white text-xs bg-blue-500 px-2 py-1 rounded-full">
                                                    Changer
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Informations personnelles */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-700 mb-2">Informations personnelles</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                                <input
                                                    type="text"
                                                    name="nom"
                                                    value={formData.nom}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                                <input
                                                    type="text"
                                                    name="prenom"
                                                    value={formData.prenom}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                                <input
                                                    type="tel"
                                                    name="telephone"
                                                    value={formData.telephone}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Informations académiques */}
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold text-gray-700 mb-2">Informations académiques</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Établissement</label>
                                                <select
                                                    name="etablissement"
                                                    value={formData.etablissement}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    <option value="ESP">ESP</option>
                                                    <option value="DEGSP">DEGSP</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Parcours</label>
                                                <select
                                                    name="parcours"
                                                    value={formData.parcours}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    <option value="EP">EP</option>
                                                    <option value="EII">EII</option>
                                                    <option value="EG">EG</option>
                                                    <option value="GESTION">GESTION</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                                                <select
                                                    name="niveau"
                                                    value={formData.niveau}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    <option value="L1">L1</option>
                                                    <option value="L2">L2</option>
                                                    <option value="L3">L3</option>
                                                    <option value="M1">M1</option>
                                                    <option value="M2">M2</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
                                                <select
                                                    name="promotion"
                                                    value={formData.promotion}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    <option value="2020">2020</option>
                                                    <option value="2021">2021</option>
                                                    <option value="2022">2022</option>
                                                    <option value="2023">2023</option>
                                                    <option value="2024">2024</option>
                                                    <option value="2025">2025</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                                                <select
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    <option value="President">Président</option>
                                                    <option value="Membre de bureau">Membre de bureau</option>
                                                    <option value="Membre">Membre</option>
                                                </select>
                                            </div>
                                            {formData.role === 'Membre de bureau' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fonction</label>
                                                    <select
                                                        name="sous_role"
                                                        value={formData.sous_role}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        <option value="">Sélectionner...</option>
                                                        <option value="Tresoriere">Trésorière</option>
                                                        <option value="Vice_president">Vice-président</option>
                                                        <option value="Commissaire au compte">Commissaire au compte</option>
                                                        <option value="Commission logement">Commission logement</option>
                                                        <option value="Commission sport">Commission sport</option>
                                                        <option value="Conseiller">Conseiller</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end space-x-2">
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={isLoading}
                                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de visualisation */}
            <AnimatePresence>
                {showViewModal && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl w-full max-h-[80vh] overflow-y-auto"
                        >
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Détails de l'utilisateur
                                    </h2>
                                    <button
                                        onClick={() => setShowViewModal(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <FiX className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row">
                                    {/* Photo de profil - Partie gauche */}
                                    <div className="md:w-1/3 bg-gray-50 p-4 flex flex-col items-center rounded-lg">
                                        <div className="w-32 h-32 mb-4 rounded-lg overflow-hidden border-4 border-white shadow-lg">
                                            {selectedUser.photo ? (
                                                <img
                                                    src={getPhotoUrl(selectedUser.photo)}
                                                    alt="Photo de profil"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                                                    <FiUser className="h-12 w-12 text-blue-400" />
                                                </div>
                                            )}
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-800">{selectedUser.nom} {selectedUser.prenom}</h2>
                                        <p className="text-blue-600 mb-2">{selectedUser.role}</p>
                                        {selectedUser.sous_role && (
                                            <p className="text-sm text-gray-600">{selectedUser.sous_role}</p>
                                        )}
                                    </div>

                                    {/* Informations - Partie droite */}
                                    <div className="md:w-2/3 p-4">
                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Informations personnelles */}
                                            <div className="space-y-4">
                                                <div className="flex items-center mb-2">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                        <FiUser className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        Informations personnelles
                                                    </h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11">
                                                    <div>
                                                        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Email</span>
                                                        <span className="text-gray-800">{selectedUser.email || '—'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</span>
                                                        <span className={`${selectedUser.telephone ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                                            {selectedUser.telephone || 'Non renseigné'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Informations académiques */}
                                            <div className="space-y-4">
                                                <div className="flex items-center mb-2">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        Informations académiques
                                                    </h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11">
                                                    <div>
                                                        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Établissement</span>
                                                        <span className={`${selectedUser.etablissement ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                                            {selectedUser.etablissement || 'Non renseigné'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Parcours</span>
                                                        <span className={`${selectedUser.parcours ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                                            {selectedUser.parcours || 'Non renseigné'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</span>
                                                        <span className={`${selectedUser.niveau ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                                            {selectedUser.niveau || 'Non renseigné'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Promotion</span>
                                                        <span className={`${selectedUser.promotion ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                                            {selectedUser.promotion || 'Non renseigné'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => setShowViewModal(false)}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal des cotisations */}
            {showCotisationsModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                Cotisations de {selectedUser.prenom} {selectedUser.nom}
                            </h3>
                            <button
                                onClick={() => setShowCotisationsModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {loadingCotisations ? (
                            <div className="flex justify-center items-center p-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date début</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date fin</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut paiement</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedUserCotisations.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                    Aucune cotisation trouvée pour cet utilisateur
                                                </td>
                                            </tr>
                                        ) : (
                                            selectedUserCotisations.map(cotisation => (
                                                <tr key={cotisation.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {cotisation.nom}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(cotisation.montant)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(cotisation.date_debut).toLocaleDateString('fr-FR')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(cotisation.date_fin).toLocaleDateString('fr-FR')}
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                        cotisation.statut_paiement === 'Payé' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {cotisation.statut_paiement}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <button
                                                            onClick={() => handleUpdatePaiement(
                                                                cotisation.id,
                                                                selectedUser.id,
                                                                cotisation.statut_paiement === 'Payé' ? 'Non payé' : 'Payé'
                                                            )}
                                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                cotisation.statut_paiement === 'Payé'
                                                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                                                            }`}
                                                        >
                                                            {cotisation.statut_paiement === 'Payé' ? 'Marquer comme non payé' : 'Marquer comme payé'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListUtilisateur;