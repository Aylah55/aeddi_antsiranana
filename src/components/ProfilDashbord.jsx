import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilUtilisateur from './ProfilUtilisateur';
import ListUtilisateur from './ListUtilisateur';
import ListeActivites from './ListeActivites';
import { getUserProfile, logoutUser } from '../services/api';

const ProfilDashbord = () => {
    const [dateHeure, setDateHeure] = useState(new Date());
    const [contenuActif, setContenuActif] = useState('Informations de votre profil');
    const [activeItem, setActiveItem] = useState('profil');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setDateHeure(new Date());
        }, 60000);

        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    const response = await getUserProfile();
                    setUser(response.data.user);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                setLoading(false);
            } catch (error) {
                console.error('Erreur de chargement:', error);
                navigate('/login');
            }
        };

        fetchUserData();

        return () => clearInterval(interval);
    }, [navigate]);

    const menuItems = [
        { id: 'profil', label: 'Profil', icon: '👤', content: 'Informations de votre profil' },
        { id: 'activite', label: 'Activité', icon: '📊', content: 'Historique des activités' },
        { id: 'membre', label: 'Membre', icon: '👥', content: 'Liste des membres' },
        { id: 'cotisation', label: 'Cotisation', icon: '💰', content: 'Gestion des cotisations' },
    ];

    const afficherContenu = (content, id) => {
        setContenuActif(content);
        setActiveItem(id);
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            navigate('/');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
            {/* Contenu principal */}
            <div className="flex-1 p-6 pb-24 md:pb-6 md:ml-72">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-800">
                            Bienvenue, {user?.prenom || 'Utilisateur'}
                        </h1>
                        <p className="text-blue-600 mt-1">Gérez votre association en toute simplicité</p>
                    </div>
                    <div className="mt-4 md:mt-0 bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-gray-700 font-medium">
                            {dateHeure.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            <span className="ml-2 text-blue-600">
                                {dateHeure.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Section de contenu */}
                <div className="mt-6 p-6 bg-white rounded-xl shadow-md border border-gray-100">
                    {contenuActif ? (
                        <div className="animate-fadeIn">
                            <div className="flex items-center mb-6">
                                <span className="text-2xl mr-3">
                                    {menuItems.find(item => item.id === activeItem)?.icon}
                                </span>
                                <h2 className="text-2xl font-semibold text-blue-800">{contenuActif}</h2>
                                </div>
                                {activeItem === 'profil' ? (
                                        <ProfilUtilisateur user={user} setUser={setUser} />
                                    ) : activeItem === 'membre' ? (
                                        <ListUtilisateur />
                                    ) : activeItem === 'activite' ? (
                                        <ListeActivites type="activite" />
                                    ) : activeItem === 'cotisation' ? (
                                        <ListeActivites type="cotisation" />
                                    ) : (
                                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                                            <p className="text-gray-700">Bienvenue sur votre tableau de bord.</p>
                                        </div>
                                    )}

                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-3xl">👋</span>
                            </div>
                            <h3 className="text-xl font-medium text-gray-700">Bienvenue sur votre tableau de bord</h3>
                            <p className="text-gray-500 mt-2 max-w-md mx-auto">
                                Sélectionnez une option dans le menu pour commencer à gérer votre association
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Barre latérale desktop */}
            <div className="hidden md:block fixed inset-y-0 left-0 w-64 bg-white p-6 space-y-4 border-r border-gray-200 shadow-sm">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-blue-800">Tableau de bord</h2>
                    <p className="text-gray-500 text-sm">Bienvenue, {user?.prenom || 'Utilisateur'}</p>
                </div>

                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => afficherContenu(item.content, item.id)}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center ${
                                    activeItem === item.id
                                        ? 'bg-blue-100 text-blue-700 font-medium border-l-4 border-blue-600'
                                        : 'text-gray-700 hover:bg-blue-50'
                                }`}
                            >
                                <span className="text-xl mr-3">{item.icon}</span>
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="absolute bottom-6 left-6 right-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center py-2 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                        <span className="mr-2">🚪</span>
                        Déconnexion
                    </button>
                </div>
            </div>

            {/* Barre de navigation mobile */}
            <div className="md:hidden fixed inset-x-0 bottom-0 bg-white text-gray-700 p-2 border-t border-gray-200 shadow-lg">
                <div className="flex justify-around items-center">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => afficherContenu(item.content, item.id)}
                            className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                                activeItem === item.id ? 'text-blue-600 bg-blue-50' : 'hover:text-blue-600'
                            }`}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-xs mt-1">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilDashbord;