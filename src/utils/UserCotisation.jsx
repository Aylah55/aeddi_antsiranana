import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

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

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Cotisations de {user?.prenom} {user?.nom}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FiX size={24} />
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date début</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date fin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut paiement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cotisations?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Aucune cotisation trouvée pour cet utilisateur
                  </td>
                </tr>
              ) : (
                cotisations.map(cotisation => (
                  <tr key={cotisation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cotisation.nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MGA' }).format(cotisation.montant)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(cotisation.date_debut).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(cotisation.date_fin).toLocaleDateString('fr-FR')}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${localStatuts[cotisation.id] === 'Payé' ? 'text-green-600' : 'text-red-600'}`}>{localStatuts[cotisation.id]}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleToggle(cotisation.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 transition-colors duration-150 shadow-sm
                          ${localStatuts[cotisation.id] === 'Payé' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}
                          ${localStatuts[cotisation.id] !== cotisation.statut_paiement ? 'ring-2 ring-blue-400' : ''}`}
                        disabled={pending}
                      >
                        {localStatuts[cotisation.id] === 'Payé' ? <FiCheckCircle /> : <FiRefreshCw />}
                        {localStatuts[cotisation.id] === 'Payé' ? 'Payé' : 'Non payé'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {hasChanges() && (
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                disabled={pending}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                <FiSave /> {pending ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserCotisation;
