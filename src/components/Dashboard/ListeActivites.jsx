import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye, Edit, Trash2, PlusCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';

const ListeActivites = () => {
    const [activites, setActivites] = useState([]);
    const [erreur, setErreur] = useState(null);
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        date_debut: '',
        date_fin: '',
        status: 'À venir'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Configuration d'Axios pour inclure le token d'authentification
    const axiosInstance = axios.create({
        baseURL: 'http://localhost:8000/api',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    useEffect(() => {
        fetchActivites();
    }, []);

    const fetchActivites = async () => {
        try {
            const response = await axiosInstance.get('/activites');
            setActivites(response.data.data || response.data);
        } catch (error) {
            console.error('Erreur :', error);
            setErreur("Impossible de charger les activités.");
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.nom.trim()) {
            errors.nom = 'Le nom est requis';
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

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Format: YYYY-MM-DDTHH:MM
        return date.toISOString().slice(0, 16);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErreur(null);

        try {
            const dataToSend = {
                ...formData,
                // Les dates sont déjà au bon format pour l'API
            };

            const response = await axiosInstance.post('/activites', dataToSend);
            
            // Réinitialiser le formulaire
            setFormData({
                nom: '',
                description: '',
                date_debut: '',
                date_fin: '',
                status: 'À venir'
            });
            
            // Fermer la modale et rafraîchir la liste
            setShowAddModal(false);
            await fetchActivites();
            
            // Afficher un message de succès
            toast.success('Activité ajoutée avec succès !');
            
            // Cacher le message après 3 secondes
            setTimeout(() => setErreur(null), 3000);
            
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'activité :', error);
            
            let errorMessage = "Une erreur est survenue lors de l'ajout de l'activité";
            
            if (error.response) {
                // Erreur du serveur avec un statut
                if (error.response.status === 401) {
                    errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
                    // Rediriger vers la page de connexion
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                    window.location.href = '/connexion';
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data && error.response.data.errors) {
                    // Gestion des erreurs de validation du Laravel
                    const validationErrors = {};
                    Object.keys(error.response.data.errors).forEach(key => {
                        validationErrors[key] = error.response.data.errors[key][0];
                    });
                    setFormErrors(validationErrors);
                    errorMessage = 'Veuillez corriger les erreurs dans le formulaire';
                }
            } else if (error.request) {
                // La requête a été faite mais aucune réponse n'a été reçue
                errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
            }
            
            setErreur({ type: 'error', message: errorMessage });
            
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Si on change une date de début ou de fin et qu'il y avait une erreur de validation,
        // on la supprime pour permettre une nouvelle validation
        if ((name === 'date_debut' || name === 'date_fin') && formErrors.date_fin) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.date_fin;
                return newErrors;
            });
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const openModal = (item) => {
        setSelected(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelected(null);
    };

    const openAddModal = () => {
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        setFormData({
            nom: '',
            description: '',
            date_debut: '',
            date_fin: '',
            status: 'À venir'
        });
    };

    const isAdmin = user?.role === 'admin';

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Liste des Activités</h2>
                {isAdmin && (
                    <button 
                        onClick={openAddModal}
                        className="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        <PlusCircle size={18} className="mr-2" />
                        Ajouter activité
                    </button>
                )}
            </div>

            {erreur && (
                <div className={`mb-4 p-3 rounded ${
                    erreur.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                    {erreur.message}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de début</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de fin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {activites.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{item.nom}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{item.description || "Aucune"}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{new Date(item.date_debut).toLocaleDateString('fr-FR')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">{new Date(item.date_fin).toLocaleDateString('fr-FR')}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-base ${
                                    item.status === 'Terminé' ? 'text-green-600' : 
                                    item.status === 'En cours' ? 'text-yellow-600' : 'text-blue-600'
                                }`}>
                                    {item.status}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-base font-medium">
                                    <div className="flex items-center">
                                        <button
                                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                                            onClick={() => openModal(item)}
                                        >
                                            <Eye size={18} />
                                        </button>
                                        {isAdmin && (
                                            <>
                                                <button className="text-yellow-600 hover:text-yellow-900 mr-2">
                                                    <Edit size={18} />
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    <Trash2 size={18} />
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

            {/* Modale de détail */}
            {showModal && selected && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
                        >
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold mb-4">{selected.nom}</h3>
                        <p className="mb-2"><span className="font-semibold">Description :</span> {selected.description || 'Aucune'}</p>
                        <p className="mb-2"><span className="font-semibold">Date de début :</span> {new Date(selected.date_debut).toLocaleString('fr-FR')}</p>
                        <p className="mb-2"><span className="font-semibold">Date de fin :</span> {new Date(selected.date_fin).toLocaleString('fr-FR')}</p>
                        <p className="mb-2">
                            <span className="font-semibold">Statut :</span> 
                            <span className={`ml-1 ${
                                selected.status === 'Terminé' ? 'text-green-600' : 
                                selected.status === 'En cours' ? 'text-yellow-600' : 'text-blue-600'
                            }`}>
                                {selected.status}
                            </span>
                        </p>
                    </div>
                </div>
            )}

            {/* Modale d'ajout */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
                        <button
                            onClick={closeAddModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
                        >
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold mb-4">Ajouter une activité</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nom">
                                    Nom *
                                </label>
                                <input
                                    type="text"
                                    id="nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                                        formErrors.nom ? 'border-red-500' : ''
                                    }`}
                                    required
                                />
                                {formErrors.nom && (
                                    <p className="text-red-500 text-xs italic mt-1">{formErrors.nom}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date_debut">
                                        Date de début *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="date_debut"
                                        name="date_debut"
                                        value={formData.date_debut}
                                        onChange={handleChange}
                                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                                            formErrors.date_debut ? 'border-red-500' : ''
                                        }`}
                                        required
                                    />
                                    {formErrors.date_debut && (
                                        <p className="text-red-500 text-xs italic mt-1">{formErrors.date_debut}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date_fin">
                                        Date de fin *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="date_fin"
                                        name="date_fin"
                                        value={formData.date_fin}
                                        onChange={handleChange}
                                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                                            formErrors.date_fin ? 'border-red-500' : ''
                                        }`}
                                        required
                                        min={formData.date_debut}
                                    />
                                    {formErrors.date_fin && (
                                        <p className="text-red-500 text-xs italic mt-1">{formErrors.date_fin}</p>
                                    )}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                                    Statut *
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                                        formErrors.status ? 'border-red-500' : ''
                                    }`}
                                    required
                                >
                                    <option value="À venir">À venir</option>
                                    <option value="En cours">En cours</option>
                                    <option value="Terminé">Terminé</option>
                                </select>
                                {formErrors.status && (
                                    <p className="text-red-500 text-xs italic mt-1">{formErrors.status}</p>
                                )}
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={closeAddModal}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center ${
                                        isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Enregistrement...
                                        </>
                                    ) : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListeActivites;
