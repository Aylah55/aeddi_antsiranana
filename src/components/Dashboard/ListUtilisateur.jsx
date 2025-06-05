import React, { useState, useEffect } from 'react';
import { fetchUsers } from '../../services/api';
import { FiUser, FiSearch, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';

const API_URL = 'http://localhost:8000';

const getPhotoUrl = (photoPath) => `${API_URL}/storage/${photoPath}`;

const ListUtilisateur = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [etablissementFilter, setEtablissementFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    useEffect(() => {
        const getUsers = async () => {
            try {
                setLoading(true);
                const response = await fetchUsers();
                console.log('Réponse de l\'API:', response);

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
                setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors du chargement des utilisateurs');
                setLoading(false);
            }
        };

        getUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.role !== 'admin' &&
        (user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.prenom?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (etablissementFilter === '' || user.etablissement?.toLowerCase() === etablissementFilter.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleViewUser = (userId) => {
        console.log(`Voir l'utilisateur avec l'ID: ${userId}`);
    };

    const handleEditUser = (userId) => {
        console.log(`Modifier l'utilisateur avec l'ID: ${userId}`);
    };

    const handleDeleteUser = (userId) => {
        console.log(`Supprimer l'utilisateur avec l'ID: ${userId}`);
    };

    const isAdmin = user?.role === 'admin';

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
        <div className="flex flex-col h-screen">
            <div className="flex-1 overflow-y-auto">
                <div className="bg-white">
                    {currentUsers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                                        <th scope="col" className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                        <th scope="col" className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                                        <th scope="col" className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Établissement</th>
                                        <th scope="col" className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                        <th scope="col" className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                                        <th scope="col" className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.photo ? (
                                                    <img
                                                        src={getPhotoUrl(user.photo)}
                                                        alt={`${user.prenom} ${user.nom}`}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                                                        <FiUser className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{user.nom}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{user.prenom}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{user.etablissement}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                                                {user.role === 'membre de bureau' ? `Membre de bureau - ${user.sous_role}` : user.role}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-blue-600">{user.telephone}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base font-medium">
                                                <div className="opacity-0 hover:opacity-100 transition-opacity duration-300">
                                                    <button
                                                        onClick={() => handleViewUser(user.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                                                    >
                                                        <FiEye />
                                                    </button>
                                                    {isAdmin && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditUser(user.id)}
                                                                className="text-yellow-600 hover:text-yellow-900 mr-2"
                                                            >
                                                                <FiEdit />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FiUser className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun membre trouvé</h3>
                            <p className="mt-1 text-gray-500">
                                {searchTerm || etablissementFilter
                                    ? "Essayez de modifier vos critères de recherche."
                                    : "La liste des membres est vide."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white p-4 border-t border-gray-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher par nom ou prénom..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="relative w-full md:w-64">
                            <select
                                value={etablissementFilter}
                                onChange={(e) => {
                                    setEtablissementFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Tous les établissements</option>
                                {Array.from(new Set(users.map(user => user.etablissement))).map(etablissement => (
                                    <option key={etablissement} value={etablissement}>{etablissement}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="flex justify-center items-center space-x-4">
                            <button
                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                            >
                                Précédent
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} sur {totalPages}
                            </span>
                            <button
                                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListUtilisateur;
