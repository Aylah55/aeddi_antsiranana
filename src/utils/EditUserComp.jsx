import React from 'react';
import { FiX, FiUser } from 'react-icons/fi';

const EditUserComp = ({ formData, onChange, onSubmit, onClose, isLoading, previewImage, editingUser }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Modifier l'utilisateur</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FiX className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Photo de profil */}
        <div className="col-span-1 md:col-span-2 flex justify-center">
          <div className="relative w-24 h-24 mb-3">
            {previewImage ? (
              <img src={previewImage} alt="Prévisualisation" className="w-full h-full object-cover rounded-lg" />
            ) : (editingUser?.photo_url || editingUser?.photo) ? (
              <img src={editingUser.photo_url || editingUser.photo} alt="Photo de profil" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                <FiUser className="h-10 w-10 text-gray-400" />
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg cursor-pointer transition-all hover:bg-opacity-40">
              <input type="file" name="photo" onChange={onChange} accept="image/*" className="hidden" />
              <span className="text-white text-xs bg-blue-500 px-2 py-1 rounded-full">Changer</span>
            </label>
          </div>
        </div>
        {/* Informations personnelles */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-700 mb-2">Informations personnelles</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" name="nom" value={formData.nom} onChange={onChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input type="text" name="prenom" value={formData.prenom} onChange={onChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={onChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input type="tel" name="telephone" value={formData.telephone} onChange={onChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        {/* Informations académiques */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-700 mb-2">Informations académiques</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Établissement</label>
              <select name="etablissement" value={formData.etablissement} onChange={onChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                <option value="">Sélectionner...</option>
                <option value="ESP">ESP</option>
                <option value="DEGSP">DEGSP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parcours</label>
              <select name="parcours" value={formData.parcours} onChange={onChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                <option value="">Sélectionner...</option>
                <option value="EP">EP</option>
                <option value="EII">EII</option>
                <option value="EG">EG</option>
                <option value="GESTION">GESTION</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
              <select name="niveau" value={formData.niveau} onChange={onChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                <option value="">Sélectionner...</option>
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="M1">M1</option>
                <option value="M2">M2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
              <select name="promotion" value={formData.promotion} onChange={onChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                <option value="">Sélectionner...</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select name="role" value={formData.role} onChange={onChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                <option value="">Sélectionner...</option>
                <option value="President">Président</option>
                <option value="Membre de bureau">Membre de bureau</option>
                <option value="Membre">Membre</option>
              </select>
            </div>
            {formData.role === 'Membre de bureau' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fonction</label>
                <select name="sous_role" value={formData.sous_role} onChange={onChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                  <option value="">Sélectionner...</option>
                  <option value="Tresoriere">Trésorière</option>
                  <option value="Vice_president">Vice-président</option>
                  <option value="Commissaire au compte">Commissaire au compte</option>
                  <option value="Commission logement">Commission logement</option>
                  <option value="Commission sport">Commission sport</option>
                  <option value="Conseiller">Conseiller</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <button onClick={onClose} className="px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Annuler</button>
        <button onClick={onSubmit} disabled={isLoading} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
};

export default EditUserComp;
