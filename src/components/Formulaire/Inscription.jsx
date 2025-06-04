import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

function Inscription({ onSwitch }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    etablissement: '',
    parcours: '',
    niveau: '',
    role: '',
    sous_role: '',
    promotion: '',
    telephone: '',
    email: '',
    password: '',
    confirmPassword: '',
    photo: null,
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formPart, setFormPart] = useState(1);
  const navigate = useNavigate();

  const etablissements = ['ESP', 'DEGSP'];
  const parcoursParEtablissement = {
    ESP: ['EP', 'EII'],
    DEGSP: ['EG', 'GESTION']
  };
  const niveaux = ['L1', 'L2', 'L3', 'M1', 'M2'];
  const roles = ['President', 'Membre de bureau', 'Membre'];
  const promotions = Array.from({length: 6}, (_, i) => (2020 + i).toString());
  const sousRolesBureau = [
    'Tresoriere',
    'Vice_president',
    'Commissaire au compte',
    'Commission logement',
    'Commission sport',
    'Conseiller'
  ];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData(prev => {
        const newData = { ...prev, [name]: value };

        if (name === 'etablissement') {
          newData.parcours = '';
        }

        if (name === 'role' && value !== 'Membre de bureau') {
          newData.sous_role = '';
        }

        return newData;
      });
    }
  };

  const handleNext = () => {
    setFormPart(2);
  };

  const handlePrevious = () => {
    setFormPart(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'confirmPassword' && formData[key] !== null && formData[key] !== '') {
        data.append(key, formData[key]);
        console.log(`Sending ${key}:`, formData[key]);
      }
    });

    if (formData.role !== 'Membre de bureau') {
      data.delete('sous_role');
    }

    try {
      console.log('Données envoyées:', Object.fromEntries(data.entries()));
      const response = await axios({
        method: 'post',
        url: `${API_URL}/inscription`,
        data: data,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.status === 'success') {
        navigate('/dashbord');
      } else {
        setError('Une erreur est survenue lors de l\'inscription');
      }
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        let errorMessages = [];
        for (const key in errors) {
          errorMessages.push(...errors[key]);
        }
        setError(errorMessages.join('\n'));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(`Erreur: ${err.message}`);
      } else {
        setError('Une erreur inattendue est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 border-2 border-transparent hover:border-blue-200 transition-all duration-300">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Inscription</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-500 text-sm rounded-md text-center whitespace-pre-line">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {formPart === 1 && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Établissement</label>
                  <select
                    name="etablissement"
                    value={formData.etablissement}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionner</option>
                    {etablissements.map(etab => (
                      <option key={etab} value={etab}>{etab}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parcours</label>
                  <select
                    name="parcours"
                    value={formData.parcours}
                    onChange={handleChange}
                    required
                    disabled={!formData.etablissement || isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionner</option>
                    {formData.etablissement && parcoursParEtablissement[formData.etablissement].map(parc => (
                      <option key={parc} value={parc}>{parc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'étude</label>
                  <select
                    name="niveau"
                    value={formData.niveau}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionner</option>
                    {niveaux.map(niveau => (
                      <option key={niveau} value={niveau}>{niveau}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
                  <select
                    name="promotion"
                    value={formData.promotion}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionner</option>
                    {promotions.map(promo => (
                      <option key={promo} value={promo}>{promo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className={`px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  Suivant
                </button>
              </div>
            </>
          )}

          {formPart === 2 && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionner</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {formData.role === 'Membre de bureau' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sous-rôle</label>
                    <select
                      name="sous_role"
                      value={formData.sous_role}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionner</option>
                      {sousRolesBureau.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo de profil</label>
                  <input
                    type="file"
                    name="photo"
                    onChange={handleChange}
                    accept="image/*"
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={isLoading}
                  className={`px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 flex items-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Inscription en cours...
                    </>
                  ) : (
                    "S'inscrire"
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Vous avez déjà un compte ?{' '}
          <span
            onClick={onSwitch}
            className="text-blue-600 font-medium hover:text-blue-800 cursor-pointer underline transition-colors"
          >
            Connectez-vous ici
          </span>
        </p>
      </div>
    </div>
  );
}

export default Inscription;
