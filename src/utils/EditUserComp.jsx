import React from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiBookOpen, FiBriefcase, FiEdit2, FiCamera } from 'react-icons/fi';

const EditUserComp = ({ formData, onChange, onSubmit, onClose, isLoading, previewImage, editingUser, readOnly = false }) => {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10 animate-fade-in flex flex-col items-center relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors" title="Fermer">
        <FiX className="h-6 w-6" />
      </button>
      {/* Avatar et en-tête */}
      <div className="flex flex-col items-center mb-6 w-full">
        <div className="relative w-28 h-28 mb-2">
          <div className="rounded-full shadow-lg overflow-hidden w-28 h-28 bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center">
            {previewImage ? (
              <img src={previewImage} alt="Prévisualisation" className="w-full h-full object-cover" />
            ) : (editingUser?.photo_url || editingUser?.photo) ? (
              <img src={editingUser.photo_url || editingUser.photo} alt="Photo de profil" className="w-full h-full object-cover" />
            ) : (
              <FiUser className="h-16 w-16 text-blue-300" />
            )}
            {!readOnly && (
              <label className="absolute inset-0 flex items-end justify-center bg-black bg-opacity-0 hover:bg-opacity-30 cursor-pointer transition-all rounded-full">
                <input type="file" name="photo" onChange={onChange} accept="image/*" className="hidden" />
                <span className="mb-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg"><FiCamera /> Changer</span>
              </label>
            )}
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center justify-center gap-2">
            <FiUser className="inline-block text-blue-400" /> {formData.nom} {formData.prenom}
          </h2>
          <div className="text-blue-600 font-semibold mb-1">{formData.role}</div>
          <div className="flex flex-col md:flex-row md:gap-4 items-center justify-center text-gray-500 text-sm">
            <span className="flex items-center gap-1"><FiMail /> {formData.email}</span>
            <span className="flex items-center gap-1"><FiPhone /> {formData.telephone || 'Non renseigné'}</span>
          </div>
        </div>
      </div>
      {/* Formulaire */}
      <form className="w-full space-y-8 mt-2">
        {/* Infos personnelles */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><FiUser /> Informations personnelles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
              <input type="text" name="nom" value={formData.nom} onChange={onChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800" disabled={readOnly} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Prénom</label>
              <input type="text" name="prenom" value={formData.prenom} onChange={onChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800" disabled={readOnly} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={onChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800" disabled={readOnly} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone</label>
              <input type="tel" name="telephone" value={formData.telephone} onChange={onChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800" disabled={readOnly} />
            </div>
          </div>
        </div>
        {/* Infos académiques */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><FiBookOpen /> Informations académiques</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Établissement</label>
              <select name="etablissement" value={formData.etablissement} onChange={onChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800" disabled={readOnly}>
                <option value="">Sélectionner...</option>
                <option value="ESP">ESP</option>
                <option value="DEGSP">DEGSP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Parcours</label>
              <select name="parcours" value={formData.parcours} onChange={onChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800" disabled={readOnly}>
                <option value="">Sélectionner...</option>
                <option value="EP">EP</option>
                <option value="EII">EII</option>
                <option value="EG">EG</option>
                <option value="GESTION">GESTION</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Niveau</label>
              <select name="niveau" value={formData.niveau} onChange={onChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800" disabled={readOnly}>
                <option value="">Sélectionner...</option>
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="M1">M1</option>
                <option value="M2">M2</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Promotion</label>
              <select name="promotion" value={formData.promotion} onChange={onChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800" disabled={readOnly}>
                <option value="">Sélectionner...</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Rôle</label>
              <select name="role" value={formData.role} onChange={onChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800" disabled={readOnly}>
                <option value="">Sélectionner...</option>
                <option value="President">Président</option>
                <option value="Membre de bureau">Membre de bureau</option>
                <option value="Membre">Membre</option>
              </select>
            </div>
            {formData.role === 'Membre de bureau' && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Fonction</label>
                <select name="sous_role" value={formData.sous_role} onChange={onChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 text-gray-800" disabled={readOnly}>
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
        {/* Actions */}
        {!readOnly && (
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium shadow-sm">Annuler</button>
            <button type="button" onClick={onSubmit} disabled={isLoading} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold flex items-center gap-2 shadow-md hover:bg-blue-700 transition-colors disabled:opacity-60">
              <FiEdit2 /> {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default EditUserComp;
