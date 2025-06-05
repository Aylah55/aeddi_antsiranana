import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react'; // Import de l'icône de déconnexion
import ProfilUtilisateur from './ProfilUtilisateur';
import ListeUtilisateur from './ListUtilisateur';
import ListeActivites from './ListeActivites';

const ProfilDashbord = () => {
    const [dateHeure] = useState(new Date());
    const [activeItem, setActiveItem] = useState('profil');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    // Vérifier si l'utilisateur est admin
    const isAdmin = user?.role === 'admin';

    // Si c'est un admin, rediriger vers l'accueil et masquer le profil
    useEffect(() => {
        if (isAdmin) {
            setActiveItem('accueil');
            navigate('/dashbord');
        }
    }, [isAdmin, navigate]);

    const menuItems = [
        { id: 'accueil', label: 'Accueil', icon: '🏠' },
        ...(!isAdmin ? [{ id: 'profil', label: 'Profil', icon: '👤' }] : []),
        { id: 'activites', label: 'Activités', icon: '📅' },
        { id: 'membres', label: 'Membres', icon: '👥' },
        { id: 'cotisations', label: 'Cotisations', icon: '💰' }
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        navigate('/');
    };

    const handleMenuClick = (itemId) => {
        setIsLoading(true);
        setActiveItem(itemId);
        // Simulate loading
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
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
            case 'accueil':
                return (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                        <div className="animate-fadeIn">
                            <div className="flex items-center mb-6">
                                <span className="text-2xl mr-3">👋</span>
                                <h2 className="text-2xl font-semibold text-blue-800">Bienvenue {user?.prenom} !</h2>
                            </div>
                            <p className="text-gray-600">
                                Bienvenue dans votre espace personnel AEDDI.
                            </p>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                        <p className="text-gray-600">Cette fonctionnalité sera bientôt disponible.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
            {/* Barre latérale */}
            <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
                <div className="p-6 mb-8">
                    <h2 className="text-2xl font-bold text-blue-800">AEDDI</h2>
                    <p className="text-gray-600 text-sm mt-1">Tableau de bord</p>
                </div>

                <nav className="flex-1 px-6">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleMenuClick(item.id)}
                                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                                        activeItem === item.id
                                            ? 'bg-blue-100 text-blue-700 font-medium'
                                            : 'text-gray-600 hover:bg-blue-50'
                                    }`}
                                >
                                    <span className="mr-3 text-xl">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Ligne de chargement */}
                <div className="h-1 bg-gray-100 relative">
                    <div
                        className={`absolute top-0 left-0 h-full transition-all duration-300 ease-in-out ${
                            isLoading
                                ? 'bg-red-500 animate-loading-bar'
                                : 'bg-blue-500 w-full'
                        }`}
                    ></div>
                </div>

                {/* En-tête */}
                <header className="bg-white border-b border-gray-200 py-4 px-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800">
                                {menuItems.find(item => item.id === activeItem)?.label || 'Tableau de bord'}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <p className="text-sm text-gray-700 font-medium">
                                {dateHeure.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                <span className="ml-2 text-blue-600">
                                    {dateHeure.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </p>
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Déconnexion"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Contenu */}
                <main className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        renderContent()
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProfilDashbord;
