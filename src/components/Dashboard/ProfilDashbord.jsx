import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilUtilisateur from './ProfilUtilisateur';
import ListeUtilisateur from './ListUtilisateur';

const ProfilDashbord = () => {
    const [dateHeure] = useState(new Date());
    const [activeItem, setActiveItem] = useState('profil');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    const menuItems = [
        { id: 'accueil', label: 'Accueil', icon: '🏠' },
        { id: 'profil', label: 'Profil', icon: '👤' },
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
                                    <span className="text-xl mr-3">{item.icon}</span>
                                    {item.label}
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

                <div className="border-b">
                    <div className="flex justify-between items-center px-6 py-3">
                        <div>
                            <h1 className="text-2xl font-bold text-blue-800">
                                {menuItems.find(item => item.id === activeItem)?.label}
                            </h1>
                            <p className="text-blue-600 text-sm">AEDDI</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <p className="text-gray-700 font-medium">
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
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {renderContent()}
                </div>
            </div>

            {/* Barre de navigation mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
                <div className="flex justify-around p-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
                            className={`flex flex-col items-center p-2 ${
                                activeItem === item.id ? 'text-blue-600' : 'text-gray-600'
                            }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-xs mt-1">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilDashbord;
