import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo, updateUserProfile, getPhotoUrl } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { API_URL } from '../../services/api';
import EditUserComp from '../../utils/EditUserComp';

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
                <div className="md:w-1/3 bg-gray-50 border-r border-gray-200">
                    <div className="p-6 flex flex-col items-center">
                        <EditUserComp
                            formData={formData}
                                        onChange={handleChange}
                            onSubmit={handleUpdate}
                            onClose={handleCancel}
                            isLoading={isLoading}
                            previewImage={previewImage}
                            editingUser={user}
                            readOnly={!isEditing}
                        />
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-all shadow-md flex items-center mt-4"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Modifier le profil
                            </button>
                        )}
                    </div>
                </div>
                {/* Contenu du profil - Partie droite (supprimée car tout est dans EditUserComp) */}
            </div>
        </div>
    );
}

export default ProfilUtilisateur;