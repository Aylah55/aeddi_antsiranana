import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { 
  fetchNotifications,
  markNotificationsAsRead,
  deleteAllNotifications,
  apiGet
} from '../../services/api';
import axios from 'axios';
import ListeCotisation from './ListeCotisation';
import DetailCotisation from './DetailCotisation';

// Détecter le rôle de l'utilisateur connecté
const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export default function Notification({ onCotisationView }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cotisations, setCotisations] = useState([]);
  const [selectedCotisation, setSelectedCotisation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [user, setUser] = useState(getUserFromStorage());
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetchNotifications();
        
        // Formatage des données
        const formatted = response.data.map(notif => {
          // Détection du type de notification
          const isStatusChange = notif.message && notif.message.includes('a changé votre cotisation');
          return {
            id: notif.id,
            user: notif.admin_name || 'Admin',
            date: new Date(notif.created_at).toLocaleString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            message: notif.message, // Toujours utiliser le message du backend
            isStatusChange,
            action: `a ajouté une cotisation "${notif.title}"`,
            title: notif.title,
            avatar: notif.admin_avatar || 'https://i.pravatar.cc/100?img=1',
            is_read: notif.is_read || false
          };
        });
        
        setNotifications(formatted);
        setError(null);
      } catch (err) {
        console.error('Erreur de chargement des notifications:', err);
        setError('Impossible de charger les notifications');
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Charger les cotisations au montage (ou à l'ouverture du menu notif)
  useEffect(() => {
    if (!user) return;
    const endpoint = isAdmin ? '/cotisations' : '/my-cotisations';
    apiGet(endpoint, {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
    })
      .then(res => setCotisations(res.data.data || res.data))
      .catch(() => setCotisations([]));
  }, [user, isAdmin]);

  // Log à chaque changement de cotisations ou notifications
  useEffect(() => {
    console.log('Cotisations disponibles:', cotisations);
  }, [cotisations]);

  useEffect(() => {
    console.log('Notifications chargées:', notifications);
  }, [notifications]);

  const handleMarkAllAsRead = async () => {
    try {
      await markNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="absolute top-16 right-4 w-96 bg-white rounded-lg shadow-lg border z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <button 
          onClick={handleDeleteAll}
          className="text-yellow-600 text-sm flex items-center"
        >
          <Trash2 size={16} className="mr-1" />
          Tout retirer
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 py-2 space-x-4 text-sm font-medium">
        <span className="text-blue-600 border-b-2 border-blue-600 pb-1 cursor-pointer">
          Tout
        </span>
        <span className="text-gray-500 relative cursor-pointer">
          Non lus{' '}
          {unreadCount > 0 && (
            <span className="ml-1 text-white text-xs bg-gray-500 rounded-full px-2">
              {unreadCount}
            </span>
          )}
        </span>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Chargement...</div>
        ) : error ? (
          <div className="p-4 text-sm text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">Aucune notification</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-start px-4 py-3 space-x-3 border-b cursor-pointer hover:bg-gray-50"
              onClick={() => {
                // Extraire le nom de la cotisation depuis notif.message ou notif.action
                const sourceText = notif.isStatusChange ? notif.message : notif.action;
                const match = sourceText.match(/"([^"]+)"/);
                const cotisationName = match ? match[1] : null;
                const cotisation = cotisationName
                  ? cotisations.find(c => c.nom === cotisationName)
                  : null;
                if (cotisation) {
                  setSelectedCotisation(cotisation);
                  setShowDetailModal(true);
                } else {
                  alert('Cotisation non trouvée pour cette notification.');
                }
              }}
            >
              <img 
                src={notif.avatar} 
                alt="avatar" 
                className="w-10 h-10 rounded-full" 
                onError={(e) => {
                  e.target.src = 'https://i.pravatar.cc/100?img=1';
                }}
              />
              <div className="flex-1 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-xs font-medium">
                    Cotisation
                  </span>
                  <span className="text-blue-600 text-xs">{notif.date}</span>
                </div>
                <p className="mt-1 text-gray-700">
                  <strong>{notif.user}</strong> {notif.isStatusChange ? notif.message : notif.message}
                </p>
              </div>
              {!notif.is_read && (
                <div className="mt-1">
                  <span className="block w-2 h-2 bg-blue-600 rounded-full"></span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div
          onClick={handleMarkAllAsRead}
          className="px-4 py-2 text-sm text-blue-600 hover:underline cursor-pointer"
        >
          Tout marquer comme lu
        </div>
      )}
      {/* Modale de détail cotisation */}
      {showDetailModal && selectedCotisation && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={() => {
                setShowDetailModal(false);
                setSelectedCotisation(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              title="Fermer"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <DetailCotisation cotisation={selectedCotisation} />
          </div>
        </div>
      )}
    </div>
  );
}