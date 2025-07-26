import React, { useEffect, useState, useRef } from 'react';
import { Mail } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { fetchMessages, sendMessage } from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';
dayjs.extend(relativeTime);
dayjs.locale('fr');

const PAGE_SIZE = 20;
const Message = ({ open, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose && onClose();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  // Chargement initial et au changement d'ouverture
  useEffect(() => {
    if (open) {
      setLoading(true);
      setPage(1);
      fetchMessages(1, PAGE_SIZE)
        .then(res => {
          setMessages(res.data.reverse());
          setHasMore(res.data.length === PAGE_SIZE);
          // Calculer le nombre de messages non lus
          const lastSeenId = Number(localStorage.getItem('message_last_seen')) || 0;
          const unread = res.data.filter(m => m.id > lastSeenId).length;
          setUnreadCount(unread);
        })
        .catch(() => setMessages([]))
        .finally(() => setLoading(false));
    }
  }, [open]);

  // Scroll infini : charger plus au scroll haut
  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMore && !loadingMore) {
      setLoadingMore(true);
      fetchMessages(page + 1, PAGE_SIZE)
        .then(res => {
          if (res.data.length > 0) {
            setMessages(prev => [...res.data.reverse(), ...prev]);
            setPage(prev => prev + 1);
            setHasMore(res.data.length === PAGE_SIZE);
          } else {
            setHasMore(false);
          }
        })
        .finally(() => setLoadingMore(false));
    }
  };

  // Badge: recalculer à chaque réception de messages
  useEffect(() => {
    if (!open && messages.length > 0) {
      const lastSeenId = Number(localStorage.getItem('message_last_seen')) || 0;
      const unread = messages.filter(m => m.id > lastSeenId).length;
      setUnreadCount(unread);
    }
  }, [messages, open]);

  // Scroll auto
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Focus auto sur input
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Overlay sombre sur mobile uniquement */}
      <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-40" onClick={onClose} />
      <div
        className="fixed z-50 top-16 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl border animate-fade-in-up md:top-16 md:right-4 md:left-auto md:transform-none md:w-80 md:max-w-none"
        style={{ maxHeight: '80vh' }}
        ref={containerRef}
      >
        {/* Bouton de fermeture (mobile) */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 z-10 md:hidden"
          aria-label="Fermer"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        {/* Onglet (optionnel) */}
        <div className="flex justify-between px-4 py-2 text-sm font-medium border-b">
          <span className="text-blue-600 border-b-2 border-blue-600 pb-1 cursor-pointer">
            Tous
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
        {/* Liste avec scroll */}
        <div className="max-h-[60vh] overflow-y-auto px-2 py-2 flex flex-col gap-2" onScroll={handleScroll}>
          {loadingMore && (
            <div className="text-center text-gray-400 py-2">Chargement...</div>
          )}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              <span className="text-blue-500 text-sm">Chargement des messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-center font-medium mb-2">Aucun message</p>
              <p className="text-gray-400 text-sm text-center">Vous n'avez pas encore de messages</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div key={msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}> 
                  <div className={`flex items-end gap-2 max-w-[80%] ${isMine ? 'flex-row-reverse' : ''}`}>
                    {!isMine && (
                      <img src={msg.avatar || 'https://i.pravatar.cc/100?img=1'} className="w-8 h-8 rounded-full border" alt="avatar" />
                    )}
                    <div className={`rounded-xl px-4 py-2 ${isMine ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'} shadow-sm`}>
                      <div className="text-sm break-words whitespace-pre-line">{msg.content}</div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                        <span>{msg.sender || (isMine ? 'Moi' : 'Admin')}</span>
                        <span>·</span>
                        <span>{dayjs().diff(dayjs(msg.sent_at), 'day') > 7 ? dayjs(msg.sent_at).format('DD/MM/YYYY') : dayjs(msg.sent_at).fromNow()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Marquer tout comme lu (optionnel) */}
        {messages.length > 0 && unreadCount > 0 && (
          <div className="text-center py-2 text-sm border-t">
            <button
              onClick={() => {
                // Marquer tous les messages comme lus
                if (messages.length > 0) {
                  const lastId = messages[messages.length - 1].id;
                  localStorage.setItem('message_last_seen', lastId);
                  setUnreadCount(0);
                }
                onClose && onClose();
              }}
              className="text-blue-600 hover:underline"
            >
              Tout marquer comme lu
            </button>
          </div>
        )}
        {/* Formulaire d'envoi pour admin */}
        {isAdmin && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!newMessage.trim()) return;
            setSending(true);
            try {
              await sendMessage(newMessage);
              setNewMessage("");
              toast.success('Message envoyé !');
              fetchMessages().then(res => setMessages(res.data.reverse()));
            } catch (err) {
              toast.error("Erreur lors de l'envoi du message");
            } finally {
              setSending(false);
            }
          }} className="p-3 border-t flex gap-2 bg-gray-50 sticky bottom-0">
            <input
              type="text"
              className="flex-1 border rounded px-2 py-1 text-sm"
              placeholder="Écrire un message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              disabled={sending}
              ref={inputRef}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (newMessage.trim() && !sending) {
                    e.target.form.requestSubmit();
                  }
                }
              }}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              disabled={sending || !newMessage.trim()}
            >
              {sending ? '...' : 'Envoyer'}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default Message;
