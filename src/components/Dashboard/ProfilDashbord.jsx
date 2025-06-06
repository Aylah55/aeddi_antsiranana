import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Home, User, Calendar, Users, CreditCard, Trash2 } from 'lucide-react';
import ProfilUtilisateur from './ProfilUtilisateur';
import ListeUtilisateur from './ListUtilisateur';
import ListeActivites from './ListeActivites';
import ListeCotisation from './ListeCotisation';
import AcceuilUtilisateur from './AcceuilUtilisateur';
import logo from '../../assets/logo/aeddi.png';

const ProfilDashbord = () => {
    const [dateHeure] = useState(new Date());
    const [activeItem, setActiveItem] = useState('profil');
    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    // Vérifier si l'utilisateur est admin
    const isAdmin = user?.role === 'admin';

    // Rediriger tous les utilisateurs vers l'accueil après connexion
    useEffect(() => {
        setActiveItem('accueil');
        navigate('/dashbord');
    }, [navigate]);

    const menuItems = [
        { id: 'accueil', label: 'Accueil', icon: Home },
        { id: 'activites', label: 'Activités', icon: Calendar },
        { id: 'membres', label: 'Membres', icon: Users },
        { id: 'cotisations', label: 'Cotisations', icon: CreditCard }
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        navigate('/');
    };

    const handleMenuClick = async (itemId) => {
        setIsLoading(true);
        setLoadingProgress(0);
        setActiveItem(itemId);

        // Démarrer l'animation de chargement
        const startLoading = () => {
            setLoadingProgress(30); // Démarrage rapide à 30%
            setTimeout(() => {
                if (isLoading) setLoadingProgress(50); // Progression à 50% après un court délai
            }, 100);
            setTimeout(() => {
                if (isLoading) setLoadingProgress(70); // Progression à 70% après un délai plus long
            }, 300);
        };

        startLoading();

        try {
            // Simuler le temps de chargement du composant
            await new Promise(resolve => setTimeout(resolve, 500));
            setLoadingProgress(100); // Chargement terminé
        } finally {
            // Attendre que l'animation de 100% soit visible avant de cacher la barre
            setTimeout(() => {
                setIsLoading(false);
                setLoadingProgress(0);
            }, 200);
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleProfileClick = () => {
        setActiveItem('profil');
        return <ProfilUtilisateur user={user} setUser={(updatedUser) => {
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setTimeout(() => {
                setUser(JSON.parse(localStorage.getItem('user')));
            }, 100);
        }} />;
    };

    const renderContent = () => {
        switch (activeItem) {
            case 'profil':
                return <ProfilUtilisateur user={user} setUser={(updatedUser) => {
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setTimeout(() => {
                        setUser(JSON.parse(localStorage.getItem('user')));
                    }, 100);
                }} />;
            case 'membres':
                return <ListeUtilisateur />;
            case 'activites':
                return <ListeActivites />;
            case 'cotisations':
                return <ListeCotisation />;
            case 'accueil':
                return <AcceuilUtilisateur />;
            default:
                return (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                        <p className="text-gray-600">Cette fonctionnalité sera bientôt disponible.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Barre latérale pour grands écrans */}
            <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
                <div className="p-4">
                    <img
                        src={logo}
                        alt="Logo AEDDI"
                        className="h-32 w-full object-contain"
                    />
                </div>

                <nav className="flex-1">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleMenuClick(item.id)}
                                    className={`w-full flex items-center px-4 py-3 transition-colors ${activeItem === item.id
                                        ? 'bg-blue-100 text-blue-700 font-medium'
                                        : 'text-gray-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <item.icon className="mr-3" size={20} />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            {/* Contenu principal */}
            <div className="flex-1 flex flex-col">
                <div className="h-1 relative w-full">
                    <div className="absolute top-0 left-0 w-full h-full bg-blue-500 z-0" />
                    {isLoading && (
                        <div
                            className="absolute top-0 left-0 h-full bg-red-500 z-10 transition-all duration-300 ease-in-out"
                            style={{ width: `${loadingProgress}%` }}
                        />
                    )}
                </div>

                {/* En-tête */}
                <header className="bg-white border-b border-gray-200">
                    <div className="flex justify-between items-center h-16 px-4">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800">
                                {menuItems.find(item => item.id === activeItem)?.label || 'Tableau de bord'}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-6">
                            <p className="text-sm text-gray-700 font-medium">
                                {formatDate(dateHeure)}
                            </p>

                            {/* Photo de profil et nom */}
                            <div
                                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                                onClick={handleProfileClick}
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100">
                                    {user?.photo ? (
                                        <img
                                            src={`http://localhost:8000/storage/${user.photo}`}
                                            alt="Photo de profil"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                                            <span className="text-xl text-blue-400">👤</span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {user?.nom} {user?.prenom}
                                </span>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex items-center space-x-2 relative">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Paramètres"
                                >
                                    <Settings size={20} />
                                </button>

                                {/* Menu des paramètres */}
                                {showSettings && (
                                    <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        <div className="px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 cursor-pointer text-red-600">
                                            <Trash2 size={16} />
                                            <span className="text-sm">Supprimer mon compte</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Déconnexion"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Contenu */}
                <main className="flex-1">
                    {renderContent()}
                </main>
            </div>

            {/* Barre de navigation fixe en bas pour petits écrans */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
                <div className="flex justify-around items-center">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
                            className={`flex flex-col items-center p-2 ${activeItem === item.id
                                ? 'text-blue-700'
                                : 'text-gray-600'
                                }`}
                        >
                            <item.icon size={24} />
                            <span className="text-xs mt-1">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilDashbord;