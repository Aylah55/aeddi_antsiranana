import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function ProfilUtilisateur({ user, setUser }) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nom: user?.nom || '',
        prenom: user?.prenom || '',
        email: user?.email || '',
        photo: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        if (e.target.name === 'photo') {
            const file = e.target.files[0];
            setFormData({ ...formData, photo: file });

            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            const data = new FormData();
            data.append('nom', formData.nom);
            data.append('prenom', formData.prenom);
            data.append('email', formData.email);
            if (formData.photo) {
                data.append('photo', formData.photo);
            }

            const response = await updateUserProfile(user.id, data);
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setIsEditing(false);
            setPreviewImage(null);
            setSuccess('Profil mis à jour avec succès');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Erreur lors de la mise à jour: ' + (err.response?.data?.message || err.message));
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            photo: null
        });
        setPreviewImage(null);
    };

    const startEditing = () => {
        setIsEditing(true);
    };

    if (!user) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500">Utilisateur non trouvé</div>
                <button 
                    onClick={() => navigate('/login')}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Se connecter
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm animate-fadeIn">
                    <p>{error}</p>
                </div>
            )}
            {success && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded shadow-sm animate-fadeIn">
                    <p>{success}</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
                {/* Photo de profil - Partie gauche */}
                <div className="md:w-1/3 flex flex-col items-center">
                    <div className="relative group w-64 h-64 rounded-xl overflow-hidden shadow-lg border-4 border-white bg-gray-100">
                        {user?.photo ? (
                            <img
                                src={`${API_URL}/storage/${user.photo}`}
                                alt="Photo de profil"
                                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    console.log('Erreur d\'affichage de la photo:', user.photo);
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-7xl text-gray-400">👤</span>
                            </div>
                        )}
                        {isEditing && (
                            <label className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <input
                                    type="file"
                                    name="photo"
                                    onChange={handleChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div className="bg-white p-3 rounded-full shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </label>
                        )}
                    </div>

                    {previewImage && (
                        <div className="mt-4 text-center animate-fadeIn">
                            <p className="text-sm text-gray-600 mb-2">Nouvelle photo:</p>
                            <img
                                src={previewImage}
                                alt="Prévisualisation"
                                className="w-20 h-20 rounded-full mx-auto border-2 border-gray-300 object-cover"
                            />
                        </div>
                    )}

                    {!isEditing && (
                        <button
                            onClick={startEditing}
                            className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center min-w-[180px]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Chargement...
                                </>
                            ) : (
                                'Modifier le profil'
                            )}
                        </button>
                    )}
                </div>

                {/* Informations - Partie droite avec bordure dégradé */}
                <div className="md:w-2/3">
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div
                                key="edit"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl border border-gray-200 shadow-sm"
                            >
                                <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Modifier le profil
                                </h2>
                                
                                <div className="space-y-5">
                                    <div className="flex items-center bg-white p-4 rounded-lg border border-gray-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                            <input
                                                type="text"
                                                name="nom"
                                                value={formData.nom}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center bg-white p-4 rounded-lg border border-gray-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                            <input
                                                type="text"
                                                name="prenom"
                                                value={formData.prenom}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center bg-white p-4 rounded-lg border border-gray-200">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 pt-2">
                                        <button
                                            onClick={handleUpdate}
                                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md flex items-center justify-center"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Enregistrement...
                                                </>
                                            ) : (
                                                'Enregistrer'
                                            )}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="view"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border border-blue-200 shadow-sm"
                            >
                                <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Mon Profil
                                </h2>
                                
                                <div className="space-y-5">
                                    <div className="flex items-center bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-gray-500">Nom</p>
                                            <p className="font-medium text-gray-800">{user.nom}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-gray-500">Prénom</p>
                                            <p className="font-medium text-gray-800">{user.prenom}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium text-gray-800">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default ProfilUtilisateur;