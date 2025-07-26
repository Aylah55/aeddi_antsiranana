import React from 'react';
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import { DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserTable = ({ 
  users = [], 
  loading = false, 
  error = null, 
  onView, 
  onEdit, 
  onDelete, 
  onCotisations,
  isAdmin = false,
  getPhotoUrl = () => {},
  getInitials = () => {},
  roleColors = {},
  className = ""
}) => {
  const getInitialsDefault = (nom, prenom) => {
    return ((nom?.[0] || '') + (prenom?.[0] || '')).toUpperCase();
  };

  const getInitialsFn = getInitials || getInitialsDefault;

  return (
    <div className={`overflow-x-auto rounded-lg shadow-inner bg-gradient-to-r from-blue-50 to-white relative hidden md:block ${className}`} style={{ maxHeight: '600px', overflowY: 'auto' }}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
            <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
            <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <AnimatePresence initial={false}>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 className="font-semibold">Erreur</h3>
                  </div>
                  <p className="mt-2">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Réessayer
                  </button>
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                  className={`group hover:bg-blue-50 transition-colors duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'}`}
                >
                  <td className="px-2 md:px-6 py-4 whitespace-nowrap">
                    <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg border-4 border-white group-hover:scale-105 transition-transform duration-200 bg-gray-100 flex items-center justify-center">
                      {(user.photo_url || user.photo) ? (
                        <img
                          src={user.photo_url || getPhotoUrl(user.photo)}
                          alt={`${user.nom} ${user.prenom}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)', color: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getInitialsFn(user.nom, user.prenom)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 md:px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900 flex items-center gap-2">
                    {user.nom}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold shadow ${roleColors[user.role] || 'bg-gray-300 text-gray-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-2 md:px-6 py-4 whitespace-nowrap text-base text-gray-500">{user.prenom}</td>
                  <td className="px-2 md:px-6 py-4 whitespace-nowrap text-base text-gray-500">{user.email}</td>
                  <td className="px-2 md:px-6 py-4 whitespace-nowrap text-base font-medium relative">
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => onView(user)}
                        className="p-2 rounded-full hover:bg-blue-100 transition-colors"
                        title="Voir"
                      >
                        <FiEye className="h-5 w-5 text-indigo-600" />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onEdit(user)}
                            className="p-2 rounded-full hover:bg-yellow-100 transition-colors"
                            title="Modifier"
                          >
                            <FiEdit className="h-5 w-5 text-yellow-600" />
                          </button>
                          <button
                            onClick={() => onCotisations(user)}
                            className="p-2 rounded-full hover:bg-green-100 transition-colors"
                            title="Cotisations"
                          >
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </button>
                          <button
                            onClick={() => onDelete(user)}
                            className="p-2 rounded-full hover:bg-red-100 transition-colors"
                            title="Supprimer"
                          >
                            <FiTrash2 className="h-5 w-5 text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default UserTable; 