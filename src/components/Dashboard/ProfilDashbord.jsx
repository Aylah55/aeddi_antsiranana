import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilDashbord = () => {
    const [dateHeure] = useState(new Date());
    const [activeItem, setActiveItem] = useState('accueil');
    const navigate = useNavigate();

    const menuItems = [
        { id: 'accueil', label: 'Accueil', icon: '🏠' },
        { id: 'profil', label: 'Profil', icon: '👤' },
        { id: 'activites', label: 'Activités', icon: '📅' },
        { id: 'membres', label: 'Membres', icon: '👥' },
        { id: 'cotisations', label: 'Cotisations', icon: '💰' }
    ];

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
            {/* Barre latérale */}
            <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-blue-800">AEDDI</h2>
                    <p className="text-gray-600 text-sm mt-1">Tableau de bord</p>
                </div>

                <nav className="flex-1">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveItem(item.id)}
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

                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <span className="text-xl mr-3">🚪</span>
                    Retour à l'accueil
                </button>
            </div>

            {/* Contenu principal */}
            <div className="flex-1">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-800">
                                Bienvenue sur votre tableau de bord
                            </h1>
                            <p className="text-blue-600 mt-1">AEDDI</p>
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

                    <div className="mt-6 p-6 bg-white rounded-xl shadow-md border border-gray-100">
                        <div className="animate-fadeIn">
                            <div className="flex items-center mb-6">
                                <span className="text-2xl mr-3">👋</span>
                                <h2 className="text-2xl font-semibold text-blue-800">Inscription réussie !</h2>
                            </div>
                            <p className="text-gray-600">
                                Bienvenue dans votre espace personnel AEDDI. Votre inscription a été effectuée avec succès.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barre de navigation mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
                <div className="flex justify-around p-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveItem(item.id)}
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