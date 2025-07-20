import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, getPhotoUrl } from '../../services/api';
import { LogOut, Bell, Settings, Home, User, Calendar, Users, CreditCard, Trash2, Menu } from 'lucide-react';
import ProfilUtilisateur from './ProfilUtilisateur';
import ListeUtilisateur from './ListUtilisateur';
import ListeActivites from './ListeActivites';
import ListeCotisation from './ListeCotisation';
import AcceuilUtilisateur from './AcceuilUtilisateur';
import logo from '../../assets/logo/aeddi.png';
import Notification from './Notification';
import { fetchNotifications, markNotificationsAsRead, setPassword } from '../../services/api';
import Message from './Message';

const ProfilDashbord = () => {
    const [dateHeure] = useState(new Date());
    const [activeItem, setActiveItem] = useState('profil');
    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const notificationRef = useRef(null);
    const [cotisationToView, setCotisationToView] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        password: '',
        password_confirmation: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isCreatingPassword, setIsCreatingPassword] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Vérifier si l'utilisateur a un mot de passe temporaire (utilisateur Google)
    const hasTemporaryPassword = user?.provider === 'google' && !user?.password_set;

    // Fonction pour ouvrir le modal de création de mot de passe
    const handleCreatePassword = () => {
        setShowPasswordModal(true);
        setPasswordError('');
        setPasswordSuccess('');
        setPasswordData({ password: '', password_confirmation: '' });
    };

    // Fonction pour gérer la soumission du formulaire de mot de passe
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsCreatingPassword(true);
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.password !== passwordData.password_confirmation) {
            setPasswordError('Les mots de passe ne correspondent pas');
            setIsCreatingPassword(false);
            return;
        }

        try {
            await setPassword({
                email: user.email,
                password: passwordData.password,
                password_confirmation: passwordData.password_confirmation
            });
            
            setPasswordSuccess('Mot de passe créé avec succès !');
            
            // Mettre à jour l'utilisateur localement
            const updatedUser = { ...user, password_set: true };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Fermer le modal après 2 secondes
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordSuccess('');
            }, 2000);
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Erreur lors de la création du mot de passe');
        } finally {
            setIsCreatingPassword(false);
        }
    };

    // Fonction pour fermer le modal
    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordError('');
        setPasswordSuccess('');
        setPasswordData({ password: '', password_confirmation: '' });
    };

    // Vérifier si l'utilisateur est admin
    const isAdmin = user?.role === 'admin';

    // Initialiser l'onglet actif à l'accueil
    useEffect(() => {
        setActiveItem('accueil');
    }, []);

    // Charger les notifications
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const response = await fetchNotifications();
                const unread = response.data.filter(notif => !notif.is_read).length;
                setUnreadCount(unread);
                setNotifications(response.data);
            } catch (error) {
                console.error("Erreur de chargement des notifications", error);
            }
        };

        loadNotifications();
        
        // Recharger périodiquement
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

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
            setLoadingProgress(30);
            setTimeout(() => {
                if (isLoading) setLoadingProgress(50);
            }, 100);
            setTimeout(() => {
                if (isLoading) setLoadingProgress(70);
            }, 300);
        };

        startLoading();

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setLoadingProgress(100);
        } finally {
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

    const toggleNotifications = async () => {
        if (!showNotifications && unreadCount > 0) {
            try {
                await markNotificationsAsRead();
                setUnreadCount(0);
                setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            } catch (error) {
                console.error("Erreur de marquage comme lu", error);
            }
        }
        setShowNotifications(!showNotifications);
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
                return <ListeCotisation cotisationToView={cotisationToView} setCotisationToView={setCotisationToView} />;
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
        <>
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
                        {/* Hamburger menu pour mobile */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-2 focus:outline-none"
                                aria-label="Ouvrir le menu"
                            >
                                <Menu className="w-7 h-7 text-blue-700" />
                            </button>
                        </div>
                        {/* Titre (masqué sur mobile) */}
                        <div className="hidden md:block">
                            <h1 className="text-xl font-semibold text-gray-800">
                                {menuItems.find(item => item.id === activeItem)?.label || 'Tableau de bord'}
                            </h1>
                        </div>
                        {/* Profil et nom toujours visibles */}
                        <div className="flex items-center space-x-3 ml-auto">
                            <div
                                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                                onClick={handleProfileClick}
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100">
                                    {(user?.photo_url || user?.photo) ? (
                                        <img
                                            src={user.photo_url || getPhotoUrl(user.photo)}
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
                        </div>
                        {/* Section droite (date, notifications, etc.) masquée sur mobile */}
                        <div className="hidden md:flex items-center space-x-6">
                            <p className="text-sm text-gray-700 font-medium">
                                {formatDate(dateHeure)}
                            </p>
                            {/* Message d'alerte pour mot de passe temporaire */}
                            {hasTemporaryPassword && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 shadow-sm">
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                                            <span className="text-sm text-yellow-800 font-medium">
                                                Votre mot de passe est temporaire
                                            </span>
                                            <button
                                                onClick={handleCreatePassword}
                                                className="text-sm text-yellow-700 underline hover:text-yellow-800 font-medium transition-colors"
                                            >
                                                Créer un mot de passe
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <Message />
                            <div className="relative" ref={notificationRef}>
                                <div className="w-6 h-6 cursor-pointer" onClick={toggleNotifications}>
                                    <Bell className="w-6 h-6 text-gray-700" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 text-[10px] flex items-center justify-center text-white rounded-full border-2 border-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                                {showNotifications && (
                                    <Notification 
                                        notifications={notifications}
                                        onClose={() => setShowNotifications(false)}
                                        onCotisationView={(cotisation) => {
                                            setActiveItem('cotisations');
                                            setCotisationToView(cotisation);
                                            setShowNotifications(false);
                                        }}
                                    />
                                )}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Déconnexion"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Message d'alerte principal pour mot de passe temporaire */}
                {hasTemporaryPassword && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 px-4 py-3">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h3 className="text-sm font-semibold text-yellow-800">
                                            Mot de passe temporaire détecté
                                        </h3>
                                        <p className="text-sm text-yellow-700">
                                            Pour une meilleure sécurité, créez un mot de passe permanent.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCreatePassword}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                >
                                    Créer un mot de passe
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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

        {/* Modal de création de mot de passe */}
        {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            Créer votre mot de passe
                        </h2>
                        <button
                            onClick={handleClosePasswordModal}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                        Créez un mot de passe pour pouvoir vous connecter avec email/mot de passe en plus de Google.
                    </p>

                    {passwordError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-500 text-sm rounded-md">
                            {passwordError}
                        </div>
                    )}

                    {passwordSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-500 text-sm rounded-md">
                            {passwordSuccess}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nouveau mot de passe
                            </label>
                            <input
                                type="password"
                                value={passwordData.password}
                                onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
                                required
                                disabled={isCreatingPassword}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                placeholder="Minimum 8 caractères"
                                minLength="8"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmer le mot de passe
                            </label>
                            <input
                                type="password"
                                value={passwordData.password_confirmation}
                                onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})}
                                required
                                disabled={isCreatingPassword}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                placeholder="Répétez votre mot de passe"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClosePasswordModal}
                                disabled={isCreatingPassword}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isCreatingPassword}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                            >
                                {isCreatingPassword ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Création...
                                    </>
                                ) : (
                                    'Créer le mot de passe'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Menu mobile latéral */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex">
                {/* Overlay */}
                <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setIsMobileMenuOpen(false)}></div>
                {/* Menu latéral */}
                <div className="relative bg-white w-64 max-w-full h-full shadow-xl animate-slide-in-left flex flex-col p-6">
                    <button
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Fermer le menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="flex flex-col items-center mt-8 mb-6">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200 mb-2">
                            {(user?.photo_url || user?.photo) ? (
                                <img
                                    src={user.photo_url || getPhotoUrl(user.photo)}
                                    alt="Photo de profil"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                                    <span className="text-2xl text-blue-400">👤</span>
                                </div>
                            )}
                        </div>
                        <span className="text-lg font-semibold text-gray-800">{user?.nom} {user?.prenom}</span>
                    </div>
                    <div className="flex flex-col space-y-4 mt-4">
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); toggleNotifications(); }}
                            className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-blue-700 font-medium"
                        >
                            <Bell className="mr-3" size={22} /> Notifications
                            {unreadCount > 0 && (
                                <span className="ml-2 bg-red-500 w-5 h-5 text-xs flex items-center justify-center text-white rounded-full border-2 border-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => { setIsMobileMenuOpen(false); }}
                            className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-blue-700 font-medium"
                        >
                            <Message className="mr-3" size={22} /> Messages
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 font-medium"
                        >
                            <LogOut className="mr-3" size={22} /> Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
    );
};

export default ProfilDashbord;