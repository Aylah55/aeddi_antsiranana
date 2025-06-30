import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye, Edit, Trash2, PlusCircle, X, MoreVertical } from 'lucide-react';
import { toast } from 'react-toastify';

const ListeCotisation = () => {
    const [cotisations, setCotisations] = useState([]);
    const [erreur, setErreur] = useState(null);
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        montant: '',
        date_debut: '',
        date_fin: '',
        status: 'À payer'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const axiosInstance = axios.create({
        baseURL: 'http://localhost:8000/api',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    const isAdmin = user && user.role === 'admin';

    useEffect(() => {
        if (user) {
            fetchCotisations();
        }
    }, [user]);

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

    const fetchCotisations = async () => {
        setIsLoading(true);
        try {
            // Si l'utilisateur est admin, récupérer toutes les cotisations
            // Sinon, récupérer seulement ses cotisations personnelles
            const endpoint = isAdmin ? '/cotisations' : '/my-cotisations';
            const response = await axiosInstance.get(endpoint);
            setCotisations(response.data.data || response.data);
        } catch (error) {
            console.error('Erreur :', error);
            setErreur("Impossible de charger les cotisations.");
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.nom.trim()) {
            errors.nom = 'Le nom est requis';
        }
        if (!formData.montant || formData.montant <= 0) {
            errors.montant = 'Le montant doit être supérieur à 0';
        }
        if (!formData.date_debut) {
            errors.date_debut = 'La date de début est requise';
        }
        if (!formData.date_fin) {
            errors.date_fin = 'La date de fin est requise';
        } else if (new Date(formData.date_debut) >= new Date(formData.date_fin)) {
            errors.date_fin = 'La date de fin doit être postérieure à la date de début';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);
        setErreur(null);
        try {
            const dataToSend = { ...formData };
            const response = await axiosInstance.post('/cotisations', dataToSend);
            setFormData({
                nom: '',
                description: '',
                montant: '',
                date_debut: '',
                date_fin: '',
                status: 'À payer'
            });
            setShowAddModal(false);
            await fetchCotisations();
            toast.success('Cotisation ajoutée avec succès !');
        } catch (error) {
            handleError(error, "Une erreur est survenue lors de l'ajout de la cotisation");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);
        setErreur(null);
        try {
            const dataToSend = { ...formData };
            const response = await axiosInstance.put(`/cotisation/${selected.id}`, dataToSend);
            setShowEditModal(false);
            await fetchCotisations();
            toast.success('Cotisation modifiée avec succès !');
        } catch (error) {
            handleError(error, "Une erreur est survenue lors de la modification de la cotisation");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleError = (error, defaultMessage) => {
        console.error('Erreur :', error);
        let errorMessage = defaultMessage;
        if (error.response) {
            if (error.response.status === 401) {
                errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                window.location.href = '/connexion';
            } else if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.response.data && error.response.data.errors) {
                const validationErrors = {};
                Object.keys(error.response.data.errors).forEach(key => {
                    validationErrors[key] = error.response.data.errors[key][0];
                });
                setFormErrors(validationErrors);
                errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
            }
        } else if (error.request) {
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
        }
        setErreur({ type: 'error', message: errorMessage });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Effacer les erreurs du champ modifié
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    const formatMontant = (montant) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'MGA'
        }).format(montant);
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

    // Si l'utilisateur n'est pas admin, afficher ses cotisations personnelles
    if (!isAdmin) {
        return (
            <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Mes Cotisations</h2>
                </div>

                {/* En-têtes fixes */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date début</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date fin</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mon statut</th>
                            </tr>
                        </thead>
                    </table>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center p-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : erreur ? (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                        <div className="flex items-center">
                            <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <h3 className="font-semibold">Erreur</h3>
                        </div>
                        <p className="mt-2">{erreur}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        <table className="min-w-full divide-y divide-gray-200">
                            <tbody className="bg-white divide-y divide-gray-200">
                                {cotisations.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                            Aucune cotisation trouvée
                                        </td>
                                    </tr>
                                ) : (
                                    cotisations.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{item.nom}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{item.description || "Aucune"}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(item.montant)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                                                {new Date(item.date_debut).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                                                {new Date(item.date_fin).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-base font-medium ${
                                                item.statut_paiement === 'Payé' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {item.statut_paiement}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Liste des Cotisations</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    <PlusCircle size={18} className="mr-2" />
                    Ajouter cotisation
                </button>
            </div>

            {erreur && (
                <div className={`mb-4 p-3 rounded ${
                    erreur.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                    {erreur.message}
                </div>
            )}

            {/* En-têtes fixes */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date début</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date fin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                </table>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="overflow-x-auto" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="bg-white divide-y divide-gray-200">
                            {cotisations.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        Aucune cotisation trouvée
                                    </td>
                                </tr>
                            ) : (
                                cotisations.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{item.nom}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{item.description || "Aucune"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(item.montant)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                                            {new Date(item.date_debut).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                                            {new Date(item.date_fin).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-base ${
                                            item.status === 'Payé' ? 'text-green-600' :
                                            item.status === 'En cours' ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {item.status}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium relative">
                                            <div className="action-menu">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveDropdown(activeDropdown === item.id ? null : item.id);
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600"
                                                    title="Actions"
                                                >
                                                    <MoreVertical className="h-5 w-5" />
                                                </button>

                                                {activeDropdown === item.id && (
                                                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                        <div className="py-1" role="menu">
                                                            <button
                                                                onClick={() => {
                                                                    setSelected(item);
                                                                    setShowModal(true);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                <Eye className="mr-3 h-4 w-4 text-indigo-600" />
                                                                Voir
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelected(item);
                                                                    setFormData({
                                                                        nom: item.nom,
                                                                        description: item.description,
                                                                        montant: item.montant,
                                                                        date_debut: formatDateForInput(item.date_debut),
                                                                        date_fin: formatDateForInput(item.date_fin),
                                                                        status: item.status
                                                                    });
                                                                    setShowEditModal(true);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                <Edit className="mr-3 h-4 w-4 text-yellow-600" />
                                                                Modifier
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    // Ajouter la logique de suppression ici
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                <Trash2 className="mr-3 h-4 w-4 text-red-600" />
                                                                Supprimer
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de détail */}
            {showModal && selected && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{selected.nom}</h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelected(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <p><span className="font-semibold">Description :</span> {selected.description || 'Aucune'}</p>
                            <p><span className="font-semibold">Montant :</span> {formatMontant(selected.montant)}</p>
                            <p><span className="font-semibold">Date de début :</span> {new Date(selected.date_debut).toLocaleString('fr-FR')}</p>
                            <p><span className="font-semibold">Date de fin :</span> {new Date(selected.date_fin).toLocaleString('fr-FR')}</p>
                            <p>
                                <span className="font-semibold">Statut :</span>
                                <span className={`ml-2 ${
                                    selected.status === 'Payé' ? 'text-green-600' :
                                    selected.status === 'En cours' ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                    {selected.status}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'ajout/modification */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                {showAddModal ? 'Ajouter une cotisation' : 'Modifier la cotisation'}
                            </h3>
                            <button
                                onClick={() => {
                                    showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                                    setFormData({
                                        nom: '',
                                        description: '',
                                        montant: '',
                                        date_debut: '',
                                        date_fin: '',
                                        status: 'À payer'
                                    });
                                    setFormErrors({});
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={showAddModal ? handleSubmit : handleEditSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nom *</label>
                                    <input
                                        type="text"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                                            formErrors.nom ? 'border-red-500' : ''
                                        }`}
                                        required
                                    />
                                    {formErrors.nom && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.nom}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Montant *</label>
                                    <input
                                        type="number"
                                        name="montant"
                                        value={formData.montant}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                                            formErrors.montant ? 'border-red-500' : ''
                                        }`}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                    {formErrors.montant && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.montant}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date de début *</label>
                                        <input
                                            type="datetime-local"
                                            name="date_debut"
                                            value={formData.date_debut}
                                            onChange={handleChange}
                                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                                                formErrors.date_debut ? 'border-red-500' : ''
                                            }`}
                                            required
                                        />
                                        {formErrors.date_debut && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.date_debut}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date de fin *</label>
                                        <input
                                            type="datetime-local"
                                            name="date_fin"
                                            value={formData.date_fin}
                                            onChange={handleChange}
                                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                                                formErrors.date_fin ? 'border-red-500' : ''
                                            }`}
                                            required
                                        />
                                        {formErrors.date_fin && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.date_fin}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Statut *</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        required
                                    >
                                        <option value="À payer">À payer</option>
                                        <option value="En cours">En cours</option>
                                        <option value="Payé">Payé</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                                        setFormData({
                                            nom: '',
                                            description: '',
                                            montant: '',
                                            date_debut: '',
                                            date_fin: '',
                                            status: 'À payer'
                                        });
                                        setFormErrors({});
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {showAddModal ? 'Ajout en cours...' : 'Modification en cours...'}
                                        </span>
                                    ) : (
                                        showAddModal ? 'Ajouter' : 'Modifier'
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

export default ListeCotisation; 