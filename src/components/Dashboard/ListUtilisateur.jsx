import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiEdit, FiTrash2, FiEye, FiMoreVertical, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { userService, apiClient, API_URL, getPhotoUrl } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import EditUserComp from '../../utils/EditUserComp';
import UserDetailComp from '../../utils/UserDetailComp';
import UserCotisation from '../../utils/UserCotisation';
import ConfirmDialog from '../../utils/ConfirmDialog';
import SearchAndFilters from '../../utils/SearchAndFilters';
import Pagination from '../../utils/Pagination';
import UserTable from '../../utils/UserTable';

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
    const [showFilters, setShowFilters] = useState(false);

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
                        photo: user.photo || null,
                        photo_url: user.photo_url || null
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
            console.log("Token d'authentification:", localStorage.getItem('auth_token'));
            // Utiliser l'URL correcte pour la suppression
            const response = await apiClient.delete(`/users/${userToDelete.id}`);
            
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
            console.error('Réponse d\'erreur:', error.response?.data);
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

    const isAdmin = user && user.role === 'admin';

    // Debug: Vérifier le rôle de l'utilisateur connecté
    useEffect(() => {
        console.log('Utilisateur connecté:', user);
        console.log('Rôle utilisateur:', user?.role);
        console.log('Est admin?', isAdmin);
    }, [user, isAdmin]);

    const handleCotisationsClick = async (user) => {
        setLoadingCotisations(true);
        try {
            const response = await apiClient.get(`/user/${user.id}/cotisations`);
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
            await apiClient.put(`/cotisation/${cotisationId}/user/${userId}/paiement`, 
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

    // Si l'utilisateur n'est pas encore chargé, afficher un loading
    if (!user) {
        return (
            <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Palette de couleurs pour les rôles
    const ROLE_COLORS = {
      'President': 'bg-blue-500 text-white',
      'Membre de bureau': 'bg-green-500 text-white',
      'Membre': 'bg-gray-400 text-white',
    };

    function getInitials(nom, prenom) {
      return ((nom?.[0] || '') + (prenom?.[0] || '')).toUpperCase();
    }

    // Configuration des filtres pour SearchAndFilters
    const filters = [
      {
        key: 'etablissement',
        label: 'Établissement',
        value: etablissementFilter,
        options: [
          { value: '', label: 'Tous les établissements' },
          { value: 'ESP', label: 'ESP' },
          { value: 'DEGSP', label: 'DEGSP' }
        ]
      }
    ];

    const handleFilterChange = (key, value) => {
      if (key === 'etablissement') {
        setEtablissementFilter(value);
      }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Liste des Utilisateurs</h2>
            </div>

            {/* Barre de recherche et filtres avec le nouveau composant */}
            <SearchAndFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                onFilterChange={handleFilterChange}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                searchPlaceholder="Rechercher un utilisateur..."
            />

            {/* Affichage responsive en mode 'cards' sur mobile */}
            <div className="block md:hidden space-y-4 mb-6">
                <AnimatePresence initial={false}>
                    {loading ? (
                        <div className="flex flex-col gap-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl shadow p-4 flex items-center gap-4 animate-pulse">
                                    <div className="w-14 h-14 rounded-full bg-blue-100" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-blue-50 rounded w-1/2" />
                                        <div className="h-3 bg-blue-50 rounded w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                            <div className="flex items-center">
                                <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <h3 className="font-semibold">Erreur</h3>
                            </div>
                            <p className="mt-2">{error}</p>
                        </div>
                    ) : (
                        currentUsers.map((user, idx) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.25 }}
                                className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 relative"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg border-4 border-white bg-gray-100 flex items-center justify-center">
                                        {(user.photo_url || user.photo) ? (
                                            <img
                                                src={user.photo_url || getPhotoUrl(user.photo)}
                                                alt={`${user.nom} ${user.prenom}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)', color: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {getInitials(user.nom, user.prenom)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-bold text-gray-900">{user.nom} {user.prenom}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shadow ${ROLE_COLORS[user.role] || 'bg-gray-300 text-gray-700'}`}>{user.role}</span>
                                        </div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                                {/* Bouton trois points */}
                                <button onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)} className="p-2 rounded-full hover:bg-gray-100 transition-colors action-menu" title="Actions">
                                    <FiMoreVertical className="h-5 w-5 text-gray-500" />
                                </button>
                                {/* Menu d'actions flottant */}
                                {activeDropdown === user.id && (
                                    <div className="absolute right-4 top-16 z-20 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 action-menu">
                                        <div className="py-1">
                                            <button onClick={() => { handleViewUser(user); setActiveDropdown(null); }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 action-menu">
                                                <FiEye className="mr-2 h-4 w-4 text-indigo-600" /> Voir
                                            </button>
                                            {isAdmin && (
                                                <>
                                                    <button onClick={() => { handleEditUser(user); setActiveDropdown(null); }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 action-menu">
                                                        <FiEdit className="mr-2 h-4 w-4 text-yellow-600" /> Modifier
                                                    </button>
                                                    <button onClick={() => { handleCotisationsClick(user); setActiveDropdown(null); }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 action-menu">
                                                        <DollarSign className="mr-2 h-4 w-4 text-green-600" /> Cotisations
                                                    </button>
                                                    <button onClick={() => { handleDeleteClick(user); setActiveDropdown(null); }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 action-menu">
                                                        <FiTrash2 className="mr-2 h-4 w-4 text-red-600" /> Supprimer
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Tableau desktop avec le nouveau composant */}
            <UserTable
                users={currentUsers}
                loading={loading}
                error={error}
                onView={handleViewUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteClick}
                onCotisations={handleCotisationsClick}
                isAdmin={isAdmin}
                getPhotoUrl={getPhotoUrl}
                getInitials={getInitials}
                roleColors={ROLE_COLORS}
            />

            {/* Pagination avec le nouveau composant */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={paginate}
                showInfo={true}
                totalItems={filteredUsers.length}
                itemsPerPage={usersPerPage}
            />

            {/* Modal de confirmation avec le nouveau composant */}
            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Confirmer la suppression"
                message="Êtes-vous sûr de vouloir supprimer l'utilisateur"
                confirmText="Supprimer"
                cancelText="Annuler"
                itemName={userToDelete ? `${userToDelete.prenom} ${userToDelete.nom}` : ""}
            />

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
                        <EditUserComp
                            formData={formData}
                            onChange={handleChange}
                            onSubmit={handleUpdate}
                            onClose={() => setShowEditModal(false)}
                            isLoading={isLoading}
                            previewImage={previewImage}
                            editingUser={editingUser}
                        />
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* Modal de visualisation */}
            {showViewModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                        <UserDetailComp user={selectedUser} onClose={() => setShowViewModal(false)} />
                    </div>
                </div>
            )}

            {/* Modal des cotisations */}
            {showCotisationsModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl">
                        <UserCotisation
                            user={selectedUser}
                            cotisations={selectedUserCotisations}
                            onClose={() => setShowCotisationsModal(false)}
                            loading={loadingCotisations}
                            onUpdatePaiement={handleUpdatePaiement}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListUtilisateur;