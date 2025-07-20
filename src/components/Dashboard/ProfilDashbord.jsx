import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, getPhotoUrl } from '../../services/api';
import { LogOut, Bell, Settings, Home, User, Calendar, Users, CreditCard, Trash2, Menu, Mail } from 'lucide-react';
import ProfilUtilisateur from './ProfilUtilisateur';
import ListeUtilisateur from './ListUtilisateur';
import ListeActivites from './ListeActivites';
import ListeCotisation from './ListeCotisation';
import AcceuilUtilisateur from './AcceuilUtilisateur';
import logo from '../../assets/logo/aeddi.png';
import Notification from './Notification';
import { fetchNotifications, markNotificationsAsRead, setPassword } from '../../services/api';
import Message from './Message';
import { toast } from 'react-toastify';
import { Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
    const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [isNotifLoading, setIsNotifLoading] = useState(true);

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
        let previousIds = [];
        const loadNotifications = async () => {
            setIsNotifLoading(true);
            try {
                const response = await fetchNotifications();
                const unread = response.data.filter(notif => !notif.is_read).length;
                setUnreadCount(unread);
                setNotifications(response.data);
                // Toast pour nouvelle notification
                const newNotifs = response.data.filter(n => !previousIds.includes(n.id));
                if (previousIds.length > 0 && newNotifs.length > 0) {
                  newNotifs.forEach(n => {
                    let icon, color;
                    switch (n.type) {
                      case 'success':
                        icon = CheckCircle;
                        color = '#22c55e';
                        break;
                      case 'error':
                        icon = XCircle;
                        color = '#ef4444';
                        break;
                      case 'warning':
                        icon = AlertTriangle;
                        color = '#f59e42';
                        break;
                      default:
                        icon = Info;
                        color = '#3b82f6';
                    }
                    toast(<div style={{display:'flex',alignItems:'center',gap:8}}>
                      {icon && React.createElement(icon, {size:24, color})}
                      <div>
                        <div style={{fontWeight:'bold'}}>{n.title || 'Notification'}</div>
                        <div style={{fontSize:13}}>{n.message}</div>
                      </div>
                    </div>, {
                      position: 'top-right',
                      autoClose: 5000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      style: {background:'#fff',borderLeft:`4px solid ${color}`}
                    });
                  });
                }
                previousIds = response.data.map(n => n.id);
            } catch (error) {
                console.error("Erreur de chargement des notifications", error);
            } finally {
                setIsNotifLoading(false);
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

    // Ouvrir le menu mobile avec animation
    const openMobileMenu = () => {
        setIsMobileMenuVisible(true);
        setTimeout(() => setIsMobileMenuOpen(true), 10); // Légère attente pour déclencher la transition
    };
    // Fermer le menu mobile avec animation
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setTimeout(() => setIsMobileMenuVisible(false), 300); // Durée de la transition
    };

    return (
        <>
            {/* Header fixe en haut */}
            <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex justify-between items-center h-16 px-4">
                    {/* Hamburger menu pour mobile */}
                    <div className="md:hidden flex items-center">
                                <button
                            onClick={openMobileMenu}
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
                            <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-blue-300 shadow-lg transition-transform duration-200 hover:scale-105">
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
                            <span className="text-base font-semibold text-gray-700">
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
                            <button
                                className="relative focus:outline-none"
                                onClick={() => setShowMessage(true)}
                                title="Messages"
                            >
                                <Mail className="w-7 h-7 text-blue-600" />
                            </button>
                            <div className="relative" ref={notificationRef}>
                                <div className="w-6 h-6 cursor-pointer" onClick={toggleNotifications}>
                                    <Bell className="w-6 h-6 text-gray-700" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 text-[10px] flex items-center justify-center text-white rounded-full border-2 border-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>
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

            <div className="flex flex-col min-h-screen bg-gray-50 md:flex-row">
                {/* Sidebar pour grands écrans */}
                <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 pt-16 fixed top-0 left-0 bottom-0 z-20">
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
                </aside>
                {/* Décalage du contenu principal à droite de la sidebar sur PC */}
                <div className="flex-1 flex flex-col" style={{ minHeight: '100vh', marginLeft: 0 }}>
                    <div className="h-16 md:h-16" />
                    <main className="flex-1 overflow-y-auto overflow-x-hidden px-2 md:px-6 pb-20 md:ml-64 pt-0">
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
                        {renderContent()}
                    </main>
                    {/* Espace pour la barre de navigation fixe en bas */}
                    <div className="md:hidden h-16" />
                    {/* Barre de navigation fixe en bas pour petits écrans */}
                    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200">
                        <div className="flex justify-around items-center h-16">
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
                    </nav>
                </div>
            </div>

            {/* Menu mobile latéral avec transition améliorée */}
            {isMobileMenuVisible && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Overlay */}
                    <div
                        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                        onClick={closeMobileMenu}
                    ></div>
                    {/* Menu latéral */}
                    <div
                        className={`relative bg-white w-64 max-w-full h-full shadow-xl flex flex-col p-6 transition-transform duration-300 ease-in-out
                            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                        style={{ willChange: 'transform' }}
                    >
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            onClick={closeMobileMenu}
                            aria-label="Fermer le menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        {/* Logo AEDDI centré */}
                        <div className="flex flex-col items-center mt-8 mb-6">
                            <img
                                src={logo}
                                alt="Logo AEDDI"
                                className="w-20 h-20 object-contain mb-2"
                            />
                        </div>
                        <div className="flex flex-col space-y-4 mt-4">
                            <button
                                onClick={() => { closeMobileMenu(); toggleNotifications(); }}
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
                                onClick={() => { closeMobileMenu(); setShowMessage(true); }}
                                className="flex items-center px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors text-blue-700 font-medium"
                            >
                                <Mail className="mr-3" size={22} /> Messages
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
            {showNotifications && (
                <Notification
                    notifications={notifications}
                    loading={isNotifLoading}
                    onClose={() => setShowNotifications(false)}
                    onCotisationView={(cotisation) => {
                        setActiveItem('cotisations');
                        setCotisationToView(cotisation);
                        setShowNotifications(false);
                    }}
                />
            )}
            {showMessage && (
                <Message open={showMessage} onClose={() => setShowMessage(false)} />
            )}
        </>
    );
};

export default ProfilDashbord;