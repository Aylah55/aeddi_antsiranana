import React, { useState, useEffect, useMemo } from 'react';
import { fetchUsers, updateUser, deleteUser } from '../../services/api';
import { FiSearch, FiUser, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';
import { UserActions, EditUserModal, DeleteConfirmationModal } from './Action';
import { userService } from '../../services/api';  // Chemin à adapter selon votre structure


const API_URL = 'http://localhost:8000';

const getPhotoUrl = (photoPath) => photoPath ? `${API_URL}/storage/${photoPath}` : null;

const GestionMembre = () => {
    // États
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('nom');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'nom', direction: 'asc' });
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);

    // Fetch users
    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await fetchUsers();
                const fetchedUsers = response?.data?.users || response?.users || [];
                setUsers(fetchedUsers);
                setLoading(false);
            } catch (err) {
                console.error('API Error:', err.response?.data || err.message);
                setError(err.message || 'Erreur lors du chargement des utilisateurs');
                setLoading(false);
            }
        };

        getUsers();
    }, []);

    // Filter and sort users
// Filter and sort users
const filteredUsers = useMemo(() => {
    let result = [...users].filter(user => {
        // Filtre les utilisateurs sans ID
        if (!user.id) {
            console.warn('Utilisateur sans ID:', user);
            return false;
        }
        // Filtre les administrateurs
        if (user.role === 'admin') {
            return false;
        }
        return true;
    });

    // Filter
    if (searchTerm) {
        result = result.filter(user =>
            user[searchField]?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Sort
    if (sortConfig.key) {
        result.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    return result;
}, [users, searchTerm, searchField, sortConfig]);


    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Handlers
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleEdit = (user) => {
        setEditingUser(user);
    };

    const handleDelete = (user) => {
        setDeletingUser(user);
    };

    const handleSaveUser = async (updatedUser) => {
        try {
            if (!updatedUser?.id) {
                throw new Error("Données utilisateur invalides");
            }
    
            setUsers(prevUsers => 
                prevUsers.map(u => u.id === updatedUser.id ? {
                    ...u,
                    nom: updatedUser.nom,
                    prenom: updatedUser.prenom,
                    email: updatedUser.email,
                    photo: updatedUser.photo // Assurez-vous que c'est le chemin complet
                } : u)
            );
            
            setEditingUser(null);
        } catch (error) {
            console.error("Erreur de mise à jour:", error);
            setError(error.message);
            
            // Rechargez les données si nécessaire
            const response = await fetchUsers();
            setUsers(response.data?.users || []);
        }
    };

    const handleConfirmDelete = async (userId) => {
        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            setDeletingUser(null);
            
            // Ajouter une notification de succès
            setError(null);
            alert('Utilisateur supprimé avec succès');
            
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            setError(error.message || "Échec de la suppression de l'utilisateur");
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
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                    <div className="flex items-center">
                        <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="font-semibold">Erreur</h3>
                    </div>
                    <p className="mt-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestion des Membres</h1>
                    <p className="text-gray-600 mt-1">
                        {filteredUsers.length} membre{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <div className="relative flex-grow md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder={`Rechercher par ${searchField === 'nom' ? 'nom' : searchField === 'prenom' ? 'prénom' : 'email'}...`}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 border border-gray-300">
                            <FiFilter className="text-gray-500 mr-2" />
                            <select
                                value={searchField}
                                onChange={(e) => {
                                    setSearchField(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-transparent border-none focus:ring-0 text-sm"
                            >
                                <option value="nom">Nom</option>
                                <option value="prenom">Prénom</option>
                                <option value="email">Email</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Profil
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => requestSort('nom')}
                                >
                                    <div className="flex items-center">
                                        Nom
                                        {sortConfig.key === 'nom' && (
                                            <span className="ml-1">
                                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => requestSort('prenom')}
                                >
                                    <div className="flex items-center">
                                        Prénom
                                        {sortConfig.key === 'prenom' && (
                                            <span className="ml-1">
                                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => requestSort('email')}
                                >
                                    <div className="flex items-center">
                                        Email
                                        {sortConfig.key === 'email' && (
                                            <span className="ml-1">
                                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {user.photo && getPhotoUrl(user.photo) ? (  // Ajout de la vérification user.photo
                                                    <img
                                                        src={getPhotoUrl(user.photo)}
                                                        alt={`${user.prenom} ${user.nom}`}
                                                        className="h-10 w-10 rounded-full object-cover shadow-sm border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center shadow-sm border border-gray-200">
                                                        <FiUser className="text-gray-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.nom}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">{user.prenom}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-700">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <UserActions 
                                                user={user} 
                                                onEdit={handleEdit} 
                                                onDelete={handleDelete} 
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun membre trouvé</h3>
                                        <p className="mt-1 text-gray-500">
                                            {searchTerm
                                                ? "Essayez de modifier vos critères de recherche."
                                                : "La liste des membres est vide."}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredUsers.length > usersPerPage && (
                    <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-700">
                            Affichage de <span className="font-medium">{indexOfFirstUser + 1}</span> à{' '}
                            <span className="font-medium">
                                {Math.min(indexOfLastUser, filteredUsers.length)}
                            </span>{' '}
                            sur <span className="font-medium">{filteredUsers.length}</span> membres
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-md border ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                <FiChevronLeft className="h-5 w-5" />
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum} // Assurez-vous que la key est bien définie ici
                                        onClick={() => paginate(pageNum)}
                                        className={`px-3 py-1 rounded-md border ${currentPage === pageNum ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}


                            <button
                                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-md border ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                                <FiChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {editingUser && (
                    <EditUserModal
                        key={`edit-${editingUser.id}`}  // Ajout d'une clé unique
                        user={editingUser}
                        onClose={() => setEditingUser(null)}
                        onSave={handleSaveUser}
                    />
                )}

                {deletingUser && (
                    <DeleteConfirmationModal
                        key={`delete-${deletingUser.id}`}  // Ajout d'une clé unique
                        user={deletingUser}
                        onClose={() => setDeletingUser(null)}
                        onConfirm={handleConfirmDelete}
                    />
                )}
        </div>
    );
};

export default GestionMembre;