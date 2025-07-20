import React, { useEffect, useState, useRef } from 'react';
import { Trash2, Info, CheckCircle, XCircle, AlertTriangle, Eye, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  markNotificationsAsRead,
  deleteAllNotifications,
  apiGet
} from '../../services/api';
import axios from 'axios';
import ListeCotisation from './ListeCotisation';
import DetailCotisation from './DetailCotisation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';
dayjs.extend(relativeTime);
dayjs.locale('fr');

// Détecter le rôle de l'utilisateur connecté
const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export default function Notification({ notifications = [], loading = false, onCotisationView }) {
  const [cotisations, setCotisations] = useState([]);
  const [selectedCotisation, setSelectedCotisation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [user, setUser] = useState(getUserFromStorage());
  const isAdmin = user && user.role === 'admin';
  // Ajout d'un état local pour gérer l'affichage optimiste
  const [localNotifications, setLocalNotifications] = useState(notifications);
  useEffect(() => { setLocalNotifications(notifications); }, [notifications]);
  const [filter, setFilter] = useState('all');
  const modalRef = useRef(null);

  // Focus auto et fermeture Échap
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (typeof onCotisationView === 'function') {
          onCotisationView(null); // ou onClose si fourni
        }
        window.dispatchEvent(new CustomEvent('closeNotification'));
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCotisationView]);

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

  // Arrêter le chargement dès que notifications change
  useEffect(() => {
    // setLoading(false); // This line is removed
  }, [notifications]);

  // Log à chaque changement de cotisations ou notifications
  useEffect(() => {
    console.log('Cotisations disponibles:', cotisations);
  }, [cotisations]);

  useEffect(() => {
    console.log('Notifications chargées:', notifications);
  }, [notifications]);

  // Action : marquer comme lu
  const handleMarkAsRead = async (notifId) => {
    setLocalNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
    try {
      await markNotificationsAsRead(); // À adapter si API individuelle
    } catch (err) {
      // rollback si erreur
      setLocalNotifications(notifications);
    }
  };
  // Action : supprimer
  const handleDelete = async (notifId) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== notifId));
    try {
      await deleteAllNotifications(); // À adapter si API individuelle
    } catch (err) {
      setLocalNotifications(notifications);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markNotificationsAsRead();
      // setNotifications(prev => prev.map(n => ({ ...n, is_read: true }))); // This line is removed
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      // setNotifications([]); // This line is removed
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      {/* Overlay sombre sur mobile uniquement */}
      <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-40" />
      <div
        ref={modalRef}
        tabIndex={-1}
        className="fixed z-50 top-16 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl border animate-fade-in-up md:top-16 md:right-4 md:left-auto md:transform-none md:w-80 md:max-w-none"
        style={{ maxHeight: '80vh' }}
      >
        {/* Bouton de fermeture (mobile) */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('closeNotification'))}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 z-10 md:hidden"
          aria-label="Fermer"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <button 
            onClick={handleDeleteAll}
            className="text-yellow-600 text-sm flex items-center"
          >
            <Trash2 size={16} className="mr-1" />
            Tout retirer
          </button>
        </div>
        {/* Onglets */}
        <div className="flex justify-between px-4 py-2 text-sm font-medium border-b gap-2">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'unread', label: 'Non lus' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-2 py-1 rounded transition-colors ${filter === tab.key ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {tab.label}
              {tab.key === 'unread' && localNotifications.filter(n => !n.is_read).length > 0 && (
                <span className="ml-1 text-white text-xs bg-gray-500 rounded-full px-2">
                  {localNotifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Liste avec scroll */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              <span className="text-blue-500 text-sm">Chargement des notifications...</span>
            </div>
          ) : localNotifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Aucune notification</div>
          ) : (
            <AnimatePresence initial={false}>
              {localNotifications
                .filter(n => {
                  if (filter === 'all') return true;
                  if (filter === 'unread') return !n.is_read;
                  return n.type === filter;
                })
                .map((notif) => {
                // Mapping type -> icône et couleur
                let icon, iconColor, bgColor;
                const notifType = notif.type || 'info';
                switch (notifType) {
                  case 'success':
                    icon = <CheckCircle className="w-6 h-6 animate-bounce text-green-500" />;
                    iconColor = 'text-green-500';
                    bgColor = 'bg-green-50';
                    break;
                  case 'error':
                    icon = <XCircle className="w-6 h-6 animate-bounce text-red-500" />;
                    iconColor = 'text-red-500';
                    bgColor = 'bg-red-50';
                    break;
                  case 'warning':
                    icon = <AlertTriangle className="w-6 h-6 animate-bounce text-yellow-500" />;
                    iconColor = 'text-yellow-500';
                    bgColor = 'bg-yellow-50';
                    break;
                  default:
                    icon = <Info className="w-6 h-6 animate-bounce text-blue-500" />;
                    iconColor = 'text-blue-500';
                    bgColor = 'bg-blue-50';
                }
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.25 }}
                    className={`px-4 py-3 flex items-start border-b hover:bg-gray-50 cursor-pointer transition-all duration-300 ${bgColor} animate-fade-in-up`}
                  >
                    <div className="mr-3 flex-shrink-0 flex items-center justify-center">{icon}</div>
                    <div className="flex-1 text-sm">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${iconColor} bg-white bg-opacity-80 border`}>{notifType.charAt(0).toUpperCase() + notifType.slice(1)}</span>
                        <span className="text-xs text-gray-400">{
                          dayjs().diff(dayjs(notif.date), 'day') > 7
                            ? dayjs(notif.date).format('DD/MM/YYYY')
                            : dayjs(notif.date).fromNow()
                        }</span>
                      </div>
                      <p className="text-gray-700 mt-1">
                        <strong>{notif.user}</strong> {notif.message}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <span className="mt-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                    <div className="flex items-center gap-2 ml-2">
                      {!notif.is_read && (
                        <button title="Marquer comme lu" onClick={() => handleMarkAsRead(notif.id)} className="p-1 rounded hover:bg-blue-100 transition-colors">
                          <Check className="w-4 h-4 text-blue-500" />
                        </button>
                      )}
                      <button title="Supprimer" onClick={() => handleDelete(notif.id)} className="p-1 rounded hover:bg-red-100 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
        {/* Marquer tout comme lu */}
        <div className="text-center py-2 text-sm border-t">
          <button onClick={handleMarkAllAsRead} className="text-blue-600 hover:underline">
            Tout marquer comme lu
          </button>
        </div>
      </div>
    </>
  );
}