import React, { useState } from 'react';
import { FiUser, FiArrowLeft } from 'react-icons/fi';

const initialForm = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  etablissement: '',
  parcours: '',
  niveau: '',
  promotion: '',
  role: 'Membre',
  sous_role: '',
  photo: null,
  password: '',
  password_confirmation: '',
};

const DevenirMembre = ({ onBack, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState(initialForm);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files && files[0]) {
      setFormData({ ...formData, photo: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    if (onSubmit) onSubmit(formData);
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-3xl shadow-xl w-full mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-blue-600 hover:bg-blue-50 rounded-full p-2 mr-2" title="Retour">
          <FiArrowLeft size={22} />
        </button>
        <h2 className="text-lg sm:text-2xl font-bold text-blue-700 text-center flex-1">Devenir membre AEDDI</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo de profil */}
        <div className="col-span-1 md:col-span-2 flex justify-center">
          <div className="relative w-24 h-24 mb-3">
            {previewImage ? (
              <img src={previewImage} alt="Prévisualisation" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                <FiUser className="h-10 w-10 text-gray-400" />
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg cursor-pointer transition-all hover:bg-opacity-40">
              <input type="file" name="photo" onChange={handleChange} accept="image/*" className="hidden" />
              <span className="text-white text-xs bg-blue-500 px-2 py-1 rounded-full">Photo</span>
            </label>
          </div>
        </div>
        {/* Infos personnelles */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-700 mb-2">Informations personnelles</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        {/* Infos académiques */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-700 mb-2">Informations académiques</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Établissement</label>
              <select name="etablissement" value={formData.etablissement} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" required>
                <option value="">Sélectionner...</option>
                <option value="ESP">ESP</option>
                <option value="DEGSP">DEGSP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parcours</label>
              <select name="parcours" value={formData.parcours} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" required>
                <option value="">Sélectionner...</option>
                <option value="EP">EP</option>
                <option value="EII">EII</option>
                <option value="EG">EG</option>
                <option value="GESTION">GESTION</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
              <select name="niveau" value={formData.niveau} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" required>
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
              <select name="promotion" value={formData.promotion} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" required>
                <option value="">Sélectionner...</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>
        </div>
        {/* Mot de passe */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" required />
          </div>
        </div>
        {/* Erreur */}
        {error && <div className="col-span-1 md:col-span-2 text-red-600 text-center font-semibold animate-pulse">{error}</div>}
        {/* Bouton */}
        <div className="col-span-1 md:col-span-2 flex justify-center md:justify-end mt-4">
          <button type="submit" disabled={isLoading} className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? 'Inscription...' : 'Devenir membre'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DevenirMembre;
