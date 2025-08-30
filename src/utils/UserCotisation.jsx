import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiCheckCircle, FiRefreshCw, FiDollarSign, FiCalendar, FiClock } from 'react-icons/fi';

const UserCotisation = ({ user, cotisations, onClose, loading, onUpdatePaiement }) => {
  const [localStatuts, setLocalStatuts] = useState({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    // Réinitialiser les statuts locaux si l'utilisateur ou les cotisations changent
    const initial = {};
    cotisations?.forEach(c => {
      initial[c.id] = c.statut_paiement;
    });
    setLocalStatuts(initial);
  }, [user, cotisations]);

  const hasChanges = () => {
    return cotisations?.some(c => localStatuts[c.id] !== c.statut_paiement);
  };

  const handleToggle = (id) => {
    setLocalStatuts(prev => ({
      ...prev,
      [id]: prev[id] === 'Payé' ? 'Non payé' : 'Payé'
    }));
  };

  const handleSave = async () => {
    setPending(true);
    for (const c of cotisations) {
      if (localStatuts[c.id] !== c.statut_paiement) {
        await onUpdatePaiement(c.id, user.id, localStatuts[c.id]);
      }
    }
    setPending(false);
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA'
    }).format(montant);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header moderne */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                Cotisations de {user?.prenom} {user?.nom}
              </h3>
              <p className="text-blue-100 text-sm">
                {cotisations?.length || 0} cotisation{cotisations?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 p-0 md:p-6 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des cotisations...</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Liste des cotisations */}
            <div className="flex-1 overflow-y-auto">
              {cotisations?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FiDollarSign className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Aucune cotisation</h4>
                  <p className="text-gray-500">Aucune cotisation trouvée pour cet utilisateur</p>
                </div>
              ) : (
                <div className="space-y-4 p-4 md:p-0">
                  {cotisations.map(cotisation => (
                    <div 
                      key={cotisation.id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {cotisation.nom}
                          </h4>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <FiDollarSign className="w-4 h-4 text-green-500" />
                              <span className="font-medium">{formatMontant(cotisation.montant)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FiCalendar className="w-4 h-4 text-blue-500" />
                              <span>
                                {new Date(cotisation.date_debut).toLocaleDateString('fr-FR')} - {new Date(cotisation.date_fin).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            localStatuts[cotisation.id] === 'Payé' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {localStatuts[cotisation.id]}
                          </span>
                          <button
                            onClick={() => handleToggle(cotisation.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                              localStatuts[cotisation.id] === 'Payé'
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                            } ${localStatuts[cotisation.id] !== cotisation.statut_paiement ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                            disabled={pending}
                          >
                            {localStatuts[cotisation.id] === 'Payé' ? (
                              <>
                                <FiRefreshCw className="w-4 h-4" />
                                <span>Marquer non payé</span>
                              </>
                            ) : (
                              <>
                                <FiCheckCircle className="w-4 h-4" />
                                <span>Marquer payé</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bouton de sauvegarde */}
            {hasChanges() && (
              <div className="border-t border-gray-200 bg-gray-50 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FiClock className="w-4 h-4" />
                    <span>Modifications en attente de sauvegarde</span>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={pending}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    <FiSave className="w-4 h-4" />
                    <span>{pending ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCotisation;
