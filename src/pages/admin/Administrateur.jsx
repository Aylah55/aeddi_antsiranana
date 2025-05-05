import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { FiHome, FiUsers, FiActivity, FiMail, FiSettings, FiLogOut } from 'react-icons/fi';
import { FaUserShield } from 'react-icons/fa';

function Administrateur() {
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.email !== 'admin@admin.com') {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const menuItems = [
        { path: '', name: 'Tableau de bord', icon: <FiHome className="mr-3" /> },
        { path: 'membres', name: 'Gestion des membres', icon: <FiUsers className="mr-3" /> },
        { path: 'activites', name: 'Activités et Cotisations', icon: <FiActivity className="mr-3" /> },
        { path: 'messages', name: 'Messages', icon: <FiMail className="mr-3" /> },
        { path: 'parametres', name: 'Paramètres', icon: <FiSettings className="mr-3" /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-gradient-to-b from-blue-800 to-blue-600 text-white shadow-xl">
                <div className="p-6 flex items-center space-x-3">
                    <FaUserShield className="text-2xl text-blue-200" />
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>

                <nav className="mt-8 px-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <a
                                    href={`/administrateur/${item.path}`}
                                    className={`flex items-center p-3 rounded-lg transition-all
                                        ${window.location.pathname === `/administrateur/${item.path}`
                                            ? 'bg-blue-700 text-white shadow-md'
                                            : 'text-blue-100 hover:bg-blue-700 hover:bg-opacity-50'}`}
                                >
                                    {item.icon}
                                    {item.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="absolute bottom-0 w-64 p-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center p-3 text-blue-100 hover:text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FiLogOut className="mr-3" />
                        Déconnexion
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="bg-white shadow-sm">
                    <div className="flex items-center justify-between p-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {menuItems.find(item => window.location.pathname === `/administrateur/${item.path}`)?.name || 'Tableau de bord'}
                        </h2>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <button className="p-2 rounded-full hover:bg-gray-100 relative">
                                    <FiMail className="text-gray-600" />
                                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                                </button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-medium">A</span>
                                </div>
                                <span className="text-sm font-medium">Administrateur</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Administrateur;
