import React, { useEffect, useState, useRef } from 'react';
import { Mail } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { fetchMessages, sendMessage } from '../../services/api';

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(() => Number(localStorage.getItem('message_last_seen')) || 0);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
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
  }, [open]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchMessages()
        .then(res => {
          setMessages(res.data.reverse());
          // Calculer le nombre de messages non lus
          const lastSeenId = Number(localStorage.getItem('message_last_seen')) || 0;
          const unread = res.data.filter(m => m.id > lastSeenId).length;
          setUnreadCount(unread);
        })
        .catch(() => setMessages([]))
        .finally(() => setLoading(false));
      // Marquer tous les messages comme lus à l'ouverture
      setTimeout(() => {
        if (messages.length > 0) {
          const lastId = messages[messages.length - 1].id;
          localStorage.setItem('message_last_seen', lastId);
          setLastSeen(lastId);
          setUnreadCount(0);
        }
      }, 500);
    }
  }, [open]);

  // Badge: recalculer à chaque réception de messages
  useEffect(() => {
    if (!open && messages.length > 0) {
      const lastSeenId = Number(localStorage.getItem('message_last_seen')) || 0;
      const unread = messages.filter(m => m.id > lastSeenId).length;
      setUnreadCount(unread);
    }
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await sendMessage(newMessage);
      setNewMessage("");
      toast.success('Message envoyé !');
      // Recharger l'historique après envoi
      fetchMessages().then(res => setMessages(res.data.reverse()));
    } catch (err) {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="relative focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        title="Messages"
      >
        <Mail className="w-7 h-7 text-blue-600" />
        {unreadCount > 0 && !open && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
          {/* Formulaire d'envoi pour admin */}
          {isAdmin && (
            <form onSubmit={handleSend} className="p-3 border-b flex gap-2 bg-gray-50">
              <input
                type="text"
                className="flex-1 border rounded px-2 py-1 text-sm"
                placeholder="Écrire un message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                disabled={sending || !newMessage.trim()}
              >
                Envoyer
              </button>
            </form>
          )}
          <div className="p-2">
            {loading ? (
              <div className="text-center text-gray-400 py-4">Chargement...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400 py-4">Aucun message</div>
            ) : (
              messages.map((msg, idx) => (
                <div key={msg.id || idx} className="mb-3 p-2 rounded bg-blue-50">
                  <div className="text-xs text-gray-500 mb-1">{msg.sender || 'Admin'} - {msg.sent_at ? new Date(msg.sent_at).toLocaleString() : ''}</div>
                  <div className="text-gray-800">{msg.content}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
