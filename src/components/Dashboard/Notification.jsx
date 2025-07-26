import React, { useEffect, useState, useRef } from 'react';
import { Trash2, Info, CheckCircle, XCircle, AlertTriangle, Eye, Check, Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  notificationService
} from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';

dayjs.extend(relativeTime);
dayjs.locale('fr');

const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export default function Notification({ notifications = [], loading = false, onCotisationView, onActiviteView }) {
  const [user, setUser] = useState(getUserFromStorage());
  const isAdmin = user && user.role === 'admin';
  
  // Ajout d'un état local pour gérer l'affichage optimiste
  const [localNotifications, setLocalNotifications] = useState(notifications);
  useEffect(() => { 
    setLocalNotifications(notifications); 
    // Ajout du log pour debug
    console.log('Notifications reçues par le composant:', notifications);
  }, [notifications]);
  
  const [filter, setFilter] = useState('all');
  const modalRef = useRef(null);
  const containerRef = useRef(null);

  // Nouveaux états de chargement
  const [loadingMarkAsReadId, setLoadingMarkAsReadId] = useState(null);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [loadingAllRead, setLoadingAllRead] = useState(false);
  const [loadingDeleteAll, setLoadingDeleteAll] = useState(false);

  // Focus auto et fermeture Échap
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (typeof onCotisationView === 'function') {
          onCotisationView(null);
        }
        window.dispatchEvent(new CustomEvent('closeNotification'));
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCotisationView]);

  // Action : marquer comme lu
  const handleMarkAsRead = async (notifId) => {
    setLoadingMarkAsReadId(notifId);
    // Mise à jour optimiste
    setLocalNotifications(prev => 
      prev.map(n => 
        n.id === notifId 
          ? { ...n, is_read: true }
          : n
      )
    );
    
    try {
      await notificationService.markAsRead(notifId);
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
      // Restaurer l'état en cas d'erreur
      setLocalNotifications(notifications);
    } finally {
      setLoadingMarkAsReadId(null);
    }
  };

  // Action : supprimer
  const handleDelete = async (notifId) => {
    setLoadingDeleteId(notifId);
    // Mise à jour optimiste
    setLocalNotifications(prev => prev.filter(n => n.id !== notifId));
    
    try {
      await notificationService.deleteById(notifId);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      // Restaurer l'état en cas d'erreur
      setLocalNotifications(notifications);
    } finally {
      setLoadingDeleteId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoadingAllRead(true);
    try {
      await notificationService.markAllAsRead();
      // Mise à jour optimiste
      setLocalNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    } finally {
      setLoadingAllRead(false);
    }
  };

  const handleDeleteAll = async () => {
    setLoadingDeleteAll(true);
    try {
      await notificationService.deleteAll();
      // Mise à jour optimiste
      setLocalNotifications([]);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    } finally {
      setLoadingDeleteAll(false);
    }
  };

  // Gestion du clic sur une notification
  const handleNotifClick = (notif) => {
    // Si c'est une suppression, ne rien faire
    if (notif.type === 'delete' || notif.message?.toLowerCase().includes('supprim')) return;
    // Si c'est une cotisation
    if (notif.type === 'cotisation' && notif.cotisation_id && typeof onCotisationView === 'function') {
      onCotisationView(notif.cotisation_id);
      window.dispatchEvent(new CustomEvent('closeNotification'));
      return;
    }
    // Si c'est une activité
    if (notif.type === 'activite' && notif.activite_id && typeof onActiviteView === 'function') {
      onActiviteView(notif.activite_id);
      window.dispatchEvent(new CustomEvent('closeNotification'));
      return;
    }
    // Sinon, rien
  };

  const unreadCount = localNotifications.filter(n => !n.is_read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        window.dispatchEvent(new CustomEvent('closeNotification'));
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Overlay sombre sur mobile uniquement */}
      <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-40" onClick={() => { if (typeof onCotisationView === 'function') onCotisationView(null); window.dispatchEvent(new CustomEvent('closeNotification')); }} />
      <div
        className="fixed z-50 top-16 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl border animate-fade-in-up md:top-16 md:right-4 md:left-auto md:transform-none md:w-80 md:max-w-none"
        style={{ maxHeight: '80vh' }}
        ref={containerRef}
      >
        {/* Bouton de fermeture (mobile) */}
        <button
          onClick={() => { if (typeof onCotisationView === 'function') onCotisationView(null); window.dispatchEvent(new CustomEvent('closeNotification')); }}
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
            className="text-yellow-600 text-sm flex items-center relative disabled:opacity-60"
            disabled={loadingDeleteAll}
          >
            {loadingDeleteAll ? (
              <svg className="animate-spin h-4 w-4 mr-2 text-yellow-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            ) : <Trash2 size={16} className="mr-1" />}
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
              {tab.key === 'unread' && unreadCount > 0 && (
                <span className="ml-1 text-white text-xs bg-gray-500 rounded-full px-2">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Liste avec scroll */}
        <div className="max-h-[60vh] overflow-y-auto px-2 py-2 flex flex-col gap-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              <span className="text-blue-500 text-sm">Chargement des notifications...</span>
            </div>
          ) : localNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-center font-medium mb-2">Aucune notification</p>
              <p className="text-gray-400 text-sm text-center">Vous serez notifié ici des nouvelles activités et messages</p>
            </div>
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
                    onClick={() => handleNotifClick(notif)}
                  >
                    <div className="mr-3 flex-shrink-0 flex items-center justify-center">{icon}</div>
                    <div className="flex-1 text-sm">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${iconColor} bg-white bg-opacity-80 border`}>
                          {notifType.charAt(0).toUpperCase() + notifType.slice(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {dayjs(notif.created_at).fromNow()}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">
                        <strong>{notif.admin_name || 'Administrateur'}</strong> {notif.message}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <span className="mt-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                    <div className="flex items-center gap-2 ml-2">
                      {!notif.is_read && (
                        <button 
                          title="Marquer comme lu" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif.id);
                          }} 
                          className="p-1 rounded hover:bg-blue-100 transition-colors relative"
                          disabled={loadingMarkAsReadId === notif.id}
                        >
                          {loadingMarkAsReadId === notif.id ? (
                            <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                          ) : <Check className="w-4 h-4 text-blue-500" />}
                        </button>
                      )}
                      <button 
                        title="Supprimer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notif.id);
                        }} 
                        className="p-1 rounded hover:bg-red-100 transition-colors relative"
                        disabled={loadingDeleteId === notif.id}
                      >
                        {loadingDeleteId === notif.id ? (
                          <svg className="animate-spin h-4 w-4 text-red-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                        ) : <Trash2 className="w-4 h-4 text-red-500" />}
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
          <button onClick={handleMarkAllAsRead} className="text-blue-600 hover:underline relative" disabled={loadingAllRead}>
            {loadingAllRead && (
              <svg className="animate-spin h-4 w-4 inline-block mr-1 text-blue-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            )}
            Tout marquer comme lu
          </button>
        </div>
      </div>
    </>
  );
}