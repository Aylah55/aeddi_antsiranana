import React, { useState, useEffect, useMemo } from 'react';
import { fetchUsers } from '../../services/api';
import { FiSearch, FiUser, FiChevronLeft, FiChevronRight, FiFilter, FiEye, FiX } from 'react-icons/fi';

const API_URL = 'http://localhost:8000';

const getPhotoUrl = (photoPath) => `${API_URL}/storage/${photoPath}`;

const ListUtilisateur = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('nom');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'nom', direction: 'asc' });
    const [selectedUser, setSelectedUser] = useState(null);

    // Fetch users
    useEffect(() => {
        const getUsers = async () => {
            try {
                setLoading(true);
                const response = await fetchUsers();
                console.log('Réponse de l\'API:', response);
                
                // Gérer différents formats de réponse
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
                
                console.log('Utilisateurs récupérés:', fetchedUsers);
                setUsers(fetchedUsers);
                setLoading(false);
            } catch (err) {
                console.error('Erreur API:', err);
                console.error('Détails de l\'erreur:', {
                    message: err.message,
                    response: err.response,
                    data: err.response?.data,
                    status: err.response?.status
                });
                setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors du chargement des utilisateurs');
                setLoading(false);
            }
        };

        getUsers();
    }, []);

    // Filter and sort users
    const filteredUsers = useMemo(() => {
        let result = [...users];

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

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleViewUser = (user) => {
        setSelectedUser(user);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
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
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header with title and search */}
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h2>
                        <p className="text-gray-600 mt-1">
                            {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative flex-grow sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder={`Rechercher par ${searchField === 'nom' ? 'nom' : 'prénom'}...`}
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
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

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Photo
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
                                                {user.photo ? (
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
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                                    title="Voir détails"
                                                    onClick={() => handleViewUser(user)}
                                                >
                                                    <FiEye className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun utilisateur trouvé</h3>
                                        <p className="mt-1 text-gray-500">
                                            {searchTerm
                                                ? "Essayez de modifier vos critères de recherche."
                                                : "La liste des utilisateurs est vide."}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredUsers.length > usersPerPage && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Affichage de <span className="font-medium">{indexOfFirstUser + 1}</span> à{' '}
                            <span className="font-medium">
                                {Math.min(indexOfLastUser, filteredUsers.length)}
                            </span>{' '}
                            sur <span className="font-medium">{filteredUsers.length}</span> utilisateurs
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
                                        key={pageNum}
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

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Détails de l'utilisateur</h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex flex-col items-center">
                            {selectedUser.photo ? (
                                <img
                                    src={getPhotoUrl(selectedUser.photo)}
                                    alt={`${selectedUser.prenom} ${selectedUser.nom}`}
                                    className="h-32 w-32 rounded-full object-cover mb-4"
                                />
                            ) : (
                                <div className="h-32 w-32 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                                    <FiUser className="text-gray-500 h-16 w-16" />
                                </div>
                            )}
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">{selectedUser.nom} {selectedUser.prenom}</h3>
                                <p className="text-gray-700">{selectedUser.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListUtilisateur;
