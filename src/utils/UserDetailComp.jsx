import React from 'react';
import { FiX, FiUser, FiMail, FiPhone } from 'react-icons/fi';

const UserDetailComp = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Détails de l'utilisateur</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FiX className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-col items-center mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center mb-2">
          {user.photo_url || user.photo ? (
            <img src={user.photo_url || user.photo} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            <FiUser className="h-12 w-12 text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-bold text-gray-800">{user.nom} {user.prenom}</h3>
        <span className="text-blue-600 mb-1">{user.role}</span>
        {user.sous_role && <span className="text-sm text-gray-600">{user.sous_role}</span>}
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center text-gray-700">
          <FiMail className="mr-2" /> {user.email || '—'}
        </div>
        <div className="flex items-center text-gray-700">
          <FiPhone className="mr-2" /> {user.telephone || 'Non renseigné'}
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-semibold mr-2">Établissement :</span> {user.etablissement || 'Non renseigné'}
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-semibold mr-2">Parcours :</span> {user.parcours || 'Non renseigné'}
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-semibold mr-2">Niveau :</span> {user.niveau || 'Non renseigné'}
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-semibold mr-2">Promotion :</span> {user.promotion || 'Non renseigné'}
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Fermer</button>
      </div>
    </div>
  );
};

export default UserDetailComp;
