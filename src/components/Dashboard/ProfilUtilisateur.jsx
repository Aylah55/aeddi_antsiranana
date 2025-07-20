import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo, updateUserProfile } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { API_URL } from '../../services/api';

function ProfilUtilisateur({ user: initialUser, setUser: setParentUser }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(initialUser);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        nom: initialUser?.nom || '',
        prenom: initialUser?.prenom || '',
        email: initialUser?.email || '',
        telephone: initialUser?.telephone || '',
        etablissement: initialUser?.etablissement || '',
        parcours: initialUser?.parcours || '',
        niveau: initialUser?.niveau || '',
        role: initialUser?.role || '',
        sous_role: initialUser?.sous_role || '',
        promotion: initialUser?.promotion || '',
        photo: null
    });
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (initialUser?.id) {
            fetchUserData(initialUser.id);
        } else {
            navigate('/login');
        }
    }, [initialUser?.id, navigate]);

    const fetchUserData = async (userId) => {
        try {
            const response = await getUserInfo(userId);
            if (response.data.status === 'success') {
                setUser(response.data.user);
                setParentUser(response.data.user);
                setFormData(prev => ({
                    ...prev,
                    ...response.data.user,
                    photo: null
                }));
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des données:', err);
            setError('Erreur lors de la récupération des données');
            if (err.response?.status === 401) {
                navigate('/login');
            }
        }
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
                const oldValue = user[key];
                const newValue = formData[key];
                
                // Debug: afficher les différences
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

            // Si aucun changement, ne pas faire la requête
            if (!hasChanges) {
                console.log('Aucune modification détectée');
                setIsEditing(false);
                return;
            }

            console.log('Envoi des données au serveur:', {
                url: `/user/${user.id}`,
                method: 'PUT',
                formData: Object.fromEntries(data.entries())
            });

            const response = await updateUserProfile(user.id, data);
            console.log('Réponse du serveur:', response.data);

            if (response.data.status === 'success') {
                const updatedUser = response.data.user;
                console.log('Données utilisateur mises à jour:', updatedUser);
                
                // Mettre à jour le state local
                setUser(updatedUser);
                // Mettre à jour le state parent
                setParentUser(updatedUser);
                // Mettre à jour le localStorage
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                setFormData({
                    ...updatedUser,
                    photo: null
                });
                setIsEditing(false);
                toast.success('Profil mis à jour avec succès');
                
                // Forcer le rechargement des données
                await fetchUserData(user.id);
                
                setTimeout(() => setSuccess(null), 3000);
            } else {
                throw new Error(response.data.message || 'Erreur lors de la mise à jour');
            }
        } catch (err) {
            console.error('Erreur détaillée lors de la mise à jour:', {
                message: err.message,
                stack: err.stack,
                response: err.response?.data
            });
            setError(err.message || 'Erreur lors de la mise à jour du profil');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            ...user,
            photo: null
        });
        setPreviewImage(null);
        setError(null);
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
        <div className="bg-white h-full">
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700"
                >
                    {error}
                </motion.div>
            )}
            {success && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700"
                >
                    {success}
                </motion.div>
            )}

            <div className="flex flex-col md:flex-row h-full">
                {/* Photo de profil - Partie gauche */}
                <div className="md:w-1/3 bg-gray-50 border-r border-gray-200">
                    <div className="p-6 flex flex-col items-center">
                        <div className="relative w-48 h-48 mb-6 rounded-lg overflow-hidden border-4 border-white shadow-lg">
                            {user.photo ? (
                                <img
                                    src={user.photo}
                                    alt="Photo de profil"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                                    <span className="text-5xl text-blue-400">👤</span>
                                </div>
                            )}
                            {isEditing && (
                                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer transition-all hover:bg-opacity-40">
                                    <input
                                        type="file"
                                        name="photo"
                                        onChange={handleChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <span className="text-white font-medium text-sm bg-blue-500 px-3 py-1 rounded-full">
                                        Changer
                                    </span>
                                </label>
                            )}
                        </div>
                        
                        <h2 className="text-xl font-bold text-gray-800">{user.nom} {user.prenom}</h2>
                        <p className="text-blue-600 mb-6">{user.role}</p>
                        
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-all shadow-md flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Modifier le profil
                            </button>
                        ) : (
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleUpdate}
                                    disabled={isLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition-all shadow-md flex items-center text-sm"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Enregistrement...
                                        </>
                                    ) : 'Enregistrer'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-full transition-all shadow-md flex items-center text-sm"
                                >
                                    Annuler
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contenu du profil - Partie droite */}
                <div className="md:w-2/3">
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Informations personnelles */}
                            <div className="space-y-6">
                                <div className="flex items-center mb-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-800">Informations personnelles</h2>
                                </div>
                                
                                <div className="space-y-4 pl-11">
                                    {isEditing ? (
                                        <>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-600">Nom</label>
                                                <input
                                                    type="text"
                                                    name="nom"
                                                    value={formData.nom}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-600">Prénom</label>
                                                <input
                                                    type="text"
                                                    name="prenom"
                                                    value={formData.prenom}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-600">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-600">Téléphone</label>
                                                <input
                                                    type="tel"
                                                    name="telephone"
                                                    value={formData.telephone}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-1">
                                                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</span>
                                                <span className="text-gray-800 font-medium">{user.nom}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</span>
                                                <span className="text-gray-800 font-medium">{user.prenom}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Email</span>
                                                <span className="text-gray-800 font-medium">{user.email}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</span>
                                                <span className="text-gray-800 font-medium">{user.telephone || 'Non renseigné'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Informations académiques */}
                            <div className="space-y-6">
                                <div className="flex items-center mb-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-800">Informations académiques</h2>
                                </div>
                                
                                <div className="space-y-4 pl-11">
                                    {isEditing ? (
                                        <>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-600">Établissement</label>
                                                <input
                                                    type="text"
                                                    name="etablissement"
                                                    value={formData.etablissement}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-600">Parcours</label>
                                                <input
                                                    type="text"
                                                    name="parcours"
                                                    value={formData.parcours}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-600">Niveau</label>
                                                <input
                                                    type="text"
                                                    name="niveau"
                                                    value={formData.niveau}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-600">Promotion</label>
                                                <input
                                                    type="text"
                                                    name="promotion"
                                                    value={formData.promotion}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-600">Rôle</label>
                                                <input
                                                    type="text"
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                            {user.sous_role && (
                                                <div className="space-y-1">
                                                    <label className="block text-sm font-medium text-gray-600">Fonction</label>
                                                    <input
                                                        type="text"
                                                        name="sous_role"
                                                        value={formData.sous_role}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-1">
                                                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Établissement</span>
                                                <span className="text-gray-800 font-medium">{user.etablissement || 'Non renseigné'}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Parcours</span>
                                                <span className="text-gray-800 font-medium">{user.parcours || 'Non renseigné'}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</span>
                                                <span className="text-gray-800 font-medium">{user.niveau || 'Non renseigné'}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Promotion</span>
                                                <span className="text-gray-800 font-medium">{user.promotion || 'Non renseigné'}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</span>
                                                <span className="text-gray-800 font-medium">{user.role || 'Non renseigné'}</span>
                                            </div>
                                            {user.sous_role && (
                                                <div className="space-y-1">
                                                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Fonction</span>
                                                    <span className="text-gray-800 font-medium">{user.sous_role}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilUtilisateur;